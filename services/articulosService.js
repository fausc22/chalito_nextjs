import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

export const articulosService = {
  // Obtener todos los artículos
  obtenerArticulos: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();

      if (filtros.categoria) params.append('categoria', filtros.categoria);
      if (filtros.disponible !== undefined) params.append('disponible', filtros.disponible);

      const url = API_CONFIG.ENDPOINTS.ARTICULOS.LIST + (params.toString() ? `?${params.toString()}` : '');
      const response = await apiRequest.get(url);

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error al obtener artículos:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al obtener artículos'
      };
    }
  },

  // Obtener artículo por ID
  obtenerArticuloPorId: async (id) => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.ARTICULOS.BY_ID(id));

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error al obtener artículo:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al obtener artículo'
      };
    }
  },

  // Obtener categorías disponibles
  obtenerCategorias: async () => {
    try {
      const response = await apiRequest.get(`${API_CONFIG.ENDPOINTS.ARTICULOS.LIST}/categorias`);

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return {
        success: false,
        data: ['Entrada', 'Plato Principal', 'Postre', 'Bebida', 'Otros'],
        error: error.message
      };
    }
  },

  // Crear nuevo artículo
  crearArticulo: async (articuloData) => {
    try {
      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.ARTICULOS.CREATE,
        {
          ...articuloData,
          precio: parseFloat(articuloData.precio),
          tiempoPreparacion: parseInt(articuloData.tiempoPreparacion)
        }
      );

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || 'Artículo creado exitosamente'
      };
    } catch (error) {
      console.error('Error al crear artículo:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al crear artículo'
      };
    }
  },

  // Actualizar artículo existente
  actualizarArticulo: async (id, articuloData) => {
    try {
      const response = await apiRequest.put(
        API_CONFIG.ENDPOINTS.ARTICULOS.BY_ID(id),
        {
          ...articuloData,
          precio: parseFloat(articuloData.precio),
          tiempoPreparacion: parseInt(articuloData.tiempoPreparacion)
        }
      );

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || 'Artículo actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error al actualizar artículo:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al actualizar artículo'
      };
    }
  },

  // Eliminar artículo (marcar como inactivo)
  eliminarArticulo: async (id) => {
    try {
      const response = await apiRequest.delete(API_CONFIG.ENDPOINTS.ARTICULOS.BY_ID(id));

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || 'Artículo eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error al eliminar artículo:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al eliminar artículo'
      };
    }
  },

  // Obtener estadísticas de artículos
  obtenerEstadisticas: async () => {
    try {
      const response = await articulosService.obtenerArticulos();

      if (!response.success) {
        throw new Error('Error al obtener artículos');
      }

      const articulos = response.data;
      const categoriasResponse = await articulosService.obtenerCategorias();
      const categorias = categoriasResponse.data || [];

      // Obtener categorías únicas de los artículos
      const categoriasUnicas = [...new Set(articulos.map(a => a.categoria))];

      return {
        success: true,
        data: {
          total: articulos.length,
          disponibles: articulos.filter(a => a.disponible).length,
          noDisponibles: articulos.filter(a => !a.disponible).length,
          totalCategorias: categoriasUnicas.length,
          promedioPrecios: articulos.length > 0
            ? (articulos.reduce((sum, a) => sum + a.precio, 0) / articulos.length).toFixed(2)
            : 0,
          promedioTiempoPrep: articulos.length > 0
            ? Math.round(articulos.reduce((sum, a) => sum + a.tiempoPreparacion, 0) / articulos.length)
            : 0
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        success: false,
        data: {
          total: 0,
          disponibles: 0,
          noDisponibles: 0,
          totalCategorias: 0,
          promedioPrecios: 0,
          promedioTiempoPrep: 0
        },
        error: error.message
      };
    }
  }
};
