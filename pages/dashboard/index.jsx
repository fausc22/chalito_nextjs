import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/dashboard-v2/DashboardHeader';
import { OperationalHero } from '@/components/dashboard-v2/OperationalHero';
import { OperationalKpiGrid } from '@/components/dashboard-v2/OperationalKpiGrid';
import { OperationalAlertsPanel } from '@/components/dashboard-v2/OperationalAlertsPanel';
import { QuickActions } from '@/components/dashboard-v2/QuickActions';
import { RecentActivityPanel } from '@/components/dashboard-v2/RecentActivityPanel';
import { AdminFinancialMetrics } from '@/components/dashboard-v2/AdminFinancialMetrics';
import { RoleGate } from '@/components/dashboard-v2/RoleGate';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

function DashboardContent() {
  const { user, userRole } = useAuth();
  const { loading, error, operational, alerts, recentActivity, adminMetrics, reload } = useDashboardData(userRole);

  return (
    <Layout title="Dashboard">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <DashboardHeader userName={user?.nombre || user?.usuario} />

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-rose-700" />
                <div>
                  <p className="text-sm font-semibold text-rose-800">No se pudo cargar el dashboard</p>
                  <p className="mt-1 text-sm text-rose-700">{error}</p>
                </div>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={reload}>
                Reintentar
              </Button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : (
          <>
            <OperationalHero activeOrders={operational.active} delayedOrders={operational.delayed} />
            <OperationalKpiGrid kpis={operational} />
          </>
        )}

        <div className="grid gap-4 xl:grid-cols-12">
          <div className="space-y-4 xl:col-span-7">
            <OperationalAlertsPanel alerts={alerts} />
            <RecentActivityPanel items={recentActivity} />
          </div>
          <div className="space-y-4 xl:col-span-5">
            <QuickActions userRole={userRole} />
          </div>
        </div>

        <RoleGate adminOnly>
          <AdminFinancialMetrics metrics={adminMetrics} />
        </RoleGate>
      </div>
    </Layout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
