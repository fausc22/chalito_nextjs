import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getManualDateBounds } from '@/hooks/empleados/useAsistencia';

const buildIsoFromDateAndTime = (fechaYmd, timeHm) => {
  const [year, month, day] = fechaYmd.split('-').map(Number);
  const [hours, minutes] = timeHm.split(':').map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return localDate.toISOString();
};

const validate = (form) => {
  const errors = {};
  const now = new Date();
  const { minDate, maxDate } = getManualDateBounds();

  if (!form.empleadoId) {
    errors.empleadoId = 'Seleccione un empleado';
  }

  if (!form.fecha) {
    errors.fecha = 'Ingrese la fecha del turno';
  } else if (form.fecha < minDate || form.fecha > maxDate) {
    errors.fecha = 'La fecha esta fuera del periodo permitido';
  }

  if (!form.horaIngreso) {
    errors.horaIngreso = 'Ingrese la hora de ingreso';
  }

  if (!form.horaEgreso) {
    errors.horaEgreso = 'Ingrese la hora de egreso';
  }

  if (form.fecha && form.horaIngreso && form.horaEgreso) {
    const ingreso = new Date(buildIsoFromDateAndTime(form.fecha, form.horaIngreso));
    const egreso = new Date(buildIsoFromDateAndTime(form.fecha, form.horaEgreso));

    if (egreso <= ingreso) {
      errors.horaEgreso = 'El egreso debe ser posterior al ingreso';
    }

    if (ingreso > now || egreso > now) {
      errors.horaEgreso = 'Las horas no pueden ser futuras';
    }
  }

  return errors;
};

export function RegistroManualModal({
  isOpen,
  onClose,
  empleados = [],
  empleadoPreseleccionado = null,
  onSubmit,
  isSubmitting,
}) {
  const { minDate, maxDate } = useMemo(() => getManualDateBounds(), [isOpen]);
  const [form, setForm] = useState({
    empleadoId: '',
    fecha: maxDate,
    horaIngreso: '',
    horaEgreso: '',
    motivo: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      empleadoId: empleadoPreseleccionado?.id || '',
      fecha: maxDate,
      horaIngreso: '',
      horaEgreso: '',
      motivo: '',
    });
    setErrors({});
  }, [isOpen, empleadoPreseleccionado, maxDate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    await onSubmit({
      empleado_id: Number(form.empleadoId),
      fecha: form.fecha,
      hora_ingreso: buildIsoFromDateAndTime(form.fecha, form.horaIngreso),
      hora_egreso: buildIsoFromDateAndTime(form.fecha, form.horaEgreso),
      motivo: form.motivo.trim() || null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg min-[390px]:max-h-[90vh] min-[390px]:w-[calc(100vw-1.5rem)]">
        <DialogHeader>
          <DialogTitle>Registro manual de turno</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Carga un turno ya finalizado (ingreso y egreso). Periodo permitido: desde {minDate} hasta hoy.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="manual-empleado">Empleado</Label>
            <select
              id="manual-empleado"
              value={form.empleadoId}
              onChange={(event) => setForm((prev) => ({ ...prev, empleadoId: event.target.value }))}
              disabled={isSubmitting}
              className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Seleccionar empleado</option>
              {empleados.map((empleado) => (
                <option key={empleado.id} value={empleado.id}>
                  {empleado.nombre}
                </option>
              ))}
            </select>
            {errors.empleadoId ? (
              <p className="text-xs text-destructive">{errors.empleadoId}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="manual-fecha">Fecha del turno</Label>
            <Input
              id="manual-fecha"
              type="date"
              min={minDate}
              max={maxDate}
              value={form.fecha}
              onChange={(event) => setForm((prev) => ({ ...prev, fecha: event.target.value }))}
              disabled={isSubmitting}
            />
            {errors.fecha ? (
              <p className="text-xs text-destructive">{errors.fecha}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="manual-ingreso">Hora ingreso</Label>
              <Input
                id="manual-ingreso"
                type="time"
                value={form.horaIngreso}
                onChange={(event) => setForm((prev) => ({ ...prev, horaIngreso: event.target.value }))}
                disabled={isSubmitting}
              />
              {errors.horaIngreso ? (
                <p className="text-xs text-destructive">{errors.horaIngreso}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="manual-egreso">Hora egreso</Label>
              <Input
                id="manual-egreso"
                type="time"
                value={form.horaEgreso}
                onChange={(event) => setForm((prev) => ({ ...prev, horaEgreso: event.target.value }))}
                disabled={isSubmitting}
              />
              {errors.horaEgreso ? (
                <p className="text-xs text-destructive">{errors.horaEgreso}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="manual-motivo">Motivo (opcional)</Label>
            <Textarea
              id="manual-motivo"
              value={form.motivo}
              onChange={(event) => setForm((prev) => ({ ...prev, motivo: event.target.value }))}
              placeholder="Ej.: Olvide fichar ayer"
              rows={2}
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
              {isSubmitting ? 'Guardando...' : 'Guardar turno'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
