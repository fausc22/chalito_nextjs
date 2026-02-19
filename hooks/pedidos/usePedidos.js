import { useState, useCallback, useMemo, useEffect } from 'react';
import { pedidosService } from '../../services/pedidosService';
import { useSocket } from '../useSocket';
import { useConnectionStatus } from '../../contexts/ConnectionStatusContext';

// Función para normalizar texto eliminando tildes y convirtiendo a minúsculas
const normalizarTexto = (texto) => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos (tildes)
    .trim();
};

export const usePedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosEntregados, setPedidosEntregados] = useState([]);
  const [busquedaPedidos, setBusquedaPedidos] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updatePollingStatus, updateWebsocketStatus, markWorkerHeartbeat } = useConnectionStatus();

  // Función para cargar pedidos
  const cargarPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await pedidosService.obtenerPedidos();
      if (response.success) {
        setPedidos(response.data || []);
        // Separar pedidos entregados
        const entregados = (response.data || []).filter(p => p.estado === 'entregado');
        setPedidosEntregados(entregados);
        // Actualizar estado de conexión: polling exitoso
        updatePollingStatus(true, null);
      } else {
        const errorMsg = response.error || 'Error al cargar pedidos';
        setError(errorMsg);
        console.error('Error al cargar pedidos:', errorMsg);
        // Actualizar estado de conexión: error en polling
        updatePollingStatus(true, errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar pedidos';
      setError(errorMsg);
      console.error('Error al cargar pedidos:', err);
      // Actualizar estado de conexión: error en polling
      updatePollingStatus(true, errorMsg);
    } finally {
      setLoading(false);
    }
  }, [updatePollingStatus]);

  // Cargar pedidos desde el backend al montar el componente
  useEffect(() => {
    cargarPedidos();
    
    // Polling optimizado: cada 45 segundos (balance entre latencia y carga)
    // Se puede optimizar más con If-Modified-Since en el backend
    const interval = setInterval(cargarPedidos, 45000);
    return () => clearInterval(interval);
  }, [cargarPedidos]);

  // Integrar WebSockets (Fase 3)
  const handlePedidoCreado = useCallback((data) => {
    console.log('📦 [usePedidos] Pedido creado recibido via WebSocket:', data);
    // Recargar pedidos para obtener el nuevo pedido con todos sus datos
    cargarPedidos();
  }, [cargarPedidos]);

  const handlePedidoEstadoCambiado = useCallback((data) => {
    console.log('🔄 [usePedidos] Estado cambiado recibido via WebSocket:', data);
    
    // Mapear estado del backend al frontend
    const mapearEstado = (estadoBackend) => {
      const estado = estadoBackend.toLowerCase();
      if (estado === 'en_preparacion') return 'en_cocina';
      if (estado === 'listo') return 'listo';
      if (estado === 'recibido') return 'recibido';
      if (estado === 'entregado') return 'entregado';
      if (estado === 'cancelado') return 'cancelado';
      return estado;
    };
    
    const nuevoEstado = mapearEstado(data.estadoNuevo);
    
    // Actualizar pedido localmente
    setPedidos(prev => prev.map(p => 
      p.id === String(data.pedidoId) 
        ? { ...p, estado: nuevoEstado }
        : p
    ));
    
    // Si cambió a entregado, actualizar lista de entregados
    if (nuevoEstado === 'entregado') {
      setPedidosEntregados(prev => {
        const pedido = pedidos.find(p => p.id === String(data.pedidoId));
        if (pedido && !prev.find(p => p.id === String(data.pedidoId))) {
          return [...prev, { ...pedido, estado: 'entregado' }];
        }
        return prev;
      });
    }
    
    // Recargar para obtener datos completos del pedido actualizado
    // Usar timeout para evitar múltiples recargas si hay varios eventos
    setTimeout(() => {
      cargarPedidos();
    }, 500);
  }, [cargarPedidos, pedidos]);

  const handlePedidoCobrado = useCallback((data) => {
    console.log('💰 [usePedidos] Pedido cobrado recibido via WebSocket:', data);
    if (data?.pedidoId == null) return;

    const pedidoId = String(data.pedidoId);

    setPedidos(prev => prev.map(p => {
      if (p.id !== pedidoId) return p;
      return {
        ...p,
        ...(data.pedido || {}),
        paymentStatus: 'paid',
        estado_pago: 'PAGADO',
        actualizadoRecientemente: true
      };
    }));

    setTimeout(() => {
      setPedidos(prev => prev.map(p =>
        p.id === pedidoId ? { ...p, actualizadoRecientemente: false } : p
      ));
    }, 2000);

    // Refresca para garantizar consistencia con backend (totales, venta relacionada, etc.)
    cargarPedidos();
  }, [cargarPedidos]);

  const handleCapacidadActualizada = useCallback((data) => {
    console.log('📊 [usePedidos] Capacidad actualizada via WebSocket:', data);
    // La capacidad se maneja en PedidosColumn, que recarga automáticamente
    // Los eventos WebSocket ayudan a actualizar en tiempo real
  }, []);

  const handlePedidosAtrasados = useCallback((data) => {
    console.log('⚠️ [usePedidos] Pedidos atrasados via WebSocket:', data);
    // Se pueden mostrar notificaciones o actualizar visualmente
    // Por ahora solo logueamos
  }, []);

  const handlePedidoActualizado = useCallback((data) => {
    console.log('🔄 [usePedidos] Pedido actualizado recibido via WebSocket:', data);
    if (data.pedidoId == null) return;
    setPedidos(prev => prev.map(p => {
      if (p.id === String(data.pedidoId) && data.pedido) {
        return {
          ...p,
          ...data.pedido,
          actualizadoRecientemente: true
        };
      }
      return p;
    }));
    setTimeout(() => {
      setPedidos(prev => prev.map(ped =>
        ped.id === String(data.pedidoId) ? { ...ped, actualizadoRecientemente: false } : ped
      ));
    }, 2000);
    cargarPedidos();
  }, [cargarPedidos]);

  // Conectar WebSocket
  const { isConnected: socketConnected } = useSocket(
    handlePedidoCreado,
    handlePedidoEstadoCambiado,
    handlePedidoCobrado,
    handleCapacidadActualizada,
    handlePedidosAtrasados,
    handlePedidoActualizado,
    markWorkerHeartbeat
  );

  // Actualizar estado de conexión cuando cambia el WebSocket
  useEffect(() => {
    updateWebsocketStatus(socketConnected);
  }, [socketConnected, updateWebsocketStatus]);

  // Filtrar pedidos por búsqueda (sin necesidad de tildes)
  const pedidosFiltrados = useMemo(() => {
    if (!busquedaPedidos.trim()) return pedidos;
    
    const busquedaNormalizada = normalizarTexto(busquedaPedidos);
    return pedidos.filter(p => {
      const idNormalizado = normalizarTexto(p.id);
      const nombreNormalizado = normalizarTexto(p.clienteNombre);
      
      return idNormalizado.includes(busquedaNormalizada) ||
             nombreNormalizado.includes(busquedaNormalizada);
    });
  }, [pedidos, busquedaPedidos]);

  const pedidosRecibidos = useMemo(() => 
    pedidosFiltrados.filter(p => p.estado === 'recibido'),
    [pedidosFiltrados]
  );

  // EN PREPARACIÓN: en_cocina y listo (listo no oculta; solo salen al entregar; cobrar no los saca de la columna)
  const pedidosEnCocina = useMemo(() =>
    pedidosFiltrados.filter(p => p.estado === 'en_cocina' || p.estado === 'listo'),
    [pedidosFiltrados]
  );


  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    if (!over) return;

    const pedidoId = active.data.current.pedido.id;
    const estadoActual = active.data.current.estado;
    const estadoDestino = over.id;

    // ⚠️ DESHABILITAR: No permitir drag & drop desde RECIBIDOS a EN_PREPARACION
    // El sistema ahora lo hace automáticamente
    if (estadoActual === 'recibido' && estadoDestino === 'en_cocina') {
      console.warn('⚠️ Drag & Drop desde RECIBIDOS a EN_PREPARACION deshabilitado. El sistema lo hace automáticamente.');
      return; // No hacer nada, el sistema maneja esta transición
    }

    // Permitir otros drag & drop (dentro de EN_PREPARACION para reordenar visual, etc.)
    if (estadoActual !== estadoDestino) {
      // Actualizar estado en el backend
      const response = await pedidosService.actualizarEstadoPedido(pedidoId, estadoDestino);
      
      if (response.success) {
        // Actualizar estado localmente
        setPedidos(prev =>
          prev.map(p =>
            p.id === pedidoId ? { ...p, estado: estadoDestino } : p
          )
        );
      } else {
        console.error('Error al actualizar estado:', response.error);
        // Podrías mostrar un toast de error aquí
      }
    }
  }, []);

  const handleMarcharACocina = useCallback(async (pedidoId) => {
    const response = await pedidosService.actualizarEstadoPedido(pedidoId, 'en_cocina');
    
    if (response.success) {
      setPedidos(prev =>
        prev.map(p =>
          p.id === pedidoId ? { ...p, estado: 'en_cocina' } : p
        )
      );
    } else {
      console.error('Error al marcar pedido a cocina:', response.error);
      // El toast se mostrará desde el servicio si es necesario
    }
  }, []);

  const handleListo = useCallback(async (pedidoId) => {
    // Encontrar el pedido antes de actualizar
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) {
      console.error('Pedido no encontrado:', pedidoId);
      return;
    }

    // Actualización optimista: actualizar la UI inmediatamente a LISTO (no ENTREGADO)
    setPedidos(prev =>
      prev.map(p =>
        p.id === pedidoId
          ? { ...p, estado: 'listo', horaListo: new Date() }
          : p
      )
    );

    // Intentar actualizar en el backend (en segundo plano)
    try {
      const response = await pedidosService.actualizarEstadoPedido(pedidoId, 'listo');
      
      if (!response.success) {
        // Si falla, verificar si es rate limit
        const isRateLimit = response.error?.includes('Rate limit') || 
                           response.error?.includes('rate limit') ||
                           response.error?.toLowerCase().includes('rate limit') ||
                           response.rateLimit === true ||
                           response.status === 429;
        
        if (isRateLimit) {
          // Si es rate limit, mantener la actualización optimista
          // El pedido se sincronizará cuando se pueda
          console.warn('⚠️ Rate limit al actualizar estado. Manteniendo actualización optimista.');
          return;
        }
        
        // Si no es rate limit, revertir la actualización optimista
        console.error('Error al marcar pedido como listo:', response.error);
        setPedidos(prev =>
          prev.map(p =>
            p.id === pedidoId
              ? { ...p, estado: pedido.estado, horaListo: pedido.horaListo }
              : p
          )
        );
      }
    } catch (error) {
      // Si hay un error de red u otro error, verificar si es rate limit
      const isRateLimit = error.message?.includes('Rate limit') || 
                         error.message?.includes('rate limit') ||
                         error.response?.status === 429;
      
      if (isRateLimit) {
        // Si es rate limit, mantener la actualización optimista
        console.warn('⚠️ Rate limit al actualizar estado. Manteniendo actualización optimista.');
        return;
      }
      
      // Si no es rate limit, revertir la actualización optimista
      console.error('Error al marcar pedido como listo:', error);
      setPedidos(prev =>
        prev.map(p =>
          p.id === pedidoId
            ? { ...p, estado: pedido.estado, horaListo: pedido.horaListo }
            : p
        )
      );
    }
  }, [pedidos]);

  const handleEntregar = useCallback(async (pedidoId) => {
    // Encontrar el pedido antes de actualizar
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) {
      console.error('Pedido no encontrado:', pedidoId);
      return;
    }

    // Actualización optimista: actualizar la UI inmediatamente a ENTREGADO
    setPedidos(prev =>
      prev.map(p =>
        p.id === pedidoId
          ? { ...p, estado: 'entregado', horaEntrega: new Date() }
          : p
      )
    );
    
    // Solo agregar a pedidosEntregados si está pagado (para el modal de entregados)
    // Los pedidos entregados pero no pagados permanecen en pedidos para mostrarse
    if (pedido.paymentStatus === 'paid') {
      const pedidoEntregado = { ...pedido, estado: 'entregado', horaEntrega: new Date() };
      setPedidosEntregados(prev => {
        // Evitar duplicados
        if (!prev.find(p => p.id === pedidoId)) {
          return [...prev, pedidoEntregado];
        }
        return prev;
      });
    }

    // Intentar actualizar en el backend (en segundo plano)
    try {
      const response = await pedidosService.actualizarEstadoPedido(pedidoId, 'entregado');
      
      if (!response.success) {
        // Si falla, verificar si es rate limit
        const isRateLimit = response.error?.includes('Rate limit') || 
                           response.error?.includes('rate limit') ||
                           response.error?.toLowerCase().includes('rate limit') ||
                           response.rateLimit === true ||
                           response.status === 429;
        
        if (isRateLimit) {
          // Si es rate limit, mantener la actualización optimista
          console.warn('⚠️ Rate limit al actualizar estado. Manteniendo actualización optimista.');
          return;
        }
        
        // Si no es rate limit, revertir la actualización optimista
        console.error('Error al marcar pedido como entregado:', response.error);
        setPedidos(prev =>
          prev.map(p =>
            p.id === pedidoId
              ? { ...p, estado: pedido.estado, horaEntrega: pedido.horaEntrega }
              : p
          )
        );
        
        if (pedido.paymentStatus === 'paid') {
          setPedidosEntregados(prev => prev.filter(p => p.id !== pedidoId));
        }
      }
    } catch (error) {
      // Si hay un error de red u otro error, verificar si es rate limit
      const isRateLimit = error.message?.includes('Rate limit') || 
                         error.message?.includes('rate limit') ||
                         error.response?.status === 429;
      
      if (isRateLimit) {
        // Si es rate limit, mantener la actualización optimista
        console.warn('⚠️ Rate limit al actualizar estado. Manteniendo actualización optimista.');
        return;
      }
      
      // Si no es rate limit, revertir la actualización optimista
      console.error('Error al marcar pedido como entregado:', error);
      setPedidos(prev =>
        prev.map(p =>
          p.id === pedidoId
            ? { ...p, estado: pedido.estado, horaEntrega: pedido.horaEntrega }
            : p
        )
      );
      
      if (pedido.paymentStatus === 'paid') {
        setPedidosEntregados(prev => prev.filter(p => p.id !== pedidoId));
      }
    }
  }, [pedidos]);

  const handleCancelar = useCallback(async (pedidoId) => {
    const response = await pedidosService.eliminarPedido(pedidoId);
    
    if (response.success) {
      setPedidos(prev => prev.filter(p => p.id !== pedidoId));
    } else {
      console.error('Error al cancelar pedido:', response.error);
      // Podrías mostrar un toast de error aquí
    }
  }, []);

  const agregarPedido = useCallback((nuevoPedido) => {
    setPedidos(prev => [...prev, nuevoPedido]);
  }, []);

  const actualizarPedido = useCallback((pedidoId, actualizaciones) => {
    setPedidos(prev =>
      prev.map(p =>
        p.id === pedidoId ? { ...p, ...actualizaciones } : p
      )
    );
  }, []);

  return {
    pedidos,
    pedidosEntregados,
    pedidosRecibidos,
    pedidosEnCocina,
    busquedaPedidos,
    setBusquedaPedidos,
    handleDragEnd,
    handleMarcharACocina,
    handleListo,
    handleEntregar,
    handleCancelar,
    agregarPedido,
    actualizarPedido,
    loading,
    error,
    recargarPedidos: cargarPedidos,
    socketConnected // Exponer estado de conexión WebSocket
  };
};

