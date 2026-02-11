import { Check, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function ModalExtras({
  isOpen,
  onClose,
  producto,
  cantidadProducto,
  extrasSeleccionados,
  setExtrasSeleccionados,
  observacionItem,
  setObservacionItem,
  editandoItemCarrito,
  unidadActual,
  totalUnidades,
  unidadesConfiguradas,
  onConfirmar
}) {
  if (!producto) return null;

  const toggleExtra = (extra) => {
    const existe = extrasSeleccionados.find(e => e.id === extra.id);
    if (existe) {
      setExtrasSeleccionados(extrasSeleccionados.filter(e => e.id !== extra.id));
    } else {
      setExtrasSeleccionados([...extrasSeleccionados, extra]);
    }
  };

  const calcularTotalUnidad = () => {
    const precioBase = producto.precio * (editandoItemCarrito ? cantidadProducto : 1);
    const precioExtras = extrasSeleccionados.reduce((sum, e) => sum + e.precio, 0) * (editandoItemCarrito ? cantidadProducto : 1);
    return precioBase + precioExtras;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="h-5 w-5" />
            {editandoItemCarrito
              ? 'Editar Extras'
              : totalUnidades > 1
                ? `Agregar Extras - Unidad ${unidadActual} de ${totalUnidades}`
                : 'Agregar Extras'
            }
          </DialogTitle>
          <DialogDescription className="sr-only">
            {editandoItemCarrito
              ? 'Modifica los extras del artículo'
              : totalUnidades > 1
                ? `Configura los extras para la unidad ${unidadActual} de ${totalUnidades}`
                : 'Selecciona los extras que deseas agregar al artículo'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pt-4">
          {/* Mensaje informativo para múltiples unidades */}
          {!editandoItemCarrito && totalUnidades > 1 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-sm text-slate-700">
                Estás agregando {totalUnidades} unidades. Configura los extras para cada una individualmente.
                {unidadesConfiguradas.length > 0 && (
                  <span className="block mt-1 text-xs text-slate-600">
                    Unidades ya configuradas: {unidadesConfiguradas.length}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Info del producto */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{producto.imagen}</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800">{producto.nombre}</h3>
                <p className="text-sm text-slate-600">Precio base: ${producto.precio.toLocaleString('es-AR')}</p>
                <p className="text-sm text-slate-600">
                  {editandoItemCarrito
                    ? `Cantidad: ${cantidadProducto} ${cantidadProducto > 1 ? 'unidades' : 'unidad'}`
                    : totalUnidades > 1
                      ? `Configurando: 1 unidad (de ${totalUnidades} totales)`
                      : 'Cantidad: 1 unidad'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Lista de extras disponibles */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 mb-2">Selecciona los extras:</h4>
            <div className="space-y-2">
              {producto.extrasDisponibles.map(extra => {
                const isSelected = extrasSeleccionados.find(e => e.id === extra.id);
                return (
                  <div
                    key={extra.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => toggleExtra(extra)}
                  >
                    <Checkbox
                      checked={!!isSelected}
                      onCheckedChange={() => toggleExtra(extra)}
                      className="border-2"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{extra.nombre}</p>
                      <p className="text-sm text-slate-600">+${extra.precio.toLocaleString('es-AR')}</p>
                    </div>
                    {isSelected && (
                      <Badge className="bg-green-600 text-white">Seleccionado</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Campo de observación */}
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <Label className="text-sm font-semibold text-slate-800 mb-2 block">
              Observación (opcional)
            </Label>
            <Textarea
              placeholder="Ej: Hamburguesa poco hecha y sin sal"
              value={observacionItem}
              onChange={(e) => setObservacionItem(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Agrega una observación específica para este item
            </p>
          </div>

          {/* Resumen de precio */}
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-800 mb-2">Resumen:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Precio base {editandoItemCarrito ? `x ${cantidadProducto}` : 'x 1'}:</span>
                <span className="font-semibold text-slate-800">
                  ${editandoItemCarrito
                    ? (producto.precio * cantidadProducto).toLocaleString('es-AR')
                    : producto.precio.toLocaleString('es-AR')
                  }
                </span>
              </div>
              {extrasSeleccionados.length > 0 && (
                <>
                  <div className="border-t border-slate-200 pt-1 mt-1">
                    <p className="font-medium text-slate-700 mb-1">Extras seleccionados:</p>
                    {extrasSeleccionados.map(extra => (
                      <div key={extra.id} className="flex justify-between text-xs ml-2">
                        <span className="text-slate-600">+ {extra.nombre} {editandoItemCarrito ? `x ${cantidadProducto}` : 'x 1'}:</span>
                        <span className="text-slate-800">
                          ${editandoItemCarrito
                            ? (extra.precio * cantidadProducto).toLocaleString('es-AR')
                            : extra.precio.toLocaleString('es-AR')
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold text-slate-900">
                <span>TOTAL {totalUnidades > 1 && !editandoItemCarrito ? '(esta unidad)' : ''}:</span>
                <span>${calcularTotalUnidad().toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-shrink-0 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            className="h-11 px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirmar}
            className="bg-green-600 hover:bg-green-700 gap-2 h-11 px-6"
          >
            <Check className="h-4 w-4" />
            {editandoItemCarrito
              ? 'Guardar Cambios'
              : totalUnidades > 1 && unidadActual < totalUnidades
                ? `Continuar a Unidad ${unidadActual + 1}`
                : totalUnidades > 1 && unidadActual === totalUnidades
                  ? 'Finalizar y Agregar al Carrito'
                  : 'Agregar al Carrito'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


