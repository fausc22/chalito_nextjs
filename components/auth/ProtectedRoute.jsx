import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { getDefaultRouteForRole } from '../../config/permissions';

export function ProtectedRoute({ children, requiredRole = null, module = null }) {
  const { isAuthenticated, isLoading, hasMinimumRole, canAccessModule, userRole } = useAuth();
  const router = useRouter();

  const hasAccess = () => {
    if (module) {
      return canAccessModule(module, 'read');
    }
    if (requiredRole) {
      return hasMinimumRole(requiredRole);
    }
    return true;
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(ROUTES.LOGIN);
      } else if (!hasAccess()) {
        router.replace(getDefaultRouteForRole(userRole));
      }
    }
  }, [isAuthenticated, isLoading, requiredRole, module, userRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="spinner spinner-lg mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!hasAccess()) {
    return null;
  }

  return children;
}
