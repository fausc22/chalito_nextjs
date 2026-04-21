import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import ErrorBoundary from '../../components/common/ErrorBoundary';

function EmpleadosIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/empleados/asistencia');
  }, [router]);

  return null;
}

export default function EmpleadosIndexPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <EmpleadosIndexRedirect />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
