import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

const getFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

const buildRequestConfig = (params) => {
  if (!params || typeof params !== 'object') return {};
  return { params };
};

const extractErrorFromValidation = (responseData) => {
  const details = responseData?.errors;
  if (!Array.isArray(details) || details.length === 0) return null;
  const firstDetail = details.find((item) => item?.message)?.message;
  return firstDetail || null;
};

const getErrorMessage = (responseData, fallbackMessage) =>
  getFirstDefined(
    responseData?.message,
    responseData?.mensaje,
    responseData?.detalle,
    extractErrorFromValidation(responseData),
    fallbackMessage
  );

const ensureNumericId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const extractCollection = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.empleados)) return data.empleados;
  if (Array.isArray(data?.movimientos)) return data.movimientos;
  if (Array.isArray(data?.liquidaciones)) return data.liquidaciones;
  return [];
};

const buildSuccessResponse = (response) => ({
  success: true,
  data: response.data?.data ?? response.data ?? null,
  meta: response.data?.meta || {},
  message: response.data?.message || response.data?.mensaje,
});

const buildErrorResponse = (error, fallbackError) => ({
  success: false,
  error: getErrorMessage(error?.response?.data, fallbackError),
  status: error?.response?.status || null,
});

const parseResponse = (response, fallbackError) => {
  if (!response) {
    return { success: false, error: fallbackError, status: null };
  }

  const status = response.status || 0;
  const hasErrorFlag = response.data?.success === false || response.data?.error === true;
  if (status >= 400 || hasErrorFlag) {
    return {
      success: false,
      error: getErrorMessage(response.data, fallbackError),
      status,
    };
  }

  return buildSuccessResponse(response);
};

const executeRequest = async (method, endpoint, { params, data, fallbackError }) => {
  try {
    let response;
    if (method === 'get') {
      response = await apiRequest.get(endpoint, buildRequestConfig(params));
    } else if (method === 'post') {
      response = await apiRequest.post(endpoint, data || {}, buildRequestConfig(params));
    } else if (method === 'put') {
      response = await apiRequest.put(endpoint, data || {}, buildRequestConfig(params));
    } else if (method === 'patch') {
      response = await apiRequest.patch(endpoint, data || {}, buildRequestConfig(params));
    } else if (method === 'delete') {
      response = await apiRequest.delete(endpoint, buildRequestConfig(params));
    } else {
      throw new Error(`Metodo no soportado: ${method}`);
    }

    return parseResponse(response, fallbackError);
  } catch (error) {
    return buildErrorResponse(error, fallbackError);
  }
};

const withNumericId = (id, fallbackError, callback) => {
  const numericId = ensureNumericId(id);
  if (!numericId) {
    return {
      success: false,
      error: fallbackError,
    };
  }
  return callback(numericId);
};

const pickDefined = (obj = {}) => Object.fromEntries(
  Object.entries(obj).filter(([, value]) => value !== undefined && value !== null && value !== '')
);

const buildLiquidacionPayload = (payload = {}) => {
  const empleadoId = ensureNumericId(payload.empleado_id);
  return {
    empleado_id: empleadoId,
    fecha_desde: payload.fecha_desde || null,
    fecha_hasta: payload.fecha_hasta || null,
    incluir_detalle: payload.incluir_detalle ?? true,
  };
};

