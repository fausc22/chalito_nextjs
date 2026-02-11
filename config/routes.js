export const ROUTES = {
  // Rutas públicas
  LOGIN: '/login',

  // Rutas protegidas
  DASHBOARD: '/dashboard',
  PEDIDOS: '/pedidos',
  VENTAS: '/ventas',
  INVENTARIO: '/inventario',
  ARTICULOS: '/inventario', // Alias para compatibilidad
  GASTOS: '/gastos',
  FONDOS: '/fondos',
  REPORTES: '/reportes',
  PERFIL: '/perfil',
};

export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
];

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PEDIDOS,
  ROUTES.VENTAS,
  ROUTES.INVENTARIO,
  ROUTES.GASTOS,
  ROUTES.FONDOS,
  ROUTES.REPORTES,
  ROUTES.PERFIL,
];

export const ROUTE_TITLES = {
  [ROUTES.LOGIN]: 'Iniciar Sesión',
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.PEDIDOS]: 'Pedidos',
  [ROUTES.VENTAS]: 'Ventas',
  [ROUTES.INVENTARIO]: 'Inventario',
  [ROUTES.GASTOS]: 'Gastos',
  [ROUTES.FONDOS]: 'Fondos',
  [ROUTES.REPORTES]: 'Reportes',
  [ROUTES.PERFIL]: 'Perfil',
};
