import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestión de pedidos
 * Mapea la estructura del frontend a la estructura del backend
 */

// Mapear estado del frontend al backend (según estructura de BD)
const mapearEstadoFrontendABackend = (estadoFrontend) => {
  const mapeo = {
    'recibido': 'RECIBIDO',
    'en_cocina': 'EN_PREPARACION',
    'listo': 'LISTO', // Estado LISTO ahora es real
    'entregado': 'ENTREGADO',
    'cancelado': 'CANCELADO'
  };
  return mapeo[estadoFrontend] || 'RECIBIDO';
};

// Mapear estado del backend al frontend (según estructura de BD)
const mapearEstadoBackendAFrontend = (estadoBackend) => {
  const mapeo = {
    'RECIBIDO': 'recibido',
    'EN_PREPARACION': 'en_cocina',
    'LISTO': 'listo', // Estado LISTO ahora es real
    'ENTREGADO': 'entregado',
    'CANCELADO': 'cancelado'
  };
  return mapeo[estadoBackend] || 'recibido';
};

// Mapear modalidad del frontend al backend
const mapearModalidadFrontendABackend = (modalidadFrontend) => {
  const mapeo = {
    'delivery': 'DELIVERY',
    'retiro': 'RETIRO'
  };
  return mapeo[modalidadFrontend] || 'DELIVERY';
};

// Mapear modalidad del backend al frontend
const mapearModalidadBackendAFrontend = (modalidadBackend) => {
  const mapeo = {
    'DELIVERY': 'delivery',
    'RETIRO': 'retiro'
  };
  return mapeo[modalidadBackend] || 'delivery';
};

// Mapear medio de pago del frontend al backend
const mapearMedioPagoFrontendABackend = (medioPagoFrontend) => {
  if (!medioPagoFrontend) {
    console.log('⚠️ Medio de pago vacío, retornando null');
    return null;
  }
  
  // Normalizar a minúsculas para el mapeo
  const medioPagoNormalizado = String(medioPagoFrontend).toLowerCase().trim();
  console.log(`💳 Mapeando medio de pago: "${medioPagoFrontend}" -> "${medioPagoNormalizado}"`);
  
  const mapeo = {
    'efectivo': 'EFECTIVO',
    'debito': 'DEBITO',
    'credito': 'CREDITO',
    'transferencia': 'TRANSFERENCIA',
    'mercadopago': 'MERCADOPAGO'
  };
  
  const resultado = mapeo[medioPagoNormalizado] || medioPagoFrontend.toUpperCase();
  console.log(`💳 Medio de pago mapeado a: "${resultado}"`);
  return resultado;
};

