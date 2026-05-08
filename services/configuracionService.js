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

const GENERAL_CONFIG_KEYS = {
  NOMBRE_NEGOCIO: {
    label: 'Nombre del negocio',
    description: 'Nombre visible en la interfaz principal.',
    defaultValue: '',
  },
  LOGO_URL: {
    label: 'Logo URL',
    description: 'URL publica del logo del negocio.',
    defaultValue: '',
  },
  COLOR_PRIMARIO: {
    label: 'Color primario',
    description: 'Color principal de la interfaz en formato HEX.',
    defaultValue: '#1D4ED8',
  },
  MODO_OSCURO: {
    label: 'Modo oscuro',
    description: 'Activa colores oscuros si la interfaz lo soporta.',
    defaultValue: false,
  },
};

const toInteger = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'si', 'sí', 'on'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'off', ''].includes(normalized)) return false;
  }
  return false;
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

  const generalData = Object.entries(GENERAL_CONFIG_KEYS).reduce((acc, [key, meta]) => {
    const rawValue = getRawValueByKey(responseData, key);
    let parsedValue = meta.defaultValue;

    if (key === 'MODO_OSCURO') {
      parsedValue = toBoolean(rawValue);
    } else if (rawValue != null) {
      parsedValue = String(rawValue);
    }

    acc[key] = {
      key,
      value: parsedValue,
      label: meta.label,
      description: meta.description,
    };
    return acc;
  }, {});

  return { operationData, generalData, warnings };
};

const normalizeGeneralPayloadValue = (key, value) => {
  if (key === 'MODO_OSCURO') return toBoolean(value);
  if (key === 'COLOR_PRIMARIO') return String(value ?? '').trim().toUpperCase();
  return String(value ?? '').trim();
};

export const configuracionService = {
  configKeys: OPERATION_CONFIG_KEYS,
  operationConfigKeys: OPERATION_CONFIG_KEYS,
  generalConfigKeys: GENERAL_CONFIG_KEYS,

  getConfiguracionSistema: async () => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.CONFIGURACION.LIST);

      if (response.data?.error === true || response.data?.success === false) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al obtener configuracion')
        };
      }

      const normalized = normalizeConfig(response.data);
      return {
        success: true,
        operationData: normalized.operationData,
        generalData: normalized.generalData,
        warnings: normalized.warnings,
      };
    } catch (error) {
      console.error('Error obteniendo configuracion:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener configuracion',
        error
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

  getConfiguracionGeneral: async () => {
    const result = await configuracionService.getConfiguracionSistema();
    if (!result.success) return result;

    return {
      success: true,
      data: result.generalData,
      warnings: result.warnings,
    };
  },

  updateConfiguracionGeneral: async (values) => {
    try {
      const allowedEntries = Object.entries(values || {}).filter(([key]) =>
        Object.hasOwn(GENERAL_CONFIG_KEYS, key)
      );

      if (!allowedEntries.length) {
        return {
          success: false,
          message: 'No hay valores generales para guardar',
        };
      }

      for (const [key, value] of allowedEntries) {
        const payloadValue = normalizeGeneralPayloadValue(key, value);
        const response = await apiRequest.put(
          API_CONFIG.ENDPOINTS.CONFIGURACION.BY_KEY(key),
          { valor: payloadValue }
        );

        if (response.data?.error === true || response.data?.success === false) {
          return {
            success: false,
            message: getApiErrorMessage(response, `Error al guardar ${GENERAL_CONFIG_KEYS[key].label}`),
          };
        }
      }

      return {
        success: true,
        message: 'Configuracion general actualizada correctamente',
      };
    } catch (error) {
      console.error('Error actualizando configuracion general:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al guardar configuracion general',
        error,
      };
    }
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
          message: getApiErrorMessage(response, 'Error al guardar configuracion')
        };
      }

      return {
        success: true,
        message: response.data?.message || 'Configuracion actualizada correctamente'
      };
    } catch (error) {
      console.error('Error actualizando configuracion operativa:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al guardar configuracion',
        error
      };
    }
  }
};
