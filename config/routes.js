import { MODULES, canAccess } from './permissions';

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
  REPORTES: '/reportes',
  CLIENTES: '/clientes',
  PERFIL: '/perfil',
  CONFIGURACION: '/configuracion',
  COCINA: '/cocina',
  USUARIOS: '/usuarios',
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
  ROUTES.REPORTES,
  ROUTES.CLIENTES,
  ROUTES.PERFIL,
  ROUTES.CONFIGURACION,
  ROUTES.COCINA,
  ROUTES.USUARIOS,
];

export const ROUTE_TITLES = {
  [ROUTES.LOGIN]: 'Iniciar Sesión',
  [ROUTES.DASHBOARD]: 'Inicio',
  [ROUTES.PEDIDOS]: 'Pedidos',
  [ROUTES.VENTAS]: 'Ventas',
  [ROUTES.INVENTARIO]: 'Inventario',
  [ROUTES.EMPLEADOS]: 'Empleados',
  [ROUTES.GASTOS]: 'Gastos',
  [ROUTES.REPORTES]: 'Reportes',
  [ROUTES.CLIENTES]: 'Clientes',
  [ROUTES.PERFIL]: 'Perfil',
  [ROUTES.CONFIGURACION]: 'Configuración del sistema',
  [ROUTES.COCINA]: 'Cocina',
  [ROUTES.USUARIOS]: 'Usuarios del sistema',
};

/** Módulo RBAC requerido para acceder a cada ruta (lectura) */
export const ROUTE_MODULES = {
  [ROUTES.DASHBOARD]: MODULES.DASHBOARD,
  [ROUTES.PEDIDOS]: MODULES.PEDIDOS,
  [ROUTES.COCINA]: MODULES.COCINA,
  [ROUTES.VENTAS]: MODULES.VENTAS,
  [ROUTES.INVENTARIO]: MODULES.INVENTARIO,
  [ROUTES.EMPLEADOS]: MODULES.EMPLEADOS,
  [ROUTES.GASTOS]: MODULES.GASTOS,
  [ROUTES.REPORTES]: MODULES.REPORTES,
  [ROUTES.CLIENTES]: MODULES.CLIENTES,
  [ROUTES.CONFIGURACION]: MODULES.CONFIGURACION,
  [ROUTES.PERFIL]: MODULES.PERFIL,
  [ROUTES.USUARIOS]: MODULES.USUARIOS,
};

export const ROUTE_MIN_ROLES = {
  [ROUTES.CLIENTES]: 'GERENTE',
  [ROUTES.CONFIGURACION]: 'GERENTE',
};

export function getModuleForPath(pathname) {
  if (!pathname) return null;
  const path = pathname.split('?')[0];
  const entries = Object.entries(ROUTE_MODULES).sort((a, b) => b[0].length - a[0].length);
  for (const [route, moduleKey] of entries) {
    if (path === route || path.startsWith(`${route}/`)) return moduleKey;
  }
  return null;
}

export function canAccessPath(role, pathname, action = 'read') {
  const moduleKey = getModuleForPath(pathname);
  if (!moduleKey) return true;
  return canAccess(role, moduleKey, action);
}
