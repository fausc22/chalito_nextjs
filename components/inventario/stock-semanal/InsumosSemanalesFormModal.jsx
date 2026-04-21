import { ClipboardList } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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

export function InsumosSemanalesFormModal({
  isOpen,
  onOpenChange,
  formulario,
  onFieldChange,
  errors = {},
  onSubmit,
  isEditing = false,
  loading = false,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#315e92]" />
            {isEditing ? 'Editar insumo semanal' : 'Nuevo insumo semanal'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing ? 'Modificá los datos del insumo' : 'Completá los datos del insumo'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pt-4 pl-4 pr-4">
          <div className="space-y-2">
            <Label htmlFor="insumo-nombre" className="text-sm font-medium">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="insumo-nombre"
              value={formulario.nombre || ''}
              onChange={(e) => onFieldChange('nombre', e.target.value)}
              placeholder="Ej: Harina 000, Aceite girasol..."
              className="border-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              autoComplete="off"
              {...getInputErrorProps(errors, 'nombre').inputProps}
            />
            <FieldError error={errors?.nombre} id="insumo-nombre-error" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insumo-descripcion" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="insumo-descripcion"
              value={formulario.descripcion || ''}
              onChange={(e) => onFieldChange('descripcion', e.target.value)}
              placeholder="Opcional: unidad esperada, ubicación, notas internas..."
              rows={3}
              className="border-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
            <Checkbox
              id="insumo-activo"
              checked={formulario.activo !== 0 && formulario.activo !== false}
              onCheckedChange={(checked) => onFieldChange('activo', checked ? 1 : 0)}
              className="w-5 h-5 border-2"
            />
            <Label htmlFor="insumo-activo" className="cursor-pointer text-slate-800 font-medium">
              Insumo activo
            </Label>
          </div>
        </form>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear insumo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
