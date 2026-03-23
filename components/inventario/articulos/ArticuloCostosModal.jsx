import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';

const RENTABILIDAD_THRESHOLDS = {
  ALTA: 60,
  MEDIA: 40,
};

function formatCantidadValor(valor) {
  if (valor == null) return '—';
  const num = Number(valor);
  if (Number.isNaN(num)) return '—';
  return Number(num.toFixed(3)).toString();
}

function normalizeLinea(linea, idx) {
  const nombreIng =
    linea.ingrediente_nombre ||
    linea.nombre_ingrediente ||
    linea.nombre ||
    `Ingrediente ${idx + 1}`;
  const cantidadOriginal =
    linea.cantidad_original ?? linea.cantidadOriginal ?? linea.cantidad ?? null;
  const unidadOriginal =
    linea.unidad_original || linea.unidadOriginal || linea.unidad || null;
  const costoUnitarioBase =
    linea.costo_unitario_base ??
    linea.costoUnitarioBase ??
    linea.costo_unitario ??
    null;
  const costoLinea =
    linea.costo_linea ?? linea.costoLinea ?? linea.total ?? null;
  const cantidadStr =
    cantidadOriginal != null
      ? `${formatCantidadValor(cantidadOriginal)}${unidadOriginal ? ` ${unidadOriginal}` : ''}`
      : '—';
  return { nombreIng, cantidadStr, costoUnitarioBase, costoLinea };
}

