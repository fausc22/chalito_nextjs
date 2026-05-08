import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { ROLE_NAMES } from '../../config/api';
import { Menu, LogOut, Home, Package, User, Settings, ChevronDown, CreditCard, TrendingDown, TrendingUp, Wallet, Users, BarChart3 } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user/UserAvatar';
import { getUserSecondaryText } from '@/lib/userDisplay';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';

export function NavBar({
  showSidebarToggle = false,
  sidebarOpen = false,
  onSidebarToggle = null,
  compactMode = false,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, userRole } = useAuth();
  const router = useRouter();

  const isActiveRoute = (route) =>
    router.pathname === route || router.pathname.startsWith(`${route}/`);

  const navLinkClasses = (route) =>
    `px-4 py-2 rounded-lg font-medium transition-colors ${
      isActiveRoute(route)
        ? compactMode
          ? 'bg-blue-50 text-blue-700 font-semibold'
          : 'bg-blue-700 text-white font-semibold'
        : compactMode
          ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          : 'text-blue-200 hover:text-white hover:bg-blue-700'
    }`;

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const getRoleDisplayName = (role) => ROLE_NAMES[role] || role;
  const secondaryUserText = getUserSecondaryText(user);
  const canSeeClientes = userRole === 'ADMIN' || userRole === 'GERENTE';

  const mainNavItems = [
    { href: ROUTES.DASHBOARD, label: 'Inicio', icon: Home },
    { href: ROUTES.PEDIDOS, label: 'Pedidos', icon: CreditCard },
    { href: ROUTES.INVENTARIO, label: 'Inventario', icon: Package },
    { href: ROUTES.EMPLEADOS, label: 'Empleados', icon: Users },
    { href: ROUTES.VENTAS, label: 'Ventas', icon: TrendingUp },
    { href: ROUTES.REPORTES, label: 'Reportes', icon: BarChart3 },
    ...(canSeeClientes ? [{ href: ROUTES.CLIENTES, label: 'Clientes', icon: Users }] : []),
    { href: ROUTES.GASTOS, label: 'Gastos', icon: TrendingDown },
    { href: ROUTES.FONDOS, label: 'Fondos', icon: Wallet },
  ];

  const userNavItems = [
    { href: ROUTES.PERFIL, label: 'Mi Perfil', icon: User },
    { href: ROUTES.CONFIGURACION, label: 'Configuración', icon: Settings },
  ];

  return (
    <header
      className={
        compactMode
          ? 'border-b border-slate-200 bg-white shadow-sm'
          : 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-lg'
      }
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center">
            {/* Toggle sidebar Pedidos (mobile/tablet) */}
            {showSidebarToggle && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onSidebarToggle?.()}
                className={`xl:hidden mr-1 sm:mr-2 h-9 w-9 rounded-md transition-colors ${
                  compactMode
                    ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-400'
                    : 'border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-slate-500'
                }`}
                aria-label="Abrir o cerrar sidebar de pedidos"
              >
                <Menu className={`h-5 w-5 ${compactMode ? 'text-slate-700' : 'text-white'}`} />
              </Button>
            )}

            {/* Logo */}
            <Link
              href={ROUTES.DASHBOARD}
              className="flex items-center space-x-3 ml-1 sm:ml-4 transition-all duration-300 hover:scale-105 hover:brightness-110 hover:drop-shadow-lg"
            >
              <div className="relative w-32 h-12 sm:w-36 sm:h-14 md:w-44 md:h-16">
                <Image
                  src="/logo-empresa.png"
                  alt="Logo El Chalito"
                  fill
                  sizes="(max-width: 640px) 128px, (max-width: 768px) 144px, 176px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Menú desktop */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Enlaces de navegación */}
            {!compactMode ? (
              <nav className="flex items-center space-x-2">
                {mainNavItems.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className={navLinkClasses(href)}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                  </Link>
                ))}
              </nav>
            ) : (
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                Operacion de pedidos
              </div>
            )}

            {/* Separador vertical */}
            <div className={`h-8 w-px ${compactMode ? 'bg-slate-300' : 'bg-blue-600'}`}></div>

            {/* Dropdown menú de usuario - Flotante */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-3 h-auto py-2 px-3 transition-colors ${
                    compactMode ? 'hover:bg-slate-100' : 'hover:bg-blue-700'
                  }`}
                >
                  <UserAvatar
                    user={user}
                    size="sm"
                    className={compactMode ? 'border-2 border-slate-200' : 'bg-blue-700 border-2 border-blue-600'}
                    fallbackClassName={compactMode ? 'bg-slate-100 text-slate-700' : 'bg-blue-700 text-white'}
                  />
                  <div className="flex flex-col items-start">
                    <span className={`text-sm font-semibold leading-tight ${compactMode ? 'text-slate-900' : 'text-white'}`}>
                      {user?.nombre}
                    </span>
                    <span className={`text-xs leading-tight ${compactMode ? 'text-slate-500' : 'text-blue-200'}`}>
                      {secondaryUserText || '-'}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`mt-0.5 h-5 text-xs px-1.5 border-none ${
                        compactMode
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-100'
                          : 'bg-blue-700 text-blue-200 hover:bg-blue-700'
                      }`}
                    >
                      {getRoleDisplayName(userRole)}
                    </Badge>
                  </div>
                  <ChevronDown className={`h-4 w-4 ${compactMode ? 'text-slate-500' : 'text-blue-200'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.nombre}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {secondaryUserText || 'Sin email/usuario'}
                    </p>
                    <Badge variant="outline" className="w-fit mt-1 text-xs">
                      {getRoleDisplayName(userRole)}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userNavItems.map(({ href, label, icon: Icon }) => (
                  <DropdownMenuItem key={href} asChild>
                    <Link href={href}>
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Menú móvil - Sheet */}
          <div className="lg:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`transition-colors ${compactMode ? 'hover:bg-slate-100' : 'hover:bg-blue-700'}`}
                >
                  <Menu className={`h-6 w-6 ${compactMode ? 'text-slate-800' : 'text-white'}`} />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                // Sidebar móvil: debajo del navbar y sin taparlo
                overlayClassName="top-16"
                className={`w-72 h-[calc(100vh-4rem)] top-16 overflow-y-auto ${
                  compactMode
                    ? 'bg-white border-l border-slate-200 text-slate-900'
                    : 'bg-gradient-to-b from-blue-900 to-blue-800 border-l border-blue-700 text-white'
                }`}
              >
                <SheetHeader className={`pb-4 ${compactMode ? 'border-b border-slate-200' : 'border-b border-blue-700'}`}>
                  <SheetTitle className={`${compactMode ? 'text-slate-900' : 'text-white'} text-left`}>
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        user={user}
                        size="lg"
                        className={compactMode ? 'border-2 border-slate-200' : 'bg-blue-700 border-2 border-blue-600'}
                        fallbackClassName={compactMode ? 'bg-slate-100 text-slate-700' : 'bg-blue-700 text-white'}
                      />
                      <div className="flex flex-col items-start">
                        <span className={`font-semibold text-base ${compactMode ? 'text-slate-900' : 'text-white'}`}>
                          {user?.nombre}
                        </span>
                        <span className={`text-xs ${compactMode ? 'text-slate-500' : 'text-blue-300'}`}>{secondaryUserText || '-'}</span>
                        <Badge
                          variant="secondary"
                          className={`mt-1 h-5 text-xs px-1.5 border-none ${
                            compactMode
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-100'
                              : 'bg-blue-700 text-blue-200 hover:bg-blue-700'
                          }`}
                        >
                          {getRoleDisplayName(userRole)}
                        </Badge>
                      </div>
                    </div>
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Menú de navegación del sistema
                  </SheetDescription>
                </SheetHeader>

                {/* Enlaces de navegación móvil */}
                <nav className="flex flex-col gap-2 mt-6">
                  {mainNavItems.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                        isActiveRoute(href)
                          ? compactMode
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-blue-700 text-white'
                          : compactMode
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'text-blue-200 hover:text-white hover:bg-blue-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Link>
                  ))}

                  {/* Separador */}
                  <div className={`my-4 border-t ${compactMode ? 'border-slate-200' : 'border-blue-700'}`} />

                  {userNavItems.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                        isActiveRoute(href)
                          ? compactMode
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-blue-700 text-white'
                          : compactMode
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'text-blue-200 hover:text-white hover:bg-blue-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Link>
                  ))}

                  {/* Separador */}
                  <div className={`my-4 border-t ${compactMode ? 'border-slate-200' : 'border-blue-700'}`} />

                  {/* Botón Cerrar Sesión */}
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
