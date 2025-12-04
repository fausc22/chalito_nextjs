import { apiRequest, tokenManager } from './api';
import { API_CONFIG } from '../config/api';

export const authService = {
  // Login
  login: async (credentials) => {
    try {
      // Mapear 'usuario' a 'username' que es lo que espera el backend
      const loginData = {
        username: credentials.usuario,
        password: credentials.password,
        remember: credentials.remember
      };

      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        loginData
      );

      // Verificar si el interceptor transformó un error en respuesta exitosa
      if (response.data.error === true || response.data.success === false) {
        return {
          success: false,
          message: response.data.mensaje || response.data.message || 'Error al iniciar sesión',
          error: response.data
        };
      }

      // El backend devuelve 'token' y 'usuario', no 'accessToken' y 'user'
      const { token, refreshToken, usuario } = response.data;

      // Validar que recibimos los datos necesarios
      if (!token || !usuario) {
        return {
          success: false,
          message: 'Respuesta inválida del servidor',
          error: response.data
        };
      }

      // Guardar tokens y datos del usuario
      tokenManager.setTokens(token, refreshToken);
      tokenManager.setUserData(usuario);

      return {
        success: true,
        user: usuario,
        message: 'Login exitoso'
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión',
        error
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      tokenManager.clearTokens();
    }
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.AUTH.VERIFY);

      // El backend devuelve 'usuario' no 'user'
      if (response.data.usuario || response.data.user) {
        const userData = response.data.usuario || response.data.user;
        tokenManager.setUserData(userData);
        return {
          success: true,
          user: userData
        };
      }

      return {
        success: false,
        message: 'Token inválido'
      };
    } catch (error) {
      // No loguear errores 401 en verificación ya que son esperados cuando no hay sesión
      if (error.response?.status !== 401) {
        console.error('Error verificando token:', error);
      }
      return {
        success: false,
        message: 'Error de verificación',
        error
      };
    }
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    const token = tokenManager.getAccessToken();
    return !!token;
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    return tokenManager.getUserData();
  },

  // Actualizar perfil
  updateProfile: async (userData) => {
    try {
      const response = await apiRequest.put(
        API_CONFIG.ENDPOINTS.AUTH.PROFILE,
        userData
      );

      if (response.data.user) {
        tokenManager.setUserData(response.data.user);
        return {
          success: true,
          user: response.data.user
        };
      }

      return {
        success: false,
        message: 'Error al actualizar perfil'
      };
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar perfil',
        error
      };
    }
  }
};
