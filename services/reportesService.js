import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

const DEFAULT_ERROR = 'No pudimos cargar los reportes. Intentá nuevamente.';

export const reportesService = {
  obtenerDashboard: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();

      const month = filtros.month;
      const year = filtros.year;
      const dateFrom = filtros.date_from || filtros.desde;
      const dateTo = filtros.date_to || filtros.hasta;
      const rankingLimit = filtros.ranking_limit || filtros.limit;
      const paymentMethod = filtros.payment_method || filtros.medioPago;
      const origin = filtros.origin || filtros.origenPedido;

      if (month !== undefined && month !== null && month !== '') {
        params.append('month', String(month));
      }
      if (year !== undefined && year !== null && year !== '') {
        params.append('year', String(year));
      }
      if (dateFrom) {
        params.append('date_from', dateFrom);
        params.append('desde', dateFrom);
      }
      if (dateTo) {
        params.append('date_to', dateTo);
        params.append('hasta', dateTo);
      }
      if (rankingLimit) {
        params.append('ranking_limit', String(rankingLimit));
        params.append('limit', String(rankingLimit));
      }
      if (paymentMethod) params.append('payment_method', paymentMethod);
      if (origin) params.append('origin', origin);

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