// Transformar pedido del backend al formato del frontend
const transformarPedidoBackendAFrontend = (pedidoBackend, articulos = []) => {
  // Mapear origen del backend al frontend
  // Backend ENUM tiene: MOSTRADOR, TELEFONO, WHATSAPP, WEB (mayúsculas)
  // Frontend usa: mostrador, telefono, whatsapp, web (minúsculas)
  const mapearOrigenBackendAFrontend = (origenBackend) => {
    // Normalizar a mayúsculas para el mapeo
    const origenNormalizado = (origenBackend || '').toUpperCase();
    const mapeo = {
      'MOSTRADOR': 'mostrador',
      'TELEFONO': 'telefono',
      'WHATSAPP': 'whatsapp',
      'WEB': 'web'
    };
    return mapeo[origenNormalizado] || 'mostrador';
  };

  // Mapear medio_pago del backend al frontend (EFECTIVO -> efectivo)
  const mapearMedioPagoBackendAFrontend = (medio) => {
    if (!medio || typeof medio !== 'string') return null;
    const m = medio.toUpperCase();
    const map = { 'EFECTIVO': 'efectivo', 'DEBITO': 'debito', 'CREDITO': 'credito', 'TRANSFERENCIA': 'transferencia', 'MERCADOPAGO': 'mercadopago' };
    return map[m] || medio.toLowerCase();
  };

  return {
    id: String(pedidoBackend.id),
    clienteNombre: pedidoBackend.cliente_nombre || 'Cliente sin nombre',
    telefono: pedidoBackend.cliente_telefono || '',
    email: pedidoBackend.cliente_email || null,
    direccion: pedidoBackend.cliente_direccion || '',
    origen: mapearOrigenBackendAFrontend(pedidoBackend.origen_pedido || 'mostrador'),
    tipo: pedidoBackend.horario_entrega ? 'programado' : 'ya',
    horaProgramada: pedidoBackend.horario_entrega 
      ? (() => {
          const fecha = new Date(pedidoBackend.horario_entrega);
          const horas = String(fecha.getHours()).padStart(2, '0');
          const minutos = String(fecha.getMinutes()).padStart(2, '0');
          return `${horas}:${minutos}`;
        })()
      : null,
    timestamp: new Date(pedidoBackend.fecha).getTime(),
    items: articulos.map(art => ({
      id: art.articulo_id,
      articulo_id: art.articulo_id,
      articulo_nombre: art.articulo_nombre,
      nombre: art.articulo_nombre,
      cantidad: art.cantidad || 1,
      precio: parseFloat(art.precio) || 0,
      subtotal: parseFloat(art.subtotal) || (parseFloat(art.precio) * (art.cantidad || 1)) || 0,
      extras: art.personalizaciones ? (typeof art.personalizaciones === 'string' ? JSON.parse(art.personalizaciones) : art.personalizaciones) : null,
      personalizaciones: art.personalizaciones ? (typeof art.personalizaciones === 'string' ? JSON.parse(art.personalizaciones) : art.personalizaciones) : null,
      observaciones: art.observaciones || null
    })),
    total: parseFloat(pedidoBackend.total) || 0,
    // Mapear estado_pago del backend al frontend
    // Si estado_pago no existe (pedidos antiguos), usar medio_pago como fallback
    paymentStatus: pedidoBackend.estado_pago 
      ? (pedidoBackend.estado_pago === 'PAGADO' ? 'paid' : 'pending')
      : (pedidoBackend.medio_pago && pedidoBackend.medio_pago !== null && pedidoBackend.medio_pago !== '' ? 'paid' : 'pending'),
    estado: mapearEstadoBackendAFrontend(pedidoBackend.estado),
    tipoEntrega: mapearModalidadBackendAFrontend(pedidoBackend.modalidad),
    medioPago: mapearMedioPagoBackendAFrontend(pedidoBackend.medio_pago),
    observaciones: pedidoBackend.observaciones || '',
    subtotal: parseFloat(pedidoBackend.subtotal) || 0,
    ivaTotal: parseFloat(pedidoBackend.iva_total) || 0,
    // Campos nuevos para automatización
    horaInicioPreparacion: pedidoBackend.hora_inicio_preparacion ? new Date(pedidoBackend.hora_inicio_preparacion).getTime() : null,
    tiempoEstimadoPreparacion: pedidoBackend.tiempo_estimado_preparacion || 15,
    horaEsperadaFinalizacion: pedidoBackend.hora_esperada_finalizacion ? new Date(pedidoBackend.hora_esperada_finalizacion).getTime() : null,
    horaListo: pedidoBackend.hora_listo ? new Date(pedidoBackend.hora_listo).getTime() : null,
    prioridad: pedidoBackend.prioridad ? pedidoBackend.prioridad.toLowerCase() : 'normal',
    transicionAutomatica: pedidoBackend.transicion_automatica !== undefined ? pedidoBackend.transicion_automatica : true
  };
};

