import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Tag, Check, X, Image as ImageIcon, Upload } from 'lucide-react';
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
import { clearFieldError, getInputErrorProps } from '@/lib/form-errors';
import { toast } from '@/hooks/use-toast';

const TIPOS_IMAGEN_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGEN_BYTES = 5 * 1024 * 1024;

/**
 * Componente de formulario para crear/editar categorías con shadcn/ui
 */
export const CategoriasForm = ({
  isOpen,
  onClose,
  formulario,
  onFieldChange,
  errors = {},
  setErrors,
  onSubmit,
  isEditing = false,
  loading = false,
}) => {
  const fileInputRef = useRef(null);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    if (!formulario.imagenFile) {
      setFilePreview(null);
      return undefined;
    }
    const objectUrl = URL.createObjectURL(formulario.imagenFile);
    setFilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [formulario.imagenFile]);

  useEffect(() => {
    if (!isOpen && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [isOpen]);

  const imagenPreview = filePreview || formulario.imagen_url || null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const rechazarImagen = (e, mensaje, titulo) => {
    setErrors?.((prev) => ({ ...prev, imagen: mensaje }));
    toast({ variant: 'destructive', title: titulo, description: mensaje });
    e.target.value = '';
  };

  const handleImagenChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!TIPOS_IMAGEN_PERMITIDOS.includes(file.type)) {
      rechazarImagen(e, 'Solo se permiten imágenes JPG, PNG o WebP', 'Formato no válido');
      return;
    }
    if (file.size > MAX_IMAGEN_BYTES) {
      rechazarImagen(e, 'La imagen no debe superar los 5MB', 'Archivo muy grande');
      return;
    }

    setErrors?.((prev) => clearFieldError(prev, 'imagen'));
    onFieldChange('imagenFile', file);
  };

  const handleQuitarImagen = () => {
    onFieldChange('imagenFile', null);
    onFieldChange('imagen_url', null);
    setErrors?.((prev) => clearFieldError(prev, 'imagen'));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {isEditing ? 'Editar Categoría' : 'Crear Nueva Categoría'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditing
              ? 'Modifica los datos de la categoría'
              : 'Completa los datos para agregar una nueva categoría'}
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
              onChange={(e) => onFieldChange('nombre', e.target.value)}
              placeholder="Ej: Entradas, Platos Principales, Bebidas..."
              className="border-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              {...getInputErrorProps(errors, 'nombre').inputProps}
            />
            <FieldError error={errors?.nombre} id="nombre-error" />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              value={formulario.descripcion || ''}
              onChange={(e) => onFieldChange('descripcion', e.target.value)}
              placeholder="Descripción opcional de la categoría"
              rows={3}
              className="border-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {/* Imagen de la card en la carta online */}
          <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              <Label className="text-sm font-medium text-foreground">
                Imagen en la carta online (Opcional)
              </Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <label htmlFor="categoria-imagen-input" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-300 bg-card rounded-lg hover:bg-accent hover:border-blue-400 transition-colors">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-foreground">
                    {imagenPreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                  </span>
                </div>
                <input
                  id="categoria-imagen-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImagenChange}
                  className="hidden"
                />
              </label>

              {imagenPreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleQuitarImagen}
                  className="sm:w-auto border-red-300 text-red-600 hover:bg-destructive/10 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Quitar
                </Button>
              )}
            </div>

            {imagenPreview && (
              <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden border-2 border-border">
                <Image
                  src={imagenPreview}
                  alt="Vista previa de la categoría"
                  fill
                  className="object-cover"
                  sizes="500px"
                  unoptimized={imagenPreview.startsWith('blob:')}
                />
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {imagenPreview
                ? 'Formatos: JPG, PNG, WebP • Tamaño máximo: 5MB'
                : 'Sin imagen: la carta usa automáticamente la foto de un artículo de esta categoría.'}
            </p>
            <FieldError error={errors?.imagen} id="imagen-error" />
          </div>

          {/* Checkbox activo */}
          {isEditing && (formulario.activo === 0 || formulario.activo === false) ? (
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 border-2 border-amber-500 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
              <Checkbox
                id="activo"
                checked={formulario.activo !== 0 && formulario.activo !== false}
                onCheckedChange={(checked) => onFieldChange('activo', checked ? 1 : 0)}
                className="w-5 h-5 border-2"
              />
              <Label htmlFor="activo" className="cursor-pointer text-amber-900 font-semibold">
                Reactivar categoría (marcar como activa)
              </Label>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-muted border-2 border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
              <Checkbox
                id="activo"
                checked={formulario.activo !== 0 && formulario.activo !== false}
                onCheckedChange={(checked) => onFieldChange('activo', checked ? 1 : 0)}
                className="w-5 h-5 border-2"
              />
              <Label htmlFor="activo" className="cursor-pointer font-medium text-foreground">
                Categoría activa
              </Label>
            </div>
          )}

          {formulario.visible_carta === 0 || formulario.visible_carta === false ? (
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 border-2 border-amber-500 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
              <Checkbox
                id="visible_carta"
                checked={formulario.visible_carta !== 0 && formulario.visible_carta !== false}
                onCheckedChange={(checked) => onFieldChange('visible_carta', checked ? 1 : 0)}
                className="w-5 h-5 border-2"
              />
              <Label htmlFor="visible_carta" className="cursor-pointer text-amber-900 font-semibold">
                Mostrar en carta online
              </Label>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-muted border-2 border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
              <Checkbox
                id="visible_carta"
                checked={formulario.visible_carta !== 0 && formulario.visible_carta !== false}
                onCheckedChange={(checked) => onFieldChange('visible_carta', checked ? 1 : 0)}
                className="w-5 h-5 border-2"
              />
              <Label htmlFor="visible_carta" className="cursor-pointer font-medium text-foreground">
                Visible en carta online
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
