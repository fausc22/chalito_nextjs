import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { PedidosPageContent } from '@/components/pedidos/PedidosPageContent';

export default function PedidosPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute module="pedidos">
        <PedidosPageContent />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
