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
      ESTADO: (id) => `/pedidos/${id}/estado`,
      OBSERVACIONES: (id) => `/pedidos/${id}/observaciones`,
      ARTICULOS: (id) => `/pedidos/${id}/articulos`,
      CAPACIDAD: '/pedidos/capacidad',
      FORZAR_ESTADO: (id) => `/pedidos/${id}/forzar-estado`,
      COBRAR: (id) => `/pedidos/${id}/cobrar`,
      COMANDA_PRINT: (id) => `/pedidos/${id}/comanda-print`,
      TICKET_PRINT: (id) => `/pedidos/${id}/ticket-print`,
    },
    CONFIGURACION: {
      LIST: '/configuracion-sistema',
      BY_KEY: (clave) => `/configuracion-sistema/${clave}`,
    },
    VENTAS: {
      LIST: '/ventas',
      CREATE: '/ventas',
      UPDATE: '/ventas',
      DELETE: '/ventas',
      BY_ID: (id) => `/ventas/${id}`,
    },
    ARTICULOS: {
      LIST: '/inventario/articulos',
      CREATE: '/inventario/articulos',
      UPDATE: '/inventario/articulos',
      DELETE: '/inventario/articulos',
      BY_ID: (id) => `/inventario/articulos/${id}`,
      UPLOAD_IMAGEN: '/articulos/upload-imagen',
    },
    CATEGORIAS: {
      LIST: '/inventario/categorias',
      CREATE: '/inventario/categorias',
      UPDATE: '/inventario/categorias',
      DELETE: '/inventario/categorias',
      BY_ID: (id) => `/inventario/categorias/${id}`,
    },
    INGREDIENTES: {
      LIST: '/inventario/ingredientes',
      CREATE: '/inventario/ingredientes',
      UPDATE: '/inventario/ingredientes',
      DELETE: '/inventario/ingredientes',
      BY_ID: (id) => `/inventario/ingredientes/${id}`,
    },
    ADICIONALES: {
      LIST: '/inventario/adicionales',
      CREATE: '/inventario/adicionales',
      UPDATE: '/inventario/adicionales',
      DELETE: '/inventario/adicionales',
      BY_ID: (id) => `/inventario/adicionales/${id}`,
      ADICIONALES_POR_ARTICULO: (articuloId) => `/inventario/articulos/${articuloId}/adicionales`,
      ASIGNAR_A_ARTICULO: (articuloId) => `/inventario/articulos/${articuloId}/adicionales`,
      ELIMINAR_DE_ARTICULO: (articuloId, adicionalId) => `/inventario/articulos/${articuloId}/adicionales/${adicionalId}`,
    },
    COMANDAS: {
      LIST: '/comandas',
      CREATE: '/comandas',
      UPDATE: '/comandas',
      DELETE: '/comandas',
      BY_ID: (id) => `/comandas/${id}`,
      ESTADO: (id) => `/comandas/${id}/estado`,
      OBSERVACIONES: (id) => `/comandas/${id}/observaciones`,
    },
    HEALTH: {
      WORKER: '/health/worker',
    },
    METRICS: {
      PEDIDOS_ATRASADOS: '/metrics/pedidos-atrasados',
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
