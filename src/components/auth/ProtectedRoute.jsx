import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';

export function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, isLoading, hasMinimumRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(ROUTES.LOGIN);
      } else if (requiredRole && !hasMinimumRole(requiredRole)) {
        router.replace(ROUTES.DASHBOARD);
      }
    }
  }, [isAuthenticated, isLoading, requiredRole, hasMinimumRole, router]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner spinner-lg mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // No mostrar nada si no está autenticado (se redirige)
  if (!isAuthenticated) {
    return null;
  }

  // No mostrar nada si no tiene el rol requerido (se redirige)
  if (requiredRole && !hasMinimumRole(requiredRole)) {
    return null;
  }

  return children;
}
