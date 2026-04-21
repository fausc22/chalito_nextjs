import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const ESTADO_UI = {
  sin_ingreso: {
    label: 'Sin ingreso',
    badgeClass: 'border-amber-200 bg-amber-100 text-amber-800',
  },
  en_turno: {
    label: 'En turno',
    badgeClass: 'border-green-200 bg-green-100 text-green-800',
  },
  turno_cerrado: {
    label: 'Turno cerrado',
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-700',
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

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
};

export function EmpleadoAsistenciaCard({ empleado, onRegistrarIngreso, onRegistrarEgreso }) {
  const estadoUi = ESTADO_UI[empleado.estado] || ESTADO_UI.sin_ingreso;
  const ingresoDisponible = empleado.estado !== 'en_turno';
  const egresoDisponible = empleado.estado === 'en_turno';

  return (
    <Card className="border-slate-200 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {empleado.nombre}
            </h3>
            <p className="text-sm text-slate-900">
              Valor hora: {formatCurrency(empleado.valorHora)}
            </p>
          </div>
          <Badge variant="outline" className={estadoUi.badgeClass}>
            {estadoUi.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ingreso</p>
            <p className="mt-1 font-semibold text-slate-700">
              {formatTime(empleado.asistenciaActual?.ingreso)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Egreso</p>
            <p className="mt-1 font-semibold text-slate-700">
              {formatTime(empleado.asistenciaActual?.egreso)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Horas del turno</p>
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
          >
            {empleado.loadingAccion && ingresoDisponible ? 'Registrando...' : 'Registrar ingreso'}
          </Button>
          <Button
            type="button"
            variant={egresoDisponible ? 'default' : 'outline'}
            disabled={!egresoDisponible || empleado.loadingAccion}
            onClick={() => onRegistrarEgreso(empleado.id)}
            className={egresoDisponible ? 'bg-green-600 text-white hover:bg-green-700' : ''}
          >
            {empleado.loadingAccion && egresoDisponible ? 'Registrando...' : 'Registrar egreso'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
