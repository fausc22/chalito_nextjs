export const ROUTES = {
  // Rutas públicas
  LOGIN: '/login',

  // Rutas protegidas
  DASHBOARD: '/dashboard',
  PEDIDOS: '/pedidos',
  VENTAS: '/ventas',
  ARTICULOS: '/articulos',
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
  ROUTES.ARTICULOS,
  ROUTES.REPORTES,
  ROUTES.PERFIL,
];

export const ROUTE_TITLES = {
  [ROUTES.LOGIN]: 'Iniciar Sesión',
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.PEDIDOS]: 'Pedidos',
  [ROUTES.VENTAS]: 'Ventas',
  [ROUTES.ARTICULOS]: 'Artículos',
  [ROUTES.REPORTES]: 'Reportes',
  [ROUTES.PERFIL]: 'Perfil',
};
