import Link from 'next/link';
import { forwardRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_NAMES } from '@/config/api';
import { ROUTE_TITLES } from '@/config/routes';
import { UserAvatar } from '@/components/user/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUserMenuItems } from './navigation';

export const AdminTopbar = forwardRef(function AdminTopbar(
  { title, onMobileMenuOpen, actions = null },
  ref,
) {
  const router = useRouter();
  const { user, userRole, logout } = useAuth();

  const routeMeta = useMemo(() => {
    const subtitles = {
      '/dashboard': 'Inicio',
      '/pedidos': 'Gestion operativa de pedidos',
      '/cocina': 'Seguimiento de comandas',
      '/inventario': 'Control de articulos e insumos',
      '/ventas': 'Historial y cobros',
      '/clientes': 'Gestion de clientes',
      '/empleados': 'Gestion del equipo',
      '/gastos': 'Control de gastos operativos',
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

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header
      ref={ref}
      className="sticky top-0 z-30 shrink-0 border-b border-border bg-background/95 text-foreground shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85"
    >
      <div className="relative flex h-16 items-center justify-between gap-2 px-4 sm:h-[72px] sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMobileMenuOpen}
            className="h-10 w-10 shrink-0 text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground lg:hidden"
            aria-label="Abrir menu lateral"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground sm:text-lg">{routeMeta.title}</p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">{routeMeta.subtitle}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}

          <ThemeToggle />

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto gap-2 rounded-xl px-2 py-1.5 transition-all duration-200 hover:bg-accent sm:gap-3"
              >
                <UserAvatar
                  user={user}
                  size="sm"
                  className="border-border"
                  fallbackClassName="bg-muted text-foreground"
                />
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-tight text-foreground">
                    {user?.nombre || user?.usuario || 'Usuario'}
                  </p>
                  <Badge variant="outline" className="mt-1 h-5 border-border text-xs text-muted-foreground">
                    {ROLE_NAMES[userRole] || userRole || 'Sin rol'}
                  </Badge>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-sm font-medium leading-none text-foreground">
                  {user?.nombre || user?.usuario || 'Usuario'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{user?.usuario || user?.email || '-'}</p>
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
                className="cursor-pointer text-red-600 transition-colors duration-200 focus:bg-destructive/10 focus:text-red-600 dark:focus:bg-red-950/40 dark:focus:text-red-400"
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
});
