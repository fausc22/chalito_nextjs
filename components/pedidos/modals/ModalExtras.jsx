import { Check, Package, Minus, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { separarPresentacionYExtras, getExtraCantidad, formatExtraNombre, getExtraLineTotal, CANTIDAD_EXTRA_MAX } from '@/lib/extrasUtils';

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

  const { presentacion: opcionesPresentacion, extras: extrasNormales } = separarPresentacionYExtras(producto.extrasDisponibles || []);

  const isEditarProductoTitulo =
    producto?._editarProductoTitulo === true &&
    (!producto.extrasDisponibles || producto.extrasDisponibles.length === 0);
  const dobleExtra = opcionesPresentacion.find((e) => /hacela\s*doble/i.test(e.nombre || e.adicional_nombre || e.name || ''));
  const tripleExtra = opcionesPresentacion.find((e) => /hacela\s*triple/i.test(e.nombre || e.adicional_nombre || e.name || ''));
  const cuadrupleExtra = opcionesPresentacion.find((e) => /hacela\s*cu[aá]druple/i.test(e.nombre || e.adicional_nombre || e.name || ''));

  const presentacionSeleccionada = extrasSeleccionados.find((e) => e.id === cuadrupleExtra?.id)
    ? 'cuadruple'
    : extrasSeleccionados.find((e) => e.id === tripleExtra?.id)
      ? 'triple'
      : extrasSeleccionados.find((e) => e.id === dobleExtra?.id)
        ? 'doble'
      : 'simple';

  const setPresentacion = (val) => {
    const sinPresentacion = extrasSeleccionados.filter(
      (e) => e.id !== dobleExtra?.id && e.id !== tripleExtra?.id && e.id !== cuadrupleExtra?.id
    );
    if (val === 'simple') {
      setExtrasSeleccionados(sinPresentacion);
    } else if (val === 'doble' && dobleExtra) {
      setExtrasSeleccionados([...sinPresentacion, dobleExtra]);
    } else if (val === 'triple' && tripleExtra) {
      setExtrasSeleccionados([...sinPresentacion, tripleExtra]);
    } else if (val === 'cuadruple' && cuadrupleExtra) {
      setExtrasSeleccionados([...sinPresentacion, cuadrupleExtra]);
    }
  };

  const extraPermiteCantidad = (extra) =>
    Boolean(extra?.permiteCantidad ?? extra?.permite_cantidad);

  const toggleExtra = (extra) => {
    const existe = extrasSeleccionados.find((e) => e.id === extra.id);
    if (existe) {
      setExtrasSeleccionados(extrasSeleccionados.filter((e) => e.id !== extra.id));
    } else {
      const nuevo = extraPermiteCantidad(extra) ? { ...extra, cantidad: 1 } : { ...extra };
      setExtrasSeleccionados([...extrasSeleccionados, nuevo]);
    }
  };

  const incrementarExtra = (extraId) => {
    setExtrasSeleccionados((prev) =>
      prev.map((e) => {
        if (e.id !== extraId) return e;
        const qty = getExtraCantidad(e);
        if (qty >= CANTIDAD_EXTRA_MAX) return e;
        return { ...e, cantidad: qty + 1 };
      })
    );
  };

  const decrementarExtra = (extraId) => {
    setExtrasSeleccionados((prev) => {
      const extra = prev.find((e) => e.id === extraId);
      if (!extra) return prev;
      const qty = getExtraCantidad(extra);
      if (qty <= 1) {
        return prev.filter((e) => e.id !== extraId);
      }
      return prev.map((e) => (e.id === extraId ? { ...e, cantidad: qty - 1 } : e));
    });
  };

  const calcularTotalUnidad = () => {
    const qtyProducto = editandoItemCarrito ? cantidadProducto : 1;
    const precioBase = producto.precio * qtyProducto;
    const precioExtras = extrasSeleccionados.reduce(
      (sum, e) => sum + getExtraLineTotal(e) * qtyProducto,
      0
    );
    return precioBase + precioExtras;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-0.75rem)] sm:w-full max-w-2xl h-[90dvh] sm:h-[85vh] flex flex-col p-3 sm:p-6">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEditarProductoTitulo
              ? 'Editar Producto'
              : editandoItemCarrito
                ? producto.extrasDisponibles && producto.extrasDisponibles.length > 0
                  ? 'Editar Extras y Observación'
                  : 'Editar Observación'
                : totalUnidades > 1
                  ? `Agregar Extras - Unidad ${unidadActual} de ${totalUnidades}`
                  : producto.extrasDisponibles && producto.extrasDisponibles.length > 0
                    ? 'Agregar Extras'
                    : 'Agregar Observación'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditarProductoTitulo
              ? 'Edita el producto y su observación'
              : editandoItemCarrito
                ? 'Modifica los extras del artículo'
                : totalUnidades > 1
                  ? `Configura los extras para la unidad ${unidadActual} de ${totalUnidades}`
                  : 'Selecciona los extras que deseas agregar al artículo'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pt-3 sm:pt-4 pr-0 sm:pr-3">
          {/* Mensaje informativo para múltiples unidades */}
          {!editandoItemCarrito && totalUnidades > 1 && (
            <div className="bg-muted border border-border rounded-lg p-3">
              <p className="text-sm text-foreground">
                Estás agregando {totalUnidades} unidades. Configura los extras para cada una individualmente.
                {unidadesConfiguradas.length > 0 && (
                  <span className="block mt-1 text-xs text-muted-foreground">
                    Unidades ya configuradas: {unidadesConfiguradas.length}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Info del producto */}
          <div className="bg-muted border border-border rounded-lg p-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="text-4xl">{producto.imagen}</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{producto.nombre}</h3>
                <p className="text-sm text-muted-foreground">Precio base: ${producto.precio.toLocaleString('es-AR')}</p>
                <p className="text-sm text-muted-foreground">
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

          {/* Presentación + Extras - Solo si el producto tiene extras */}
          {producto.extrasDisponibles && producto.extrasDisponibles.length > 0 ? (
            <div className="space-y-4">
              {/* Presentación (radio) - Hacela doble / Hacela triple / Hacela cuadruple */}
              {(dobleExtra || tripleExtra || cuadrupleExtra) && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground mb-2">Presentación:</h4>
                  <div className="flex flex-wrap gap-4 pl-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="presentacion"
                        checked={presentacionSeleccionada === 'simple'}
                        onChange={() => setPresentacion('simple')}
                        className="w-4 h-4 border-2 border-border text-blue-600"
                      />
                      <span className="text-sm font-medium text-foreground">Simple</span>
                    </label>
                    {dobleExtra && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="presentacion"
                          checked={presentacionSeleccionada === 'doble'}
                          onChange={() => setPresentacion('doble')}
                          className="w-4 h-4 border-2 border-border text-blue-600"
                        />
                        <span className="text-sm font-medium text-foreground">Doble</span>
                        <span className="text-xs text-muted-foreground">+${dobleExtra.precio?.toLocaleString('es-AR')}</span>
                      </label>
                    )}
                    {tripleExtra && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="presentacion"
                          checked={presentacionSeleccionada === 'triple'}
                          onChange={() => setPresentacion('triple')}
                          className="w-4 h-4 border-2 border-border text-blue-600"
                        />
                        <span className="text-sm font-medium text-foreground">Triple</span>
                        <span className="text-xs text-muted-foreground">+${tripleExtra.precio?.toLocaleString('es-AR')}</span>
                      </label>
                    )}
                    {cuadrupleExtra && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="presentacion"
                          checked={presentacionSeleccionada === 'cuadruple'}
                          onChange={() => setPresentacion('cuadruple')}
                          className="w-4 h-4 border-2 border-border text-blue-600"
                        />
                        <span className="text-sm font-medium text-foreground">Cuádruple</span>
                        <span className="text-xs text-muted-foreground">+${cuadrupleExtra.precio?.toLocaleString('es-AR')}</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Extras (checkboxes) - resto de adicionales */}
              {extrasNormales.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground mb-2">Extras:</h4>
                  <div className="space-y-2">
                    {extrasNormales.map((extra) => {
                      const seleccionado = extrasSeleccionados.find((e) => e.id === extra.id);
                      const isSelected = Boolean(seleccionado);
                      const qty = seleccionado ? getExtraCantidad(seleccionado) : 0;
                      const permiteCantidad = extraPermiteCantidad(extra);
                      const precioUnit = extra.precio || 0;
                      const precioMostrado =
                        permiteCantidad && isSelected ? precioUnit * qty : precioUnit;

                      return (
                        <div
                          key={extra.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                            isSelected ? 'bg-primary/10 border-blue-300' : 'bg-card border-border hover:border-border'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleExtra(extra)}
                            className="border-2 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground">{extra.nombre}</p>
                            {!permiteCantidad && (
                              <p className="text-sm text-muted-foreground">+${precioUnit.toLocaleString('es-AR')}</p>
                            )}
                          </div>
                          <div
                            className="flex shrink-0 items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {permiteCantidad && isSelected && (
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => decrementarExtra(extra.id)}
                                  aria-label={`Menos ${extra.nombre}`}
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </Button>
                                <span className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums">
                                  {qty}
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => incrementarExtra(extra.id)}
                                  disabled={qty >= CANTIDAD_EXTRA_MAX}
                                  aria-label={`Más ${extra.nombre}`}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )}
                            <span className="min-w-[4.5rem] text-right text-sm font-semibold tabular-nums text-foreground">
                              +${precioMostrado.toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-primary/10 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <span className="font-semibold">ℹ️ Este producto no tiene extras disponibles.</span>
                <br />
                Puedes agregar una observación específica para este item.
              </p>
            </div>
          )}

          {/* Campo de observación */}
          <div className="mt-4 bg-muted border border-border rounded-lg p-4">
            <Label className="text-sm font-semibold text-foreground mb-2 block">
              Observación (opcional)
            </Label>
            <Textarea
              placeholder="Ej: Hamburguesa poco hecha y sin sal"
              value={observacionItem}
              onChange={(e) => setObservacionItem(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Agrega una observación específica para este item
            </p>
          </div>

          {/* Resumen de precio */}
          <div className="mt-4 bg-muted border border-border rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-2">Resumen:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precio base {editandoItemCarrito ? `x ${cantidadProducto}` : 'x 1'}:</span>
                <span className="font-semibold text-foreground">
                  ${editandoItemCarrito
                    ? (producto.precio * cantidadProducto).toLocaleString('es-AR')
                    : producto.precio.toLocaleString('es-AR')
                  }
                </span>
              </div>
              {extrasSeleccionados.length > 0 && (
                <>
                  <div className="border-t border-border pt-1 mt-1">
                    <p className="font-medium text-foreground mb-1">Extras seleccionados:</p>
                    {extrasSeleccionados.map((extra, index) => {
                      const qtyProducto = editandoItemCarrito ? cantidadProducto : 1;
                      const lineTotal = getExtraLineTotal(extra) * qtyProducto;
                      return (
                        <div key={`${extra.id}-${getExtraCantidad(extra)}-${index}`} className="flex justify-between text-xs ml-2">
                          <span className="text-muted-foreground">
                            + {formatExtraNombre(extra)}
                            {qtyProducto > 1 ? ` (×${qtyProducto} u.)` : ''}:
                          </span>
                          <span className="text-foreground">${lineTotal.toLocaleString('es-AR')}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold text-foreground">
                <span>TOTAL {totalUnidades > 1 && !editandoItemCarrito ? '(esta unidad)' : ''}:</span>
                <span>${calcularTotalUnidad().toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-shrink-0 pt-4 border-t flex flex-col-reverse sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            className="h-11 px-6 w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirmar}
            className="bg-green-600 hover:bg-green-700 gap-2 h-11 px-6 w-full sm:w-auto"
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


