import { apiRequest, getApiErrorMessage } from './api';
import { API_CONFIG } from '../config/api';

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const cuponesService = {
  formatDateTime,

  async listar() {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.CUPONES.LIST);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al listar cupones'),
          cupones: [],
        };
      }
      return { success: true, cupones: response.data.cupones || [] };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al listar cupones',
        cupones: [],
      };
    }
  },

  async crear(payload) {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.CUPONES.LIST, payload);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al crear cupón'),
        };
      }
      return { success: true, id: response.data.id, message: 'Cupón creado' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear cupón',
      };
    }
  },

  async actualizar(id, payload) {
    try {
      const response = await apiRequest.put(API_CONFIG.ENDPOINTS.CUPONES.BY_ID(id), payload);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al actualizar cupón'),
        };
      }
      return { success: true, message: 'Cupón actualizado' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar cupón',
      };
    }
  },

  async toggleActivo(id) {
    try {
      const response = await apiRequest.put(API_CONFIG.ENDPOINTS.CUPONES.TOGGLE(id));
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al cambiar estado'),
        };
      }
      return { success: true, activo: response.data.activo };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cambiar estado',
      };
    }
  },

  formatValor(cupon) {
    if (!cupon) return '';
    if (cupon.tipo === 'porcentaje') return `${parseFloat(cupon.valor)}%`;
    return `$${parseFloat(cupon.valor).toFixed(2)}`;
  },
};