export function ArticuloCostosModal({
  isOpen,
  onClose,
  articulo,
  data,
  loading,
  error
}) {
  const detalle =
    (data && (
      data.lineas ||
      data.detalle ||
      data.detalles ||
      data.detalle_ingredientes ||
      data.detalleIngredientes ||
      data.ingredientes ||
      data.ingredientes_detalle ||
      data.ingredientesDetalle ||
      data.items
    )) || [];

  const errores =
    (data && (data.errores_conversion || data.errores || data.warnings)) || [];

  const precioVenta =
    data?.precio_venta ?? data?.precioVenta ?? data?.precio ?? articulo?.precio ?? null;

  const costoTotal =
    data?.costo_total ?? data?.costoTotal ?? data?.total_costo ?? data?.totalCosto ?? null;

  const margenBruto =
    data?.margen_bruto ?? data?.margenBruto ?? data?.margen ?? null;

  const margenPorcentaje =
    data?.margen_porcentaje ?? data?.margenPorcentaje ?? data?.margen_pct ?? null;

  const margenPctNumber =
    margenPorcentaje != null && !Number.isNaN(Number(margenPorcentaje))
      ? Number(margenPorcentaje)
      : null;

  let rentabilidadNivel = null;
  let rentabilidadLabel = '';
  let rentabilidadDescripcion = '';
  let rentabilidadClasses = '';

  if (margenPctNumber != null) {
    if (margenPctNumber >= RENTABILIDAD_THRESHOLDS.ALTA) {
      rentabilidadNivel = 'alta';
      rentabilidadLabel = 'Rentabilidad alta';
      rentabilidadDescripcion = 'Buen margen para este producto.';
      rentabilidadClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    } else if (margenPctNumber >= RENTABILIDAD_THRESHOLDS.MEDIA) {
      rentabilidadNivel = 'media';
      rentabilidadLabel = 'Rentabilidad media';
      rentabilidadDescripcion = 'Margen aceptable, se puede optimizar.';
      rentabilidadClasses = 'bg-amber-50 text-amber-800 border-amber-200';
    } else {
      rentabilidadNivel = 'baja';
      rentabilidadLabel = 'Rentabilidad baja';
      rentabilidadDescripcion = 'Margen ajustado, revisar costos o precio.';
      rentabilidadClasses = 'bg-red-50 text-red-800 border-red-200';
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden p-4 sm:p-6">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-xl font-bold text-slate-800">
            Costos del artículo elaborado
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detalle de costos del artículo elaborado.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto pt-2">
          <div className="space-y-4 px-0">
            {/* Estado de carga / error */}
            {loading && (
              <p className="text-sm text-muted-foreground">
                Cargando costos del artículo...
              </p>
            )}

            {!loading && error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {!loading && !error && articulo && (
              <>
                {/* Resumen general */}
                <div className="space-y-1 text-center">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {articulo.nombre}
                  </h3>
                  <div className="mt-2 border-b border-slate-200 w-32 mx-auto" />
                  <p className="text-sm text-muted-foreground pt-1">
                    Tipo: {articulo.tipo || 'OTRO'} • ID: {articulo.id}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <ResumenItem
                    label="Precio de venta"
                    value={precioVenta != null ? formatCurrency(Number(precioVenta)) : '—'}
                    emphasis
                  />
                  <ResumenItem
                    label="Costo total"
                    value={costoTotal != null ? formatCurrency(Number(costoTotal)) : '—'}
                  />
                  <ResumenItem
                    label="Margen bruto"
                    value={margenBruto != null ? formatCurrency(Number(margenBruto)) : '—'}
                  />
                  <ResumenItem
                    label="Margen %"
                    value={
                      margenPorcentaje != null
                        ? `${Number(margenPorcentaje).toFixed(2)} %`
                        : '—'
                    }
                  />
                </div>

                {/* Bloque informativo IVA (21%): solo visual, no modifica cálculos */}
                {precioVenta != null && !Number.isNaN(Number(precioVenta)) && (
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2">
                      Desglose estimado de IVA (21%)
                    </p>
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1 text-sm">
                      <IvaLinea label="Precio final" value={Number(precioVenta)} formatCurrency={formatCurrency} />
                      <IvaLinea
                        label="Neto estimado"
                        value={Number(precioVenta) / 1.21}
                        formatCurrency={formatCurrency}
                      />
                      <IvaLinea
                        label="IVA estimado"
                        value={Number(precioVenta) - Number(precioVenta) / 1.21}
                        formatCurrency={formatCurrency}
                      />
                    </div>
                  </div>
                )}

                {/* Indicador de rentabilidad */}
                {rentabilidadNivel && (
                  <div className="mt-3">
                    <div className={`inline-flex items-start gap-2 px-3 py-2 rounded-md border text-xs md:text-sm ${rentabilidadClasses}`}>
                      <Badge
                        variant="outline"
                        className={`text-[10px] md:text-xs font-semibold border-transparent px-1.5 py-0.5 ${
                          rentabilidadNivel === 'alta'
                            ? 'bg-emerald-600 text-white'
                            : rentabilidadNivel === 'media'
                              ? 'bg-amber-500 text-white'
                              : 'bg-red-600 text-white'
                        }`}
                      >
                        {rentabilidadLabel}
                      </Badge>
                      <span className="text-xs md:text-sm">
                        {rentabilidadDescripcion} (Margen: {margenPctNumber.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                )}

                {/* Errores de conversión / configuración de costos */}
                {Array.isArray(errores) && errores.length > 0 && (
                  <div className="mt-4">
                    <Alert variant="destructive">
                      <AlertDescription>
                        <p className="font-semibold mb-1">
                          ⚠️ No se puede calcular el costo del artículo.
                        </p>
                        <p className="text-sm mb-2">
                          Algunos ingredientes no tienen el costo configurado correctamente.
                        </p>
                        <p className="text-sm font-medium mb-1">
                          Ingredientes afectados:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {Array.from(
                            new Set(
                              errores.map((e) => {
                                if (typeof e === 'string') return e;
                                if (!e || typeof e !== 'object') return 'Ingrediente sin nombre';
                                return (
                                  e.ingrediente_nombre ||
                                  e.nombre_ingrediente ||
                                  e.nombre ||
                                  'Ingrediente sin nombre'
                                );
                              })
                            )
                          ).map((nombre, idx) => (
                            <li key={idx}>{nombre}</li>
                          ))}
                        </ul>
                        <p className="text-sm mt-3">
                          Editá esos ingredientes y completá su costo para poder calcular el costo
                          del artículo.
                        </p>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                <Separator className="my-4 flex-shrink-0" />

                {/* Detalle por ingrediente: tabla en desktop, cards compactas en mobile/tablet */}
                {(!Array.isArray(errores) || errores.length === 0) && (
                  <div className="flex flex-col space-y-2">
                    <h4 className="font-semibold text-slate-800">
                      Detalle de costos por ingrediente
                    </h4>
                    {detalle.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No se recibió detalle de ingredientes para este artículo.
                      </p>
                    ) : (
                      <>
                        {/* Desktop: tabla con scroll interno si hay muchos ingredientes */}
                        <div className="hidden md:block max-h-[280px] lg:max-h-[320px] overflow-y-auto overflow-x-auto border border-slate-200 rounded-md">
                          <table className="w-full text-xs md:text-sm">
                            <thead className="bg-slate-50 sticky top-0">
                              <tr>
                                <th className="px-2 py-2 text-left font-semibold text-slate-700">
                                  Ingrediente
                                </th>
                                <th className="px-2 py-2 text-center font-semibold text-slate-700">
                                  Cantidad
                                </th>
                                <th className="px-2 py-2 text-center font-semibold text-slate-700">
                                  Costo unitario
                                </th>
                                <th className="px-2 py-2 text-right font-semibold text-slate-700">
                                  Costo línea
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {detalle.map((linea, idx) => {
                                const norm = normalizeLinea(linea, idx);
                                return (
                                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                    <td className="px-2 py-1.5 text-left">
                                      <span className="font-medium text-slate-800">{norm.nombreIng}</span>
                                    </td>
                                    <td className="px-2 py-1.5 text-center whitespace-nowrap">
                                      {norm.cantidadStr}
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                      {norm.costoUnitarioBase != null
                                        ? formatCurrency(Number(norm.costoUnitarioBase))
                                        : '—'}
                                    </td>
                                    <td className="px-2 py-1.5 text-right">
                                      {norm.costoLinea != null ? (
                                        <span className="font-semibold text-slate-900">
                                          {formatCurrency(Number(norm.costoLinea))}
                                        </span>
                                      ) : (
                                        '—'
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile / Tablet: cards compactas por ingrediente */}
                        <div className="md:hidden space-y-2">
                          {detalle.map((linea, idx) => {
                            const norm = normalizeLinea(linea, idx);
                            return (
                              <IngredienteCostoCard
                                key={idx}
                                nombreIng={norm.nombreIng}
                                cantidadStr={norm.cantidadStr}
                                costoUnitarioBase={norm.costoUnitarioBase}
                                costoLinea={norm.costoLinea}
                                formatCurrency={formatCurrency}
                              />
                            );
                          })}
                        </div>

                        {/* Total costo receta */}
                        {costoTotal != null && (
                          <div className="flex justify-end mt-3">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 bg-slate-50">
                              <span className="text-xs md:text-sm font-semibold text-slate-700">
                                Costo total
                              </span>
                              <span className="text-sm md:text-base font-bold text-slate-900">
                                {formatCurrency(Number(costoTotal))}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Card compacta por ingrediente para mobile/tablet (reemplaza la tabla) */
function IngredienteCostoCard({
  nombreIng,
  cantidadStr,
  costoUnitarioBase,
  costoLinea,
  formatCurrency,
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50/50 p-3">
      <p className="font-medium text-slate-800 text-sm leading-tight">
        {nombreIng}
      </p>
      <p className="text-xs text-slate-600 mt-1">
        {cantidadStr}
      </p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
        <span className="text-slate-600">
          Unitario:{' '}
          {costoUnitarioBase != null
            ? formatCurrency(Number(costoUnitarioBase))
            : '—'}
        </span>
        <span className="font-semibold text-slate-900">
          Costo: {costoLinea != null ? formatCurrency(Number(costoLinea)) : '—'}
        </span>
      </div>
    </div>
  );
}

/** Línea del desglose IVA: en mobile apila label y valor; en desktop "Label: $ valor" */
function IvaLinea({ label, value, formatCurrency }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-1.5">
      <span className="text-slate-600 text-xs sm:text-sm">{label}</span>
      <span className="font-medium text-slate-900">
        <span className="hidden sm:inline">: </span>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function ResumenItem({ label, value, emphasis }) {
  return (
    <div className="p-3 rounded-md border border-slate-200 bg-slate-50/40 flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
        {label}
      </span>
      <span
        className={`text-sm ${
          emphasis ? 'font-bold text-slate-900 text-base' : 'font-semibold text-slate-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

