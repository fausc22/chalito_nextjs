import { apiRequest, getApiErrorMessage } from './api';
import { API_CONFIG } from '../config/api';

export const whatsappService = {
  async obtenerEstado() {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.WHATSAPP.ESTADO);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al obtener estado'),
        };
      }
      const { success, ...estado } = response.data;
      return { success: true, ...estado };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener estado',
      };
    }
  },

  async obtenerQr() {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.WHATSAPP.QR);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al obtener QR'),
        };
      }
      return { success: true, ...response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener QR',
      };
    }
  },

  async conectar() {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.WHATSAPP.CONECTAR);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al conectar'),
        };
      }
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al conectar',
      };
    }
  },

  async desconectar() {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.WHATSAPP.DESCONECTAR);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al desconectar'),
        };
      }
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al desconectar',
      };
    }
  },

  async getSettings() {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.WHATSAPP.SETTINGS);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al obtener configuración'),
        };
      }
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener configuración',
      };
    }
  },

  async getPreviews() {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.WHATSAPP.PREVIEWS);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al obtener ejemplos'),
        };
      }
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener ejemplos',
      };
    }
  },

  async updateSettings(payload) {
    try {
      const response = await apiRequest.put(API_CONFIG.ENDPOINTS.WHATSAPP.SETTINGS, payload);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al guardar configuración'),
        };
      }
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al guardar configuración',
      };
    }
  },
};
