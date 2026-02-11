import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { toast } from '@/hooks/use-toast';

// Token Manager
export const tokenManager = {
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(API_CONFIG.TOKEN_CONFIG.ACCESS_TOKEN_KEY);
    }
    return null;
  },

  getRefreshToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(API_CONFIG.TOKEN_CONFIG.REFRESH_TOKEN_KEY);
    }
    return null;
  },

  setTokens: (accessToken, refreshToken = null) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(API_CONFIG.TOKEN_CONFIG.ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(API_CONFIG.TOKEN_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
      }
    }
  },

  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(API_CONFIG.TOKEN_CONFIG.ACCESS_TOKEN_KEY);
      localStorage.removeItem(API_CONFIG.TOKEN_CONFIG.REFRESH_TOKEN_KEY);
      localStorage.removeItem(API_CONFIG.TOKEN_CONFIG.USER_KEY);
    }
  },

  getUserData: () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(API_CONFIG.TOKEN_CONFIG.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  setUserData: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(API_CONFIG.TOKEN_CONFIG.USER_KEY, JSON.stringify(user));
    }
  }
};

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variables para evitar múltiples refresh simultáneos
let isRefreshing = false;
let refreshSubscribers = [];

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshComplete = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Interceptor de request
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es error 401 y no es login/refresh/verify
    if (error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes('/login') &&
        !originalRequest.url.includes('/refresh-token') &&
        !originalRequest.url.includes('/verify-token')) {

      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken }
        );

        const { accessToken } = response.data;
        tokenManager.setTokens(accessToken);

        onRefreshComplete(accessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        isRefreshing = false;
        tokenManager.clearTokens();

        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');

        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }, 1500);

        return Promise.reject(refreshError);
      }
    }

    // Manejar rate limiting (429) - debe manejarse antes de otros 4xx
    if (error.response?.status === 429) {
      const retryAfter = error.response?.headers?.['retry-after'] || 300; // 5 minutos por defecto
      console.warn(`⚠️ Rate limit excedido. Esperar ${retryAfter} segundos antes de reintentar.`);
      // Devolver como respuesta para que los componentes puedan manejarlo
      return Promise.resolve({
        data: {
          success: false,
          error: true,
          status: 429,
          mensaje: `Rate limit excedido. Esperar ${retryAfter} segundos.`,
          rateLimit: true,
          retryAfter: parseInt(retryAfter)
        },
        status: 429,
        statusText: 'Too Many Requests',
        headers: error.response.headers,
        config: error.config
      });
    }

    // Manejar errores del servidor (500+)
    if (error.response?.status >= 500) {
      toast.error('Error del servidor. Intenta nuevamente.');
      return Promise.reject(error);
    }

    // Para errores 4xx (excepto 401 y 429 que ya se manejan arriba),
    // NO rechazamos la promesa para evitar el error overlay de Next.js
    // En su lugar, devolvemos un objeto con la información del error
    if (error.response?.status >= 400 && error.response?.status < 500) {
      // Transformamos el error en una respuesta "exitosa" que contenga el error
      // Esto evita que Next.js muestre el error overlay
      return Promise.resolve({
        data: {
          success: false,
          error: true,
          status: error.response.status,
          mensaje: error.response?.data?.mensaje || error.response?.data?.message,
          data: error.response?.data
        },
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        config: error.config
      });
    }

    return Promise.reject(error);
  }
);

// Funciones helper para hacer requests
export const apiRequest = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

export default apiClient;
