import Head from 'next/head';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { ModoCocina } from '../../components/pedidos/ModoCocina';
import { CocinaActionBar } from '../../components/pedidos/CocinaActionBar';

export default function CocinaPage() {
  return (
    <>
      <Head>
        <title>Cocina - El Chalito</title>
      </Head>
      <ErrorBoundary>
        <ProtectedRoute module="cocina">
          <div className="flex h-screen flex-col">
            <CocinaActionBar />
            <div className="min-h-0 flex-1">
              <ModoCocina
                isOpen={true}
                onClose={() => {}}
                modoCocina={true}
                className="h-full"
                showThemeToggle={false}
              />
            </div>
          </div>
        </ProtectedRoute>
      </ErrorBoundary>
    </>
  );
}
