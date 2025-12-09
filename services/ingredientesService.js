import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

export const ingredientesService = {
  // Obtener todos los ingredientes activos (para selectores)
  obtenerIngredientesActivos: async () => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.INGREDIENTES.LIST, {
        params: { disponible: true, limite: 1000 }
      });

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error al obtener ingredientes activos:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al obtener ingredientes'
      };
    }
  },

  // Obtener ingredientes con filtros y paginación
  obtenerIngredientes: async (filtros = {}) => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.INGREDIENTES.LIST, {
        params: filtros
      });

      return {
        success: true,
        data: response.data.data || response.data,
        meta: response.data.meta || {
          pagina_actual: 1,
          total_registros: (response.data.data || response.data).length,
          total_paginas: 1,
          registros_por_pagina: 10,
          hay_mas: false
        }
      };
    } catch (error) {
      console.error('Error al obtener ingredientes:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al obtener ingredientes'
      };
    }
  },

  // Obtener ingrediente por ID
  obtenerIngredientePorId: async (id) => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.INGREDIENTES.BY_ID(id));

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error al obtener ingrediente:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al obtener ingrediente'
      };
    }
  },

  // Crear nuevo ingrediente
  crearIngrediente: async (ingredienteData) => {
    try {
      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.INGREDIENTES.CREATE,
        ingredienteData
      );

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || 'Ingrediente creado correctamente'
      };
    } catch (error) {
      // Manejo específico para error 409 (Conflict) - nombre duplicado
      if (error.response?.status === 409) {
        return {
          success: false,
          error: error.response?.data?.mensaje || 'Ya existe un ingrediente con ese nombre. Por favor, usa un nombre diferente.'
        };
      }

      // Solo loguear errores inesperados
      console.error('Error al crear ingrediente:', error);

      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al crear ingrediente'
      };
    }
  },

  // Actualizar ingrediente existente
  actualizarIngrediente: async (id, ingredienteData) => {
    try {
      const response = await apiRequest.put(
        API_CONFIG.ENDPOINTS.INGREDIENTES.BY_ID(id),
        ingredienteData
      );

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || 'Ingrediente actualizado correctamente'
      };
    } catch (error) {
      // Manejo específico para error 409 (Conflict) - nombre duplicado
      if (error.response?.status === 409) {
        return {
          success: false,
          error: error.response?.data?.mensaje || 'Ya existe un ingrediente con ese nombre. Por favor, usa un nombre diferente.'
        };
      }

      // Solo loguear errores inesperados
      console.error('Error al actualizar ingrediente:', error);

      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al actualizar ingrediente'
      };
    }
  },

  // Eliminar ingrediente (marcar como no disponible)
  eliminarIngrediente: async (id) => {
    try {
      const response = await apiRequest.delete(API_CONFIG.ENDPOINTS.INGREDIENTES.BY_ID(id));

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || 'Ingrediente eliminado correctamente'
      };
    } catch (error) {
      // Manejo específico para error 400 (Bad Request) - ingrediente en uso
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response?.data?.mensaje || error.response?.data?.message || 'No se puede eliminar el ingrediente. Puede que esté siendo usado en artículos.'
        };
      }

      // Solo loguear errores inesperados
      console.error('Error al eliminar ingrediente:', error);

      return {
        success: false,
        error: error.response?.data?.mensaje || error.response?.data?.message || 'Error al eliminar ingrediente'
      };
    }
  }
};
