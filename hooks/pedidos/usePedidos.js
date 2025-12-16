import { useState, useCallback, useMemo, useEffect } from 'react';
import { pedidosService } from '../../services/pedidosService';

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

  // Cargar pedidos desde el backend al montar el componente
  useEffect(() => {
    const cargarPedidos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await pedidosService.obtenerPedidos();
        if (response.success) {
          setPedidos(response.data || []);
          // Separar pedidos entregados
          const entregados = (response.data || []).filter(p => p.estado === 'entregado');
          setPedidosEntregados(entregados);
        } else {
          setError(response.error || 'Error al cargar pedidos');
          console.error('Error al cargar pedidos:', response.error);
        }
      } catch (err) {
        setError(err.message || 'Error al cargar pedidos');
        console.error('Error al cargar pedidos:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
    
    // Recargar pedidos cada 120 segundos (2 minutos) para mantenerlos actualizados y evitar rate limiting
    const interval = setInterval(cargarPedidos, 120000);
    return () => clearInterval(interval);
  }, []);

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

  const pedidosEnCocina = useMemo(() => 
    pedidosFiltrados.filter(p => 
      // Incluir pedidos en cocina O pedidos entregados que aún no han sido pagados
      p.estado === 'en_cocina' || 
      (p.estado === 'entregado' && p.paymentStatus === 'pending')
    ),
    [pedidosFiltrados]
  );

  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    if (!over) return;

    const pedidoId = active.data.current.pedido.id;
    const estadoActual = active.data.current.estado;
    const estadoDestino = over.id;

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

    // Actualización optimista: actualizar la UI inmediatamente
    setPedidos(prev =>
      prev.map(p =>
        p.id === pedidoId
          ? { ...p, estado: 'entregado', horaEntrega: new Date() }
          : p
      )
    );
    
    // Solo agregar a pedidosEntregados si está pagado (para el modal de entregados)
    // Los pedidos entregados pero no pagados permanecen en pedidos para mostrarse en "En preparación"
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
          // El pedido se sincronizará cuando se pueda
          console.warn('⚠️ Rate limit al actualizar estado. Manteniendo actualización optimista.');
          return;
        }
        
        // Si no es rate limit, revertir la actualización optimista
        console.error('Error al marcar pedido como listo:', response.error);
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
      console.error('Error al marcar pedido como listo:', error);
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
    handleCancelar,
    agregarPedido,
    actualizarPedido,
    loading,
    error,
    recargarPedidos: async () => {
      setLoading(true);
      const response = await pedidosService.obtenerPedidos();
      if (response.success) {
        setPedidos(response.data || []);
        const entregados = (response.data || []).filter(p => p.estado === 'entregado');
        setPedidosEntregados(entregados);
      }
      setLoading(false);
    }
  };
};

