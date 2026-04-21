import { CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldError } from '@/components/ui/field-error';
import { getInputErrorProps } from '@/lib/form-errors';

export function CrearSemanaModal({
  open,
  onOpenChange,
  formulario,
  onFieldChange,
  errors = {},
  onSubmit,
  loading = false,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-[#315e92]" />
            Crear nueva semana
          </DialogTitle>
          <DialogDescription>
            Definí el período de la semana. Al confirmar, se generará el detalle con los insumos activos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">
                Fecha inicio <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={formulario.fecha_inicio || ''}
                onChange={(e) => onFieldChange('fecha_inicio', e.target.value)}
                {...getInputErrorProps(errors, 'fecha_inicio').inputProps}
              />
              <FieldError error={errors?.fecha_inicio} id="fecha_inicio-error" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_fin">
                Fecha fin <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fecha_fin"
                type="date"
                value={formulario.fecha_fin || ''}
                onChange={(e) => onFieldChange('fecha_fin', e.target.value)}
                {...getInputErrorProps(errors, 'fecha_fin').inputProps}
              />
              <FieldError error={errors?.fecha_fin} id="fecha_fin-error" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones_semana">Observaciones</Label>
            <Textarea
              id="observaciones_semana"
              value={formulario.observaciones || ''}
              onChange={(e) => onFieldChange('observaciones', e.target.value)}
              rows={3}
              placeholder="Opcional"
              className="resize-none border-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Creando...' : 'Confirmar y crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
