import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para información del sistema (health, métricas)
 * Uso interno, no para mostrar al usuario final
 */
export const systemService = {
  /**
   * Obtener estado del worker
   * @returns {Promise<{success: boolean, data?: {active: boolean, lastExecution?: string}, error?: string}>}
   */
  obtenerHealthWorker: async () => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.HEALTH.WORKER);

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al obtener estado del worker',
          data: { active: false }
        };
      }

      const raw = response.data || {};
      const payload = raw.data || raw;
      const active = payload.active === true || payload.running === true;

      return {
        success: true,
        data: {
          ...payload,
          active
        }
      };
    } catch (error) {
      console.error('Error al obtener health del worker:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al obtener estado del worker',
        data: { active: false }
      };
    }
  },

  /**
   * Obtener métricas de pedidos atrasados
   * @returns {Promise<{success: boolean, data?: {count: number, pedidos?: Array}, error?: string}>}
   */
  obtenerMetricasPedidosAtrasados: async () => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.METRICS.PEDIDOS_ATRASADOS);

      if (response.data?.error === true) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al obtener métricas',
          data: { count: 0, pedidos: [] }
        };
      }

      const raw = response.data || {};
      const data = raw.metrics || raw.data || raw || {};

      return {
        success: true,
        data: {
          count: data.count ?? data.cantidad_atrasados ?? 0,
          pedidos: data.pedidos || []
        }
      };
    } catch (error) {
      console.error('Error al obtener métricas de pedidos atrasados:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al obtener métricas',
        data: { count: 0, pedidos: [] }
      };
    }
  }
};