// Transformar pedido del frontend al formato del backend
// Según estructura de BD: pedidos y pedidos_contenido
const transformarPedidoFrontendABackend = (pedidoFrontend) => {
  // Calcular subtotal de los items (precio * cantidad + extras)
  const subtotalItems = pedidoFrontend.items?.reduce((sum, item) => {
    const precioBase = parseFloat(item.precio) || 0;
    const cantidad = parseInt(item.cantidad) || 1;
    const precioExtras = (item.extras || []).reduce((s, e) => s + (parseFloat(e.precio) || 0), 0);
    const subtotalItem = (precioBase + precioExtras) * cantidad;
    return sum + subtotalItem;
  }, 0) || 0;

  // Calcular IVA (21% del subtotal)
  const ivaTotal = subtotalItems * 0.21;
  
  // Total = subtotal + IVA
  const total = subtotalItems + ivaTotal;

  // Mapear origen del frontend al backend
  // Frontend usa: mostrador, telefono, whatsapp, web (minúsculas)
  // Backend ENUM espera: MOSTRADOR, TELEFONO, WHATSAPP, WEB (mayúsculas)
  const mapearOrigenFrontendABackend = (origenFrontend) => {
    console.log('🔍 Mapeando origen:', origenFrontend);
    const mapeo = {
      'mostrador': 'MOSTRADOR',
      'telefono': 'TELEFONO',
      'whatsapp': 'WHATSAPP',
      'web': 'WEB'
    };
    const resultado = mapeo[origenFrontend] || 'MOSTRADOR';
    console.log('🔍 Origen mapeado a:', resultado);
    return resultado;
  };

  return {
    cliente_nombre: pedidoFrontend.clienteNombre || pedidoFrontend.cliente?.nombre || '',
    cliente_direccion: pedidoFrontend.cliente?.direccion || pedidoFrontend.direccion || '',
    cliente_telefono: pedidoFrontend.cliente?.telefono || pedidoFrontend.telefono || '',
    cliente_email: pedidoFrontend.cliente?.email || pedidoFrontend.email || null,
    origen_pedido: mapearOrigenFrontendABackend(pedidoFrontend.origen || 'mostrador'),
    subtotal: pedidoFrontend.subtotal || subtotalItems,
    iva_total: pedidoFrontend.ivaTotal || pedidoFrontend.iva_total || ivaTotal,
    total: pedidoFrontend.total || total,
    medio_pago: (pedidoFrontend.medioPago || pedidoFrontend.medio_pago)
      ? mapearMedioPagoFrontendABackend(pedidoFrontend.medioPago || pedidoFrontend.medio_pago)
      : null,
    estado_pago: pedidoFrontend.paymentStatus === 'paid' ? 'PAGADO' : 'DEBE',
    modalidad: mapearModalidadFrontendABackend(pedidoFrontend.tipoEntrega || pedidoFrontend.modalidad),
    horario_entrega: pedidoFrontend.horaProgramada 
      ? new Date(`${new Date().toISOString().split('T')[0]} ${pedidoFrontend.horaProgramada}`).toISOString()
      : null,
    estado: mapearEstadoFrontendABackend(pedidoFrontend.estado || 'recibido'),
    observaciones: pedidoFrontend.observaciones || '',
    articulos: pedidoFrontend.items?.map(item => {
      const precioBase = parseFloat(item.precio) || 0;
      const cantidad = parseInt(item.cantidad) || 1;
      const extras = item.extras || item.extrasSeleccionados || [];
      const precioExtras = extras.reduce((s, e) => s + (parseFloat(e.precio) || 0), 0);
      const precioUnitario = precioBase + precioExtras;
      const subtotalItem = precioUnitario * cantidad;

      // Preparar personalizaciones en formato JSON
      // Formato: { extras: [{ id, nombre, precio }, ...] }
      // El validador espera un objeto, no null, así que enviamos un objeto vacío si no hay extras
      let personalizaciones = {};
      if (extras && extras.length > 0) {
        personalizaciones = {
          extras: extras.map(e => ({
            id: e.id || null,
            nombre: e.nombre || String(e),
            precio: parseFloat(e.precio) || 0
          }))
        };
      }

      // Asegurar que articulo_id sea un número entero
      const articuloId = parseInt(item.id || item.articulo_id);
      if (isNaN(articuloId) || articuloId <= 0) {
        console.error('❌ Error: articulo_id inválido:', item.id || item.articulo_id);
        throw new Error(`ID de artículo inválido: ${item.id || item.articulo_id}`);
      }

      return {
        articulo_id: articuloId,
        articulo_nombre: String(item.nombre || item.articulo_nombre || ''),
        cantidad: cantidad,
        precio: precioUnitario, // Precio unitario (incluye extras)
        subtotal: subtotalItem,
        personalizaciones: personalizaciones,
        observaciones: item.observaciones || null
      };
    }) || []
  };
};

