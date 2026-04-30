import { useState } from 'react';
import { ShoppingCart, ChevronRight, ChevronLeft, Check, Search, Package, Edit, Trash2, Store, Truck, Phone, MessageSquare, Globe, Clock, Banknote, CreditCard, Building2, Smartphone, XCircle, CheckCircle, Settings, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FieldError } from '@/components/ui/field-error';
import { ProductCard } from '../ProductCard';
import ClienteAutocomplete from '../ClienteAutocomplete';
import { getItemExtras, getSufijoPresentacion, getExtrasSinPresentacion } from '@/lib/extrasUtils';
import { clearFieldError as clearErrorByPath, getInputErrorProps } from '@/lib/form-errors';
import { toast } from '@/hooks/use-toast';

// Mapear estado del pedido a texto legible
const getEstadoTexto = (estado) => {
  const estados = {
    'recibido': 'RECIBIDO',
    'en_cocina': 'EN PREPARACIÓN',
    'listo': 'LISTO',
    'entregado': 'ENTREGADO',
    'cancelado': 'CANCELADO'
  };
  return estados[estado] || estado.toUpperCase();
};

const sanitizeNombre = (v) => (v || '').replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '');
const sanitizeTelefono = (v) => {
  const s = (v || '').trim();
  const hasPlus = s.startsWith('+');
  const rest = (hasPlus ? s.slice(1) : s).replace(/[^\d\s\-()]/g, '');
  return (hasPlus ? '+' : '') + rest;
};
const sanitizeDireccion = (v) => (v || '').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,'\-/°]/g, '');
const sanitizeNumeroAltura = (v) => (v || '').replace(/[^a-zA-Z0-9\s\-°]/g, '');

