import { apiRequest, getApiErrorMessage, getApiErrorFromCatch } from './api';
import { API_CONFIG } from '../config/api';

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.insumos)) return payload.insumos;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
};

const isHttpError = (response) =>
  response && (response.status >= 400 || response.data?.success === false || response.data?.error === true);

const getErrorMessage = (response, fallback) => getApiErrorMessage(response, fallback);

export const insumosSemanalesService = {
  obtenerInsumos: async (filtros = {}) => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.STOCK_SEMANAL.INSUMOS.LIST, {
        params: filtros,
      });

      if (isHttpError(response)) {
        return {
          success: false,
          error: getErrorMessage(response, 'Error al obtener insumos semanales'),
        };
      }

      const raw = response.data?.data ?? response.data;
      return {
        success: true,
        data: extractList(raw),
      };
    } catch (error) {
      console.error('Error al obtener insumos semanales:', error);
      return {
        success: false,
        error: getApiErrorFromCatch(error, 'Error al obtener insumos semanales'),
      };
    }
  },

  crearInsumo: async (payload) => {
    try {
      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.STOCK_SEMANAL.INSUMOS.CREATE,
        payload
      );

      if (isHttpError(response)) {
        return {
          success: false,
          error: getErrorMessage(response, 'Error al crear insumo semanal'),
        };
      }

      return {
        success: true,
        data: response.data?.data ?? response.data,
        mensaje: response.data?.mensaje || response.data?.message,
      };
    } catch (error) {
      console.error('Error al crear insumo semanal:', error);
      return {
        success: false,
        error: getApiErrorFromCatch(error, 'Error al crear insumo semanal'),
      };
    }
  },

  actualizarInsumo: async (id, payload) => {
    try {
      const response = await apiRequest.put(
        API_CONFIG.ENDPOINTS.STOCK_SEMANAL.INSUMOS.BY_ID(id),
        payload
      );

      if (isHttpError(response)) {
        return {
          success: false,
          error: getErrorMessage(response, 'Error al actualizar insumo semanal'),
        };
      }

      return {
        success: true,
        data: response.data?.data ?? response.data,
        mensaje: response.data?.mensaje || response.data?.message,
      };
    } catch (error) {
      console.error('Error al actualizar insumo semanal:', error);
      return {
        success: false,
        error: getApiErrorFromCatch(error, 'Error al actualizar insumo semanal'),
      };
    }
  },

  /**
   * Activa o inactiva un insumo (PATCH dedicado, alineado a empleados /status).
   */
  actualizarActivo: async (id, activo) => {
    try {
      const response = await apiRequest.patch(
        API_CONFIG.ENDPOINTS.STOCK_SEMANAL.INSUMOS.ACTIVO(id),
        { activo: Boolean(activo) }
      );

      if (isHttpError(response)) {
        return {
          success: false,
          error: getErrorMessage(response, 'Error al cambiar el estado del insumo'),
        };
      }

      return {
        success: true,
        data: response.data?.data ?? response.data,
        mensaje: response.data?.mensaje || response.data?.message,
      };
    } catch (error) {
      console.error('Error al actualizar estado del insumo:', error);
      return {
        success: false,
        error: getApiErrorFromCatch(error, 'Error al cambiar el estado del insumo'),
      };
    }
  },

  eliminarInsumo: async (id) => {
    try {
      const response = await apiRequest.delete(API_CONFIG.ENDPOINTS.STOCK_SEMANAL.INSUMOS.DELETE(id));

      if (isHttpError(response)) {
        return {
          success: false,
          error: getErrorMessage(response, 'Error al eliminar el insumo'),
        };
      }

      return {
        success: true,
        data: response.data?.data ?? response.data,
        mensaje: response.data?.mensaje || response.data?.message,
      };
    } catch (error) {
      console.error('Error al eliminar insumo semanal:', error);
      return {
        success: false,
        error: getApiErrorFromCatch(error, 'Error al eliminar el insumo'),
      };
    }
  },
};
