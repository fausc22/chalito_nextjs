import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

const toInputTime = (date) => {
  if (!date) return '';
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
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

const validate = (form, asistencia) => {
  const errors = {};
  const now = new Date();

  if (!form.nuevaHora) {
    errors.nuevaHora = 'Ingrese la nueva hora de ingreso';
  }

  if (form.nuevaHora && asistencia?.fechaAsistencia) {
    const fechaYmd = toDateYmd(asistencia.fechaAsistencia) || toDateYmd(asistencia.ingreso);
    if (fechaYmd) {
      const nuevaFecha = new Date(buildIsoFromDateAndTime(fechaYmd, form.nuevaHora));
      if (nuevaFecha > now) {
        errors.nuevaHora = 'La hora no puede ser futura';
      }
      if (asistencia.ingreso && nuevaFecha.getTime() === asistencia.ingreso.getTime()) {
        errors.nuevaHora = 'Debe ser distinta a la hora actual de ingreso';
      }
    }
  }

  return errors;
};

export function AjustarIngresoModal({
  isOpen,
  onClose,
  asistencia,
  onSubmit,
  isSubmitting,
}) {
  const [form, setForm] = useState({ nuevaHora: '', motivo: '' });
  const [errors, setErrors] = useState({});

  const empleadoNombre = asistencia?.empleadoNombre || 'Empleado';
  const fechaLabel = useMemo(() => {
    const fecha = asistencia?.fechaAsistencia || asistencia?.ingreso;
    return formatDate(fecha);
  }, [asistencia]);

  useEffect(() => {
    if (!isOpen || !asistencia) return;
    setForm({
      nuevaHora: toInputTime(asistencia.ingreso),
      motivo: '',
    });
    setErrors({});
  }, [isOpen, asistencia]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(form, asistencia);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const fechaYmd = toDateYmd(asistencia.fechaAsistencia) || toDateYmd(asistencia.ingreso);
    const horaIngresoNueva = buildIsoFromDateAndTime(fechaYmd, form.nuevaHora);

    await onSubmit({
      hora_ingreso_nueva: horaIngresoNueva,
      motivo: form.motivo.trim() || null,
    });
  };

  if (!asistencia) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg min-[390px]:max-h-[90vh] min-[390px]:w-[calc(100vw-1.5rem)]">
        <DialogHeader>
          <DialogTitle>Ajustar ingreso</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Este cambio modifica las horas trabajadas y puede impactar en la liquidación del período.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Empleado</Label>
              <Input value={empleadoNombre} readOnly disabled />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha de asistencia</Label>
              <Input value={fechaLabel} readOnly disabled />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Hora de ingreso actual</Label>
              <Input value={formatTime(asistencia.ingreso)} readOnly disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nueva-hora-ingreso">Nueva hora de ingreso</Label>
              <Input
                id="nueva-hora-ingreso"
                type="time"
                value={form.nuevaHora}
                onChange={(event) => setForm((prev) => ({ ...prev, nuevaHora: event.target.value }))}
                disabled={isSubmitting}
              />
              {errors.nuevaHora ? (
                <p className="text-xs text-destructive">{errors.nuevaHora}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="motivo-ajuste">Motivo del ajuste (opcional)</Label>
            <Textarea
              id="motivo-ajuste"
              value={form.motivo}
              onChange={(event) => setForm((prev) => ({ ...prev, motivo: event.target.value }))}
              placeholder="Ej.: Olvidé fichar a tiempo; el empleado entró antes."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="border-t pt-3 sm:pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar ajuste'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
