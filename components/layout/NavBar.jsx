import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { ROLE_NAMES, ROLE_ICONS } from '../../config/api';
import { Menu, LogOut, Home, Package, User, Settings, ChevronDown, Plus, ChevronRight, CreditCard, TrendingDown, TrendingUp, Wallet, Users, BarChart3 } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, userRole } = useAuth();
  const router = useRouter();

  const isActiveRoute = (route) =>
    router.pathname === route || router.pathname.startsWith(`${route}/`);

  const navLinkClasses = (route) =>
    `px-4 py-2 rounded-lg font-medium transition-colors ${
      isActiveRoute(route)
        ? 'bg-blue-700 text-white font-semibold'
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
  const getRoleIcon = (role) => ROLE_ICONS[role] || '👤';

  // Obtener iniciales del usuario para el avatar
  const getUserInitials = () => {
    if (!user?.nombre) return 'U';
    const names = user.nombre.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.nombre.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-lg">
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
                className="xl:hidden mr-1 sm:mr-2 h-9 w-9 rounded-md border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-slate-500 transition-colors"
                aria-label="Abrir o cerrar sidebar de pedidos"
              >
                <Menu className="h-5 w-5 text-white" />
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
            <nav className="flex items-center space-x-2">
              <Link href={ROUTES.DASHBOARD} className={navLinkClasses(ROUTES.DASHBOARD)}>
                <span className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Inicio
                </span>
              </Link>

              <Link href={ROUTES.PEDIDOS} className={navLinkClasses(ROUTES.PEDIDOS)}>
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Pedidos
                </span>
              </Link>

              <Link href={ROUTES.INVENTARIO} className={navLinkClasses(ROUTES.INVENTARIO)}>
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Inventario
                </span>
              </Link>

              <Link href={ROUTES.EMPLEADOS} className={navLinkClasses(ROUTES.EMPLEADOS)}>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Empleados
                </span>
              </Link>

              <Link href={ROUTES.VENTAS} className={navLinkClasses(ROUTES.VENTAS)}>
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Ventas
                </span>
              </Link>

              <Link href={ROUTES.REPORTES} className={navLinkClasses(ROUTES.REPORTES)}>
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Reportes
                </span>
              </Link>

              {(userRole === 'ADMIN' || userRole === 'GERENTE') && (
                <Link href={ROUTES.CLIENTES} className={navLinkClasses(ROUTES.CLIENTES)}>
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Clientes
                  </span>
                </Link>
              )}

              <Link href={ROUTES.GASTOS} className={navLinkClasses(ROUTES.GASTOS)}>
                <span className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Gastos
                </span>
              </Link>
            </nav>

            {/* Separador vertical */}
            <div className="h-8 w-px bg-blue-600"></div>

            {/* Dropdown menú de usuario - Flotante */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 h-auto py-2 px-3 hover:bg-blue-700 transition-colors"
                >
                  <Avatar className="h-9 w-9 bg-blue-700 border-2 border-blue-600">
                    <AvatarFallback className="bg-blue-700 text-white font-semibold text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-white leading-tight">
                      {user?.nombre}
                    </span>
                    <Badge variant="secondary" className="mt-0.5 h-5 text-xs px-1.5 bg-blue-700 text-blue-200 hover:bg-blue-700 border-none">
                      {getRoleDisplayName(userRole)}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 text-blue-200" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.nombre}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      @{user?.usuario}
                    </p>
                    <Badge variant="outline" className="w-fit mt-1 text-xs">
                      {getRoleDisplayName(userRole)}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="cursor-not-allowed">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="cursor-not-allowed">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
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
                  className="hover:bg-blue-700 transition-colors"
                >
                  <Menu className="h-6 w-6 text-white" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                // Sidebar móvil: debajo del navbar y sin taparlo
                overlayClassName="top-16"
                className="w-72 h-[calc(100vh-4rem)] top-16 bg-gradient-to-b from-blue-900 to-blue-800 border-l border-blue-700 text-white overflow-y-auto"
              >
                <SheetHeader className="border-b border-blue-700 pb-4">
                  <SheetTitle className="text-white text-left">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 bg-blue-700 border-2 border-blue-600">
                        <AvatarFallback className="bg-blue-700 text-white font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-white text-base">
                          {user?.nombre}
                        </span>
                        <span className="text-xs text-blue-300">@{user?.usuario}</span>
                        <Badge variant="secondary" className="mt-1 h-5 text-xs px-1.5 bg-blue-700 text-blue-200 hover:bg-blue-700 border-none">
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
                  <Link
                    href={ROUTES.DASHBOARD}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActiveRoute(ROUTES.DASHBOARD)
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-200 hover:text-white hover:bg-blue-700'
                    }`}
                  >
                    <Home className="h-5 w-5" />
                    Inicio
                  </Link>

                  <Link
                    href={ROUTES.PEDIDOS}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActiveRoute(ROUTES.PEDIDOS)
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-200 hover:text-white hover:bg-blue-700'
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    Pedidos
                  </Link>

                  <Link
                    href={ROUTES.INVENTARIO}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActiveRoute(ROUTES.INVENTARIO)
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-200 hover:text-white hover:bg-blue-700'
                    }`}
                  >
                    <Package className="h-5 w-5" />
                    Inventario
                  </Link>

                  <Link
                    href={ROUTES.VENTAS}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActiveRoute(ROUTES.VENTAS)
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-200 hover:text-white hover:bg-blue-700'
                    }`}
                  >
                    <TrendingUp className="h-5 w-5" />
                    Ventas
                  </Link>

                  <Link
                    href={ROUTES.EMPLEADOS}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActiveRoute(ROUTES.EMPLEADOS)
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-200 hover:text-white hover:bg-blue-700'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    Empleados
                  </Link>

                  <Link
                    href={ROUTES.REPORTES}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActiveRoute(ROUTES.REPORTES)
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-200 hover:text-white hover:bg-blue-700'
                    }`}
                  >
                    <BarChart3 className="h-5 w-5" />
                    Reportes
                  </Link>

                  {(userRole === 'ADMIN' || userRole === 'GERENTE') && (
                    <Link
                      href={ROUTES.CLIENTES}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                        isActiveRoute(ROUTES.CLIENTES)
                          ? 'bg-blue-700 text-white'
                          : 'text-blue-200 hover:text-white hover:bg-blue-700'
                      }`}
                    >
                      <Users className="h-5 w-5" />
                      Clientes
                    </Link>
                  )}

                  <Link
                    href={ROUTES.GASTOS}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActiveRoute(ROUTES.GASTOS)
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-200 hover:text-white hover:bg-blue-700'
                    }`}
                  >
                    <TrendingDown className="h-5 w-5" />
                    Gastos
                  </Link>

                  <Link
                    href={ROUTES.FONDOS}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActiveRoute(ROUTES.FONDOS)
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-200 hover:text-white hover:bg-blue-700'
                    }`}
                  >
                    <Wallet className="h-5 w-5" />
                    Fondos
                  </Link>

                  {/* Separador */}
                  <div className="border-t border-blue-700 my-4" />

                  {/* Opciones deshabilitadas */}
                  <button
                    disabled
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-blue-400 cursor-not-allowed opacity-50"
                  >
                    <User className="h-5 w-5" />
                    Perfil
                  </button>

                  <button
                    disabled
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-blue-400 cursor-not-allowed opacity-50"
                  >
                    <Settings className="h-5 w-5" />
                    Configuración
                  </button>

                  {/* Separador */}
                  <div className="border-t border-blue-700 my-4" />

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
