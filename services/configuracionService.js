import { apiRequest, getApiErrorMessage } from './api';
import { API_CONFIG } from '../config/api';

const OPERATION_CONFIG_KEYS = {
  MAX_PEDIDOS_EN_PREPARACION: {
    min: 1,
    max: 200,
    label: 'Maximo de pedidos en preparacion',
    description: 'Limita la cantidad de pedidos simultaneos en cocina.',
  },
  TIEMPO_BASE_PEDIDO_MINUTOS: {
    min: 1,
    max: 180,
    label: 'Tiempo base por pedido (minutos)',
    description: 'Tiempo inicial estimado para calcular demoras.',
  },
};

const toInteger = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

const getRawValueByKey = (responseData, key) => {
  const configObject = responseData?.config || {};
  const list = responseData?.data || [];
  const fromConfig = configObject[key]?.valor;
  const fromList = list.find((item) => item.clave === key)?.valor;
  return fromConfig ?? fromList;
};

const normalizeConfig = (responseData) => {
  const warnings = [];

  const operationData = Object.entries(OPERATION_CONFIG_KEYS).reduce((acc, [key, meta]) => {
    const numeric = toInteger(getRawValueByKey(responseData, key));
    if (numeric == null) {
      warnings.push(`Se uso valor por defecto para ${key} por datos invalidos del backend.`);
    }

    acc[key] = {
      key,
      value: numeric ?? meta.min,
      min: meta.min,
      max: meta.max,
      label: meta.label,
      description: meta.description,
    };
    return acc;
  }, {});

  return { operationData, warnings };
};

/** Lee MODO_OSCURO de la API solo para migración one-shot al localStorage del tema. */
export const readLegacyDarkModeFromApi = async () => {
  try {
    const response = await apiRequest.get(API_CONFIG.ENDPOINTS.CONFIGURACION.LIST);
    if (response.data?.error === true || response.data?.success === false) {
      return null;
    }
    const raw = getRawValueByKey(response.data, 'MODO_OSCURO');
    if (raw == null) return null;
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'number') return raw === 1;
    const normalized = String(raw).trim().toLowerCase();
    return ['1', 'true', 'si', 'sí', 'on'].includes(normalized);
  } catch {
    return null;
  }
};

export const configuracionService = {
  configKeys: OPERATION_CONFIG_KEYS,
  operationConfigKeys: OPERATION_CONFIG_KEYS,

  getConfiguracionSistema: async () => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.CONFIGURACION.LIST);

      if (response.data?.error === true || response.data?.success === false) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al obtener configuracion'),
        };
      }

      const normalized = normalizeConfig(response.data);
      return {
        success: true,
        operationData: normalized.operationData,
        warnings: normalized.warnings,
      };
    } catch (error) {
      console.error('Error obteniendo configuracion:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener configuracion',
        error,
      };
    }
  },

  getConfiguracionOperativa: async () => {
    const result = await configuracionService.getConfiguracionSistema();
    if (!result.success) return result;

    return {
      success: true,
      data: result.operationData,
      warnings: result.warnings,
    };
  },

  updateConfiguracionOperativa: async (values) => {
    try {
      const payload = Object.entries(values).reduce((acc, [key, value]) => {
        if (Object.hasOwn(OPERATION_CONFIG_KEYS, key)) {
          acc[key] = Number(value);
        }
        return acc;
      }, {});

      const response = await apiRequest.put(API_CONFIG.ENDPOINTS.CONFIGURACION.LIST, payload);
      if (response.data?.error === true || response.data?.success === false) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al guardar configuracion'),
        };
      }

      return {
        success: true,
        message: response.data?.message || 'Configuracion actualizada correctamente',
      };
    } catch (error) {
      console.error('Error actualizando configuracion operativa:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al guardar configuracion',
        error,
      };
    }
  },
};
