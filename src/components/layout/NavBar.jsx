import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { ROLE_NAMES, ROLE_ICONS } from '../../config/api';
import Image from 'next/image';

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, userRole } = useAuth();
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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

  return (
    <header className="bg-white shadow-md sticky top-0 z-30">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href={ROUTES.DASHBOARD} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="relative w-32 h-12 md:w-40 md:h-14">
              <Image
                src="/logo-empresa.png"
                alt="Logo El Chalito"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Botón hamburguesa - móvil */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={toggleMenu}
            aria-label="Menú"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 w-full bg-gray-700 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block h-0.5 w-full bg-gray-700 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 w-full bg-gray-700 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>

          {/* Menú desktop */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href={ROUTES.DASHBOARD}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                router.pathname === ROUTES.DASHBOARD
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Inicio
            </Link>

            <Link
              href={ROUTES.ARTICULOS}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                router.pathname === ROUTES.ARTICULOS
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Artículos
            </Link>

            {/* Información del usuario */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-xl">
                  {getRoleIcon(userRole)}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">{user?.nombre}</div>
                  <div className="text-xs text-gray-500">{getRoleDisplayName(userRole)}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn-danger btn-sm"
                title="Cerrar sesión"
              >
                <span className="mr-1">🚪</span>
                Salir
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          <div className="fixed top-16 right-0 bottom-0 w-64 bg-white shadow-xl z-50 md:hidden animate-slide-down">
            <div className="p-6 space-y-6">
              {/* Info usuario móvil */}
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-2xl">
                  {getRoleIcon(userRole)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{user?.nombre}</div>
                  <div className="text-sm text-gray-500">{getRoleDisplayName(userRole)}</div>
                  <div className="text-xs text-gray-400">@{user?.usuario}</div>
                </div>
              </div>

              {/* Enlaces móvil */}
              <nav className="space-y-2">
                <Link
                  href={ROUTES.DASHBOARD}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    router.pathname === ROUTES.DASHBOARD
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🏠 Inicio
                </Link>

                <Link
                  href={ROUTES.ARTICULOS}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    router.pathname === ROUTES.ARTICULOS
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🍔 Artículos
                </Link>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="w-full btn-danger"
                  >
                    🚪 Cerrar Sesión
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
