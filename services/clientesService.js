import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

export const clientesService = {
  buscarSugerencias: async (q) => {
    try {
      const query = String(q || '').trim();
      if (query.length < 2) {
        return { success: true, data: [] };
      }

      const response = await apiRequest.get(
        `${API_CONFIG.ENDPOINTS.CLIENTES.SUGERENCIAS}?q=${encodeURIComponent(query)}`
      );

      if (response.data?.error === true || response.data?.success === false) {
        return { success: false, error: response.data?.mensaje || 'Error al buscar clientes', data: [] };
      }

      return {
        success: true,
        data: response.data?.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al buscar clientes',
        data: [],
      };
    }
  },

  listar: async ({ page = 1, limit = 20, q = '' } = {}) => {
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (q) params.set('q', q);

      const response = await apiRequest.get(`${API_CONFIG.ENDPOINTS.CLIENTES.LIST}?${params.toString()}`);
      if (response.data?.error === true || response.data?.success === false) {
        return {
          success: false,
          error: response.data?.mensaje || 'Error al listar clientes',
          data: [],
          pagination: null,
        };
      }

      return {
        success: true,
        data: response.data?.data || [],
        pagination: response.data?.pagination || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al listar clientes',
        data: [],
        pagination: null,
      };
    }
  },

  obtenerPorId: async (id) => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.CLIENTES.BY_ID(id));
      if (response.data?.error === true || response.data?.success === false) {
        return {
          success: false,
          error: response.data?.mensaje || 'Error al obtener cliente',
        };
      }
      return { success: true, data: response.data?.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al obtener cliente',
      };
    }
  },

  obtenerHistorial: async (id, limit = 20) => {
    try {
      const response = await apiRequest.get(`${API_CONFIG.ENDPOINTS.CLIENTES.HISTORIAL(id)}?limit=${limit}`);
      if (response.data?.error === true || response.data?.success === false) {
        return {
          success: false,
          error: response.data?.mensaje || 'Error al obtener historial',
          data: { pedidos: [], ventas: [], direcciones: [] },
        };
      }
      return {
        success: true,
        data: response.data?.data || { pedidos: [], ventas: [], direcciones: [] },
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al obtener historial',
        data: { pedidos: [], ventas: [], direcciones: [] },
      };
    }
  },

  actualizar: async (id, payload) => {
    try {
      const response = await apiRequest.put(API_CONFIG.ENDPOINTS.CLIENTES.UPDATE(id), payload);
      if (response.data?.error === true || response.data?.success === false) {
        return { success: false, error: response.data?.mensaje || 'Error al actualizar cliente' };
      }
      return { success: true, data: response.data?.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al actualizar cliente',
      };
    }
  },
};
