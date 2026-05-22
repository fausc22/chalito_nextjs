import Head from 'next/head';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { ModoCocina } from '../../components/pedidos/ModoCocina';

export default function CocinaPage() {
  return (
    <>
      <Head>
        <title>Cocina - El Chalito</title>
      </Head>
      <ErrorBoundary>
        <ProtectedRoute module="cocina">
          <ModoCocina isOpen={true} onClose={() => {}} modoCocina={true} />
        </ProtectedRoute>
      </ErrorBoundary>
    </>
  );
}
