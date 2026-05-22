import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useConnectionStatus } from '@/contexts/ConnectionStatusContext';
import { ROLES } from '@/config/api';
import { HomeWelcome } from '@/components/home/HomeWelcome';
import { HomePrimaryAction } from '@/components/home/HomePrimaryAction';
import { HomeShortcutsGrid } from '@/components/home/HomeShortcutsGrid';
import { HomePulseStrip } from '@/components/home/HomePulseStrip';
import { HomeCocinaLauncher } from '@/components/home/HomeCocinaLauncher';

function HomeContent() {
  const { user, userRole } = useAuth();
  const {
    pedidosAtrasadosCount,
    workerActive,
    pollingActive,
    lastPollingError,
  } = useConnectionStatus();

  const systemIssue = !workerActive || !pollingActive || Boolean(lastPollingError);
  const hasAlerts = pedidosAtrasadosCount > 0 || systemIssue;
  const isCocina = userRole === ROLES.COCINA;

  return (
    <Layout title="Inicio">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <HomeWelcome
          userName={user?.nombre || user?.usuario}
          userRole={userRole}
          hasAlerts={hasAlerts}
        />

        {isCocina ? (
          <HomeCocinaLauncher />
        ) : (
          <>
            <HomePrimaryAction userRole={userRole} />
            <HomeShortcutsGrid
              userRole={userRole}
              pedidosAtrasadosCount={pedidosAtrasadosCount}
            />
            <HomePulseStrip
              pedidosAtrasadosCount={pedidosAtrasadosCount}
              workerActive={workerActive}
              pollingActive={pollingActive}
              lastPollingError={lastPollingError}
            />
          </>
        )}
      </div>
    </Layout>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute module="dashboard">
      <ErrorBoundary>
        <HomeContent />
      </ErrorBoundary>
    </ProtectedRoute>
  );
}
