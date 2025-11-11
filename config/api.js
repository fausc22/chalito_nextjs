export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',

  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh-token',
      PROFILE: '/auth/profile',
      VERIFY: '/auth/verify'
    },
    PEDIDOS: {
      LIST: '/pedidos',
      CREATE: '/pedidos',
      UPDATE: '/pedidos',
      DELETE: '/pedidos',
      BY_ID: (id) => `/pedidos/${id}`,
    },
    VENTAS: {
      LIST: '/ventas',
      CREATE: '/ventas',
      UPDATE: '/ventas',
      DELETE: '/ventas',
      BY_ID: (id) => `/ventas/${id}`,
    },
    ARTICULOS: {
      LIST: '/articulos',
      CREATE: '/articulos',
      UPDATE: '/articulos',
      DELETE: '/articulos',
      BY_ID: (id) => `/articulos/${id}`,
    },
  },

  TIMEOUT: 10000,

  TOKEN_CONFIG: {
    ACCESS_TOKEN_KEY: 'chalito_access_token',
    REFRESH_TOKEN_KEY: 'chalito_refresh_token',
    USER_KEY: 'chalito_user_data'
  },

  HEADERS: {
    AUTHORIZATION: 'Authorization',
    CONTENT_TYPE: 'application/json',
    X_REFRESH_TOKEN: 'x-refresh-token'
  }
};

export const ROLES = {
  ADMIN: 'ADMIN',
  GERENTE: 'GERENTE',
  CAJERO: 'CAJERO',
  COCINA: 'COCINA'
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 4,
  [ROLES.GERENTE]: 3,
  [ROLES.CAJERO]: 2,
  [ROLES.COCINA]: 1
};

export const ROLE_NAMES = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.GERENTE]: 'Gerente',
  [ROLES.CAJERO]: 'Cajero',
  [ROLES.COCINA]: 'Chef'
};

export const ROLE_ICONS = {
  [ROLES.ADMIN]: '👑',
  [ROLES.GERENTE]: '👔',
  [ROLES.CAJERO]: '💰',
  [ROLES.COCINA]: '👨‍🍳'
};
