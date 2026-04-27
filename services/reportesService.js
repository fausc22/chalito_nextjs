import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

const DEFAULT_ERROR = 'No pudimos cargar los reportes. Intentá nuevamente.';

export const reportesService = {
  obtenerDashboard: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();

      if (filtros.desde) params.append('desde', filtros.desde);
      if (filtros.hasta) params.append('hasta', filtros.hasta);
      if (filtros.limit) params.append('limit', String(filtros.limit));

      const queryString = params.toString();
      const url = queryString
        ? `${API_CONFIG.ENDPOINTS.REPORTES.DASHBOARD}?${queryString}`
        : API_CONFIG.ENDPOINTS.REPORTES.DASHBOARD;

      const response = await apiRequest.get(url);
      const payload = response?.data;

      if (!payload || payload.error === true || payload.ok === false || payload.success === false) {
        return {
          success: false,
          error:
            payload?.message ||
            payload?.mensaje ||
            payload?.data?.message ||
            payload?.data?.mensaje ||
            DEFAULT_ERROR,
        };
      }

      return {
        success: true,
        filtros: payload?.filtros || {},
        data: payload?.data || {},
      };
    } catch (error) {
      console.error('❌ Error al obtener dashboard de reportes:', error);
      return {
        success: false,
        error: error?.response?.data?.message || error?.message || DEFAULT_ERROR,
      };
    }
  },
};

