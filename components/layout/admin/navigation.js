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
  Users,
  Wallet,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';

const roleCanSeeClientes = (role) => role === 'ADMIN' || role === 'GERENTE';

export const getMainNavItems = (userRole) => {
  const items = [
    { href: ROUTES.DASHBOARD, label: 'Inicio', icon: LayoutDashboard },
    { href: ROUTES.PEDIDOS, label: 'Pedidos', icon: ShoppingBasket },
    { href: ROUTES.COCINA, label: 'Cocina', icon: CreditCard },
    { href: ROUTES.INVENTARIO, label: 'Inventario', icon: Package },
    { href: ROUTES.VENTAS, label: 'Ventas', icon: TrendingUp },
    { href: ROUTES.EMPLEADOS, label: 'Empleados', icon: Users },
    { href: ROUTES.GASTOS, label: 'Gastos', icon: TrendingDown },
    { href: ROUTES.FONDOS, label: 'Fondos', icon: Wallet },
    { href: ROUTES.REPORTES, label: 'Reportes', icon: BarChart3 },
  ];

  if (roleCanSeeClientes(userRole)) {
    items.splice(6, 0, { href: ROUTES.CLIENTES, label: 'Clientes', icon: Users });
  }

  return items;
};

export const getUserMenuItems = () => [
  { href: ROUTES.PERFIL, label: 'Mi perfil', icon: User },
  { href: ROUTES.CONFIGURACION, label: 'Configuracion', icon: Settings },
];

export const getShortcutItems = (userRole) => {
  const base = [
    { href: ROUTES.PEDIDOS, label: 'Pedidos', icon: ShoppingBasket },
    { href: ROUTES.COCINA, label: 'Cocina', icon: CreditCard },
    { href: ROUTES.INVENTARIO, label: 'Inventario', icon: Package },
    { href: ROUTES.VENTAS, label: 'Ventas', icon: TrendingUp },
  ];

  if (roleCanSeeClientes(userRole)) {
    base.push({ href: ROUTES.CLIENTES, label: 'Clientes', icon: Users });
  }

  return base;
};
