import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EMPTY_FORM = {
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  documento: '',
  valor_hora: '',
  fecha_ingreso: '',
  observaciones: '',
};

const toInputDate = (dateValue) => {
  if (!dateValue) return '';
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const validateForm = (form) => {
  const errors = {};
  const fechaIngreso = form.fecha_ingreso ? new Date(`${form.fecha_ingreso}T00:00:00`) : null;
  const now = new Date();
  if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
  if (!form.apellido.trim()) errors.apellido = 'El apellido es obligatorio';
  if (!form.valor_hora || Number(form.valor_hora) <= 0) errors.valor_hora = 'Ingrese un valor hora valido';
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Email invalido';
  if (fechaIngreso && fechaIngreso > now) errors.fecha_ingreso = 'La fecha de ingreso no puede ser futura';
  return errors;
};

export function EmpleadoFormModal({ isOpen, onClose, empleado, onSubmit, isMutating }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const isEditing = Boolean(empleado);

  useEffect(() => {
    if (!isOpen) return;
    if (!empleado) {
      setForm(EMPTY_FORM);
      setErrors({});
      return;
    }

    setForm({
      nombre: empleado.nombre || '',
      apellido: empleado.apellido || '',
      telefono: empleado.telefono || '',
      email: empleado.email || '',
      documento: empleado.documento || '',
      valor_hora: empleado.valorHora || '',
      fecha_ingreso: toInputDate(empleado.fechaIngreso),
      observaciones: empleado.observaciones || '',
    });
    setErrors({});
  }, [empleado, isOpen]);

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
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSubmit(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="kds-card-scroll max-h-[78vh] max-w-xl overflow-y-scroll sm:max-h-[90vh] sm:overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar empleado' : 'Nuevo empleado'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(event) => handleChange('nombre', event.target.value)}
                placeholder="Nombre"
                className="mt-1"
                maxLength={60}
              />
              {errors.nombre ? <p className="mt-1 text-xs text-red-600">{errors.nombre}</p> : null}
            </div>
            <div>
              <Label htmlFor="apellido">Apellido *</Label>
              <Input
                id="apellido"
                value={form.apellido}
                onChange={(event) => handleChange('apellido', event.target.value)}
                placeholder="Apellido"
                className="mt-1"
                maxLength={60}
              />
              {errors.apellido ? <p className="mt-1 text-xs text-red-600">{errors.apellido}</p> : null}
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={form.telefono}
                onChange={(event) => handleChange('telefono', event.target.value)}
                placeholder="11 5555-5555"
                className="mt-1"
                maxLength={30}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="ejemplo@gmail.com"
                className="mt-1"
                maxLength={100}
              />
              {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
            </div>
            <div>
              <Label htmlFor="documento">Documento</Label>
              <Input
                id="documento"
                value={form.documento}
                onChange={(event) => handleChange('documento', event.target.value)}
                placeholder="DNI / CUIL"
                className="mt-1"
                maxLength={30}
              />
            </div>
            <div>
              <Label htmlFor="valor_hora">Valor hora *</Label>
              <Input
                id="valor_hora"
                type="number"
                min="0"
                step="0.01"
                value={form.valor_hora}
                onChange={(event) => handleChange('valor_hora', event.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
              {errors.valor_hora ? <p className="mt-1 text-xs text-red-600">{errors.valor_hora}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <Label htmlFor="fecha_ingreso">Fecha de ingreso</Label>
              <Input
                id="fecha_ingreso"
                type="date"
                value={form.fecha_ingreso}
                onChange={(event) => handleChange('fecha_ingreso', event.target.value)}
                className="mt-1 w-[160px] max-w-full sm:w-full"
              />
              {errors.fecha_ingreso ? <p className="mt-1 text-xs text-red-600">{errors.fecha_ingreso}</p> : null}
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={form.observaciones}
                onChange={(event) => handleChange('observaciones', event.target.value)}
                placeholder="Notas internas del empleado"
                className="mt-1 min-h-[100px]"
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter className="border-t pt-3 sm:pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isMutating} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={isMutating || hasErrors} className="w-full sm:w-auto">
              {isMutating ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear empleado'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
