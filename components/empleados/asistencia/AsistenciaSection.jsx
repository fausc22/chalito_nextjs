import { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useAsistencia } from '@/hooks/empleados/useAsistencia';
import { EmpleadosFeedback } from '@/components/empleados/EmpleadosFeedback';
import { AsistenciaMetricCard } from './AsistenciaMetricCard';
import { EmpleadoAsistenciaCard } from './EmpleadoAsistenciaCard';
import { AsistenciaRecentTable } from './AsistenciaRecentTable';

const ESTADO_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'sin_ingreso', label: 'Sin ingreso' },
  { value: 'en_turno', label: 'En turno' },
  { value: 'turno_cerrado', label: 'Turno cerrado' },
];

const formatHours = (hours) => `${(Number(hours) || 0).toFixed(2)} hs`;

const formatMoney = (amount) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
}).format(Number(amount) || 0);

export function AsistenciaSection() {
  const {
    empleadosConEstado,
    actividadReciente,
    metricas,
    loadingInicial,
    loadingRefresh,
    error,
    cargarAsistencia,
    registrarIngreso,
    registrarEgreso,
  } = useAsistencia();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('all');

  useEffect(() => {
    cargarAsistencia();
  }, [cargarAsistencia]);

  const empleadosFiltrados = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return empleadosConEstado.filter((empleado) => {
      const matchesSearch = !normalizedSearch || empleado.nombre.toLowerCase().includes(normalizedSearch);
      const matchesEstado = estadoFiltro === 'all' || empleado.estado === estadoFiltro;
      return matchesSearch && matchesEstado;
    });
  }, [empleadosConEstado, estadoFiltro, searchTerm]);

  const handleIngreso = async (empleadoId) => {
    const response = await registrarIngreso(empleadoId);
    if (response.success) {
      toast.success('Ingreso registrado');
      await cargarAsistencia({ silent: true });
    } else {
      toast.error('No se pudo registrar ingreso', { description: response.error });
    }
  };

  const handleEgreso = async (empleadoId) => {
    const response = await registrarEgreso(empleadoId);
    if (response.success) {
      toast.success('Egreso registrado');
      await cargarAsistencia({ silent: true });
    } else {
      toast.error('No se pudo registrar egreso', { description: response.error });
    }
  };

  if (loadingInicial) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
        <div className="h-12 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-64 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AsistenciaMetricCard
          label="Empleados activos hoy"
          value={metricas.activosHoy}
          hint="Con al menos una marca de ingreso"
          accentClass="text-slate-900"
        />
        <AsistenciaMetricCard
          label="En turno ahora"
          value={metricas.enTurnoAhora}
          hint="Con turno abierto en este momento"
          accentClass="text-slate-900"
        />
        <AsistenciaMetricCard
          label="Horas acumuladas hoy"
          value={formatHours(metricas.horasAcumuladasHoy)}
          hint="Suma total de horas trabajadas"
          accentClass="text-slate-900"
        />
        <AsistenciaMetricCard
          label="Total estimado hoy"
          value={formatMoney(metricas.totalEstimadoHoy)}
          hint="Estimado por valor hora actual"
          accentClass="text-slate-900"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative lg:min-w-0 lg:flex-[1.6]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar empleado por nombre"
              className="pl-9"
            />
          </div>

          <select
            value={estadoFiltro}
            onChange={(event) => setEstadoFiltro(event.target.value)}
            className="h-10 min-w-[220px] rounded-md border border-slate-300 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 lg:flex-[0.9]"
          >
            {ESTADO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="outline"
            onClick={() => cargarAsistencia({ silent: true })}
            disabled={loadingRefresh}
            className="border-slate-300 text-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${loadingRefresh ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

        </div>
      </div>

      {error ? (
        <EmpleadosFeedback type="error" message={error} />
      ) : null}

      {empleadosFiltrados.length === 0 ? (
        <EmpleadosFeedback
          type="empty"
          message="No hay empleados para mostrar con los filtros actuales."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {empleadosFiltrados.map((empleado) => (
            <EmpleadoAsistenciaCard
              key={empleado.id}
              empleado={empleado}
              onRegistrarIngreso={handleIngreso}
              onRegistrarEgreso={handleEgreso}
            />
          ))}
        </div>
      )}

      <div id="actividad-reciente">
        <AsistenciaRecentTable rows={actividadReciente} />
      </div>
    </div>
  );
}
