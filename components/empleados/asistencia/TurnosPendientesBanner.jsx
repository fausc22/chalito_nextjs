import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatFecha = (record) => {
  const fecha = record?.fechaAsistencia || record?.ingreso;
  if (!fecha) return 'fecha desconocida';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(fecha);
};

export function TurnosPendientesBanner({ turnosPendientes = [], empleadosConEstado = [] }) {
  const [expanded, setExpanded] = useState(true);

  if (!turnosPendientes.length) return null;

  const scrollToEmpleado = (empleadoId) => {
    const element = document.getElementById(`empleado-asistencia-${empleadoId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-2">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="font-semibold text-amber-900">
              Hay {turnosPendientes.length} turno{turnosPendientes.length === 1 ? '' : 's'} sin cerrar
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Registra el egreso de estos turnos antes de fichar nuevos ingresos.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-amber-900 hover:bg-amber-100"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {expanded ? (
        <ul className="mt-3 space-y-2">
          {turnosPendientes.map((turno) => {
            const empleado = empleadosConEstado.find((item) => item.id === turno.empleadoId);
            const nombre = empleado?.nombre || turno.empleadoNombre;
            return (
              <li
                key={turno.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
              >
                <span className="font-medium text-foreground">
                  {nombre} — pendiente desde {formatFecha(turno)}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => scrollToEmpleado(turno.empleadoId)}
                  className="border-amber-300 text-amber-900 hover:bg-amber-50"
                >
                  Ir al empleado
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
