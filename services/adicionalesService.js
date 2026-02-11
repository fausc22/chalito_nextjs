import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

export const adicionalesService = {
  // Obtener todos los adicionales activos (para selectores)
  obtenerAdicionalesActivos: async () => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.ADICIONALES.LIST, {
        params: { disponible: true, limite: 1000 }
      });

      return {
        success: true,
        data: response.data.data || response.data || []
      };
    } catch (error) {
      console.error('Error al obtener adicionales activos:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al obtener adicionales',
        data: []
      };
    }
  },

  // Obtener adicionales con filtros y paginación
  obtenerAdicionales: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filtros.nombre) params.append('nombre', filtros.nombre);
      if (filtros.disponible !== undefined) params.append('disponible', filtros.disponible);
      if (filtros.limite) params.append('limite', filtros.limite);
      if (filtros.pagina) params.append('pagina', filtros.pagina);

      const url = API_CONFIG.ENDPOINTS.ADICIONALES.LIST + (params.toString() ? `?${params.toString()}` : '');
      const response = await apiRequest.get(url);

      // Verificar si la respuesta es un error transformado
      if (response.data?.error === true || response.data?.success === false) {
        return {
          success: false,
          error: response.data.mensaje || response.data.message || 'Error al obtener adicionales',
          data: [],
          meta: {}
        };
      }

      return {
        success: true,
        data: response.data.data || response.data || [],
        meta: response.data.meta || {
          pagina_actual: 1,
          total_registros: (response.data.data || response.data || []).length,
          total_paginas: 1,
          registros_por_pagina: 10,
          hay_mas: false
        }
      };
    } catch (error) {
      console.error('Error al obtener adicionales:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al obtener adicionales',
        data: [],
        meta: {}
      };
    }
  },

  // Obtener adicional por ID
  obtenerAdicionalPorId: async (id) => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.ADICIONALES.BY_ID(id));

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al obtener adicional'
        };
      }

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error al obtener adicional:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al obtener adicional'
      };
    }
  },

  // Crear nuevo adicional
  crearAdicional: async (adicionalData) => {
    try {
      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.ADICIONALES.CREATE,
        adicionalData
      );

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al crear adicional'
        };
      }

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || response.data.message || 'Adicional creado correctamente'
      };
    } catch (error) {
      // Manejo específico para error 409 (Conflict) - nombre duplicado
      if (error.response?.status === 409) {
        return {
          success: false,
          error: error.response?.data?.mensaje || 'Ya existe un adicional con ese nombre. Por favor, usa un nombre diferente.'
        };
      }

      console.error('Error al crear adicional:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al crear adicional'
      };
    }
  },

  // Actualizar adicional existente
  actualizarAdicional: async (id, adicionalData) => {
    try {
      const response = await apiRequest.put(
        API_CONFIG.ENDPOINTS.ADICIONALES.BY_ID(id),
        adicionalData
      );

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al actualizar adicional'
        };
      }

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || response.data.message || 'Adicional actualizado correctamente'
      };
    } catch (error) {
      // Manejo específico para error 409 (Conflict) - nombre duplicado
      if (error.response?.status === 409) {
        return {
          success: false,
          error: error.response?.data?.mensaje || 'Ya existe un adicional con ese nombre. Por favor, usa un nombre diferente.'
        };
      }

      console.error('Error al actualizar adicional:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al actualizar adicional'
      };
    }
  },

  // Eliminar adicional (marcar como no disponible)
  eliminarAdicional: async (id) => {
    try {
      const response = await apiRequest.delete(API_CONFIG.ENDPOINTS.ADICIONALES.BY_ID(id));

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al eliminar adicional'
        };
      }

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || response.data.message || 'Adicional eliminado correctamente'
      };
    } catch (error) {
      // Manejo específico para error 400 (Bad Request) - adicional en uso
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response?.data?.mensaje || error.response?.data?.message || 'No se puede eliminar el adicional. Puede que esté siendo usado en artículos.'
        };
      }

      console.error('Error al eliminar adicional:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.response?.data?.message || 'Error al eliminar adicional'
      };
    }
  },

  // ==========================================
  // FUNCIONES PARA ADICIONALES_CONTENIDO
  // ==========================================

  // Obtener adicionales asignados a un artículo
  obtenerAdicionalesPorArticulo: async (articuloId) => {
    try {
      const response = await apiRequest.get(
        API_CONFIG.ENDPOINTS.ADICIONALES.ADICIONALES_POR_ARTICULO(articuloId)
      );

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al obtener adicionales del artículo',
          data: []
        };
      }

      return {
        success: true,
        data: response.data.data || response.data || []
      };
    } catch (error) {
      console.error('Error al obtener adicionales del artículo:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al obtener adicionales del artículo',
        data: []
      };
    }
  },

  // Asignar adicionales a un artículo
  asignarAdicionalesAArticulo: async (articuloId, adicionalesIds) => {
    try {
      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.ADICIONALES.ASIGNAR_A_ARTICULO(articuloId),
        { adicionales: adicionalesIds }
      );

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al asignar adicionales'
        };
      }

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || response.data.message || 'Adicionales asignados correctamente'
      };
    } catch (error) {
      console.error('Error al asignar adicionales:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al asignar adicionales'
      };
    }
  },

  // Eliminar asignación de adicional a artículo
  eliminarAdicionalDeArticulo: async (articuloId, adicionalId) => {
    try {
      const response = await apiRequest.delete(
        API_CONFIG.ENDPOINTS.ADICIONALES.ELIMINAR_DE_ARTICULO(articuloId, adicionalId)
      );

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al eliminar adicional del artículo'
        };
      }

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || response.data.message || 'Adicional eliminado del artículo correctamente'
      };
    } catch (error) {
      console.error('Error al eliminar adicional del artículo:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al eliminar adicional del artículo'
      };
    }
  }
};








