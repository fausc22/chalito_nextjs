import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { useAuth } from '../../contexts/AuthContext';
import { getDefaultEmpleadosSection } from '@/config/empleadosPermissions';

function EmpleadosIndexRedirect() {
  const router = useRouter();
  const { userRole } = useAuth();

  useEffect(() => {
    const defaultSection = getDefaultEmpleadosSection(userRole) || 'asistencia';
    router.replace(`/empleados/${defaultSection}`);
  }, [router, userRole]);

  return null;
}

export default function EmpleadosIndexPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute module="empleados">
        <EmpleadosIndexRedirect />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
