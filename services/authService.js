import { apiRequest, getApiErrorMessage, tokenManager } from './api';
import { API_CONFIG } from '../config/api';

const normalizeUserData = (rawUser = {}) => ({
  id: rawUser.id ?? null,
  nombre: rawUser.nombre ?? '',
  email: rawUser.email ?? '',
  usuario: rawUser.usuario ?? rawUser.username ?? '',
  rol: rawUser.rol ?? '',
  avatar_key: rawUser.avatar_key ?? null,
  ultima_conexion: rawUser.ultima_conexion ?? null,
});

const isErrorResponse = (response) => response?.data?.error === true || response?.data?.success === false;

const isEndpointMissing = (response) => {
  const status = response?.status;
  return status === 404 || status === 405;
};

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

      const { token, refreshToken, usuario } = response.data;

      // Validar que recibimos los datos necesarios
      if (!token || !usuario) {
        return {
          success: false,
          message: 'Respuesta inválida del servidor',
          error: response.data
        };
      }

      const normalizedUser = normalizeUserData(usuario);

      tokenManager.setTokens(token, refreshToken);
      tokenManager.setUserData(normalizedUser);

      return {
        success: true,
        user: normalizedUser,
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

      if (response.data.usuario || response.data.user) {
        const userData = normalizeUserData(response.data.usuario || response.data.user);
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

  // Obtener perfil actualizado del backend (canonico: /usuarios/me)
  getProfile: async () => {
    try {
      let response = await apiRequest.get(API_CONFIG.ENDPOINTS.USUARIOS.ME);
      if (isErrorResponse(response) && isEndpointMissing(response)) {
        response = await apiRequest.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
      }

      if (isErrorResponse(response)) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al obtener perfil')
        };
      }

      const userData = normalizeUserData(response.data?.usuario || response.data?.user);
      tokenManager.setUserData(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener perfil',
        error
      };
    }
  },

  // Actualizar perfil (canonico: /usuarios/me)
  updateProfile: async (userData) => {
    try {
      const payload = {
        nombre: userData.nombre,
        email: userData.email,
        usuario: userData.usuario,
        avatar_key: userData.avatar_key ?? null,
      };

      let response = await apiRequest.put(API_CONFIG.ENDPOINTS.USUARIOS.ME, payload);
      if (isErrorResponse(response) && isEndpointMissing(response)) {
        response = await apiRequest.put(API_CONFIG.ENDPOINTS.AUTH.PROFILE, payload);
      }

      if (isErrorResponse(response)) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'Error al actualizar perfil')
        };
      }

      if (response.data.user || response.data.usuario) {
        const normalizedUser = normalizeUserData(response.data.user || response.data.usuario);
        tokenManager.setUserData(normalizedUser);
        return {
          success: true,
          user: normalizedUser
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
  },

  changePassword: async ({ password_actual, password_nueva, confirmar_password }) => {
    try {
      let response = await apiRequest.put(
        API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
        {
          currentPassword: password_actual,
          newPassword: password_nueva,
        }
      );

      if (isErrorResponse(response) && isEndpointMissing(response)) {
        response = await apiRequest.put(
          API_CONFIG.ENDPOINTS.USUARIOS.CHANGE_PASSWORD,
          {
            password_actual,
            password_nueva,
            confirmar_password,
          }
        );
      }

      if (isErrorResponse(response)) {
        return {
          success: false,
          message: getApiErrorMessage(response, 'No se pudo cambiar la contraseña'),
        };
      }

      return {
        success: true,
        message: response.data?.message || 'Contraseña actualizada exitosamente'
      };
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'No se pudo cambiar la contraseña',
        error
      };
    }
  },

  setCurrentUser: (userData) => {
    tokenManager.setUserData(normalizeUserData(userData));
  }
};
