import { ROLES } from './api';
import { MODULES, canAccess } from './permissions';

const EMPLEADOS_BASE_SECTIONS = Object.freeze(['asistencia', 'empleados', 'movimientos']);
const ADMIN_EXTRA_SECTIONS = Object.freeze(['liquidaciones']);

const normalizeRole = (role) => String(role || '').trim().toUpperCase();

export function canViewEmpleadosModule(userOrRole) {
  const role = normalizeRole(userOrRole?.rol || userOrRole);
  return canAccess(role, MODULES.EMPLEADOS, 'read');
}

export function canViewEmployeeLiquidaciones(userOrRole) {
  const role = normalizeRole(userOrRole?.rol || userOrRole);
  return role === ROLES.ADMIN;
}

export function canViewEmployeeHourlyRate(userOrRole) {
  const role = normalizeRole(userOrRole?.rol || userOrRole);
  return role === ROLES.ADMIN;
}

export function canMutateEmployeeMaster(userOrRole) {
  const role = normalizeRole(userOrRole?.rol || userOrRole);
  return role === ROLES.ADMIN;
}

export function canViewEmployeeHoursSummary(userOrRole) {
  const role = normalizeRole(userOrRole?.rol || userOrRole);
  return role === ROLES.ADMIN;
}

export function canViewEmployeeEstimatedTotal(userOrRole) {
  const role = normalizeRole(userOrRole?.rol || userOrRole);
  return role === ROLES.ADMIN;
}

export function canOperateEmployeeAttendance(userOrRole) {
  const role = normalizeRole(userOrRole?.rol || userOrRole);
  return role === ROLES.ADMIN || role === ROLES.GERENTE;
}

export function canOperateEmployeeMovements(userOrRole) {
  const role = normalizeRole(userOrRole?.rol || userOrRole);
  return role === ROLES.ADMIN || role === ROLES.GERENTE;
}

export function getAllowedEmpleadosSections(userOrRole) {
  if (!canViewEmpleadosModule(userOrRole)) return [];
  if (canViewEmployeeLiquidaciones(userOrRole)) {
    return [...EMPLEADOS_BASE_SECTIONS, ...ADMIN_EXTRA_SECTIONS];
  }
  return [...EMPLEADOS_BASE_SECTIONS];
}

export function getDefaultEmpleadosSection(userOrRole) {
  const allowed = getAllowedEmpleadosSections(userOrRole);
  return allowed[0] || null;
}

export function canAccessEmpleadosSection(userOrRole, section) {
  if (!section) return false;
  return getAllowedEmpleadosSections(userOrRole).includes(section);
}
