import { ROLES, ROLE_NAMES } from './api';

export { ROLES, ROLE_NAMES };

export const MODULES = Object.freeze({
  DASHBOARD: 'dashboard',
  PEDIDOS: 'pedidos',
  COCINA: 'cocina',
  VENTAS: 'ventas',
  INVENTARIO: 'inventario',
  EMPLEADOS: 'empleados',
  GASTOS: 'gastos',
  FONDOS: 'fondos',
  REPORTES: 'reportes',
  CLIENTES: 'clientes',
  CONFIGURACION: 'configuracion',
  USUARIOS: 'usuarios',
  PERFIL: 'perfil',
  AUDITORIA: 'auditoria',
});

const ACTION_LEVEL = { read: 1, write: 2, delete: 3 };

const ROLE_ACCESS = {
  [ROLES.ADMIN]: {
    [MODULES.DASHBOARD]: 'write',
    [MODULES.PEDIDOS]: 'write',
    [MODULES.COCINA]: 'write',
    [MODULES.VENTAS]: 'write',
    [MODULES.INVENTARIO]: 'write',
    [MODULES.EMPLEADOS]: 'write',
    [MODULES.GASTOS]: 'write',
    [MODULES.FONDOS]: 'write',
    [MODULES.REPORTES]: 'write',
    [MODULES.CLIENTES]: 'delete',
    [MODULES.CONFIGURACION]: 'write',
    [MODULES.USUARIOS]: 'write',
    [MODULES.PERFIL]: 'write',
    [MODULES.AUDITORIA]: 'write',
  },
  [ROLES.GERENTE]: {
    [MODULES.DASHBOARD]: 'write',
    [MODULES.PEDIDOS]: 'write',
    [MODULES.COCINA]: 'write',
    [MODULES.VENTAS]: 'write',
    [MODULES.INVENTARIO]: 'write',
    [MODULES.EMPLEADOS]: 'write',
    [MODULES.GASTOS]: 'write',
    [MODULES.FONDOS]: 'write',
    [MODULES.REPORTES]: 'write',
    [MODULES.CLIENTES]: 'write',
    [MODULES.CONFIGURACION]: 'write',
    [MODULES.USUARIOS]: null,
    [MODULES.PERFIL]: 'write',
    [MODULES.AUDITORIA]: 'read',
  },
  [ROLES.CAJERO]: {
    [MODULES.DASHBOARD]: 'read',
    [MODULES.PEDIDOS]: 'write',
    [MODULES.COCINA]: 'read',
    [MODULES.VENTAS]: 'read',
    [MODULES.INVENTARIO]: null,
    [MODULES.EMPLEADOS]: null,
    [MODULES.GASTOS]: null,
    [MODULES.FONDOS]: null,
    [MODULES.REPORTES]: null,
    [MODULES.CLIENTES]: 'read',
    [MODULES.CONFIGURACION]: null,
    [MODULES.USUARIOS]: null,
    [MODULES.PERFIL]: 'write',
    [MODULES.AUDITORIA]: null,
  },
  [ROLES.COCINA]: {
    [MODULES.DASHBOARD]: 'read',
    [MODULES.PEDIDOS]: 'read',
    [MODULES.COCINA]: 'write',
    [MODULES.VENTAS]: null,
    [MODULES.INVENTARIO]: null,
    [MODULES.EMPLEADOS]: null,
    [MODULES.GASTOS]: null,
    [MODULES.FONDOS]: null,
    [MODULES.REPORTES]: null,
    [MODULES.CLIENTES]: null,
    [MODULES.CONFIGURACION]: null,
    [MODULES.USUARIOS]: null,
    [MODULES.PERFIL]: 'write',
    [MODULES.AUDITORIA]: null,
  },
};

export const MODULE_ROUTES = {
  [MODULES.DASHBOARD]: '/dashboard',
  [MODULES.PEDIDOS]: '/pedidos',
  [MODULES.COCINA]: '/cocina',
  [MODULES.VENTAS]: '/ventas',
  [MODULES.INVENTARIO]: '/inventario',
  [MODULES.EMPLEADOS]: '/empleados',
  [MODULES.GASTOS]: '/gastos',
  [MODULES.REPORTES]: '/reportes',
  [MODULES.CLIENTES]: '/clientes',
  [MODULES.CONFIGURACION]: '/configuracion',
  [MODULES.USUARIOS]: '/usuarios',
  [MODULES.PERFIL]: '/perfil',
};

export function getMaxAction(role, module) {
  if (!role || !module) return null;
  const access = ROLE_ACCESS[role];
  if (!access) return null;
  return access[module] || null;
}

export function canAccess(role, module, action = 'read') {
  const maxAction = getMaxAction(role, module);
  if (!maxAction) return false;
  const required = ACTION_LEVEL[action] || ACTION_LEVEL.read;
  const granted = ACTION_LEVEL[maxAction] || 0;
  return granted >= required;
}

export function canWrite(role, module) {
  return canAccess(role, module, 'write');
}

export function getDefaultRouteForRole(role) {
  if (role === ROLES.COCINA) return MODULE_ROUTES[MODULES.COCINA];
  return MODULE_ROUTES[MODULES.DASHBOARD];
}

const NAV_MODULE_ORDER = [
  MODULES.DASHBOARD,
  MODULES.PEDIDOS,
  MODULES.COCINA,
  MODULES.INVENTARIO,
  MODULES.VENTAS,
  MODULES.CLIENTES,
  MODULES.EMPLEADOS,
  MODULES.GASTOS,
  MODULES.REPORTES,
  MODULES.CONFIGURACION,
  MODULES.USUARIOS,
];

export function getAccessibleModulesForRole(role, minAction = 'read') {
  return NAV_MODULE_ORDER.filter((m) => canAccess(role, m, minAction));
}

const HOME_SHORTCUT_EXCLUDED = new Set([
  MODULES.DASHBOARD,
  MODULES.PERFIL,
  MODULES.AUDITORIA,
  MODULES.FONDOS,
]);

const HOME_SHORTCUT_ORDER_BY_ROLE = {
  [ROLES.ADMIN]: [
    MODULES.PEDIDOS,
    MODULES.VENTAS,
    MODULES.REPORTES,
    MODULES.INVENTARIO,
    MODULES.GASTOS,
    MODULES.CLIENTES,
    MODULES.EMPLEADOS,
    MODULES.COCINA,
    MODULES.CONFIGURACION,
    MODULES.USUARIOS,
  ],
  [ROLES.GERENTE]: [
    MODULES.PEDIDOS,
    MODULES.VENTAS,
    MODULES.REPORTES,
    MODULES.INVENTARIO,
    MODULES.GASTOS,
    MODULES.CLIENTES,
    MODULES.EMPLEADOS,
    MODULES.COCINA,
    MODULES.CONFIGURACION,
  ],
  [ROLES.CAJERO]: [MODULES.PEDIDOS, MODULES.VENTAS, MODULES.CLIENTES, MODULES.COCINA],
  [ROLES.COCINA]: [MODULES.COCINA, MODULES.PEDIDOS],
};

const DEFAULT_HOME_SHORTCUT_ORDER = [
  MODULES.PEDIDOS,
  MODULES.VENTAS,
  MODULES.COCINA,
  MODULES.INVENTARIO,
  MODULES.CLIENTES,
];

export function getHomeShortcutModules(role) {
  const order = HOME_SHORTCUT_ORDER_BY_ROLE[role] || DEFAULT_HOME_SHORTCUT_ORDER;
  return order.filter(
    (module) => !HOME_SHORTCUT_EXCLUDED.has(module) && canAccess(role, module, 'read')
  );
}
