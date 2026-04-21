import { apiRequest, getApiErrorMessage, getApiErrorFromCatch } from './api';
import { API_CONFIG } from '../config/api';

const isHttpError = (response) =>
  response && (response.status >= 400 || response.data?.success === false || response.data?.error === true);

const getErrorMessage = (response, fallback) => getApiErrorMessage(response, fallback);

const toPositiveInt = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.trunc(parsed);
};

const sanitizeHistoricoParams = (params = {}) => {
  const clean = {};
  const page = toPositiveInt(params.page ?? params.pagina);
  const limit = toPositiveInt(params.limit ?? params.limite);
  const estadoRaw = params.estado;

  if (page !== undefined) clean.page = page;
  if (limit !== undefined) clean.limit = limit;
  if (estadoRaw !== undefined && estadoRaw !== null && String(estadoRaw).trim() !== '') {
    clean.estado = String(estadoRaw).trim();
  }

  return clean;
};

const normalizeHistoricoPayload = (raw) => {
  if (Array.isArray(raw)) {
    return {
      items: raw,
      paginacion: {
        pagina: 1,
        limite: raw.length,
        total: raw.length,
        total_paginas: 1,
      },
    };
  }

  const items =
    (Array.isArray(raw?.items) && raw.items) ||
    (Array.isArray(raw?.rows) && raw.rows) ||
    (Array.isArray(raw?.data) && raw.data) ||
    (Array.isArray(raw?.semanas) && raw.semanas) ||
    [];

  const p = raw?.paginacion ?? raw?.pagination ?? raw?.meta ?? {};
  const pagina = toPositiveInt(p.pagina ?? p.page ?? raw?.pagina ?? raw?.page) ?? 1;
  const limite =
    toPositiveInt(p.limite ?? p.limit ?? p.registros_por_pagina ?? raw?.limite ?? raw?.limit) ??
    (items.length > 0 ? items.length : 20);
  const total =
    Number(p.total ?? p.total_registros ?? p.totalItems ?? raw?.total ?? items.length) || items.length;
  const totalPaginas =
    toPositiveInt(p.total_paginas ?? p.totalPages ?? raw?.total_paginas ?? raw?.totalPages) ??
    Math.max(1, Math.ceil(total / Math.max(1, limite)));

  return {
    ...(raw && typeof raw === 'object' ? raw : {}),
    items,
    paginacion: {
      pagina,
      limite,
      total,
      total_paginas: totalPaginas,
    },
  };
};

const extractDetalles = (raw) => {
  if (!raw || typeof raw !== 'object') return [];
  const d = raw.detalles ?? raw.detalle ?? raw.lineas ?? raw.items ?? raw.detalle_lineas;
  if (Array.isArray(d)) return d;
  return [];
};

/** Normaliza la respuesta del backend a { ...camposSemana, detalles } */
export function normalizeSemanaAbiertaPayload(raw) {
  if (raw == null) return null;
  if (typeof raw !== 'object') return null;
  const detalles = extractDetalles(raw);
  return { ...raw, detalles };
}

/** El GET `/semanas/abierta` solo devuelve la fila de semana; el detalle viene en GET `/semanas/:id` como `detalle`. */
function necesitaHidratarDetalle(raw) {
  if (raw == null || typeof raw !== 'object' || raw.id == null) return false;
  if (Array.isArray(raw.detalle) && raw.detalle.length > 0) return false;
  if (Array.isArray(raw.detalles) && raw.detalles.length > 0) return false;
  return true;
}

