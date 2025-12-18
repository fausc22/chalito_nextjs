import { useState, useRef, useEffect } from 'react';
import { Utensils, Check, Plus, X, Image as ImageIcon, Upload } from 'lucide-react';
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
  imagenFile,
  setImagenFile,
}) => {
  // Estado local para ingredientes seleccionados
  const [ingredienteTemp, setIngredienteTemp] = useState({
    ingrediente_id: '',
    cantidad: '',
    unidad_medida: 'UNIDADES'
  });

  // Referencia para guardar los ingredientes originales del artículo
  const ingredientesOriginalesRef = useRef([]);

  // ==================== ESTADO PARA IMAGEN ====================
  // El estado de imagenFile viene del padre (ArticulosTab)
  // Preview local para mostrar la imagen seleccionada
  const [imagenPreview, setImagenPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Guardar ingredientes originales cuando se abre el modal para editar
  useEffect(() => {
    if (isOpen && isEditing && formulario.ingredientes?.length > 0) {
      ingredientesOriginalesRef.current = [...formulario.ingredientes];
    } else if (isOpen && !isEditing) {
      ingredientesOriginalesRef.current = [];
    }
  }, [isOpen, isEditing]);

  // Limpiar imagen cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setImagenFile(null);
      setImagenPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  // Cargar imagen existente cuando se edita un artículo
  useEffect(() => {
    if (isOpen && isEditing && formulario.imagen_url && !imagenFile) {
      // Si está editando y tiene imagen_url, mostrar preview de la imagen de Cloudinary
      setImagenPreview(formulario.imagen_url);
    } else if (isOpen && !isEditing) {
      // Si es crear nuevo, limpiar preview
      setImagenPreview(null);
    }
  }, [isOpen, isEditing, formulario.imagen_url, imagenFile]);

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

  // ==================== HANDLERS PARA IMAGEN ====================
  // Handler para seleccionar imagen
  const handleImagenChange = (e) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Formato no válido',
        description: 'Solo se permiten imágenes JPG, PNG o WebP'
      });
      e.target.value = '';
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'Archivo muy grande',
        description: 'La imagen no debe superar los 5MB'
      });
      e.target.value = '';
      return;
    }

    // Guardar archivo en estado (NO se envía al backend)
    setImagenFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // FUTURO: Aquí se subirá la imagen a Cloudinary
    // const uploadedUrl = await uploadToCloudinary(file);
    // setFormulario(prev => ({ ...prev, imagen_url: uploadedUrl }));
  };

  // Handler para eliminar imagen seleccionada
  const handleEliminarImagen = () => {
    setImagenFile(null);
    setImagenPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            {isEditing ? 'Editar Artículo' : 'Crear Nuevo Artículo'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing
              ? 'Modifica los datos del artículo'
              : 'Completa los datos para agregar un nuevo artículo al menú'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pt-4 pr-2">
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
                className="border-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                className="border-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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

          {/* ==================== SECCIÓN DE IMAGEN (OPCIONAL) ==================== */}
          <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 bg-blue-50/30 space-y-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              <Label className="text-sm font-medium text-slate-700">
                Imagen del artículo (Opcional)
              </Label>
            </div>

            {/* Texto informativo */}
            <p className="text-xs text-slate-500 leading-relaxed">
              La imagen es opcional. Por ahora solo se puede seleccionar, pero no se subirá. 
              Podrás agregarla más adelante cuando se implemente la subida a Cloudinary.
            </p>

            {/* Input de archivo */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <label 
                  htmlFor="imagen-input" 
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-300 bg-white rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors">
                    <Upload className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">
                      {imagenFile ? 'Cambiar imagen' : 'Seleccionar imagen'}
                    </span>
                  </div>
                  <input
                    id="imagen-input"
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImagenChange}
                    className="hidden"
                  />
                </label>

                {imagenFile && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEliminarImagen}
                    className="sm:w-auto border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Quitar
                  </Button>
                )}
              </div>

              {/* Preview de la imagen */}
              {imagenPreview && (
                <div className="relative">
                  <div className="relative w-full h-40 sm:h-48 bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-200">
                    <img
                      src={imagenPreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    <span className="font-medium">{imagenFile?.name}</span> 
                    {' '}({(imagenFile?.size / 1024).toFixed(0)} KB)
                  </p>
                </div>
              )}

              {/* Indicación de formatos permitidos */}
              {!imagenFile && (
                <p className="text-xs text-slate-400">
                  Formatos: JPG, PNG, WebP • Tamaño máximo: 5MB
                </p>
              )}
            </div>
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
                className="border-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium whitespace-nowrap"
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
                className="border-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                className="border-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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