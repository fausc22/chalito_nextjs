import { Carrot, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Carrot className="h-5 w-5" />
            {isEditing ? 'Editar Ingrediente' : 'Crear Nuevo Ingrediente'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing
              ? 'Modifica los datos del ingrediente'
              : 'Completa los datos para agregar un nuevo ingrediente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pt-4 pl-4 pr-4">
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
              className="border-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
              className="border-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {/* Unidad base (para costos) */}
          <div className="space-y-2">
            <Label htmlFor="unidad_base" className="text-sm font-medium">
              Unidad base para costos
            </Label>
            <Select
              value={formulario.unidad_base || 'UNIDADES'}
              onValueChange={(value) => handleChange('unidad_base', value)}
            >
              <SelectTrigger id="unidad_base" className="border-2">
                <SelectValue placeholder="Seleccionar unidad base" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNIDADES">UNIDADES → pan, huevo, fetas</SelectItem>
                <SelectItem value="GRAMOS">GRAMOS → queso, panceta</SelectItem>
                <SelectItem value="KILOS">KILOS → carne, papas</SelectItem>
                <SelectItem value="LITROS">LITROS → aceite, salsa</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Esta es la unidad base que se usará para calcular costos (por ejemplo, costo por kilo, por litro o por unidad).
            </p>
          </div>

          {/* Costo unitario base */}
          <div className="space-y-2">
            <Label htmlFor="costo_unitario_base" className="text-sm font-medium">
              Costo por unidad
            </Label>
            <Input
              id="costo_unitario_base"
              type="number"
              value={formulario.costo_unitario_base !== undefined && formulario.costo_unitario_base !== null ? formulario.costo_unitario_base : ''}
              onChange={(e) => handleChange('costo_unitario_base', e.target.value)}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="border-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-xs text-muted-foreground">
              ¿Cuánto cuesta 1 kilo / 1 litro / 1 unidad de este insumo? Ejemplo: carne → costo por kilo, aceite → costo por litro, pan → costo por unidad.
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

        </form>

        <DialogFooter className="gap-2 flex-shrink-0 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="h-11 px-6"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 gap-2 h-11 px-6"
          >
            <Check className="h-4 w-4" />
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