export const empleadosService = {
  obtenerEmpleados: async (filtros = {}) => {
    const response = await executeRequest('get', API_CONFIG.ENDPOINTS.EMPLEADOS.LIST, {
      params: pickDefined(filtros),
      fallbackError: 'No se pudo obtener la lista de empleados',
    });

    return response.success
      ? { success: true, data: extractCollection(response.data), meta: response.meta }
      : response;
  },

  obtenerEmpleadoPorId: async (id) => withNumericId(
    id,
    'El ID de empleado debe ser un numero positivo',
    (numericId) => executeRequest('get', API_CONFIG.ENDPOINTS.EMPLEADOS.BY_ID(numericId), {
      fallbackError: 'No se pudo obtener el detalle del empleado',
    })
  ),

  crearEmpleado: async (payload) => {
    return executeRequest('post', API_CONFIG.ENDPOINTS.EMPLEADOS.CREATE, {
      data: payload,
      fallbackError: 'No se pudo crear el empleado',
    });
  },

  actualizarEmpleado: async (id, payload) => withNumericId(
    id,
    'El ID de empleado debe ser un numero positivo',
    (numericId) => executeRequest('put', API_CONFIG.ENDPOINTS.EMPLEADOS.UPDATE(numericId), {
      data: payload,
      fallbackError: 'No se pudo actualizar el empleado',
    })
  ),

  activarEmpleado: async (id) => withNumericId(
    id,
    'El ID de empleado debe ser un numero positivo',
    (numericId) => executeRequest('patch', API_CONFIG.ENDPOINTS.EMPLEADOS.STATUS(numericId), {
      data: { activo: true },
      fallbackError: 'No se pudo activar el empleado',
    })
  ),

  inactivarEmpleado: async (id) => withNumericId(
    id,
    'El ID de empleado debe ser un numero positivo',
    (numericId) => executeRequest('patch', API_CONFIG.ENDPOINTS.EMPLEADOS.STATUS(numericId), {
      data: { activo: false },
      fallbackError: 'No se pudo inactivar el empleado',
    })
  ),

  obtenerAsistencias: async (filtros = {}) => {
    const response = await executeRequest('get', API_CONFIG.ENDPOINTS.EMPLEADOS.ASISTENCIAS.LIST, {
      params: pickDefined(filtros),
      fallbackError: 'No se pudo obtener la asistencia',
    });

    return response.success
      ? { success: true, data: Array.isArray(response.data) ? response.data : [], meta: response.meta }
      : response;
  },

  registrarIngreso: async (empleadoId, extraPayload = {}) => {
    return withNumericId(
      empleadoId,
      'El ID de empleado debe ser un numero positivo',
      (id) => executeRequest('post', API_CONFIG.ENDPOINTS.EMPLEADOS.ASISTENCIAS.INGRESO, {
        data: { empleado_id: id, ...extraPayload },
        fallbackError: 'No se pudo registrar el ingreso',
      })
    );
  },

  registrarEgreso: async (empleadoId, extraPayload = {}) => withNumericId(
    empleadoId,
    'El ID de empleado debe ser un numero positivo',
    (id) => executeRequest('post', API_CONFIG.ENDPOINTS.EMPLEADOS.ASISTENCIAS.EGRESO, {
      data: { empleado_id: id, ...extraPayload },
      fallbackError: 'No se pudo registrar el egreso',
    })
  ),

  obtenerMovimientos: async (filtros = {}) => {
    const response = await executeRequest('get', API_CONFIG.ENDPOINTS.EMPLEADOS.MOVIMIENTOS.LIST, {
      params: pickDefined(filtros),
      fallbackError: 'No se pudo obtener la lista de movimientos',
    });

    return response.success
      ? { success: true, data: extractCollection(response.data), meta: response.meta }
      : response;
  },

  obtenerMovimientoPorId: async (id) => withNumericId(
    id,
    'El ID de movimiento debe ser un numero positivo',
    (numericId) => executeRequest('get', API_CONFIG.ENDPOINTS.EMPLEADOS.MOVIMIENTOS.BY_ID(numericId), {
      fallbackError: 'No se pudo obtener el detalle del movimiento',
    })
  ),

  crearMovimiento: async (payload) => executeRequest('post', API_CONFIG.ENDPOINTS.EMPLEADOS.MOVIMIENTOS.CREATE, {
    data: payload,
    fallbackError: 'No se pudo crear el movimiento',
  }),

  actualizarMovimiento: async (id, payload) => withNumericId(
    id,
    'El ID de movimiento debe ser un numero positivo',
    (numericId) => executeRequest('put', API_CONFIG.ENDPOINTS.EMPLEADOS.MOVIMIENTOS.UPDATE(numericId), {
      data: payload,
      fallbackError: 'No se pudo actualizar el movimiento',
    })
  ),

  eliminarMovimiento: async (id) => withNumericId(
    id,
    'El ID de movimiento debe ser un numero positivo',
    async (numericId) => {
      try {
        const response = await apiRequest.delete(
          API_CONFIG.ENDPOINTS.EMPLEADOS.MOVIMIENTOS.DELETE(numericId),
          buildRequestConfig({})
        );
        const parsed = parseResponse(response, 'No se pudo eliminar el movimiento');
        if (parsed.success) return parsed;

        const rd = response?.data && typeof response.data === 'object' ? response.data : {};
        const codigo = String(rd.codigo || rd.code || '').toUpperCase();
        const enLiquidacion =
          rd.esta_liquidado === true
          || rd.estaLiquidado === true
          || rd.puede_eliminarse === false
          || rd.puedeEliminarse === false
          || rd.liquidado === true
          || codigo.includes('LIQUID')
          || codigo === 'EN_LIQUIDACION'
          || codigo === 'YA_LIQUIDADO';

        const defaultLiquidMsg = 'No es posible eliminar este movimiento porque ya forma parte de una liquidación guardada';
        const errorMsg = enLiquidacion
          ? getFirstDefined(rd.mensaje, rd.message, rd.detalle, defaultLiquidMsg)
          : getErrorMessage(rd, parsed.error);

        return {
          success: false,
          error: errorMsg,
          status: response?.status ?? null,
          enLiquidacion,
        };
      } catch (error) {
        return buildErrorResponse(error, 'No se pudo eliminar el movimiento');
      }
    }
  ),

  calcularLiquidacion: async (payload) => {
    const normalizedPayload = buildLiquidacionPayload(payload);
    if (!normalizedPayload.empleado_id || !normalizedPayload.fecha_desde || !normalizedPayload.fecha_hasta) {
      return {
        success: false,
        error: 'Debes indicar empleado, fecha_desde y fecha_hasta para calcular la liquidacion',
      };
    }

    const resumenGet = await executeRequest('get', API_CONFIG.ENDPOINTS.EMPLEADOS.LIQUIDACIONES.SUMMARY, {
      params: normalizedPayload,
      fallbackError: 'No se pudo calcular la liquidacion',
    });

    if (resumenGet.success) return resumenGet;

    if (![404, 405].includes(resumenGet.status)) {
      return resumenGet;
    }

    return executeRequest('post', API_CONFIG.ENDPOINTS.EMPLEADOS.LIQUIDACIONES.CALCULATE, {
      data: normalizedPayload,
      fallbackError: 'No se pudo calcular la liquidacion',
    });
  },

  guardarLiquidacion: async (payload) => {
    const toOptionalAmount = (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const body = pickDefined({
      empleado_id: ensureNumericId(payload?.empleado_id),
      fecha_desde: payload?.fecha_desde,
      fecha_hasta: payload?.fecha_hasta,
      observaciones: payload?.observaciones ?? payload?.descripcion ?? payload?.concepto ?? null,
      total_base: toOptionalAmount(payload?.total_base),
      total_bonos: toOptionalAmount(payload?.total_bonos),
      total_descuentos: toOptionalAmount(payload?.total_descuentos),
      total_adelantos: toOptionalAmount(payload?.total_adelantos),
      total_consumos: toOptionalAmount(payload?.total_consumos),
      total_final: toOptionalAmount(payload?.total_final),
    });

    return executeRequest('post', API_CONFIG.ENDPOINTS.EMPLEADOS.LIQUIDACIONES.CREATE, {
      data: body,
      fallbackError: 'No se pudo guardar la liquidacion',
    });
  },

  obtenerLiquidaciones: async (filtros = {}) => {
    const response = await executeRequest('get', API_CONFIG.ENDPOINTS.EMPLEADOS.LIQUIDACIONES.LIST, {
      params: pickDefined(filtros),
      fallbackError: 'No se pudo obtener el historial de liquidaciones',
    });

    return response.success
      ? { success: true, data: extractCollection(response.data), meta: response.meta }
      : response;
  },

  obtenerLiquidacionPorId: async (id) => withNumericId(
    id,
    'El ID de liquidacion debe ser un numero positivo',
    (numericId) => executeRequest('get', API_CONFIG.ENDPOINTS.EMPLEADOS.LIQUIDACIONES.BY_ID(numericId), {
      fallbackError: 'No se pudo obtener el detalle de la liquidacion',
    })
  ),
};
