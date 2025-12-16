import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestión de comandas
 * Mapea la estructura del frontend a la estructura del backend
 */

// Mapear estado del frontend al backend (según estructura de BD)
const mapearEstadoFrontendABackend = (estadoFrontend) => {
  const mapeo = {
    'recibido': 'RECIBIDO',
    'en_preparacion': 'EN_PREPARACION',
    'listo': 'LISTA',
    'lista': 'LISTA',
    'entregado': 'LISTA', // Compatibilidad: entregado mapea a LISTA
    'cancelado': 'CANCELADA',
    'cancelada': 'CANCELADA'
  };
  return mapeo[estadoFrontend] || 'EN_PREPARACION';
};

// Mapear estado del backend al frontend (según estructura de BD)
const mapearEstadoBackendAFrontend = (estadoBackend) => {
  const mapeo = {
    'RECIBIDO': 'recibido',
    'EN_PREPARACION': 'en_preparacion',
    'LISTA': 'listo',
    'CANCELADA': 'cancelado'
  };
  return mapeo[estadoBackend] || 'en_preparacion';
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

// Transformar comanda del backend al formato del frontend
const transformarComandaBackendAFrontend = (comandaBackend, articulos = []) => {
  return {
    id: String(comandaBackend.id),
    pedidoId: String(comandaBackend.pedido_id),
    clienteNombre: comandaBackend.cliente_nombre || 'Cliente sin nombre',
    clienteDireccion: comandaBackend.cliente_direccion || '',
    clienteTelefono: comandaBackend.cliente_telefono || '',
    clienteEmail: comandaBackend.cliente_email || '',
    modalidad: mapearModalidadBackendAFrontend(comandaBackend.modalidad),
    horarioEntrega: comandaBackend.horario_entrega 
      ? new Date(comandaBackend.horario_entrega).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      : null,
    estado: mapearEstadoBackendAFrontend(comandaBackend.estado),
    observaciones: comandaBackend.observaciones || '',
    fecha: comandaBackend.fecha ? new Date(comandaBackend.fecha) : new Date(),
    articulos: articulos.map(art => {
      // Parsear personalizaciones si es string JSON
      let personalizaciones = null;
      if (art.personalizaciones) {
        try {
          personalizaciones = typeof art.personalizaciones === 'string' 
            ? JSON.parse(art.personalizaciones) 
            : art.personalizaciones;
        } catch (e) {
          console.warn('Error parseando personalizaciones:', e);
          personalizaciones = null;
        }
      }

      return {
        id: art.id,
        articuloId: art.articulo_id,
        articuloNombre: art.articulo_nombre,
        cantidad: art.cantidad,
        personalizaciones: personalizaciones,
        observaciones: art.observaciones || null
      };
    })
  };
};

// Transformar comanda del frontend al formato del backend
const transformarComandaFrontendABackend = (comandaFrontend) => {
  return {
    pedido_id: parseInt(comandaFrontend.pedidoId) || parseInt(comandaFrontend.pedido_id),
    cliente_nombre: comandaFrontend.clienteNombre || comandaFrontend.cliente_nombre || '',
    cliente_direccion: comandaFrontend.clienteDireccion || comandaFrontend.cliente_direccion || '',
    cliente_telefono: comandaFrontend.clienteTelefono || comandaFrontend.cliente_telefono || '',
    cliente_email: comandaFrontend.clienteEmail || comandaFrontend.cliente_email || '',
    modalidad: mapearModalidadFrontendABackend(comandaFrontend.modalidad),
    horario_entrega: comandaFrontend.horarioEntrega 
      ? new Date(`${new Date().toISOString().split('T')[0]} ${comandaFrontend.horarioEntrega}`).toISOString()
      : null,
    estado: mapearEstadoFrontendABackend(comandaFrontend.estado || 'recibido'),
    observaciones: comandaFrontend.observaciones || '',
    articulos: comandaFrontend.articulos?.map(art => ({
      articulo_id: art.articuloId || art.articulo_id,
      articulo_nombre: art.articuloNombre || art.articulo_nombre,
      cantidad: parseInt(art.cantidad) || 1,
      personalizaciones: art.personalizaciones ? art.personalizaciones : null,
      observaciones: art.observaciones || null
    })) || []
  };
};

export const comandasService = {
  /**
   * Obtener todas las comandas
   * Por defecto filtra solo las comandas del día actual
   */
  obtenerComandas: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Por defecto, filtrar solo comandas del día actual
      // Usar fecha local para evitar problemas de zona horaria
      const ahora = new Date();
      const hoy = ahora.getFullYear() + '-' + 
                  String(ahora.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(ahora.getDate()).padStart(2, '0'); // YYYY-MM-DD en zona horaria local
      
      if (!filtros.fecha_desde && !filtros.fecha_hasta && filtros.soloHoy !== false) {
        params.append('fecha_desde', hoy);
        params.append('fecha_hasta', hoy);
        console.log('🔍 Filtrando comandas del día:', hoy);
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
      if (filtros.pedido_id) {
        params.append('pedido_id', filtros.pedido_id);
      }

      const url = API_CONFIG.ENDPOINTS.COMANDAS.LIST + (params.toString() ? `?${params.toString()}` : '');
      
      // Agregar timeout a la llamada principal (10 segundos máximo)
      const comandasPromise = apiRequest.get(url);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout obteniendo comandas')), 10000)
      );
      
      let response;
      try {
        response = await Promise.race([comandasPromise, timeoutPromise]);
      } catch (timeoutError) {
        console.error('⏱️ Timeout obteniendo comandas:', timeoutError);
        return {
          success: false,
          error: 'Timeout al obtener comandas. Intenta nuevamente.',
          data: []
        };
      }

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al obtener comandas',
          data: []
        };
      }

      const comandasBackend = response.data.data || response.data || [];
      
      // Transformar cada comanda y obtener sus artículos
      // Usar Promise.allSettled para que si una comanda falla, las demás continúen
      const comandasTransformadas = await Promise.allSettled(
        comandasBackend.map(async (comanda) => {
          try {
            // Agregar timeout a la llamada de artículos (3 segundos máximo)
            const articulosPromise = apiRequest.get(`${API_CONFIG.ENDPOINTS.COMANDAS.BY_ID(comanda.id)}`);
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout obteniendo artículos')), 3000)
            );
            
            const articulosResponse = await Promise.race([articulosPromise, timeoutPromise]);
            const articulos = articulosResponse.data?.data?.articulos || articulosResponse.data?.articulos || [];
            return transformarComandaBackendAFrontend(comanda, articulos);
          } catch (error) {
            console.warn(`⚠️ Error obteniendo artículos de la comanda ${comanda.id}:`, error.message || error);
            // Retornar comanda sin artículos en lugar de fallar completamente
            return transformarComandaBackendAFrontend(comanda, []);
          }
        })
      );
      
      // Filtrar solo las comandas que se procesaron correctamente
      const comandasValidas = comandasTransformadas
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      return {
        success: true,
        data: comandasValidas
      };
    } catch (error) {
      console.error('❌ Error al obtener comandas:', error);
      
      // Si es un error de timeout, devolver mensaje específico
      if (error.message?.includes('Timeout')) {
        return {
          success: false,
          error: 'Timeout al obtener comandas. El servidor está tardando demasiado.',
          data: []
        };
      }
      
      // Si es un error de red, devolver mensaje específico
      if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error') || error.message?.includes('timeout')) {
        return {
          success: false,
          error: 'Error de conexión. Verifica tu conexión a internet.',
          data: []
        };
      }
      
      // Error genérico
      return {
        success: false,
        error: error.response?.data?.mensaje || error.response?.data?.message || error.message || 'Error al obtener comandas',
        data: []
      };
    }
  },

  /**
   * Obtener una comanda por ID
   */
  obtenerComandaPorId: async (id) => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.COMANDAS.BY_ID(id));

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al obtener comanda'
        };
      }

      const data = response.data.data || response.data;
      const comanda = data.comanda || data;
      const articulos = data.articulos || [];

      return {
        success: true,
        data: transformarComandaBackendAFrontend(comanda, articulos)
      };
    } catch (error) {
      console.error('Error al obtener comanda:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al obtener comanda'
      };
    }
  },

  /**
   * Crear una nueva comanda
   */
  crearComanda: async (comandaData) => {
    try {
      const comandaBackend = transformarComandaFrontendABackend(comandaData);

      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.COMANDAS.CREATE,
        comandaBackend
      );

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al crear comanda'
        };
      }

      const comandaCreada = response.data.data || response.data;
      
      return {
        success: true,
        data: {
          id: String(comandaCreada.id),
          ...comandaData
        },
        mensaje: response.data.message || 'Comanda creada exitosamente'
      };
    } catch (error) {
      console.error('Error al crear comanda:', error);
      
      let errorMessage = 'Error al crear comanda';
      if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map(e => e.message).join(', ');
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  /**
   * Actualizar estado de una comanda
   */
  actualizarEstadoComanda: async (id, nuevoEstado) => {
    try {
      const estadoBackend = mapearEstadoFrontendABackend(nuevoEstado);
      console.log(`🔄 Actualizando comanda ${id} a estado: ${estadoBackend} (desde ${nuevoEstado})`);

      const response = await apiRequest.put(
        `${API_CONFIG.ENDPOINTS.COMANDAS.BY_ID(id)}/estado`,
        { estado: estadoBackend }
      );
      
      console.log(`📦 Respuesta al actualizar estado de comanda:`, JSON.stringify(response.data, null, 2));

      if (response.data?.error === true || response.data?.success === false) {
        // Verificar si es rate limit
        const isRateLimit = response.data.status === 429 || 
                           response.data.rateLimit === true ||
                           response.data.mensaje?.includes('Rate limit') ||
                           response.data.mensaje?.includes('rate limit');
        
        return {
          success: false,
          error: response.data.mensaje || 'Error al actualizar estado',
          rateLimit: isRateLimit,
          retryAfter: response.data.retryAfter,
          status: response.data.status
        };
      }

      return {
        success: true,
        mensaje: response.data.message || 'Estado actualizado correctamente'
      };
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al actualizar estado'
      };
    }
  },

  /**
   * Actualizar observaciones de una comanda
   */
  actualizarObservaciones: async (id, observaciones) => {
    try {
      const response = await apiRequest.put(
        `${API_CONFIG.ENDPOINTS.COMANDAS.BY_ID(id)}/observaciones`,
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
  }
};

