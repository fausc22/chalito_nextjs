export const ROUTES = {
  // Rutas públicas
  LOGIN: '/login',

  // Rutas protegidas
  DASHBOARD: '/dashboard',
  PEDIDOS: '/pedidos',
  VENTAS: '/ventas',
  INVENTARIO: '/inventario',
  ARTICULOS: '/inventario', // Alias para compatibilidad
  EMPLEADOS: '/empleados',
  GASTOS: '/gastos',
  FONDOS: '/fondos',
  REPORTES: '/reportes',
  PERFIL: '/perfil',
  COCINA: '/cocina',
};

export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
];

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PEDIDOS,
  ROUTES.VENTAS,
  ROUTES.INVENTARIO,
  ROUTES.EMPLEADOS,
  ROUTES.GASTOS,
  ROUTES.FONDOS,
  ROUTES.REPORTES,
  ROUTES.PERFIL,
  ROUTES.COCINA,
];

export const ROUTE_TITLES = {
  [ROUTES.LOGIN]: 'Iniciar Sesión',
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.PEDIDOS]: 'Pedidos',
  [ROUTES.VENTAS]: 'Ventas',
  [ROUTES.INVENTARIO]: 'Inventario',
  [ROUTES.EMPLEADOS]: 'Empleados',
  [ROUTES.GASTOS]: 'Gastos',
  [ROUTES.FONDOS]: 'Fondos',
  [ROUTES.REPORTES]: 'Reportes',
  [ROUTES.PERFIL]: 'Perfil',
  [ROUTES.COCINA]: 'Cocina',
};
