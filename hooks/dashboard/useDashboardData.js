import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ROLES } from '@/config/api';
import { pedidosService } from '@/services/pedidosService';
import { ventasService } from '@/services/ventasService';
import { reportesService } from '@/services/reportesService';
import { useConnectionStatus } from '@/contexts/ConnectionStatusContext';

const initialAdminMetrics = {
  ventasDelDia: 0,
  totalCobrado: 0,
  ticketPromedio: 0,
  mediosPago: [],
  productosMasVendidos: [],
};

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const statusLabel = (estado) => {
  switch ((estado || '').toLowerCase()) {
    case 'recibido':
      return 'Pendiente';
    case 'en_cocina':
      return 'En preparacion';
    case 'listo':
      return 'Listo';
    case 'entregado':
      return 'Entregado';
    case 'cancelado':
      return 'Cancelado';
    default:
      return 'Estado';
  }
};

export function useDashboardData(userRole) {
  const { pedidosAtrasadosCount, workerActive, pollingActive, lastPollingError } = useConnectionStatus();
  const stableDelayedRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operational, setOperational] = useState({
    today: 0,
    active: 0,
    pending: 0,
    preparing: 0,
    ready: 0,
    delayed: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [adminMetrics, setAdminMetrics] = useState(initialAdminMetrics);

  const isAdmin = userRole === ROLES.ADMIN;

  const buildAlerts = useMemo(() => {
    const alerts = [];
    if (operational.delayed > 0) {
      alerts.push({
        id: 'delayed-orders',
        level: 'danger',
        title: `${operational.delayed} pedidos atrasados`,
        description: 'Conviene revisar la cola de preparacion y reasignar prioridades.',
      });
    }
    return alerts;
  }, [operational.delayed]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const today = getToday();
      const pedidosResult = await pedidosService.obtenerPedidos({ soloHoy: true });
      const pedidos = pedidosResult.success ? pedidosResult.data || [] : [];

      const pending = pedidos.filter((p) => p.estado === 'recibido').length;
      const preparing = pedidos.filter((p) => p.estado === 'en_cocina').length;
      const ready = pedidos.filter((p) => p.estado === 'listo').length;
      const active = pending + preparing + ready;
      const delayedFromMetrics = Number(pedidosAtrasadosCount || 0);
      const metricsHealthy = workerActive && pollingActive && !lastPollingError;
      if (metricsHealthy) {
        stableDelayedRef.current = delayedFromMetrics;
      }
      const delayed = metricsHealthy ? delayedFromMetrics : stableDelayedRef.current;

      setOperational({
        today: pedidos.length,
        active,
        pending,
        preparing,
        ready,
        delayed,
      });

      setRecentActivity(
        pedidos
          .slice()
          .sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0))
          .slice(0, 6)
          .map((p) => ({
            id: String(p.id),
            title: `Pedido #${p.id} - ${statusLabel(p.estado)}`,
            subtitle: p.clienteNombre
              ? `${p.clienteNombre} · ${p.horaProgramada || 'Ahora'}`
              : `Actualizado ${p.horaProgramada || 'recientemente'}`,
          }))
      );

      if (!isAdmin) {
        setAdminMetrics(initialAdminMetrics);
        return;
      }

      const [ventasResumen, reportesDashboard] = await Promise.all([
        ventasService.obtenerResumen({ fecha_desde: today, fecha_hasta: today }),
        reportesService.obtenerDashboard({
          date_from: today,
          date_to: today,
          ranking_limit: 5,
        }),
      ]);

      const resumenVentas = ventasResumen.success ? ventasResumen.data || {} : {};
      const dashboardData = reportesDashboard.success ? reportesDashboard.data || {} : {};
      const reportesResumen = dashboardData.resumen || {};

      const ventasDelDia = Number(
        resumenVentas.total_facturado ??
          resumenVentas.total_monto ??
          resumenVentas.total ??
          reportesResumen.totalVendido ??
          0
      );

      setAdminMetrics({
        ventasDelDia,
        totalCobrado: ventasDelDia,
        ticketPromedio: Number(
          reportesResumen.ticketPromedio ?? resumenVentas.ticket_promedio ?? resumenVentas.ticketPromedio ?? 0
        ),
        mediosPago: Array.isArray(dashboardData.mediosPago) ? dashboardData.mediosPago : [],
        productosMasVendidos: Array.isArray(dashboardData.productosMasVendidos)
          ? dashboardData.productosMasVendidos
          : [],
      });
    } catch (errorCarga) {
      setError(errorCarga?.message || 'No se pudieron cargar los datos del dashboard.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, pedidosAtrasadosCount, workerActive, pollingActive, lastPollingError]);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 60000);
    return () => clearInterval(timer);
  }, [loadData]);

  return {
    loading,
    error,
    operational,
    alerts: buildAlerts,
    recentActivity,
    adminMetrics,
    isAdmin,
    reload: loadData,
  };
}