const CartSummaryMobile = ({
  carrito,
  calcularTotal,
  carritoExpandidoMobile,
  setCarritoExpandidoMobile,
  modificarCantidad,
  eliminarDelCarrito,
  editarExtrasItem
}) => {
  const total = calcularTotal();

  if (!carrito || carrito.length === 0) {
    return null;
  }

  return (
    <div className="lg:hidden">
      <div className="bg-slate-50 border-t border-slate-200 rounded-t-xl px-3 pt-2 pb-3 shadow-[0_-6px_14px_rgba(15,23,42,0.06)]">
        <button
          type="button"
          onClick={() => setCarritoExpandidoMobile((prev) => !prev)}
          className="w-full flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-slate-700" />
            <span className="text-sm font-semibold text-slate-900">
              Carrito ({carrito.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              ${total.toLocaleString('es-AR')}
            </span>
            {carritoExpandidoMobile ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            )}
          </div>
        </button>

        <div
          className={`mt-2 transition-[max-height,opacity] duration-200 ease-out ${
            carritoExpandidoMobile ? 'max-h-[260px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="bg-white rounded-lg border border-slate-200 px-2 pt-2 pb-2">
            <div className="flex-1 min-h-0 max-h-[170px] overflow-y-auto space-y-2 pr-1">
              {carrito.map((item) => (
                <div
                  key={item.carritoId}
                  className="bg-white border border-slate-200 rounded-md px-2 py-1.5"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs leading-tight uppercase truncate text-slate-900">
                        {item.nombre}
                        {getSufijoPresentacion(item.extras ?? item.extrasSeleccionados ?? [])}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => editarExtrasItem(item)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => eliminarDelCarrito(item.carritoId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                    <div className="mt-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="icon"
                        variant="outline"
                          className="h-6 w-6 border-slate-300 bg-white text-xs text-slate-900"
                        onClick={() =>
                          modificarCantidad(item.carritoId, (item.quantity ?? item.cantidad ?? 1) - 1)
                        }
                      >
                        -
                      </Button>
                      <span className="text-xs font-semibold w-5 text-center">
                        {item.quantity ?? item.cantidad ?? 1}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                          className="h-6 w-6 border-slate-300 bg-white text-xs text-slate-900"
                        onClick={() =>
                          modificarCantidad(item.carritoId, (item.quantity ?? item.cantidad ?? 1) + 1)
                        }
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-xs font-bold text-slate-900">
                      ${(() => {
                        const quantity = item.quantity ?? item.cantidad ?? 1;
                        const price = item.price ?? item.precio ?? 0;
                        const { extrasTotal } = getItemExtras(item);
                        const precioBase = price * quantity;
                        const precioExtras = extrasTotal * quantity;
                        return (precioBase + precioExtras).toLocaleString('es-AR');
                      })()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 border-t border-slate-200 pt-1.5">
              <div className="flex justify-between text-sm font-semibold text-slate-900">
                <span>Total</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function ModalEditarPedido({
  isOpen,
  onClose,
  pasoModal,
  setPasoModal,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  busquedaProducto,
  setBusquedaProducto,
  carrito,
  productosFiltrados,
  categorias = [],
  loadingCategorias = false,
  loadingProductos = false,
  loadingPedido = false,
  pedidoOriginal,
  tipoEntrega,
  setTipoEntrega,
  cliente,
  setCliente,
  origen,
  setOrigen,
  tipoPedido,
  setTipoPedido,
  horaProgramada,
  setHoraProgramada,
  medioPago,
  setMedioPago,
  estadoPago,
  setEstadoPago,
  fieldErrors = {},
  setFieldErrors,
  clearFieldError,
  calcularTotal,
  agregarProductoConExtras,
  modificarCantidad,
  eliminarDelCarrito,
  editarExtrasItem,
  resetearModal,
  validarPasoCliente,
  actualizarPedido,
  onSuccess
}) {
  const [carritoExpandidoMobile, setCarritoExpandidoMobile] = useState(true);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const clearInlineError = (fieldPath) => {
    if (typeof clearFieldError === 'function') {
      clearFieldError(fieldPath);
      return;
    }

    if (typeof setFieldErrors === 'function') {
      setFieldErrors((prev) => clearErrorByPath(prev, fieldPath));
    }
  };

  const updateClienteField = (fieldPath, value) => {
    setCliente((prev) => {
      if (fieldPath.startsWith('direccion.')) {
        const nestedField = fieldPath.replace('direccion.', '');
        return {
          ...prev,
          direccion: {
            ...prev.direccion,
            [nestedField]: value,
          },
        };
      }

      return {
        ...prev,
        [fieldPath]: value,
      };
    });

    clearInlineError(fieldPath);
  };

  const handleClose = (open) => {
    if (!open) {
      resetearModal();
      onClose();
    }
  };

  const handleSelectCliente = (clienteData) => {
    setClienteSeleccionado(clienteData || null);
    if (!clienteData) return;
    setCliente((prev) => ({
      ...prev,
      nombre: sanitizeNombre(clienteData.nombre || ''),
      telefono: sanitizeTelefono(clienteData.telefono || ''),
      email: (clienteData.email || '').trim(),
    }));
    clearInlineError('nombre');
    clearInlineError('telefono');
    clearInlineError('email');
  };

  const handleActualizarPedido = async () => {
    try {
      const pedido = await actualizarPedido(onSuccess);
      if (pedido) {
        handleClose(false);
      }
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      // El error ya se maneja en actualizarPedido con toast
    }
  };

  const getTitulo = () => {
    switch (pasoModal) {
      case 1:
        return 'Editar Pedido - Armar Pedido';
      case 2:
        return 'Editar Pedido - Datos del Cliente';
      case 3:
        return 'Editar Pedido - Resumen';
      default:
        return 'Editar Pedido';
    }
  };

  // Determinar si el pedido está en cocina o listo
  const estaEnCocina = pedidoOriginal?.estado === 'en_cocina' || pedidoOriginal?.estado === 'listo';
  const estadoActual = pedidoOriginal?.estado ? getEstadoTexto(pedidoOriginal.estado) : '';
  const isWebOrder = pedidoOriginal?.origen_pedido === 'WEB' || pedidoOriginal?.origen === 'web';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-0.75rem)] sm:w-full max-w-6xl h-[92dvh] sm:h-[90vh] flex flex-col bg-slate-100 p-3 sm:p-6">
        <DialogHeader className="flex-shrink-0 pb-3">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Edit className="h-5 w-5" />
            {getTitulo()}
            {pedidoOriginal && (
              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-400">
                #{pedidoOriginal.id} - {estadoActual}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Modal para editar un pedido existente
          </DialogDescription>
          
          {/* Aviso si el pedido está en cocina o listo */}
          {estaEnCocina && (
            <Alert className="mt-3 bg-yellow-50 border-yellow-400">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-800">
                Este pedido ya está en cocina. Los cambios se reflejarán en tiempo real.
              </AlertDescription>
            </Alert>
          )}
        </DialogHeader>

        {loadingPedido ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50 text-slate-400 animate-pulse" />
              <p className="text-sm text-slate-500">Cargando pedido...</p>
            </div>
          </div>
        ) : pasoModal === 1 ? (
          // PASO 1: Armar Pedido - Mismo diseño que ModalNuevoPedido
          <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 bg-slate-100">
            {/* Columna principal: Categorías y Productos */}
            <div className="w-full lg:w-[60%] flex flex-col min-h-0">
              {/* Categorías como tabs */}
              <div className="flex gap-1.5 mb-3 border-b-2 border-slate-400 pb-1.5 flex-shrink-0 overflow-x-auto">
                {loadingCategorias ? (
                  <div className="text-xs text-slate-500">Cargando categorías...</div>
                ) : !Array.isArray(categorias) || categorias.length === 0 ? (
                  <div className="text-xs text-slate-500">No hay categorías disponibles</div>
                ) : (
                  categorias.map(cat => {
                    const categoriaId = cat.id || cat.categoria_id || cat;
                    const categoriaNombre = cat.nombre || cat.nombre_categoria || String(cat);
                    
                    return (
                      <button
                        key={categoriaId}
                        onClick={() => setCategoriaSeleccionada(categoriaId)}
                        className={`
                          px-3 py-1.5 text-xs font-medium rounded-t-lg transition-all whitespace-nowrap flex-shrink-0
                          ${categoriaSeleccionada === categoriaId
                            ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }
                        `}
                      >
                        {categoriaNombre}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Buscador de productos */}
              <div className="relative mb-3 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Buscar producto..."
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>

              {/* Grid de productos con scroll */}
              <div className="flex-1 overflow-y-auto min-h-0 pr-0 sm:pr-3 pb-[150px] lg:pb-0">
                {productosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No se encontraron productos</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {productosFiltrados.map(producto => (
                      <ProductCard
                        key={producto.id}
                        producto={producto}
                        onAgregar={agregarProductoConExtras}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar derecha: Carrito - solo desktop */}
            <div className="hidden lg:flex lg:w-[40%] flex-col lg:border-l border-slate-300 lg:pl-4 h-full mt-4 lg:mt-0">
              {/* Bloque superior fijo con título y toggle mobile */}
              <div className="flex flex-col mb-2 flex-shrink-0 min-h-[56px] lg:min-h-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Carrito</h3>
                  <Badge variant="outline" className="bg-slate-100 text-sm font-semibold">
                    {carrito.length}
                  </Badge>
                </div>
                {carrito.length > 0 && null}
              </div>

              {carrito.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Carrito vacío</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-h-0 h-full">
                  {/* Detalle del carrito con scroll interno y resumen fijo abajo */}
                  <div
                    className={`flex-1 min-h-0 lg:h-full ${
                      carritoExpandidoMobile ? '' : 'hidden lg:block'
                    }`}
                  >
                    <div className="max-h-[260px] lg:max-h-none lg:h-full flex flex-col bg-transparent">
                      {/* Lista del carrito con scroll */}
                      <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-0 pr-2">
                        {carrito.map(item => (
                          <div key={item.carritoId} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-slate-900 truncate leading-tight uppercase">
                                  {item.nombre}{getSufijoPresentacion(item.extras ?? item.extrasSeleccionados ?? [])}
                                </p>
                                {(() => {
                                  const { extras } = getItemExtras(item);
                                  const extrasVisibles = getExtrasSinPresentacion(extras);
                                  return extrasVisibles.length > 0 && (
                                    <Badge variant="outline" className="text-xs mt-1 bg-yellow-50 text-yellow-700 border-yellow-300 px-1.5 py-0.5">
                                      {extrasVisibles.length} extras
                                    </Badge>
                                  );
                                })()}
                              </div>
                              <div className="flex gap-1 ml-2 flex-shrink-0">
                                <button
                                  onClick={() => editarExtrasItem(item)}
                                  className="text-blue-600 hover:text-blue-700 transition-colors"
                                  title={item.extrasDisponibles && item.extrasDisponibles.length > 0 ? "Editar extras y observación" : "Editar observación"}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => eliminarDelCarrito(item.carritoId)}
                                  className="text-red-600 hover:text-red-700 transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 w-7 p-0 border border-slate-300 hover:bg-slate-200 text-sm font-semibold"
                                  onClick={() => modificarCantidad(item.carritoId, (item.quantity ?? item.cantidad ?? 1) - 1)}
                                >
                                  -
                                </Button>
                                <span className="font-bold text-sm w-6 text-center">{item.quantity ?? item.cantidad ?? 1}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 w-7 p-0 border border-slate-300 hover:bg-slate-200 text-sm font-semibold"
                                  onClick={() => modificarCantidad(item.carritoId, (item.quantity ?? item.cantidad ?? 1) + 1)}
                                >
                                  +
                                </Button>
                              </div>
                              <p className="font-bold text-sm text-slate-900">
                                ${(() => {
                                  const quantity = item.quantity ?? item.cantidad ?? 1;
                                  const price = item.price ?? item.precio ?? 0;
                                  const { extrasTotal } = getItemExtras(item);
                                  const precioBase = price * quantity;
                                  const precioExtras = extrasTotal * quantity;
                                  return (precioBase + precioExtras).toLocaleString('es-AR');
                                })()}
                              </p>
                            </div>

                            {(() => {
                              const { extras, extrasTotal } = getItemExtras(item);
                              const extrasLista = getExtrasSinPresentacion(item.extras ?? item.extrasSeleccionados ?? []);
                              const qty = item.quantity ?? item.cantidad ?? 1;
                              return extras.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-700 space-y-0.5">
                                  {extrasLista.map((extra, idx) => (
                                    <p key={idx} className="font-medium">• {extra.nombre}  +${((extra.precio ?? extra.precio_extra ?? 0) * qty).toLocaleString('es-AR')}</p>
                                  ))}
                                  <p className="font-medium text-slate-600 mt-1">Extras: ${(extrasTotal * qty).toLocaleString('es-AR')}</p>
                                </div>
                              );
                            })()}

                            {(item.observaciones || item.observacion) && (
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                <p className="text-xs text-slate-600 italic">
                                  <span className="font-semibold">Obs:</span> {item.observaciones || item.observacion}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Resumen del carrito fijo en la parte inferior del detalle */}
                      <div className="border-t border-slate-200 pt-2 mt-1 flex-shrink-0">
                        <div className="bg-white border border-slate-200 rounded-md p-2">
                          <div className="flex justify-between text-base font-bold text-slate-900">
                            <span>Total:</span>
                            <span>${calcularTotal().toLocaleString('es-AR')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : pasoModal === 2 ? (
          // PASO 2: Datos del Cliente - Mismo diseño que ModalNuevoPedido
          <div className="py-2 sm:py-3 pr-0 sm:pr-3 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* Datos Básicos del Cliente */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-3">👤 Datos del Cliente</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Nombre del Cliente *</Label>
                  <ClienteAutocomplete
                    value={cliente.nombre}
                    onInputChange={(nextValue) => updateClienteField('nombre', sanitizeNombre(nextValue))}
                    onSelectCliente={handleSelectCliente}
                    placeholder="Ej: Juan Pérez"
                  />
                  <FieldError error={fieldErrors?.nombre} id="nombre-error" />
                </div>

                <div>
                  <Label className="text-xs font-medium">Teléfono *</Label>
                  <Input
                    value={cliente.telefono}
                    onChange={(e) => updateClienteField('telefono', sanitizeTelefono(e.target.value))}
                    placeholder="Ej: 3815-123456"
                    className="mt-1 h-8 text-sm"
                    {...getInputErrorProps(fieldErrors, 'telefono').inputProps}
                  />
                  <FieldError error={fieldErrors?.telefono} id="telefono-error" />
                </div>

                <div className="col-span-2">
                  <Label className="text-xs font-medium">Email (opcional)</Label>
                  <Input
                    type="email"
                    value={cliente.email}
                    onChange={(e) => updateClienteField('email', e.target.value.trim())}
                    placeholder="Ej: cliente@email.com"
                    className="mt-1 h-8 text-sm"
                    {...getInputErrorProps(fieldErrors, 'email').inputProps}
                  />
                  <FieldError error={fieldErrors?.email} id="email-error" />
                </div>
              </div>
            </div>

            {/* Tipo de Entrega */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Tipo de Entrega
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant={tipoEntrega === 'retiro' ? 'default' : 'outline'}
                  className={`h-12 text-sm font-medium ${tipoEntrega === 'retiro' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => setTipoEntrega('retiro')}
                >
                  <Store className="h-4 w-4 mr-1.5" />
                  RETIRO
                </Button>
                <Button
                  variant={tipoEntrega === 'delivery' ? 'default' : 'outline'}
                  className={`h-12 text-sm font-medium ${tipoEntrega === 'delivery' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => setTipoEntrega('delivery')}
                >
                  <Truck className="h-4 w-4 mr-1.5" />
                  DELIVERY
                </Button>
              </div>
            </div>

            {/* Campos de Dirección (solo si es Delivery) */}
            {tipoEntrega === 'delivery' && (
              <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Dirección de Entrega
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clienteSeleccionado?.ultima_direccion ? (
                    <div className="col-span-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => updateClienteField('direccion.calle', clienteSeleccionado.ultima_direccion)}
                      >
                        Usar dirección guardada: {clienteSeleccionado.ultima_direccion}
                      </Button>
                    </div>
                  ) : null}
                  <div>
                    <Label className="text-xs font-medium">Calle *</Label>
                    <Input
                      value={cliente.direccion.calle}
                      onChange={(e) => updateClienteField('direccion.calle', sanitizeDireccion(e.target.value).slice(0, 200))}
                      placeholder="Ej: Av. Belgrano"
                      className="mt-1 h-8 text-sm"
                      {...getInputErrorProps(fieldErrors, 'direccion.calle').inputProps}
                    />
                    <FieldError error={fieldErrors?.direccion?.calle} id="direccion-calle-error" />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Número/Altura *</Label>
                    <Input
                      value={cliente.direccion.numero}
                      onChange={(e) => updateClienteField('direccion.numero', sanitizeNumeroAltura(e.target.value).slice(0, 30))}
                      placeholder="Ej: 1234"
                      className="mt-1 h-8 text-sm"
                      {...getInputErrorProps(fieldErrors, 'direccion.numero').inputProps}
                    />
                    <FieldError error={fieldErrors?.direccion?.numero} id="direccion-numero-error" />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Edificio/Casa</Label>
                    <Input
                      value={cliente.direccion.edificio}
                      onChange={(e) => updateClienteField('direccion.edificio', sanitizeDireccion(e.target.value).slice(0, 100))}
                      placeholder="Ej: Torre A"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Piso/Depto</Label>
                    <Input
                      value={cliente.direccion.piso}
                      onChange={(e) => updateClienteField('direccion.piso', sanitizeDireccion(e.target.value).slice(0, 50))}
                      placeholder="Ej: 3° A"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs font-medium">Observaciones</Label>
                    <Textarea
                      value={cliente.direccion.observaciones}
                      onChange={(e) => updateClienteField('direccion.observaciones', sanitizeDireccion(e.target.value).slice(0, 300))}
                      placeholder="Ej: Timbre B, portón verde"
                      rows={2}
                      className="mt-1 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Configuración Adicional */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuración del Pedido
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-medium">Origen del Pedido</Label>
                  <Select value={origen} onValueChange={setOrigen}>
                    <SelectTrigger className="mt-1 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mostrador">
                        <div className="flex items-center gap-2">
                          <Store className="h-3.5 w-3.5" />
                          <span>Mostrador</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="telefono">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          <span>Teléfono</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="whatsapp">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="web">
                        <div className="flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5" />
                          <span>Web</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium">¿Cuándo?</Label>
                  <Select value={tipoPedido} onValueChange={setTipoPedido}>
                    <SelectTrigger className="mt-1 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ya">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Lo antes posible</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="programado">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Programado</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tipoPedido === 'programado' && (
                  <div>
                    <Label className="text-xs font-medium">Hora Programada</Label>
                    <Input
                      type="time"
                      value={horaProgramada}
                      onChange={(e) => {
                        setHoraProgramada(e.target.value);
                        clearInlineError('horaProgramada');
                      }}
                      className="mt-1 h-8 font-mono text-sm"
                      {...getInputErrorProps(fieldErrors, 'horaProgramada').inputProps}
                    />
                    <FieldError error={fieldErrors?.horaProgramada} id="horaProgramada-error" />
                  </div>
                )}

                <div>
                  <Label className="text-xs font-medium">Medio de Pago</Label>
                  <Select value={medioPago} onValueChange={setMedioPago}>
                    <SelectTrigger className="mt-1 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-3.5 w-3.5" />
                          <span>Efectivo</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="debito">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Débito</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="credito">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Crédito</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="transferencia">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>Transferencia</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mercadopago">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-3.5 w-3.5" />
                          <span>MercadoPago</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium">Estado de Pago</Label>
                  <Select value={estadoPago} onValueChange={setEstadoPago}>
                    <SelectTrigger className="mt-1 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Debe</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="paid">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Pagado</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // PASO 3: Resumen - Mismo diseño que ModalNuevoPedido
          <div className="py-2 sm:py-3 space-y-4 overflow-y-auto flex-1 min-h-0 pr-0 sm:pr-2">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">📋 Resumen del Pedido</h3>
              
              {/* Items del pedido */}
              <div className="space-y-2 mb-4 max-h-[40vh] md:max-h-none overflow-y-auto pr-1">
                <h4 className="font-medium text-sm text-slate-700 mb-2">Items:</h4>
                {carrito.map((item) => (
                  <div key={item.carritoId} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 leading-tight uppercase">
                          {item.nombre}{getSufijoPresentacion(item.extras ?? item.extrasSeleccionados ?? [])}
                        </p>
                        {(() => {
                          const { extras } = getItemExtras(item);
                          const extrasVisibles = getExtrasSinPresentacion(extras);
                          return extrasVisibles.length > 0 && (
                            <Badge variant="outline" className="text-xs mt-1 bg-yellow-50 text-yellow-700 border-yellow-300 px-1.5 py-0.5">
                              {extrasVisibles.length} extras
                            </Badge>
                          );
                        })()}
                      </div>
                      <div className="flex gap-1 ml-2 flex-shrink-0">
                        <button
                          onClick={() => editarExtrasItem(item)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                          title={item.extrasDisponibles && item.extrasDisponibles.length > 0 ? "Editar extras y observación" : "Editar observación"}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => eliminarDelCarrito(item.carritoId)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const { extras, extrasTotal } = getItemExtras(item);
                      const extrasLista = getExtrasSinPresentacion(item.extras ?? item.extrasSeleccionados ?? []);
                      const quantity = item.quantity ?? item.cantidad ?? 1;
                      return extras.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-700 space-y-0.5">
                          {extrasLista.map((extra, eIdx) => (
                            <p key={eIdx} className="font-medium">• {extra.nombre}  +${((extra.precio ?? extra.precio_extra ?? 0) * quantity).toLocaleString('es-AR')}</p>
                          ))}
                          <p className="font-medium text-slate-600 mt-1">Extras: ${(extrasTotal * quantity).toLocaleString('es-AR')}</p>
                        </div>
                      );
                    })()}

                    {(item.observaciones || item.observacion) && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-600 italic">
                          <span className="font-semibold">Obs:</span> {item.observaciones || item.observacion}
                        </p>
                      </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-xs text-slate-600 font-medium">Total item:</span>
                      <p className="font-bold text-sm text-slate-900">
                        ${(() => {
                          const quantity = item.quantity ?? item.cantidad ?? 1;
                          const price = item.price ?? item.precio ?? 0;
                          const { extrasTotal } = getItemExtras(item);
                          const precioBase = price * quantity;
                          const precioExtras = extrasTotal * quantity;
                          return (precioBase + precioExtras).toLocaleString('es-AR');
                        })()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Datos del cliente */}
              <div className="mb-4 pb-4 border-b border-slate-200">
                <h4 className="font-medium text-sm text-slate-700 mb-1.5">Cliente:</h4>
                <p className="text-xs text-slate-600">{cliente.nombre}</p>
                <p className="text-xs text-slate-600">{cliente.telefono}</p>
                {tipoEntrega === 'delivery' && cliente.direccion.calle && (
                  <p className="text-xs text-slate-600 mt-1">
                    {cliente.direccion.calle} {cliente.direccion.numero}
                  </p>
                )}
              </div>

              {isWebOrder && (
                <div className="mb-4 pb-4 border-b-2 border-slate-400">
                  <h4 className="font-medium text-sm text-slate-700 mb-2">Datos WEB:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Medio de pago:</span>
                      <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">
                        {medioPago === 'mercadopago'
                          ? 'Mercado Pago'
                          : medioPago === 'transferencia'
                            ? 'Transferencia'
                            : medioPago === 'efectivo'
                              ? 'Efectivo'
                              : medioPago || 'Sin definir'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Estado de pago:</span>
                      {estadoPago === 'paid' ? (
                        <Badge className="bg-green-600 text-white">Pagado</Badge>
                      ) : (
                        <Badge className="bg-amber-500 text-white">Pago pendiente</Badge>
                      )}
                    </div>
                    {medioPago === 'efectivo' && Number.isFinite(Number(pedidoOriginal?.monto_con_cuanto_abona)) && Number(pedidoOriginal?.monto_con_cuanto_abona) > 0 && (
                      <div>
                        <span className="font-semibold">Con cuanto abona:</span>{' '}
                        <span>${Number(pedidoOriginal.monto_con_cuanto_abona).toLocaleString('es-AR')}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-semibold">Horario:</span>{' '}
                      {horaProgramada
                        ? `Programado ${horaProgramada}`
                        : (pedidoOriginal?.prioridad || '').toString().toUpperCase() === 'ALTA'
                          ? 'Cuanto antes'
                          : 'Sin horario'}
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-semibold">Observaciones del pedido:</span>{' '}
                      <span>{pedidoOriginal?.observaciones_pedido || pedidoOriginal?.observaciones || 'Sin observaciones del pedido'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Resumen financiero */}
              <div className="space-y-2">
                <div className="flex justify-between text-lg font-bold text-slate-800">
                  <span>TOTAL:</span>
                  <span>${calcularTotal().toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Carrito compacto fijo para mobile en PASO 1 */}
        {pasoModal === 1 && (
          <CartSummaryMobile
            carrito={carrito}
            calcularTotal={calcularTotal}
            carritoExpandidoMobile={carritoExpandidoMobile}
            setCarritoExpandidoMobile={setCarritoExpandidoMobile}
            modificarCantidad={modificarCantidad}
            eliminarDelCarrito={eliminarDelCarrito}
            editarExtrasItem={editarExtrasItem}
          />
        )}

        {/* Botones de navegación */}
        <DialogFooter className="flex flex-col sm:flex-row justify-between gap-3 pt-2 lg:pt-4 lg:border-t flex-shrink-0">
          {pasoModal === 1 ? (
            <>
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => setPasoModal(2)}
                disabled={carrito.length === 0}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              >
                Siguiente: Datos del Cliente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : pasoModal === 2 ? (
            <>
              <Button
                variant="outline"
                onClick={() => setPasoModal(1)}
                className="gap-2 w-full sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4" />
                Volver
              </Button>
              <Button
                onClick={() => {
                  const { valid, mensaje } = validarPasoCliente(cliente, tipoEntrega);
                  if (!valid) {
                    toast.error(mensaje);
                    return;
                  }
                  setPasoModal(3);
                }}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              >
                Siguiente: Resumen
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setPasoModal(2)}
                className="gap-2 w-full sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4" />
                Volver
              </Button>
              <Button
                onClick={handleActualizarPedido}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 w-full sm:w-auto"
              >
                <Check className="h-5 w-5" />
                Guardar Cambios
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


