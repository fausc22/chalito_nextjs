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

/**
 * Componente de formulario para crear/editar ingredientes con shadcn/ui
 */
export const IngredientesForm = ({
  isOpen,
  onClose,
  formulario,
  setFormulario,
  onSubmit,
  isEditing = false,
  loading = false,
}) => {
  const handleChange = (field, value) => {
    setFormulario(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b-2 border-slate-200">
          <DialogTitle className="text-2xl font-bold">
            {isEditing ? 'Editar Ingrediente' : 'Crear Nuevo Ingrediente'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isEditing
              ? 'Modifica los datos del ingrediente'
              : 'Completa los datos para agregar un nuevo ingrediente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-medium">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={formulario.nombre || ''}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Lechuga, Tomate, Queso..."
              className="border-2 focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              value={formulario.descripcion || ''}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Descripción opcional del ingrediente"
              rows={3}
              className="border-2 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 resize-none"
            />
          </div>

          {/* Precio Extra */}
          <div className="space-y-2">
            <Label htmlFor="precio_extra" className="text-sm font-medium">
              Precio Extra
            </Label>
            <Input
              id="precio_extra"
              type="number"
              value={formulario.precio_extra !== undefined ? formulario.precio_extra : ''}
              onChange={(e) => handleChange('precio_extra', e.target.value)}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="border-2 focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
            />
            <p className="text-sm text-muted-foreground">
              Costo adicional si el cliente lo agrega extra
            </p>
          </div>

          {/* Checkbox disponible */}
          {isEditing && (formulario.disponible === 0 || formulario.disponible === false) ? (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-500 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
              <Checkbox
                id="disponible"
                checked={formulario.disponible !== 0 && formulario.disponible !== false}
                onCheckedChange={(checked) => handleChange('disponible', checked ? 1 : 0)}
                className="w-5 h-5 border-2"
              />
              <Label htmlFor="disponible" className="cursor-pointer text-amber-900 font-semibold">
                Reactivar ingrediente (marcar como disponible)
              </Label>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
              <Checkbox
                id="disponible"
                checked={formulario.disponible !== 0 && formulario.disponible !== false}
                onCheckedChange={(checked) => handleChange('disponible', checked ? 1 : 0)}
                className="w-5 h-5 border-2"
              />
              <Label htmlFor="disponible" className="cursor-pointer font-medium text-slate-700">
                Disponible para uso
              </Label>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-6 border-t-2 border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-2 h-11 px-6 text-base"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-8 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar Ingrediente' : 'Crear Ingrediente')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
