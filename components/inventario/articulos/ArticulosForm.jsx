import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

/**
 * Componente de formulario para crear/editar artículos
 */
export const ArticulosForm = ({
  isOpen,
  onClose,
  formulario,
  setFormulario,
  categorias = [],
  ingredientes = [],
  onSubmit,
  isEditing = false,
  loading = false,
}) => {
  // Estado local para ingredientes seleccionados
  const [ingredienteTemp, setIngredienteTemp] = useState({
    ingrediente_id: '',
    cantidad: '',
    unidad_medida: 'UNIDADES'
  });

  // Referencia para guardar los ingredientes originales del artículo
  const ingredientesOriginalesRef = useRef([]);

  // Guardar ingredientes originales cuando se abre el modal para editar
  useEffect(() => {
    if (isOpen && isEditing && formulario.ingredientes?.length > 0) {
      ingredientesOriginalesRef.current = [...formulario.ingredientes];
    } else if (isOpen && !isEditing) {
      ingredientesOriginalesRef.current = [];
    }
  }, [isOpen, isEditing]);

  const handleChange = (field, value) => {
    // Manejo especial para cambio de tipo
    if (field === 'tipo') {
      const tipoAnterior = formulario.tipo;

      // Si cambia de ELABORADO a otro tipo, limpiar ingredientes
      if (tipoAnterior === 'ELABORADO' && value !== 'ELABORADO') {
        setFormulario(prev => ({ ...prev, tipo: value, ingredientes: [] }));
        return;
      }

      // Si cambia de otro tipo a ELABORADO, restaurar ingredientes originales
      if (tipoAnterior !== 'ELABORADO' && value === 'ELABORADO') {
        setFormulario(prev => ({
          ...prev,
          tipo: value,
          ingredientes: ingredientesOriginalesRef.current.length > 0
            ? [...ingredientesOriginalesRef.current]
            : []
        }));
        return;
      }
    }

    setFormulario(prev => ({ ...prev, [field]: value }));
  };

  // Agregar ingrediente a la lista
  const handleAgregarIngrediente = () => {
    if (!ingredienteTemp.ingrediente_id) {
      toast.error('Debes seleccionar un ingrediente');
      return;
    }

    if (!ingredienteTemp.cantidad || ingredienteTemp.cantidad.trim() === '') {
      toast.error('Debes ingresar una cantidad');
      return;
    }

    const cantidad = parseFloat(ingredienteTemp.cantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    const ingrediente = ingredientes.find(i => i.id === parseInt(ingredienteTemp.ingrediente_id));
    if (!ingrediente) {
      toast.error('Ingrediente no encontrado');
      return;
    }

    // Verificar que no esté ya agregado
    if (formulario.ingredientes.find(i => i.ingrediente_id === parseInt(ingredienteTemp.ingrediente_id))) {
      toast.error('Este ingrediente ya fue agregado');
      return;
    }

    setFormulario(prev => ({
      ...prev,
      ingredientes: [...prev.ingredientes, {
        ingrediente_id: parseInt(ingredienteTemp.ingrediente_id),
        nombre: ingrediente.nombre,
        cantidad: cantidad,
        unidad_medida: ingredienteTemp.unidad_medida
      }]
    }));

    // Resetear selector
    setIngredienteTemp({
      ingrediente_id: '',
      cantidad: '',
      unidad_medida: 'UNIDADES'
    });
  };

  // Quitar ingrediente de la lista
  const handleQuitarIngrediente = (ingrediente_id) => {
    setFormulario(prev => ({
      ...prev,
      ingredientes: prev.ingredientes.filter(i => i.ingrediente_id !== ingrediente_id)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación: Si es ELABORADO, debe tener ingredientes
    if (formulario.tipo === 'ELABORADO' && formulario.ingredientes.length === 0) {
      toast.error('Un artículo ELABORADO debe tener al menos un ingrediente');
      return;
    }

    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b-2 border-slate-200">
          <DialogTitle className="text-2xl font-bold">
            {isEditing ? 'Editar Artículo' : 'Crear Nuevo Artículo'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isEditing
              ? 'Modifica los datos del artículo'
              : 'Completa los datos para agregar un nuevo artículo al menú'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Código y Nombre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo" className="text-sm font-medium">
                Código de barras
              </Label>
              <Input
                id="codigo"
                value={formulario.codigo || ''}
                onChange={(e) => handleChange('codigo', e.target.value)}
                placeholder="Ej: 7890123456789"
                className="border-2 focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                value={formulario.nombre || ''}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ej: Hamburguesa Clásica"
                className="border-2 focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                required
              />
            </div>
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
              placeholder="Describe el artículo..."
              rows={3}
              className="border-2 focus:border-violet-600 focus:ring-2 focus:ring-violet-100 resize-none"
            />
          </div>

          {/* Precio y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio" className="text-sm font-medium">
                Precio ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={formulario.precio || ''}
                onChange={(e) => handleChange('precio', e.target.value)}
                placeholder="0.00"
                className="border-2 focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-sm font-medium">
                Tipo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formulario.tipo || 'OTRO'}
                onValueChange={(value) => handleChange('tipo', value)}
                required
              >
                <SelectTrigger id="tipo" className="border-2">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELABORADO">ELABORADO</SelectItem>
                  <SelectItem value="BEBIDA">BEBIDA</SelectItem>
                  <SelectItem value="OTRO">OTRO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sección de ingredientes (solo si es ELABORADO) */}
          {formulario.tipo === 'ELABORADO' && (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
              <h3 className="text-slate-600 font-medium mb-3 text-[30px]">Ingredientes del artículo</h3>

              {/* Selector de ingredientes */}
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-2 mb-4">
                <Select
                  value={ingredienteTemp.ingrediente_id}
                  onValueChange={(value) => setIngredienteTemp(prev => ({ ...prev, ingrediente_id: value }))}
                >
                  <SelectTrigger className="border-2 bg-white">
                    <SelectValue placeholder="Seleccionar ingrediente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredientes
                      .filter(ing => !formulario.ingredientes.find(s => s.ingrediente_id === ing.id))
                      .map(ing => (
                        <SelectItem key={ing.id} value={ing.id.toString()}>
                          {ing.nombre}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Cantidad"
                  value={ingredienteTemp.cantidad}
                  onChange={(e) => setIngredienteTemp(prev => ({ ...prev, cantidad: e.target.value }))}
                  min="0"
                  step="0.01"
                  className="border-2 bg-white"
                />

                <Select
                  value={ingredienteTemp.unidad_medida}
                  onValueChange={(value) => setIngredienteTemp(prev => ({ ...prev, unidad_medida: value }))}
                >
                  <SelectTrigger className="border-2 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNIDADES">UNIDADES</SelectItem>
                    <SelectItem value="GRAMOS">GRAMOS</SelectItem>
                    <SelectItem value="KILOS">KILOS</SelectItem>
                    <SelectItem value="LITROS">LITROS</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  onClick={handleAgregarIngrediente}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>

              {/* Lista de ingredientes agregados */}
              {formulario.ingredientes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-slate-500 text-sm">Ingredientes agregados:</p>
                  <div className="space-y-2">
                    {formulario.ingredientes.map(ing => (
                      <div
                        key={ing.ingrediente_id}
                        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md"
                      >
                        <span className="text-slate-700 text-sm">
                          {ing.nombre} - {ing.cantidad} {ing.unidad_medida}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuitarIngrediente(ing.ingrediente_id)}
                          className="text-red-500 hover:text-red-600 hover:scale-110 transition-all text-lg font-bold px-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stock Actual y Stock Mínimo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_actual" className="text-sm font-medium">
                Stock Actual
              </Label>
              <Input
                id="stock_actual"
                type="number"
                min="0"
                value={formulario.stock_actual || ''}
                onChange={(e) => handleChange('stock_actual', e.target.value)}
                placeholder="0"
                className="border-2 focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_minimo" className="text-sm font-medium">
                Stock Mínimo
              </Label>
              <Input
                id="stock_minimo"
                type="number"
                min="0"
                value={formulario.stock_minimo || ''}
                onChange={(e) => handleChange('stock_minimo', e.target.value)}
                placeholder="0"
                className="border-2 focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-sm font-medium">
              Categoría <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formulario.categoria || ''}
              onValueChange={(value) => handleChange('categoria', value)}
              required
            >
              <SelectTrigger id="categoria" className="border-2">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(categoria => (
                  <SelectItem
                    key={typeof categoria === 'string' ? categoria : categoria.id}
                    value={typeof categoria === 'string' ? categoria : categoria.nombre}
                  >
                    {typeof categoria === 'string' ? categoria : categoria.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Checkbox Activo / Reactivar */}
          {isEditing && (formulario.activo === 0 || formulario.activo === false) ? (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-500 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
              <Checkbox
                id="activo"
                checked={formulario.activo !== 0 && formulario.activo !== false}
                onCheckedChange={(checked) => handleChange('activo', checked ? 1 : 0)}
                className="w-5 h-5 border-2"
              />
              <Label htmlFor="activo" className="cursor-pointer text-amber-900 font-semibold">
                Reactivar artículo (marcar como disponible)
              </Label>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
              <Checkbox
                id="activo"
                checked={formulario.activo !== 0 && formulario.activo !== false}
                onCheckedChange={(checked) => handleChange('activo', checked ? 1 : 0)}
                className="w-5 h-5 border-2"
              />
              <Label htmlFor="activo" className="cursor-pointer font-medium text-slate-700">
                Activo (disponible para la venta)
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
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar Artículo' : 'Crear Artículo')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};