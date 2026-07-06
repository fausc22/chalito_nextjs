import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const ESTADO_UI = {
  sin_ingreso: {
    label: 'Sin ingreso',
    badgeClass: 'border-amber-200 bg-amber-100 text-amber-800',
  },
  turno_pendiente: {
    label: 'Turno pendiente',
    badgeClass: 'border-orange-200 bg-orange-100 text-orange-900',
  },
  en_turno: {
    label: 'En turno',
    badgeClass: 'border-green-200 bg-green-100 text-green-800',
  },
  entre_turnos: {
    label: 'Entre turnos',
    badgeClass: 'border-blue-200 bg-blue-100 text-blue-800',
  },
  turno_cerrado: {
    label: 'Turno cerrado',
    badgeClass: 'border-border bg-muted text-foreground',
  },
};

const formatTime = (date) => {
  if (!date) return '--:--';
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const formatFechaCorta = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
};

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatTurnoHoras = (turno) => {
  if (turno.minutosTrabajados > 0) {
    return `${(turno.minutosTrabajados / 60).toFixed(2)} hs`;
  }
  if (turno.ingreso && turno.egreso) {
    const ms = turno.egreso.getTime() - turno.ingreso.getTime();
    if (ms > 0) return `${(ms / (1000 * 60 * 60)).toFixed(2)} hs`;
  }
  return 'en curso';
};

const renderTurnoLinea = (turno) => {
  const ingreso = formatTime(turno.ingreso);
  const egreso = turno.egreso ? formatTime(turno.egreso) : 'en curso';
  const horas = formatTurnoHoras(turno);
  return `${ingreso} – ${egreso} (${horas})`;
};

export function EmpleadoAsistenciaCard({
  empleado,
  onRegistrarIngreso,
  onRegistrarEgreso,
  onAjustarIngreso,
  showHourlyRate = true,
  canAdjustIngreso = false,
}) {
  const estadoUi = ESTADO_UI[empleado.estado] || ESTADO_UI.sin_ingreso;
  const ingresoDisponible = ['sin_ingreso', 'entre_turnos'].includes(empleado.estado);
  const egresoDisponible = ['en_turno', 'turno_pendiente'].includes(empleado.estado);
  const asistencia = empleado.asistenciaActual;
  const turnosHoy = empleado.turnosHoy || [];
  const mostrarAjuste = canAdjustIngreso
    && ['en_turno', 'turno_pendiente'].includes(empleado.estado)
    && Boolean(asistencia?.ingreso)
    && !asistencia?.egreso
    && asistencia?.estado === 'ABIERTO'
    && empleado.puedeAjustarIngreso
    && !empleado.estaLiquidado;

  const badgeLabel = empleado.estado === 'turno_pendiente' && asistencia
    ? `Turno pendiente desde ${formatFechaCorta(asistencia.fechaAsistencia || asistencia.ingreso)}`
    : estadoUi.label;

  return (
    <Card
      id={`empleado-asistencia-${empleado.id}`}
      className="border-border shadow-sm transition-all hover:shadow-md"
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {empleado.nombre}
            </h3>
            {showHourlyRate ? (
              <p className="text-sm text-foreground">
                Valor hora: {formatCurrency(empleado.valorHora)}
              </p>
            ) : null}
          </div>
          <Badge variant="outline" className={estadoUi.badgeClass}>
            {badgeLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {empleado.estado === 'turno_pendiente' && asistencia ? (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
            Turno abierto del {formatFechaCorta(asistencia.fechaAsistencia || asistencia.ingreso)}.
            Registra el egreso antes de un nuevo ingreso.
          </div>
        ) : null}

        {turnosHoy.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Turnos de hoy
            </p>
            <ul className="space-y-1.5">
              {turnosHoy.map((turno) => (
                <li
                  key={turno.id}
                  className="rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground"
                >
                  {renderTurnoLinea(turno)}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border bg-muted p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ingreso</p>
              <p className="mt-1 font-semibold text-foreground">
                {formatTime(asistencia?.ingreso)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Egreso</p>
              <p className="mt-1 font-semibold text-foreground">
                {formatTime(asistencia?.egreso)}
              </p>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-blue-100 bg-primary/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Horas del dia</p>
          <p className="mt-1 text-sm font-semibold text-blue-800">
            {(empleado.horasTurno || 0).toFixed(2)} hs
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant={ingresoDisponible ? 'default' : 'outline'}
            disabled={!ingresoDisponible || empleado.loadingAccion}
            onClick={() => onRegistrarIngreso(empleado.id)}
            className={ingresoDisponible ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
            title={empleado.estado === 'turno_pendiente' ? 'Cierra el turno pendiente antes de registrar ingreso' : undefined}
          >
            {empleado.loadingAccion && ingresoDisponible ? 'Registrando...' : 'Registrar ingreso'}
          </Button>
          <Button
            type="button"
            variant={egresoDisponible ? 'default' : 'outline'}
            disabled={!egresoDisponible || empleado.loadingAccion}
            onClick={() => onRegistrarEgreso(empleado)}
            className={egresoDisponible ? 'bg-green-600 text-white hover:bg-green-700' : ''}
          >
            {empleado.loadingAccion && egresoDisponible
              ? 'Registrando...'
              : empleado.estado === 'turno_pendiente'
                ? 'Cerrar turno pendiente'
                : 'Registrar egreso'}
          </Button>
          {mostrarAjuste ? (
            <Button
              type="button"
              variant="outline"
              disabled={empleado.loadingAccion}
              onClick={() => onAjustarIngreso?.(empleado)}
              className="border-blue-300 bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 sm:col-span-2"
            >
              Ajustar ingreso
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
