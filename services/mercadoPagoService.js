import { apiRequest, getApiErrorMessage } from './api';
import { API_CONFIG } from '../config/api';

export const mercadoPagoService = {
  async obtenerEstado() {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.MERCADOPAGO.ESTADO);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al obtener estado de Mercado Pago'),
        };
      }
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener estado de Mercado Pago',
      };
    }
  },
};
