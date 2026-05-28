import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

const DEFAULT_ERROR = 'No pudimos cargar los reportes. Intentá nuevamente.';

export const reportesService = {
  obtenerDashboard: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();

      const dateFrom = filtros.desde || filtros.date_from;
      const dateTo = filtros.hasta || filtros.date_to;
      const rankingLimit = filtros.limit ?? filtros.ranking_limit;
      const medioPago = filtros.medio_pago || filtros.medioPago || filtros.payment_method;
      const origenPedido = filtros.origen_pedido || filtros.origenPedido || filtros.origin;

      if (dateFrom) {
        params.append('desde', dateFrom);
      }
      if (dateTo) {
        params.append('hasta', dateTo);
      }
      if (rankingLimit) {
        params.append('limit', String(rankingLimit));
      }
      if (medioPago) {
        params.append('medio_pago', medioPago);
      }
      if (origenPedido) {
        params.append('origen_pedido', origenPedido);
      }

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
