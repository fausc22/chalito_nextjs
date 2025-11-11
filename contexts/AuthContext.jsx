import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { useNotification } from './NotificationContext';
import { ROLES, ROLE_HIERARCHY } from '../config/api';
import { useRouter } from 'next/router';

const AuthContext = createContext();

// Acciones del reducer
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  VERIFY_START: 'VERIFY_START',
  VERIFY_SUCCESS: 'VERIFY_SUCCESS',
  VERIFY_ERROR: 'VERIFY_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Estado inicial
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isVerifying: false,
  error: null,
  loginAttempts: 0
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        loginAttempts: 0
      };

    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
        loginAttempts: state.loginAttempts + 1
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        loginAttempts: 0
      };

    case AUTH_ACTIONS.VERIFY_START:
      return {
        ...state,
        isVerifying: true
      };

    case AUTH_ACTIONS.VERIFY_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        isVerifying: false,
        error: null
      };

    case AUTH_ACTIONS.VERIFY_ERROR:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isVerifying: false,
        error: null
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload.user }
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const notification = useNotification();
  const router = useRouter();

  // Verificar autenticación al cargar
  useEffect(() => {
    const initializeAuth = async () => {
      if (!authService.isAuthenticated()) {
        dispatch({
          type: AUTH_ACTIONS.VERIFY_ERROR,
          payload: { error: 'No autenticado' }
        });
        return;
      }

      dispatch({ type: AUTH_ACTIONS.VERIFY_START });

      try {
        const result = await authService.verifyToken();

        if (result.success && result.user) {
          dispatch({
            type: AUTH_ACTIONS.VERIFY_SUCCESS,
            payload: { user: result.user }
          });
        } else {
          authService.logout();
          dispatch({
            type: AUTH_ACTIONS.VERIFY_ERROR,
            payload: { error: 'Token inválido' }
          });
        }
      } catch (error) {
        authService.logout();
        dispatch({
          type: AUTH_ACTIONS.VERIFY_ERROR,
          payload: { error: 'Error de verificación' }
        });
      }
    };

    initializeAuth();
  }, []);

  // Login
  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    const result = await authService.login(credentials);

    if (result.success) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: result.user }
      });

      notification.showSuccess(
        `¡Bienvenido ${result.user.nombre}!`,
        { duration: 3000 }
      );

      return { success: true, user: result.user };
    } else {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: { error: result.message }
      });

      notification.showError(result.message);

      return { success: false, message: result.message };
    }
  }, [notification]);

  // Logout
  const logout = useCallback(async () => {
    await authService.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    notification.showInfo('Sesión cerrada correctamente', { duration: 2000 });
    router.push('/login');
  }, [notification, router]);

  // Actualizar usuario
  const updateUser = useCallback((userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: { user: userData }
    });
  }, []);

  // Limpiar errores
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Helper functions para roles
  const hasRole = useCallback((role) => {
    return state.user?.rol === role;
  }, [state.user?.rol]);

  const hasMinimumRole = useCallback((minimumRole) => {
    if (!state.user?.rol || !ROLE_HIERARCHY[minimumRole]) {
      return false;
    }

    const userRoleLevel = ROLE_HIERARCHY[state.user.rol];
    const minimumRoleLevel = ROLE_HIERARCHY[minimumRole];

    return userRoleLevel >= minimumRoleLevel;
  }, [state.user?.rol]);

  const isAdmin = useCallback(() => state.user?.rol === ROLES.ADMIN, [state.user?.rol]);
  const isGerente = useCallback(() => state.user?.rol === ROLES.GERENTE || state.user?.rol === ROLES.ADMIN, [state.user?.rol]);
  const isCajero = useCallback(() => [ROLES.CAJERO, ROLES.GERENTE, ROLES.ADMIN].includes(state.user?.rol), [state.user?.rol]);
  const isCocina = useCallback(() => state.user?.rol === ROLES.COCINA, [state.user?.rol]);

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    clearError,
    hasRole,
    hasMinimumRole,
    isAdmin,
    isGerente,
    isCajero,
    isCocina,
    userRole: state.user?.rol,
    userName: state.user?.nombre,
    userEmail: state.user?.email
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
