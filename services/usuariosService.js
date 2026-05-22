import { apiRequest, getApiErrorMessage } from './api';
import { API_CONFIG } from '../config/api';

export const usuariosService = {
  listar: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      if (filtros.page) params.append('page', String(filtros.page));
      if (filtros.limit) params.append('limit', String(filtros.limit));
      if (filtros.q) params.append('q', filtros.q);
      if (filtros.rol) params.append('rol', filtros.rol);
      if (filtros.activo !== undefined && filtros.activo !== 'all') {
        params.append('activo', filtros.activo === true || filtros.activo === '1' ? '1' : '0');
      }

      const qs = params.toString();
      const url = qs
        ? `${API_CONFIG.ENDPOINTS.USUARIOS.LIST}?${qs}`
        : API_CONFIG.ENDPOINTS.USUARIOS.LIST;

      const response = await apiRequest.get(url);
      if (response.data?.success === false) {
        return { success: false, error: getApiErrorMessage(response, 'Error al listar usuarios') };
      }
      return {
        success: true,
        data: response.data?.data || [],
        pagination: response.data?.pagination || {},
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al listar usuarios',
      };
    }
  },

  obtener: async (id) => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.USUARIOS.BY_ID(id));
      if (response.data?.success === false) {
        return { success: false, error: getApiErrorMessage(response, 'Error al obtener usuario') };
      }
      return { success: true, data: response.data?.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al obtener usuario' };
    }
  },

  crear: async (payload) => {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.USUARIOS.LIST, payload);
      if (response.data?.success === false) {
        return { success: false, error: getApiErrorMessage(response, 'Error al crear usuario') };
      }
      return { success: true, data: response.data?.data, message: response.data?.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al crear usuario' };
    }
  },

  actualizar: async (id, payload) => {
    try {
      const response = await apiRequest.put(API_CONFIG.ENDPOINTS.USUARIOS.BY_ID(id), payload);
      if (response.data?.success === false) {
        return { success: false, error: getApiErrorMessage(response, 'Error al actualizar usuario') };
      }
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message,
        requiresRelogin: response.data?.requiresRelogin,
      };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al actualizar usuario' };
    }
  },

  setActivo: async (id, activo) => {
    try {
      const response = await apiRequest.patch(API_CONFIG.ENDPOINTS.USUARIOS.ACTIVO(id), { activo });
      if (response.data?.success === false) {
        return { success: false, error: getApiErrorMessage(response, 'Error al cambiar estado') };
      }
      return { success: true, data: response.data?.data, message: response.data?.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al cambiar estado' };
    }
  },

  resetPassword: async (id, payload) => {
    try {
      const response = await apiRequest.put(API_CONFIG.ENDPOINTS.USUARIOS.PASSWORD(id), payload);
      if (response.data?.success === false) {
        return { success: false, error: getApiErrorMessage(response, 'Error al restablecer contraseña') };
      }
      return { success: true, message: response.data?.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al restablecer contraseña',
      };
    }
  },
};
