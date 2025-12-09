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
      // Mapear campos del frontend al backend
      const dataToSend = {
        categoria_id: articuloData.categoria_id,
        nombre: articuloData.nombre,
        descripcion: articuloData.descripcion || null,
        precio: parseFloat(articuloData.precio),
        codigo_barra: articuloData.codigo || null,
        stock_actual: articuloData.stock_actual ? parseInt(articuloData.stock_actual) : 0,
        stock_minimo: articuloData.stock_minimo ? parseInt(articuloData.stock_minimo) : 0,
        tipo: articuloData.tipo || 'OTRO',
        imagen_url: null,
        ingredientes: articuloData.tipo === 'ELABORADO' ? (articuloData.ingredientes || []) : []
      };

      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.ARTICULOS.CREATE,
        dataToSend
      );

      // Verificar si la respuesta es un error transformado por el interceptor
      if (response.data?.error === true) {
        const status = response.data.status;
        let errorMessage = 'Error al crear artículo';

        if (status === 409) {
          errorMessage = response.data.mensaje || 'Ya existe un artículo con ese nombre o código de barras';
        } else if (status === 400) {
          errorMessage = response.data.mensaje || 'Datos inválidos. Verifica la información ingresada';
        } else {
          errorMessage = response.data.mensaje || `Error ${status}: No se pudo crear el artículo`;
        }

        return {
          success: false,
          error: errorMessage
        };
      }

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || 'Artículo creado correctamente'
      };
    } catch (error) {
      console.error('Error al crear artículo:', error);

      // Manejo específico para diferentes códigos de error
      let errorMessage = 'Error al crear artículo';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 409) {
          errorMessage = data?.mensaje || data?.message || 'Ya existe un artículo con ese nombre o código de barras';
        } else if (status === 400) {
          errorMessage = data?.mensaje || data?.message || 'Datos inválidos. Verifica la información ingresada';
        } else {
          errorMessage = data?.mensaje || data?.message || `Error ${status}: No se pudo crear el artículo`;
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Actualizar artículo existente
  actualizarArticulo: async (id, articuloData) => {
    try {
      // Mapear campos del frontend al backend
      const dataToSend = {
        categoria_id: articuloData.categoria_id,
        nombre: articuloData.nombre,
        descripcion: articuloData.descripcion || null,
        precio: parseFloat(articuloData.precio),
        codigo_barra: articuloData.codigo || null,
        stock_actual: articuloData.stock_actual !== undefined && articuloData.stock_actual !== '' ? parseInt(articuloData.stock_actual) : 0,
        stock_minimo: articuloData.stock_minimo !== undefined && articuloData.stock_minimo !== '' ? parseInt(articuloData.stock_minimo) : 0,
        tipo: articuloData.tipo || 'OTRO',
        activo: articuloData.activo ? 1 : 0,
        ingredientes: articuloData.tipo === 'ELABORADO' ? (articuloData.ingredientes || []) : []
      };

      const response = await apiRequest.put(
        API_CONFIG.ENDPOINTS.ARTICULOS.BY_ID(id),
        dataToSend
      );

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || 'Artículo actualizado correctamente'
      };
    } catch (error) {
      console.error('Error al actualizar artículo:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.response?.data?.message || 'Error al actualizar artículo'
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
        mensaje: response.data.mensaje || 'Artículo eliminado correctamente'
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
      const categoriasUnicas = [...new Set(articulos.map(a => a.categoria))];

      return {
        success: true,
        data: {
          total: articulos.length,
          disponibles: articulos.filter(a => a.activo).length,
          noDisponibles: articulos.filter(a => !a.activo).length,
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
