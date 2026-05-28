import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBasket,
  TrendingDown,
  TrendingUp,
  User,
  UserCog,
  Users,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';
import {
  MODULES,
  MODULE_ROUTES,
  getAccessibleModulesForRole,
  getHomeShortcutModules,
} from '@/config/permissions';

const NAV_META = {
  [MODULES.DASHBOARD]: { label: 'Inicio', icon: LayoutDashboard },
  [MODULES.PEDIDOS]: { label: 'Pedidos', icon: ShoppingBasket },
  [MODULES.COCINA]: { label: 'Cocina', icon: CreditCard },
  [MODULES.INVENTARIO]: { label: 'Inventario', icon: Package },
  [MODULES.VENTAS]: { label: 'Ventas', icon: TrendingUp },
  [MODULES.CLIENTES]: { label: 'Clientes', icon: Users },
  [MODULES.EMPLEADOS]: { label: 'Empleados', icon: Users },
  [MODULES.GASTOS]: { label: 'Gastos', icon: TrendingDown },
  [MODULES.REPORTES]: { label: 'Reportes', icon: BarChart3 },
  [MODULES.CONFIGURACION]: { label: 'Configuración', icon: Settings },
  [MODULES.USUARIOS]: { label: 'Usuarios', icon: UserCog },
};

const MODULE_HREF_OVERRIDES = {
  [MODULES.EMPLEADOS]: `${ROUTES.EMPLEADOS}/asistencia`,
};

const buildNavItems = (userRole, moduleList) =>
  moduleList
    .filter((m) => NAV_META[m])
    .map((m) => ({
      module: m,
      href: MODULE_HREF_OVERRIDES[m] || MODULE_ROUTES[m],
      activeMatch: MODULE_ROUTES[m],
      label: NAV_META[m].label,
      icon: NAV_META[m].icon,
    }))
    .filter((item) => item.href);

export const getMainNavItems = (userRole) => {
  const modules = getAccessibleModulesForRole(userRole, 'read');
  return buildNavItems(userRole, modules);
};

export const getUserMenuItems = () => [
  { href: ROUTES.PERFIL, label: 'Mi perfil', icon: User },
];

export const getHomeShortcuts = (userRole) => {
  const modules = getHomeShortcutModules(userRole);
  return buildNavItems(userRole, modules);
};

/** @deprecated Usar getHomeShortcuts */
export const getShortcutItems = getHomeShortcuts;
