import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Menu, LogOut, ChevronDown, Search, Bell, Clock3, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_NAMES } from '@/config/api';
import { useConnectionStatus } from '@/contexts/ConnectionStatusContext';
import { ROUTE_TITLES } from '@/config/routes';
import { UserAvatar } from '@/components/user/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUserMenuItems } from './navigation';

export function AdminTopbar({ title, sidebarCollapsed, onSidebarToggle, onMobileMenuOpen }) {
  const router = useRouter();
  const { user, userRole, logout } = useAuth();
  const { workerActive, pollingActive, lastPollingError } = useConnectionStatus();
  const [globalSearch, setGlobalSearch] = useState('');

  const routeMeta = useMemo(() => {
    const subtitles = {
      '/dashboard': 'Panel de gestion',
      '/pedidos': 'Gestion operativa de pedidos',
      '/cocina': 'Seguimiento de comandas',
      '/inventario': 'Control de articulos e insumos',
      '/ventas': 'Historial y cobros',
      '/clientes': 'Gestion de clientes',
      '/empleados': 'Gestion del equipo',
      '/gastos': 'Control de gastos operativos',
      '/fondos': 'Seguimiento de fondos',
      '/reportes': 'Analisis y metricas',
      '/configuracion': 'Ajustes del sistema',
    };

    const sortedRoutes = Object.keys(ROUTE_TITLES).sort((a, b) => b.length - a.length);
    const matchedRoute = sortedRoutes.find(
      (route) => route !== '/' && (router.pathname === route || router.pathname.startsWith(`${route}/`)),
    );

    if (!matchedRoute) {
      return {
        title: title || 'Panel de gestion',
        subtitle: 'Panel de gestion',
      };
    }

    return {
      title: ROUTE_TITLES[matchedRoute] || title || 'Panel de gestion',
      subtitle: subtitles[matchedRoute] || 'Panel de gestion',
    };
  }, [router.pathname, title]);

  const currentHour = new Date().getHours();
  const shiftLabel =
    currentHour >= 6 && currentHour <= 15
      ? 'Manana'
      : currentHour >= 16 && currentHour <= 23
        ? 'Tarde/Noche'
        : 'Fuera de turno';

  const handleLogout = async () => {
    await logout();
  };

  const healthBadge = (() => {
    if (!workerActive) {
      return { label: 'Worker revisando', classes: 'border-amber-200 bg-amber-50 text-amber-700' };
    }
    if (!pollingActive || lastPollingError) {
      return { label: 'Sistema inestable', classes: 'border-red-200 bg-red-50 text-red-700' };
    }
    return { label: 'Sistema OK', classes: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
  })();

  const notificationCount = !workerActive || !pollingActive || lastPollingError ? 1 : 0;

  const handleSearchSubmit = async () => {
    const query = globalSearch.trim();
    if (!query) {
      return;
    }
    await router.push({
      pathname: '/pedidos',
      query: { search: query },
    });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="relative flex h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:pr-8 lg:pl-0">
        <div className="flex h-full min-w-0 items-center gap-3 lg:gap-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMobileMenuOpen}
            className="text-slate-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 lg:hidden"
            aria-label="Abrir menu lateral"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden lg:flex lg:h-full">
            <div className="relative flex h-full w-[72px] items-center justify-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onSidebarToggle}
                aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
                className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:bg-gray-100 hover:shadow"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-0 right-0 top-0 w-[1.5px] bg-slate-300" />
            </div>
          </div>
          <div className="min-w-0 lg:pl-3">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-lg font-semibold text-slate-900">{routeMeta.title}</p>
              <Badge
                variant="outline"
                className={`hidden h-6 rounded-full border text-[11px] font-semibold md:inline-flex ${healthBadge.classes}`}
              >
                {healthBadge.label}
              </Badge>
            </div>
            <p className="hidden truncate text-xs text-slate-500 sm:block">{routeMeta.subtitle}</p>
          </div>
        </div>

        <div className="hidden flex-1 justify-center px-3 lg:flex">
          <div className="relative w-full max-w-[420px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleSearchSubmit}
              aria-label="Buscar"
              className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg text-slate-500 hover:bg-slate-200/70"
            >
              <Search className="h-4 w-4" />
            </Button>
            <input
              type="text"
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearchSubmit();
                }
              }}
              placeholder="Buscar pedido, cliente o telefono..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-100/80 pl-10 pr-11 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Badge
            variant="outline"
            className="hidden h-8 gap-1.5 rounded-full border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 md:inline-flex"
          >
            <Clock3 className="h-3.5 w-3.5 text-slate-500" />
            {shiftLabel}
          </Badge>

          <Button
            type="button"
            onClick={() => router.push('/pedidos')}
            className="hidden h-10 rounded-xl bg-blue-600 px-3 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700 md:inline-flex"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo pedido
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Notificaciones"
            className="relative h-10 w-10 rounded-xl text-slate-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 ? (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            ) : null}
          </Button>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto gap-3 rounded-xl px-2 py-1.5 transition-all duration-200 hover:bg-blue-50"
              >
                <UserAvatar
                  user={user}
                  size="sm"
                  className="border-blue-200"
                  fallbackClassName="bg-blue-50 text-blue-700"
                />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-tight text-slate-900">
                    {user?.nombre || user?.usuario || 'Usuario'}
                  </p>
                  <Badge variant="outline" className="mt-1 h-5 border-slate-300 text-xs text-slate-600">
                    {ROLE_NAMES[userRole] || userRole || 'Sin rol'}
                  </Badge>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-sm font-medium leading-none text-slate-900">
                  {user?.nombre || user?.usuario || 'Usuario'}
                </p>
                <p className="mt-1 text-xs text-slate-500">{user?.usuario || user?.email || '-'}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {getUserMenuItems().map(({ href, label, icon: Icon }) => (
                <DropdownMenuItem asChild key={href}>
                  <Link href={href} className="cursor-pointer">
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 transition-colors duration-200 focus:bg-red-50 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-blue-600/25 via-blue-500/10 to-transparent" />
      </div>
    </header>
  );
}