/**
 * Arma el payload de actualización: formato plano que espera el backend.
 * El backend requiere: articulos (obligatorio) + campos pedido (cliente_nombre, modalidad, etc.)
 */
const buildActualizarPedidoPayload = (pedidoFrontend) => {
  const full = transformarPedidoFrontendABackend(pedidoFrontend);
  return {
    ...full,
    articulos: full.articulos || []
  };
};

export const pedidosService = {
  /**
   * Obtener todos los pedidos
   * Por defecto filtra solo los pedidos del día actual
   */
  obtenerPedidos: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Por defecto, filtrar solo pedidos del día actual
      // Usar fecha local para evitar problemas de zona horaria
      const ahora = new Date();
      const hoy = ahora.getFullYear() + '-' + 
                  String(ahora.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(ahora.getDate()).padStart(2, '0'); // YYYY-MM-DD en zona horaria local
      
      if (!filtros.fecha_desde && !filtros.fecha_hasta && filtros.soloHoy !== false) {
        params.append('fecha_desde', hoy);
        params.append('fecha_hasta', hoy);
        console.log('🔍 Filtrando pedidos del día:', hoy);
      } else {
        if (filtros.fecha_desde) {
          params.append('fecha_desde', filtros.fecha_desde);
        }
        if (filtros.fecha_hasta) {
          params.append('fecha_hasta', filtros.fecha_hasta);
        }
      }
      
      if (filtros.estado) {
        params.append('estado', mapearEstadoFrontendABackend(filtros.estado));
      }
      if (filtros.modalidad) {
        params.append('modalidad', mapearModalidadFrontendABackend(filtros.modalidad));
      }

      const url = API_CONFIG.ENDPOINTS.PEDIDOS.LIST + (params.toString() ? `?${params.toString()}` : '');
      const response = await apiRequest.get(url);

      // Verificar si la respuesta es un error transformado
      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al obtener pedidos',
          data: []
        };
      }

      const pedidosBackend = response.data.data || response.data || [];
      
      // Transformar cada pedido y obtener sus artículos
      const pedidosTransformados = await Promise.all(
        pedidosBackend.map(async (pedido) => {
          try {
            const articulosResponse = await apiRequest.get(`${API_CONFIG.ENDPOINTS.PEDIDOS.BY_ID(pedido.id)}`);
            const articulos = articulosResponse.data?.data?.articulos || articulosResponse.data?.articulos || [];
            return transformarPedidoBackendAFrontend(pedido, articulos);
          } catch (error) {
            console.warn(`Error obteniendo artículos del pedido ${pedido.id}:`, error);
            return transformarPedidoBackendAFrontend(pedido, []);
          }
        })
      );

      return {
        success: true,
        data: pedidosTransformados
      };
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al obtener pedidos',
        data: []
      };
    }
  },

  /**
   * Obtener un pedido por ID
   */
  obtenerPedidoPorId: async (id) => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.PEDIDOS.BY_ID(id));

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al obtener pedido'
        };
      }

      const data = response.data.data || response.data;
      const pedido = data.pedido || data;
      const articulos = data.articulos || [];

      return {
        success: true,
        data: transformarPedidoBackendAFrontend(pedido, articulos)
      };
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al obtener pedido'
      };
    }
  },

  /**
   * Obtener los IDs de los productos más solicitados en pedidos recientes
   * (para la pestaña "ÚLTIMOS" en nuevo pedido)
   * @param {number} limiteProductos - Cantidad de productos a devolver (default 9)
   * @param {number} dias - Últimos N días de pedidos (default 7)
   * @param {number} maxPedidos - Máximo de pedidos a consultar para no saturar (default 25)
   */
  obtenerProductosMasSolicitados: async (limiteProductos = 9, dias = 7, maxPedidos = 25) => {
    try {
      const hasta = new Date();
      const desde = new Date();
      desde.setDate(desde.getDate() - dias);
      const fecha_desde = desde.getFullYear() + '-' + String(desde.getMonth() + 1).padStart(2, '0') + '-' + String(desde.getDate()).padStart(2, '0');
      const fecha_hasta = hasta.getFullYear() + '-' + String(hasta.getMonth() + 1).padStart(2, '0') + '-' + String(hasta.getDate()).padStart(2, '0');

      const params = new URLSearchParams();
      params.append('fecha_desde', fecha_desde);
      params.append('fecha_hasta', fecha_hasta);

      const url = API_CONFIG.ENDPOINTS.PEDIDOS.LIST + '?' + params.toString();
      const response = await apiRequest.get(url);

      if (response.data?.error === true) {
        return { success: false, error: response.data.mensaje, data: [] };
      }

      const pedidosBackend = response.data.data || response.data || [];
      const pedidosLimitados = Array.isArray(pedidosBackend) ? pedidosBackend.slice(0, maxPedidos) : [];

      const conteoPorArticulo = {};

      await Promise.all(
        pedidosLimitados.map(async (pedido) => {
          try {
            const detalle = await apiRequest.get(API_CONFIG.ENDPOINTS.PEDIDOS.BY_ID(pedido.id));
            const data = detalle.data?.data || detalle.data || {};
            const articulos = data.articulos || [];
            articulos.forEach((item) => {
              const id = item.articulo_id ?? item.articuloId;
              const cantidad = parseInt(item.cantidad, 10) || 1;
              if (id != null) {
                conteoPorArticulo[id] = (conteoPorArticulo[id] || 0) + cantidad;
              }
            });
          } catch (err) {
            console.warn('Error al obtener ítems del pedido', pedido.id, err);
          }
        })
      );

      const ordenados = Object.entries(conteoPorArticulo)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limiteProductos)
        .map(([id]) => parseInt(id, 10));

      return { success: true, data: ordenados };
    } catch (error) {
      console.error('Error al obtener productos más solicitados:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message,
        data: []
      };
    }
  },

  /**
   * Crear un nuevo pedido
   */
  crearPedido: async (pedidoData) => {
    try {
      console.log('📦 Creando pedido con datos:', pedidoData);
      console.log('📦 Origen recibido del frontend:', pedidoData.origen);
      const pedidoBackend = transformarPedidoFrontendABackend(pedidoData);
      console.log('📦 Datos transformados para backend:', pedidoBackend);
      console.log('📦 Origen mapeado para backend:', pedidoBackend.origen_pedido);

      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.PEDIDOS.CREATE,
        pedidoBackend
      );

      console.log('📦 Respuesta del backend:', response.data);

      if (response.data?.error === true || response.data?.success === false) {
        console.error('❌ Error del backend completo:', JSON.stringify(response.data, null, 2));
        
        // El interceptor de axios pone los datos del error en response.data.data
        const errorData = response.data.data || response.data;
        
        // Si hay errores de validación específicos, mostrarlos
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          console.error('❌ Errores de validación detallados:', errorData.errors);
          const erroresDetalle = errorData.errors.map(e => `${e.path || 'campo'}: ${e.message}`).join(', ');
          return {
            success: false,
            error: `Error de validación: ${erroresDetalle}`,
            errores: errorData.errors
          };
        }
        
        return {
          success: false,
          error: response.data.mensaje || errorData?.mensaje || errorData?.message || 'Error al crear pedido',
          errores: errorData?.errors
        };
      }

      const pedidoCreado = response.data.data || response.data;
      
      console.log('✅ Pedido creado exitosamente:', pedidoCreado);
      
      return {
        success: true,
        data: {
          id: String(pedidoCreado.id),
          ...pedidoData
        },
        mensaje: response.data.message || 'Pedido creado exitosamente'
      };
    } catch (error) {
      console.error('❌ Error al crear pedido:', error);
      
      // Si es un error de validación, mostrar los detalles
      if (error.response?.data?.errors) {
        console.error('❌ Errores de validación:', error.response.data.errors);
        const erroresDetalle = error.response.data.errors.map(e => `${e.path || 'campo'}: ${e.message}`).join(', ');
        return {
          success: false,
          error: `Error de validación: ${erroresDetalle}`,
          errores: error.response.data.errors
        };
      }
      
      let errorMessage = 'Error al crear pedido';
      if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  /**
   * Actualizar estado de un pedido
   */
  actualizarEstadoPedido: async (id, nuevoEstado) => {
    try {
      const estadoBackend = mapearEstadoFrontendABackend(nuevoEstado);
      console.log(`🔄 Actualizando pedido ${id} a estado: ${estadoBackend} (desde ${nuevoEstado})`);

      const response = await apiRequest.put(
        `${API_CONFIG.ENDPOINTS.PEDIDOS.BY_ID(id)}/estado`,
        { estado: estadoBackend }
      );

      console.log('📦 Respuesta al actualizar estado:', JSON.stringify(response.data, null, 2));

      // El interceptor de axios transforma errores 4xx en respuestas con error: true
      if (response.data?.error === true || response.data?.success === false) {
        console.error('❌ Error al actualizar estado completo:', JSON.stringify(response.data, null, 2));
        
        // Los errores de validación están en response.data.data
        const errorData = response.data.data || response.data;
        
        // Si hay errores de validación específicos, mostrarlos
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          console.error('❌ Errores de validación detallados:', errorData.errors);
          const erroresDetalle = errorData.errors.map(e => `${e.path || 'campo'}: ${e.message}`).join(', ');
          return {
            success: false,
            error: `Error de validación: ${erroresDetalle}`,
            errores: errorData.errors
          };
        }
        
        // Extraer el mensaje de error de diferentes posibles ubicaciones
        const errorMessage = response.data.mensaje || 
                            errorData?.mensaje || 
                            errorData?.message || 
                            (typeof errorData === 'string' ? errorData : 'Error al actualizar estado');
        
        console.error('❌ Mensaje de error extraído:', errorMessage);
        console.error('❌ Estructura completa de errorData:', JSON.stringify(errorData, null, 2));
        console.error('❌ Estructura completa de response.data:', JSON.stringify(response.data, null, 2));
        
        // Si el error es 404 (pedido no encontrado), puede ser que el pedido ya fue eliminado o actualizado
        if (response.data.status === 404) {
          console.warn('⚠️ Pedido no encontrado, puede haber sido eliminado o ya actualizado');
        }
        
        return {
          success: false,
          error: errorMessage,
          errores: errorData?.errors,
          status: response.data.status,
          rateLimit: response.data.rateLimit === true || response.data.status === 429,
          retryAfter: response.data.retryAfter
        };
      }

      console.log('✅ Estado actualizado correctamente');
      return {
        success: true,
        mensaje: response.data.message || 'Estado actualizado correctamente'
      };
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      
      // Si es un error de validación, mostrar los detalles
      if (error.response?.data?.errors) {
        console.error('❌ Errores de validación:', error.response.data.errors);
        const erroresDetalle = error.response.data.errors.map(e => `${e.path || 'campo'}: ${e.message}`).join(', ');
        return {
          success: false,
          error: `Error de validación: ${erroresDetalle}`,
          errores: error.response.data.errors
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.mensaje || error.response?.data?.message || error.message || 'Error al actualizar estado'
      };
    }
  },

  /**
   * Actualizar observaciones de un pedido
   */
  actualizarObservaciones: async (id, observaciones) => {
    try {
      const response = await apiRequest.put(
        `${API_CONFIG.ENDPOINTS.PEDIDOS.BY_ID(id)}/observaciones`,
        { observaciones }
      );

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al actualizar observaciones'
        };
      }

      return {
        success: true,
        mensaje: response.data.message || 'Observaciones actualizadas correctamente'
      };
    } catch (error) {
      console.error('Error al actualizar observaciones:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al actualizar observaciones'
      };
    }
  },

  /**
   * Eliminar un pedido
   */
  eliminarPedido: async (id) => {
    try {
      const response = await apiRequest.delete(API_CONFIG.ENDPOINTS.PEDIDOS.BY_ID(id));

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al eliminar pedido'
        };
      }

      return {
        success: true,
        mensaje: response.data.message || 'Pedido eliminado correctamente'
      };
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al eliminar pedido'
      };
    }
  },

  /**
   * Agregar artículo a un pedido existente
   */
  agregarArticulo: async (pedidoId, articulo) => {
    try {
      const articuloBackend = {
        articulo_id: articulo.id || articulo.articulo_id,
        articulo_nombre: articulo.nombre || articulo.articulo_nombre,
        cantidad: articulo.cantidad,
        precio: articulo.precio || 0,
        subtotal: articulo.subtotal || (articulo.precio * articulo.cantidad),
        personalizaciones: articulo.extras ? { extras: articulo.extras } : null,
        observaciones: articulo.observaciones || null
      };

      const response = await apiRequest.post(
        `${API_CONFIG.ENDPOINTS.PEDIDOS.BY_ID(pedidoId)}/articulos`,
        articuloBackend
      );

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al agregar artículo'
        };
      }

      return {
        success: true,
        mensaje: response.data.message || 'Artículo agregado correctamente'
      };
    } catch (error) {
      console.error('Error al agregar artículo:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al agregar artículo'
      };
    }
  },

  /**
   * Cobrar pedido existente (usa endpoint POST /pedidos/:id/cobrar).
   * Crea UNA venta, marca pedido como PAGADO, idempotente (no duplica si ya cobrado).
   */
  cobrarPedido: async (pedidoId, { medioPago = 'efectivo', tipoFactura = null, cuentaId = null } = {}) => {
    try {
      const medioPagoBackend = mapearMedioPagoFrontendABackend(medioPago) || 'EFECTIVO';
      const pedidoIdNum = parseInt(pedidoId, 10);
      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.PEDIDOS.COBRAR(pedidoId),
        {
          pedido_id: Number.isFinite(pedidoIdNum) ? pedidoIdNum : null,
          medio_pago: medioPagoBackend,
          tipo_factura: tipoFactura || null,
          cuenta_id: cuentaId || null
        }
      );

      if (response.data?.error === true || response.data?.success === false) {
        return {
          success: false,
          error: response.data.mensaje || response.data.message || 'Error al cobrar pedido',
          code: response.data.code
        };
      }

      const data = response.data.data || response.data;
      const pedidoBackend = data.pedido || data;
      const articulos = pedidoBackend.articulos || [];
      const pedidoFrontend = transformarPedidoBackendAFrontend(pedidoBackend, articulos);

      return {
        success: true,
        data: {
          pedido: pedidoFrontend,
          venta_id: data.venta_id,
          pagado: true
        }
      };
    } catch (error) {
      const errData = error.response?.data;
      return {
        success: false,
        error: errData?.mensaje || errData?.message || error.message || 'Error al cobrar pedido',
        code: errData?.code
      };
    }
  },

  /**
   * Actualizar estado de pago de un pedido (legacy - preferir cobrarPedido para cobrar)
   */
  actualizarEstadoPagoPedido: async (id, estadoPago, medioPago = null) => {
    try {
      console.log(`💰 Actualizando estado de pago del pedido ${id} a: ${estadoPago}`);
      
      const dataToSend = {
        estado_pago: estadoPago
      };
      
      // Si se proporciona medio_pago, también actualizarlo
      if (medioPago) {
        dataToSend.medio_pago = mapearMedioPagoFrontendABackend(medioPago);
      }

      const response = await apiRequest.put(
        `${API_CONFIG.ENDPOINTS.PEDIDOS.BY_ID(id)}`,
        dataToSend
      );

      if (response.data?.error === true || response.data?.success === false) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al actualizar estado de pago'
        };
      }

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error al actualizar estado de pago:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al actualizar estado de pago'
      };
    }
  },

  /**
   * Obtener información de capacidad de cocina
   */
  obtenerCapacidadCocina: async () => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.PEDIDOS.CAPACIDAD);

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al obtener capacidad'
        };
      }

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error al obtener capacidad:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al obtener capacidad'
      };
    }
  },

  /**
   * Obtener datos de comanda para imprimir
   */
  obtenerComandaParaImprimir: async (id) => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.PEDIDOS.COMANDA_PRINT(id));

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al obtener comanda'
        };
      }

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error al obtener comanda para imprimir:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al obtener comanda'
      };
    }
  },

  /**
   * Obtener datos de ticket/factura para imprimir
   */
  obtenerTicketParaImprimir: async (id) => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.PEDIDOS.TICKET_PRINT(id));

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al obtener ticket'
        };
      }

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error al obtener ticket para imprimir:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al obtener ticket'
      };
    }
  },

  /**
   * Actualizar un pedido existente.
   * Siempre envía payload completo: { pedido: {...}, items: [...] }
   */
  actualizarPedido: async (id, pedidoData) => {
    try {
      const payload = buildActualizarPedidoPayload(pedidoData);
      console.log('📝 Actualizando pedido:', id, payload);

      const response = await apiRequest.put(
        API_CONFIG.ENDPOINTS.PEDIDOS.BY_ID(id),
        payload
      );

      console.log('📝 Respuesta del backend:', response.data);

      if (response.data?.error === true || response.data?.success === false) {
        console.error('❌ Error del backend completo:', JSON.stringify(response.data, null, 2));
        
        const errorData = response.data.data || response.data;
        
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          console.error('❌ Errores de validación detallados:', errorData.errors);
          const erroresDetalle = errorData.errors.map(e => `${e.path || 'campo'}: ${e.message}`).join(', ');
          return {
            success: false,
            error: `Error de validación: ${erroresDetalle}`,
            errores: errorData.errors
          };
        }
        
        return {
          success: false,
          error: response.data.mensaje || errorData?.mensaje || errorData?.message || 'Error al actualizar pedido',
          errores: errorData?.errors
        };
      }

      const raw = response.data.data || response.data;
      const pedidoBackend = raw.pedido ?? raw;
      const articulos = Array.isArray(raw.articulos)
        ? raw.articulos
        : (Array.isArray(pedidoBackend.articulos) ? pedidoBackend.articulos : []);
      const pedidoFrontend = transformarPedidoBackendAFrontend(pedidoBackend, articulos);
      
      console.log('✅ Pedido actualizado exitosamente:', pedidoFrontend);
      
      return {
        success: true,
        data: pedidoFrontend,
        mensaje: response.data.message || 'Pedido actualizado exitosamente'
      };
    } catch (error) {
      console.error('❌ Error al actualizar pedido:', error);
      
      if (error.response?.data?.errors) {
        console.error('❌ Errores de validación:', error.response.data.errors);
        const erroresDetalle = error.response.data.errors.map(e => `${e.path || 'campo'}: ${e.message}`).join(', ');
        return {
          success: false,
          error: `Error de validación: ${erroresDetalle}`,
          errores: error.response.data.errors
        };
      }
      
      let errorMessage = 'Error al actualizar pedido';
      if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }
};

