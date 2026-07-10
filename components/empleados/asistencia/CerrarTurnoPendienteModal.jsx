import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const formatDate = (date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const formatTime = (date) => {
  if (!date) return '--:--';
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const toDateYmd = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const buildIsoFromDateAndTime = (fechaYmd, timeHm) => {
  const [year, month, day] = fechaYmd.split('-').map(Number);
  const [hours, minutes] = timeHm.split(':').map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return localDate.toISOString();
};

const addDaysToYmd = (fechaYmd, days) => {
  const [year, month, day] = fechaYmd.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const resolveEgresoIso = (fechaYmd, horaIngresoTime, horaEgresoTime) => {
  const ingresoHm = horaIngresoTime instanceof Date
    ? `${String(horaIngresoTime.getHours()).padStart(2, '0')}:${String(horaIngresoTime.getMinutes()).padStart(2, '0')}`
    : '';
  const egresoFecha = horaEgresoTime < ingresoHm ? addDaysToYmd(fechaYmd, 1) : fechaYmd;
  return buildIsoFromDateAndTime(egresoFecha, horaEgresoTime);
};

const validate = (form, asistencia) => {
  const errors = {};
  const fechaYmd = toDateYmd(asistencia?.fechaAsistencia) || toDateYmd(asistencia?.ingreso);
  const ingreso = asistencia?.ingreso;

  if (!form.horaEgreso) {
    errors.horaEgreso = 'Ingrese la hora real de egreso';
    return errors;
  }

  if (!fechaYmd || !ingreso) {
    errors.horaEgreso = 'No se pudo determinar la fecha del turno';
    return errors;
  }

  const egresoIso = resolveEgresoIso(fechaYmd, ingreso, form.horaEgreso);
  const egreso = new Date(egresoIso);
  const diffHoras = (egreso.getTime() - ingreso.getTime()) / (1000 * 60 * 60);

  if (diffHoras <= 0 || diffHoras > 16) {
    errors.horaEgreso = 'El egreso debe ser posterior al ingreso y dentro de las 16 horas de turno';
  }

  if (egreso > new Date()) {
    errors.horaEgreso = 'La hora de egreso no puede ser futura';
  }

  return errors;
};

export function CerrarTurnoPendienteModal({
  isOpen,
  onClose,
  empleado,
  onSubmit,
  isSubmitting,
}) {
  const asistencia = empleado?.asistenciaActual || empleado?.turnoPendiente || null;
  const [horaEgreso, setHoraEgreso] = useState('');
  const [errors, setErrors] = useState({});

  const empleadoNombre = empleado?.nombre || asistencia?.empleadoNombre || 'Empleado';
  const fechaLabel = useMemo(() => {
    const fecha = asistencia?.fechaAsistencia || asistencia?.ingreso;
    return formatDate(fecha);
  }, [asistencia]);
  const fechaYmd = useMemo(
    () => toDateYmd(asistencia?.fechaAsistencia) || toDateYmd(asistencia?.ingreso),
    [asistencia]
  );

  useEffect(() => {
    if (!isOpen) return;
    setHoraEgreso('');
    setErrors({});
  }, [isOpen, asistencia?.id]);

  const ingresoHm = asistencia?.ingreso
    ? `${String(asistencia.ingreso.getHours()).padStart(2, '0')}:${String(asistencia.ingreso.getMinutes()).padStart(2, '0')}`
    : '';
  const cruzaMedianoche = horaEgreso && ingresoHm ? horaEgreso < ingresoHm : false;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate({ horaEgreso }, asistencia);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    await onSubmit({
      empleado_id: Number(empleado?.id || asistencia?.empleadoId),
      hora_egreso: resolveEgresoIso(fechaYmd, asistencia.ingreso, horaEgreso),
    });
  };

  if (!asistencia) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg min-[390px]:max-h-[90vh] min-[390px]:w-[calc(100vw-1.5rem)]">
        <DialogHeader>
          <DialogTitle>Cerrar turno pendiente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Este turno quedó abierto de un día anterior. Indique la hora real de egreso
                para calcular correctamente las horas trabajadas. Si el egreso fue después de
                la medianoche, ingreselo normalmente (ej.: ingreso 22:00, egreso 02:00).
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Empleado</Label>
              <Input value={empleadoNombre} readOnly disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha del turno</Label>
              <Input value={fechaLabel} readOnly disabled />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Hora de ingreso</Label>
              <Input value={formatTime(asistencia.ingreso)} readOnly disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hora-egreso-pendiente">Hora de egreso real</Label>
              <Input
                id="hora-egreso-pendiente"
                type="time"
                value={horaEgreso}
                onChange={(event) => setHoraEgreso(event.target.value)}
                disabled={isSubmitting}
              />
              {errors.horaEgreso ? (
                <p className="text-xs text-destructive">{errors.horaEgreso}</p>
              ) : null}
            </div>
          </div>

          {cruzaMedianoche ? (
            <p className="text-xs font-medium text-blue-700">
              Se registrara el egreso al dia siguiente del turno.
            </p>
          ) : null}

          <DialogFooter className="border-t pt-3 sm:pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isSubmitting ? 'Cerrando...' : 'Cerrar turno'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
