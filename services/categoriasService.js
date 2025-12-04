import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

export const categoriasService = {
  // Obtener todas las categorías
  obtenerCategorias: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();

      if (filtros.activo !== undefined) params.append('activo', filtros.activo);

      const url = API_CONFIG.ENDPOINTS.CATEGORIAS.LIST + (params.toString() ? `?${params.toString()}` : '');
      const response = await apiRequest.get(url);

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al obtener categorías'
      };
    }
  },

  // Obtener categoría por ID
  obtenerCategoriaPorId: async (id) => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.CATEGORIAS.BY_ID(id));

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al obtener categoría'
      };
    }
  },

  // Crear nueva categoría
  crearCategoria: async (categoriaData) => {
    try {
      const dataToSend = {
        nombre: categoriaData.nombre,
        descripcion: categoriaData.descripcion || null,
        activo: categoriaData.activo ? 1 : 0
      };

      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.CATEGORIAS.CREATE,
        dataToSend
      );

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || 'Categoría creada correctamente'
      };
    } catch (error) {
      // Manejo específico para error 409 (Conflict) - nombre duplicado
      if (error.response?.status === 409) {
        return {
          success: false,
          error: error.response?.data?.mensaje || 'Ya existe una categoría con ese nombre. Por favor, usa un nombre diferente.'
        };
      }

      // Solo loguear errores inesperados
      console.error('Error al crear categoría:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al crear categoría'
      };
    }
  },

  // Actualizar categoría existente
  actualizarCategoria: async (id, categoriaData) => {
    try {
      const dataToSend = {
        nombre: categoriaData.nombre,
        descripcion: categoriaData.descripcion || null,
        activo: categoriaData.activo ? 1 : 0
      };

      const response = await apiRequest.put(
        API_CONFIG.ENDPOINTS.CATEGORIAS.BY_ID(id),
        dataToSend
      );

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || 'Categoría actualizada correctamente'
      };
    } catch (error) {
      // Manejo específico para error 409 (Conflict) - nombre duplicado
      if (error.response?.status === 409) {
        return {
          success: false,
          error: error.response?.data?.mensaje || 'Ya existe una categoría con ese nombre. Por favor, usa un nombre diferente.'
        };
      }

      // Solo loguear errores inesperados
      console.error('Error al actualizar categoría:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al actualizar categoría'
      };
    }
  },

  // Eliminar categoría (marcar como inactiva)
  eliminarCategoria: async (id) => {
    try {
      const response = await apiRequest.delete(API_CONFIG.ENDPOINTS.CATEGORIAS.BY_ID(id));

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || 'Categoría eliminada correctamente'
      };
    } catch (error) {
      // Manejo específico para error 400 (Bad Request) - categoría con artículos asociados
      if (error.response?.status === 400) {
        const articulosAsociados = error.response?.data?.articulos_asociados || 0;
        return {
          success: false,
          error: error.response?.data?.mensaje || `No se puede eliminar. La categoría tiene ${articulosAsociados} artículos asociados.`,
          articulos_asociados: articulosAsociados
        };
      }

      // Solo loguear errores inesperados
      console.error('Error al eliminar categoría:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al eliminar categoría'
      };
    }
  },

  // Obtener estadísticas de categorías
  obtenerEstadisticas: async () => {
    try {
      const response = await categoriasService.obtenerCategorias();

      if (!response.success) {
        throw new Error('Error al obtener categorías');
      }

      const categorias = response.data;

      return {
        success: true,
        data: {
          total: categorias.length,
          activas: categorias.filter(c => c.activo).length,
          inactivas: categorias.filter(c => !c.activo).length,
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        success: false,
        data: {
          total: 0,
          activas: 0,
          inactivas: 0,
        },
        error: error.message
      };
    }
  }
};
