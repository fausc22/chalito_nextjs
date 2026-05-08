import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { toast } from '@/hooks/use-toast';
import { setPollingBlocked } from './rateLimitManager';

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
      if (!userData) return null;
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.warn('No se pudo parsear usuario en storage, se limpia cache local.');
        localStorage.removeItem(API_CONFIG.TOKEN_CONFIG.USER_KEY);
        return null;
      }
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

const onRefreshComplete = (token, refreshError = null) => {
  refreshSubscribers.forEach((callback) => callback(token, refreshError));
  refreshSubscribers = [];
};

const shouldSkipRefreshForUrl = (url = '') =>
  url.includes('/login') ||
  url.includes('/refresh-token') ||
  url.includes('/verify-token') ||
  url.includes('/auth/verify');

const shouldTryRefreshOn401 = (error, url = '') => {
  if (shouldSkipRefreshForUrl(url)) return false;

  const backendMessage =
    error?.response?.data?.message ||
    error?.response?.data?.mensaje ||
    '';

  // Evita logout forzado en 401 funcionales (ej. password actual incorrecta).
  if (backendMessage && !/(token|autorizad|unauthorized|expired|expirad)/i.test(backendMessage)) {
    return false;
  }

  return true;
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
    const requestUrl = String(originalRequest?.url || '');
    const shouldTryRefresh = shouldTryRefreshOn401(error, requestUrl);

    // Si es error 401 y no es login/refresh/verify
    if (error.response?.status === 401 &&
        shouldTryRefresh &&
        !originalRequest._retry &&
        !shouldSkipRefreshForUrl(requestUrl)) {

      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((token, refreshError) => {
            if (refreshError || !token) {
              reject(refreshError || error);
              return;
            }
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

        const refreshedAccessToken = response.data?.accessToken || response.data?.token;
        if (!refreshedAccessToken) {
          throw new Error('Respuesta inválida de refresh token');
        }

        tokenManager.setTokens(refreshedAccessToken);

        onRefreshComplete(refreshedAccessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        isRefreshing = false;
        onRefreshComplete(null, refreshError);
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
      const retryAfterHeader = error.response?.headers?.['retry-after'] ||
        error.response?.headers?.['Retry-After'];
      const { blockedUntil } = setPollingBlocked({ retryAfterHeader, retryAfterSeconds: 60 });
      const retryAfterSeconds = Math.max(60, Math.ceil((blockedUntil - Date.now()) / 1000));

      console.warn(`⚠️ Rate limit excedido. Polling pausado por ${retryAfterSeconds} segundos.`);
      // Devolver como respuesta para que los componentes puedan manejarlo
      return Promise.resolve({
        data: {
          success: false,
          error: true,
          status: 429,
          mensaje: `Rate limit excedido. Polling pausado por ${retryAfterSeconds} segundos.`,
          rateLimit: true,
          retryAfter: retryAfterSeconds,
          pollingBlockedUntil: blockedUntil
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

/**
 * Mensaje legible desde respuestas de error (p. ej. 4xx devueltas como respuesta "exitosa" por el interceptor).
 * Cubre cuerpo anidado (`data.data`), validación Zod (`errors[]`) y mensajes `message` / `mensaje` del backend.
 */
export function getApiErrorMessage(response, fallback = 'Error') {
  if (!response?.data) return fallback;
  const d = response.data;
  const inner =
    d.data != null && typeof d.data === 'object' && !Array.isArray(d.data) ? d.data : null;

  const primary =
    inner?.message ||
    inner?.mensaje ||
    d.mensaje ||
    d.message ||
    inner?.detalle ||
    d.detalle;

  const errorsList = inner?.errors ?? d.errors;
  if (Array.isArray(errorsList) && errorsList.length > 0) {
    const parts = errorsList
      .map((e) => {
        if (typeof e === 'string') return e;
        const p = e.path != null ? String(e.path) : '';
        const m = e.message || e.msg || '';
        if (p && m) return `${p}: ${m}`;
        return m || p;
      })
      .filter(Boolean);
    if (parts.length) {
      const combined = parts.join('. ');
      if (primary && combined && !combined.includes(String(primary))) {
        return `${primary}. ${combined}`;
      }
      return combined;
    }
  }

  return primary || fallback;
}

/** Para bloques `catch` de axios cuando no se usa el interceptor transformado. */
export function getApiErrorFromCatch(error, fallback = 'Error') {
  if (error?.response?.data) {
    return getApiErrorMessage(error.response, fallback);
  }
  return error?.message || fallback;
}

export default apiClient;
