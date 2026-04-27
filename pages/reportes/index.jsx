import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, BarChart3, Inbox, CalendarRange } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Layout } from '../../components/layout/Layout';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useReportes } from '../../hooks/reportes/useReportes';
import { ReportesFiltros } from '../../components/reportes/ReportesFiltros';
import { ReportesResumenCards } from '../../components/reportes/ReportesResumenCards';
import { VentasPorDiaTable } from '../../components/reportes/VentasPorDiaTable';
import { ProductosMasVendidosTable } from '../../components/reportes/ProductosMasVendidosTable';
import { HorariosDemandaCard } from '../../components/reportes/HorariosDemandaCard';
import { MediosPagoCard } from '../../components/reportes/MediosPagoCard';
import { OrigenesModalidadesCard } from '../../components/reportes/OrigenesModalidadesCard';
import { ReportesDashboardSkeleton } from '../../components/reportes/ReportesDashboardSkeleton';
import { buildRangeLabel, safeNumber } from '../../components/reportes/reportesUtils';

const getDateOnly = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayRange = () => {
  const today = new Date();
  const day = getDateOnly(today);
  return { desde: day, hasta: day };
};

const getThisMonthRange = () => {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  return { desde: getDateOnly(from), hasta: getDateOnly(today) };
};

const getThisWeekRange = () => {
  const today = new Date();
  const start = new Date(today);
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);
  return { desde: getDateOnly(start), hasta: getDateOnly(today) };
};

