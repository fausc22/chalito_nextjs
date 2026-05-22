import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../config/routes';
import { getDefaultRouteForRole } from '../config/permissions';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, userRole } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace(getDefaultRouteForRole(userRole));
      } else {
        router.replace(ROUTES.LOGIN);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="spinner spinner-lg"></div>
    </div>
  );
}