export const stockSemanalSemanasService = {
  /**
   * Semana abierta actual. 404 = sin semana abierta (éxito con data null).
   */
  obtenerSemanaAbierta: async () => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.STOCK_SEMANAL.SEMANAS.ABIERTA);

      if (response.status === 404) {
        return { success: true, data: null };
      }

      if (isHttpError(response)) {
        return {
          success: false,
          error: getErrorMessage(response, 'No se pudo obtener la semana abierta'),
        };
      }

      const raw = response.data?.data ?? response.data;
      if (raw == null || (typeof raw === 'object' && Object.keys(raw).length === 0)) {
        return { success: true, data: null };
      }

      let merged = raw;
      if (necesitaHidratarDetalle(raw)) {
        const fullRes = await apiRequest.get(API_CONFIG.ENDPOINTS.STOCK_SEMANAL.SEMANAS.BY_ID(raw.id));
        if (fullRes.status === 404) {
          return {
            success: false,
            error: getErrorMessage(fullRes, 'No se pudo cargar el detalle de la semana abierta'),
          };
        }
        if (isHttpError(fullRes)) {
          return {
            success: false,
            error: getErrorMessage(fullRes, 'No se pudo cargar el detalle de la semana abierta'),
          };
        }
        merged = fullRes.data?.data ?? fullRes.data ?? raw;
      }

      return {
        success: true,
        data: normalizeSemanaAbiertaPayload(merged),
      };
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) {
        return { success: true, data: null };
      }
      console.error('Error al obtener semana abierta:', error);
      return {
        success: false,
        error: getApiErrorFromCatch(error, 'Error al obtener la semana abierta'),
      };
    }
  },

  crearSemana: async (payload) => {
    try {
      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.STOCK_SEMANAL.SEMANAS.CREATE,
        payload
      );

      if (isHttpError(response)) {
        return {
          success: false,
          error: getErrorMessage(response, 'No se pudo crear la semana'),
        };
      }

      const raw = response.data?.data ?? response.data;
      return {
        success: true,
        data: normalizeSemanaAbiertaPayload(raw),
        mensaje: response.data?.mensaje || response.data?.message,
      };
    } catch (error) {
      console.error('Error al crear semana:', error);
      return {
        success: false,
        error: getApiErrorFromCatch(error, 'Error al crear la semana'),
      };
    }
  },

  obtenerSemanaPorId: async (semanaId) => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.STOCK_SEMANAL.SEMANAS.BY_ID(semanaId));

      if (response.status === 404) {
        return { success: false, error: 'Semana no encontrada' };
      }

      if (isHttpError(response)) {
        return {
          success: false,
          error: getErrorMessage(response, 'No se pudo obtener la semana'),
        };
      }

      const raw = response.data?.data ?? response.data;
      return {
        success: true,
        data: normalizeSemanaAbiertaPayload(raw),
      };
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) {
        return { success: false, error: 'Semana no encontrada' };
      }
      console.error('Error al obtener semana por id:', error);
      return {
        success: false,
        error: getApiErrorFromCatch(error, 'Error al obtener la semana'),
      };
    }
  },

  listarHistoricoSemanas: async (params = {}) => {
    try {
      const query = sanitizeHistoricoParams(params);
      const config = Object.keys(query).length > 0 ? { params: query } : {};
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.STOCK_SEMANAL.SEMANAS.LIST, config);

      if (isHttpError(response)) {
        return {
          success: false,
          error: getErrorMessage(response, 'No se pudo cargar el histórico de semanas'),
        };
      }

      const raw = response.data?.data ?? response.data;
      return { success: true, data: normalizeHistoricoPayload(raw) };
    } catch (error) {
      console.error('Error al listar semanas:', error);
      return {
        success: false,
        error: getApiErrorFromCatch(error, 'Error al listar semanas'),
      };
    }
  },

  cerrarSemana: async (semanaId) => {
    try {
      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.STOCK_SEMANAL.SEMANAS.CERRAR(semanaId),
        {}
      );

      if (isHttpError(response)) {
        return {
          success: false,
          error: getErrorMessage(response, 'No se pudo cerrar la semana'),
        };
      }

      const raw = response.data?.data ?? response.data;
      return {
        success: true,
        data: normalizeSemanaAbiertaPayload(raw),
        mensaje: response.data?.mensaje || response.data?.message,
      };
    } catch (error) {
      console.error('Error al cerrar semana:', error);
      return {
        success: false,
        error: getApiErrorFromCatch(error, 'Error al cerrar la semana'),
      };
    }
  },

  actualizarStockInicial: async (detalleId, body) => {
    try {
      const response = await apiRequest.put(
        API_CONFIG.ENDPOINTS.STOCK_SEMANAL.SEMANAS.DETALLE_STOCK_INICIAL(detalleId),
        body
      );

      if (isHttpError(response)) {
        return {
          success: false,
          error: getErrorMessage(response, 'No se pudo actualizar el stock inicial'),
        };
      }

      return {
        success: true,
        data: response.data?.data ?? response.data,
        mensaje: response.data?.mensaje || response.data?.message,
      };
    } catch (error) {
      console.error('Error al actualizar stock inicial:', error);
      return {
        success: false,
        error: getApiErrorFromCatch(error, 'Error al actualizar el stock inicial'),
      };
    }
  },

  actualizarStockFinal: async (detalleId, body) => {
    try {
      const response = await apiRequest.put(
        API_CONFIG.ENDPOINTS.STOCK_SEMANAL.SEMANAS.DETALLE_STOCK_FINAL(detalleId),
        body
      );

      if (isHttpError(response)) {
        return {
          success: false,
          error: getErrorMessage(response, 'No se pudo actualizar el stock final'),
        };
      }

      return {
        success: true,
        data: response.data?.data ?? response.data,
        mensaje: response.data?.mensaje || response.data?.message,
      };
    } catch (error) {
      console.error('Error al actualizar stock final:', error);
      return {
        success: false,
        error: getApiErrorFromCatch(error, 'Error al actualizar el stock final'),
      };
    }
  },
};
