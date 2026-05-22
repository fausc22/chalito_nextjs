import { apiRequest, getApiErrorMessage } from './api';
import { API_CONFIG } from '../config/api';

export const DIAS_SEMANA = [
  { id: 0, nombre: 'Domingo', abrev: 'Dom' },
  { id: 1, nombre: 'Lunes', abrev: 'Lun' },
  { id: 2, nombre: 'Martes', abrev: 'Mar' },
  { id: 3, nombre: 'Miércoles', abrev: 'Mié' },
  { id: 4, nombre: 'Jueves', abrev: 'Jue' },
  { id: 5, nombre: 'Viernes', abrev: 'Vie' },
  { id: 6, nombre: 'Sábado', abrev: 'Sáb' },
];

const formatTime = (value) => {
  if (!value) return '';
  return String(value).slice(0, 5);
};

export const tiendaOnlineService = {
  async getHorarios() {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.TIENDA_ONLINE.HORARIOS);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al obtener horarios'),
          horarios: [],
        };
      }
      return {
        success: true,
        horarios: response.data.data?.horarios || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener horarios',
        horarios: [],
      };
    }
  },

  async updateHorarioDia(diaSemana, franjas) {
    try {
      const response = await apiRequest.put(API_CONFIG.ENDPOINTS.TIENDA_ONLINE.HORARIOS_DIA, {
        dia_semana: diaSemana,
        franjas,
      });
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al guardar horarios'),
        };
      }
      return {
        success: true,
        message: response.data.message,
        horarios: response.data.data?.horarios || [],
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al guardar horarios',
      };
    }
  },

  async getSettings() {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.TIENDA_ONLINE.SETTINGS);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al obtener configuración'),
        };
      }
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener configuración',
      };
    }
  },

  async updateSettings(payload) {
    try {
      const response = await apiRequest.put(API_CONFIG.ENDPOINTS.TIENDA_ONLINE.SETTINGS, payload);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al guardar configuración'),
        };
      }
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al guardar configuración',
      };
    }
  },

  async getEstadoPreview() {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.TIENDA_ONLINE.ESTADO);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al obtener estado'),
        };
      }
      const { success, ...estado } = response.data;
      return { success: true, data: estado };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener estado',
      };
    }
  },

  getHorariosDia(horarios, diaSemana) {
    return (horarios || [])
      .filter((h) => Number(h.dia_semana) === diaSemana)
      .sort((a, b) => Number(a.orden) - Number(b.orden))
      .map((h) => ({
        hora_apertura: formatTime(h.hora_apertura),
        hora_cierre: formatTime(h.hora_cierre),
        activo: Boolean(h.activo),
      }));
  },

  formatFranjasResumen(horarios, diaSemana) {
    const franjas = tiendaOnlineService.getHorariosDia(horarios, diaSemana).filter((f) => f.activo);
    if (franjas.length === 0) return 'Cerrado';
    return franjas.map((f) => `${f.hora_apertura}–${f.hora_cierre}`).join(', ');
  },

  async getApariencia() {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.TIENDA_ONLINE.APARIENCIA);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al obtener apariencia'),
        };
      }
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener apariencia',
      };
    }
  },

  async updateApariencia(payload) {
    try {
      const response = await apiRequest.put(API_CONFIG.ENDPOINTS.TIENDA_ONLINE.APARIENCIA, payload);
      if (!response.data?.success) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al guardar apariencia'),
        };
      }
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al guardar apariencia',
      };
    }
  },
};
