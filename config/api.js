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
      BY_ID: (id) => `/ventas/${id}`,
      ANULAR: (id) => `/ventas/${id}/anular`,
      RESUMEN: '/ventas/resumen',
      MEDIOS_PAGO: '/ventas/medios-pago',
    },
    REPORTES: {
      DASHBOARD: '/reportes/dashboard',
    },
    ARTICULOS: {
      LIST: '/articulos',
      CREATE: '/articulos',
      UPDATE: '/articulos',
      DELETE: '/articulos',
      BY_ID: (id) => `/articulos/${id}`,
      COSTO: (id) => `/articulos/${id}/costo`,
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
      ADICIONALES_POR_ARTICULO: (articuloId) => `/articulos/${articuloId}/adicionales`,
      ASIGNAR_A_ARTICULO: (articuloId) => `/articulos/${articuloId}/adicionales`,
      ELIMINAR_DE_ARTICULO: (articuloId, adicionalId) => `/articulos/${articuloId}/adicionales/${adicionalId}`,
    },
    STOCK_SEMANAL: {
      INSUMOS: {
        LIST: '/inventario/stock-semanal/insumos',
        CREATE: '/inventario/stock-semanal/insumos',
        BY_ID: (id) => `/inventario/stock-semanal/insumos/${id}`,
        DELETE: (id) => `/inventario/stock-semanal/insumos/${id}`,
        ACTIVO: (id) => `/inventario/stock-semanal/insumos/${id}/activo`,
      },
      SEMANAS: {
        ABIERTA: '/inventario/stock-semanal/semanas/abierta',
        LIST: '/inventario/stock-semanal/semanas',
        CREATE: '/inventario/stock-semanal/semanas',
        BY_ID: (id) => `/inventario/stock-semanal/semanas/${id}`,
        CERRAR: (id) => `/inventario/stock-semanal/semanas/${id}/cerrar`,
        /** Stock por línea de detalle (id = semanas_stock_detalle.id) */
        DETALLE_STOCK_INICIAL: (detalleId) =>
          `/inventario/stock-semanal/detalles/${detalleId}/stock-inicial`,
        DETALLE_STOCK_FINAL: (detalleId) =>
          `/inventario/stock-semanal/detalles/${detalleId}/stock-final`,
      },
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
    GASTOS: {
      LIST: '/gastos',
      CREATE: '/gastos',
      BY_ID: (id) => `/gastos/${id}`,
      UPDATE: (id) => `/gastos/${id}`,
      DELETE: (id) => `/gastos/${id}`,
      CATEGORIAS: '/gastos/categorias',
      CATEGORIA_BY_ID: (id) => `/gastos/categorias/${id}`,
      CUENTAS: '/gastos/cuentas',
      RESUMEN: '/gastos/resumen',
    },
    FONDOS: {
      CUENTAS: {
        LIST: '/fondos/cuentas',
        CREATE: '/fondos/cuentas',
        BY_ID: (id) => `/fondos/cuentas/${id}`,
        UPDATE: (id) => `/fondos/cuentas/${id}`,
        DELETE: (id) => `/fondos/cuentas/${id}`,
        MOVIMIENTOS: (id) => `/fondos/cuentas/${id}/movimientos`,
        HISTORIAL: (id) => `/fondos/cuentas/${id}/historial`,
      },
      MOVIMIENTOS: {
        CREATE: '/fondos/movimientos',
      },
    },
    EMPLEADOS: {
      LIST: '/empleados',
      CREATE: '/empleados',
      BY_ID: (id) => `/empleados/${id}`,
      UPDATE: (id) => `/empleados/${id}`,
      STATUS: (id) => `/empleados/${id}/activo`,
      ASISTENCIAS: {
        LIST: '/empleados/asistencias',
        INGRESO: '/empleados/asistencias/ingreso',
        EGRESO: '/empleados/asistencias/egreso',
      },
      MOVIMIENTOS: {
        LIST: '/empleados/movimientos',
        CREATE: '/empleados/movimientos',
        BY_ID: (movimientoId) => `/empleados/movimientos/${movimientoId}`,
        UPDATE: (movimientoId) => `/empleados/movimientos/${movimientoId}`,
        DELETE: (movimientoId) => `/empleados/movimientos/${movimientoId}`,
      },
      LIQUIDACIONES: {
        LIST: '/empleados/liquidaciones',
        CREATE: '/empleados/liquidaciones',
        SUMMARY: '/empleados/liquidaciones/resumen',
        CALCULATE: '/empleados/liquidaciones/calcular',
        BY_ID: (liquidacionId) => `/empleados/liquidaciones/${liquidacionId}`,
      },
    },
    CLIENTES: {
      LIST: '/clientes',
      SUGERENCIAS: '/clientes/sugerencias',
      BY_ID: (id) => `/clientes/${id}`,
      HISTORIAL: (id) => `/clientes/${id}/historial`,
      UPDATE: (id) => `/clientes/${id}`,
      DELETE: (id) => `/clientes/${id}`,
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