function ReportesContent() {
  const { dashboard, loading, error, hasLoaded, cargarDashboard } = useReportes();
  const hasFetchedOnceRef = useRef(false);
  const [filtros, setFiltros] = useState(() => ({
    ...getThisMonthRange(),
    limit: 10,
    medioPago: '',
    origenPedido: '',
    modalidad: '',
  }));
  const [activeQuickRange, setActiveQuickRange] = useState('mes');
  const [activeTab, setActiveTab] = useState('ventas');

  const dashboardSafe = useMemo(
    () => ({
      resumen: dashboard?.resumen || {},
      ventasPorDia: Array.isArray(dashboard?.ventasPorDia) ? dashboard.ventasPorDia : [],
      productosMasVendidos: Array.isArray(dashboard?.productosMasVendidos)
        ? dashboard.productosMasVendidos
        : [],
      horariosDemanda: Array.isArray(dashboard?.horariosDemanda) ? dashboard.horariosDemanda : [],
      mediosPago: Array.isArray(dashboard?.mediosPago) ? dashboard.mediosPago : [],
      origenes: Array.isArray(dashboard?.origenes) ? dashboard.origenes : [],
      modalidades: Array.isArray(dashboard?.modalidades) ? dashboard.modalidades : [],
    }),
    [dashboard]
  );

  const rangeLabel = useMemo(
    () => buildRangeLabel(filtros.desde, filtros.hasta),
    [filtros.desde, filtros.hasta]
  );

  const isEmptyDashboard = useMemo(() => {
    const resumen = dashboardSafe?.resumen || {};
    const resumenTotal = [
      safeNumber(resumen.totalVendido),
      safeNumber(resumen.cantidadVentas),
      safeNumber(resumen.ticketPromedio),
      safeNumber(resumen.descuentoTotal),
      safeNumber(resumen.ventaMaxima),
      safeNumber(resumen.ventaMinima),
    ].reduce((acc, value) => acc + value, 0);

    return (
      resumenTotal === 0 &&
      dashboardSafe.ventasPorDia.length === 0 &&
      dashboardSafe.productosMasVendidos.length === 0 &&
      dashboardSafe.horariosDemanda.length === 0 &&
      dashboardSafe.mediosPago.length === 0 &&
      dashboardSafe.origenes.length === 0 &&
      dashboardSafe.modalidades.length === 0
    );
  }, [dashboardSafe]);

  const aplicarFiltros = useCallback(async (nextFilters) => {
    if (!nextFilters.desde || !nextFilters.hasta) {
      toast.error('Seleccioná ambas fechas para continuar.');
      return;
    }

    if (nextFilters.desde > nextFilters.hasta) {
      toast.error('La fecha "desde" no puede ser mayor que "hasta".');
      return;
    }

    const response = await cargarDashboard(nextFilters);
    if (!response.success) {
      toast.error(response.error || 'No pudimos cargar los reportes.');
    }
  }, [cargarDashboard]);

  const handleChangeFiltro = useCallback((key, value) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
    if (key === 'desde' || key === 'hasta') {
      setActiveQuickRange(null);
    }
  }, []);

  const handleAplicarClick = useCallback(() => {
    aplicarFiltros(filtros);
  }, [aplicarFiltros, filtros]);

  const handleQuickRange = useCallback((type) => {
    const ranges = {
      hoy: getTodayRange(),
      semana: getThisWeekRange(),
      mes: getThisMonthRange(),
    };

    const selectedRange = ranges[type] || getThisMonthRange();
    const nextFilters = { ...filtros, ...selectedRange };
    setFiltros(nextFilters);
    setActiveQuickRange(type);
    aplicarFiltros(nextFilters);
  }, [aplicarFiltros, filtros]);

  useEffect(() => {
    if (hasFetchedOnceRef.current) return;
    hasFetchedOnceRef.current = true;
    aplicarFiltros(filtros);
  }, [aplicarFiltros, filtros]);

  return (
    <Layout title="Reportes y estadísticas">
      <main className="main-content">
        <div className="mb-5 sm:mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-[1.65rem] sm:text-[2rem] font-semibold text-[#315e92] mb-1.5 flex items-center gap-2">
                <BarChart3 className="h-7 w-7 sm:h-8 sm:w-8" />
                Reportes y estadísticas
              </h1>
              <p className="text-slate-600 text-sm sm:text-base">
                Analizá ventas, demanda, productos destacados y rendimiento general del negocio.
              </p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">Rango seleccionado</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-blue-900">
                <CalendarRange className="h-4 w-4" />
                {rangeLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <ReportesFiltros
            filtros={filtros}
            loading={loading}
            activeQuickRange={activeQuickRange}
            onChangeFiltro={handleChangeFiltro}
            onAplicar={handleAplicarClick}
            onQuickRange={handleQuickRange}
          />

          {!hasLoaded && loading ? <ReportesDashboardSkeleton /> : null}

          {hasLoaded && error ? (
            <div className="bg-white rounded-xl border border-rose-200 p-8 text-center shadow-sm">
              <AlertCircle className="h-10 w-10 mx-auto text-rose-500 mb-3" />
              <h2 className="text-lg font-semibold text-slate-800 mb-1">
                No pudimos cargar los reportes
              </h2>
              <p className="text-slate-600 mb-4">
                Revisá tu conexión e intentá nuevamente en unos segundos.
              </p>
              <Button type="button" onClick={handleAplicarClick}>
                Reintentar
              </Button>
            </div>
          ) : null}

          {hasLoaded && !loading && !error && isEmptyDashboard ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
              <Inbox className="h-10 w-10 mx-auto text-slate-400 mb-3" />
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Sin datos para este rango</h2>
              <p className="text-slate-600">
                No hay información disponible para el período seleccionado.
              </p>
            </div>
          ) : null}

          {hasLoaded && !loading && !error && !isEmptyDashboard ? (
            <>
              <ReportesResumenCards resumen={dashboardSafe.resumen} />

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="overflow-x-auto pb-1">
                  <TabsList className="inline-flex h-auto w-max min-w-max justify-start gap-1.5 rounded-xl border border-slate-200 bg-white p-1 sm:min-w-0">
                    <TabsTrigger
                      value="ventas"
                      className="rounded-lg px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-none"
                    >
                      Ventas
                    </TabsTrigger>
                    <TabsTrigger
                      value="demanda"
                      className="rounded-lg px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-none"
                    >
                      Demanda
                    </TabsTrigger>
                    <TabsTrigger
                      value="productos"
                      className="rounded-lg px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-none"
                    >
                      Productos
                    </TabsTrigger>
                    <TabsTrigger
                      value="canales"
                      className="rounded-lg px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-none"
                    >
                      Canales
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="ventas">
                  <VentasPorDiaTable data={dashboardSafe.ventasPorDia} />
                </TabsContent>

                <TabsContent value="demanda">
                  <HorariosDemandaCard data={dashboardSafe.horariosDemanda} />
                </TabsContent>

                <TabsContent value="productos">
                  <ProductosMasVendidosTable
                    data={dashboardSafe.productosMasVendidos}
                    rankingLimit={filtros.limit}
                  />
                </TabsContent>

                <TabsContent value="canales">
                  <div className="grid gap-5 xl:grid-cols-12">
                    <div className="xl:col-span-7">
                      <MediosPagoCard data={dashboardSafe.mediosPago} />
                    </div>
                    <div className="xl:col-span-5">
                      <OrigenesModalidadesCard
                        origenes={dashboardSafe.origenes}
                        modalidades={dashboardSafe.modalidades}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </div>
      </main>
    </Layout>
  );
}

export default function ReportesPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <ReportesContent />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}

