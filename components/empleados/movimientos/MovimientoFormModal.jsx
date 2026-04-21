import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const EMPTY_FORM = {
  empleado_id: '',
  tipo: 'BONO',
  monto: '',
  fecha: '',
  descripcion: '',
  observaciones: '',
};

const TYPE_OPTIONS = [
  { value: 'BONO', label: 'Bono' },
  { value: 'DESCUENTO', label: 'Descuento' },
  { value: 'ADELANTO', label: 'Adelanto' },
  { value: 'CONSUMO', label: 'Consumo' },
];

const toInputDate = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const validate = (form) => {
  const errors = {};
  const fecha = form.fecha ? new Date(`${form.fecha}T00:00:00`) : null;
  const now = new Date();
  if (!form.empleado_id) errors.empleado_id = 'Seleccione un empleado';
  if (!form.tipo) errors.tipo = 'Seleccione un tipo';
  if (!form.monto || Number(form.monto) <= 0) errors.monto = 'Ingrese un monto valido';
  if (!form.fecha) errors.fecha = 'La fecha es obligatoria';
  if (fecha && fecha > now) errors.fecha = 'La fecha no puede ser futura';
  if (!form.descripcion.trim()) errors.descripcion = 'La descripcion es obligatoria';
  return errors;
};

export function MovimientoFormModal({
  isOpen,
  onClose,
  movimiento,
  empleados,
  onSubmit,
  isMutating,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const isEditing = Boolean(movimiento);

  useEffect(() => {
    if (!isOpen) return;
    if (!movimiento) {
      setForm({
        ...EMPTY_FORM,
        fecha: toInputDate(new Date()),
      });
      setErrors({});
      return;
    }

    setForm({
      empleado_id: movimiento.empleadoId || '',
      tipo: movimiento.tipo || 'BONO',
      monto: movimiento.monto || '',
      fecha: toInputDate(movimiento.fecha),
      descripcion: movimiento.descripcion || '',
      observaciones: movimiento.observaciones || '',
    });
    setErrors({});
  }, [isOpen, movimiento]);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    await onSubmit(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl min-[390px]:max-h-[90vh] min-[390px]:w-[calc(100vw-1.5rem)]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar movimiento' : 'Nuevo movimiento'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <Label htmlFor="empleado_id">Empleado *</Label>
              <select
                id="empleado_id"
                value={form.empleado_id}
                onChange={(event) => handleChange('empleado_id', event.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Seleccionar empleado</option>
                {empleados.map((empleado) => (
                  <option key={empleado.id} value={empleado.id}>
                    {empleado.nombreCompleto}
                  </option>
                ))}
              </select>
              {errors.empleado_id ? <p className="mt-1 text-xs text-red-600">{errors.empleado_id}</p> : null}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:contents">
              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <select
                  id="tipo"
                  value={form.tipo}
                  onChange={(event) => handleChange('tipo', event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.tipo ? <p className="mt-1 text-xs text-red-600">{errors.tipo}</p> : null}
              </div>

              <div>
                <Label htmlFor="monto">Monto *</Label>
                <Input
                  id="monto"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monto}
                  onChange={(event) => handleChange('monto', event.target.value)}
                  className="mt-1"
                  placeholder="0.00"
                />
                {errors.monto ? <p className="mt-1 text-xs text-red-600">{errors.monto}</p> : null}
              </div>
            </div>

            <div>
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                type="date"
                value={form.fecha}
                onChange={(event) => handleChange('fecha', event.target.value)}
                className="mt-1 w-[160px] max-w-full sm:w-full"
              />
              {errors.fecha ? <p className="mt-1 text-xs text-red-600">{errors.fecha}</p> : null}
            </div>
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción *</Label>
            <Textarea
              id="descripcion"
              value={form.descripcion}
              onChange={(event) => handleChange('descripcion', event.target.value)}
              className="mt-1 min-h-[90px]"
              maxLength={250}
              placeholder="Detalle del movimiento"
            />
            {errors.descripcion ? <p className="mt-1 text-xs text-red-600">{errors.descripcion}</p> : null}
          </div>

          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={form.observaciones}
              onChange={(event) => handleChange('observaciones', event.target.value)}
              className="mt-1 min-h-[80px]"
              maxLength={400}
              placeholder="Notas internas (opcional)"
            />
          </div>

          <DialogFooter className="border-t pt-3 sm:pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isMutating} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={isMutating || hasErrors} className="w-full sm:w-auto">
              {isMutating ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear movimiento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
