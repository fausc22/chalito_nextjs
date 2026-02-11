import { ShoppingCart, ChevronRight, ChevronLeft, Check, Search, Package, Edit, Trash2, Store, Truck, Phone, MessageSquare, Globe, Clock, Banknote, CreditCard, Building2, Smartphone, XCircle, CheckCircle, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '../ProductCard';

// Helper para obtener icono según el valor
const getOrigenIcon = (valor) => {
  const iconos = {
    'mostrador': Store,
    'telefono': Phone,
    'whatsapp': MessageSquare,
    'web': Globe
  };
  return iconos[valor] || Store;
};

const getMedioPagoIcon = (valor) => {
  const iconos = {
    'efectivo': Banknote,
    'debito': CreditCard,
    'credito': CreditCard,
    'transferencia': Building2,
    'mercadopago': Smartphone
  };
  return iconos[valor] || Banknote;
};

const getEstadoPagoIcon = (valor) => {
  return valor === 'paid' ? CheckCircle : XCircle;
};

export function ModalNuevoPedido({
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
  descuento,
  setDescuento,
  calcularSubtotal,
  calcularEnvio,
  calcularDescuento,
  calcularIVA,
  calcularTotal,
  agregarProductoConExtras,
  modificarCantidad,
  eliminarDelCarrito,
  editarExtrasItem,
  resetearModal,
  crearPedido,
  onSuccess
}) {
  const handleClose = (open) => {
    if (!open) {
      resetearModal();
      onClose();
    }
  };

  const handleCrearPedido = async () => {
    // Si el estado de pago es "paid", primero mostrar modal de cobro
    if (estadoPago === 'paid') {
      // Preparar datos del pedido para el modal de cobro
      const pedidoParaCobro = {
        id: 'nuevo', // Temporal hasta que se cree
        clienteNombre: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email,
        direccion: tipoEntrega === 'delivery' 
          ? `${cliente.direccion.calle} ${cliente.direccion.numero}`.trim()
          : '',
        subtotal: calcularSubtotal() - calcularDescuento(),
        ivaTotal: calcularIVA(),
        descuento: calcularDescuento(),
        total: calcularTotal(),
        items: carrito.map(item => {
          const precioBase = parseFloat(item.precio) || 0;
          const cantidad = parseInt(item.cantidad) || 1;
          const precioExtras = (item.extrasSeleccionados || []).reduce((s, e) => s + (parseFloat(e.precio) || 0), 0);
          const subtotalItem = (precioBase + precioExtras) * cantidad;
          
          return {
            id: item.id,
            articulo_id: item.id,
            nombre: item.nombre,
            cantidad: cantidad,
            precio: precioBase + precioExtras,
            subtotal: subtotalItem
          };
        }),
        medioPago: medioPago,
        // Guardar todos los datos del formulario para crear el pedido después
        datosFormulario: {
          cliente,
          carrito,
          tipoEntrega,
          origen,
          tipoPedido,
          horaProgramada,
          descuento,
          estadoPago: 'paid' // Ya está pagado
        }
      };
      
      // Llamar callback para mostrar modal de cobro
      if (onSuccess) {
        onSuccess({ mostrarCobro: true, pedidoParaCobro });
      }
      return;
    }
    
    // Si no es "paid", crear el pedido directamente
    try {
      const pedido = await crearPedido(onSuccess);
      if (pedido) {
        handleClose(false);
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      // El error ya se maneja en crearPedido con alert
    }
  };

  const getTitulo = () => {
    switch (pasoModal) {
      case 1:
        return 'Nuevo Pedido - Armar Pedido';
      case 2:
        return 'Nuevo Pedido - Datos del Cliente';
      case 3:
        return 'Nuevo Pedido - Resumen';
      default:
        return 'Nuevo Pedido';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col bg-slate-100">
        <DialogHeader className="flex-shrink-0 pb-3">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {getTitulo()}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Modal para crear un nuevo pedido con productos, datos del cliente y resumen
          </DialogDescription>
        </DialogHeader>

        {pasoModal === 1 ? (
          // PASO 1: Armar Pedido - Diseño minimalista
          <div className="flex-1 flex gap-4 min-h-0 bg-slate-100">
            {/* Columna principal: Categorías y Productos - 60% */}
            <div className="w-[60%] flex flex-col min-h-0">
              {/* Categorías como tabs */}
              <div className="flex gap-1.5 mb-3 border-b-2 border-slate-400 pb-1.5 flex-shrink-0 overflow-x-auto">
                {loadingCategorias ? (
                  <div className="text-xs text-slate-500">Cargando categorías...</div>
                ) : !Array.isArray(categorias) || categorias.length === 0 ? (
                  <div className="text-xs text-slate-500">No hay categorías disponibles</div>
                ) : (
                  categorias.map(cat => {
                    // Manejar diferentes formatos de categoría
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
              <div className="flex-1 overflow-y-auto min-h-0 pr-3">
                {productosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No se encontraron productos</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
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

            {/* Sidebar derecha: Carrito - 40% - Empieza desde arriba, ocupa toda la altura */}
            <div className="w-[40%] flex flex-col border-l-2 border-slate-400 pl-4 h-full">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <h3 className="text-lg font-bold text-slate-900">Carrito</h3>
                <Badge variant="outline" className="bg-slate-100 text-sm font-semibold">
                  {carrito.length}
                </Badge>
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
                  {/* Lista del carrito con scroll - ocupa todo el alto disponible */}
                  <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-0 pr-2">
                    {carrito.map(item => (
                      <div key={item.carritoId} className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-md">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-900 truncate leading-tight">{item.nombre}</p>
                            {item.extrasDisponibles && item.extrasDisponibles.length > 0 && (
                              <Badge variant="outline" className="text-xs mt-1 bg-yellow-50 text-yellow-700 border-yellow-300 px-1.5 py-0.5">
                                {item.extrasSeleccionados.length} extras
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2 flex-shrink-0">
                            {item.extrasDisponibles && item.extrasDisponibles.length > 0 && (
                              <button
                                onClick={() => editarExtrasItem(item)}
                                className="text-blue-600 hover:text-blue-700"
                                title="Editar extras"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => eliminarDelCarrito(item.carritoId)}
                              className="text-red-600 hover:text-red-700"
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
                              onClick={() => modificarCantidad(item.carritoId, item.cantidad - 1)}
                            >
                              -
                            </Button>
                            <span className="font-bold text-sm w-6 text-center">{item.cantidad}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 border border-slate-300 hover:bg-slate-200 text-sm font-semibold"
                              onClick={() => modificarCantidad(item.carritoId, item.cantidad + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <p className="font-bold text-sm text-slate-900">
                            ${(() => {
                              const precioBase = item.precio * item.cantidad;
                              const precioExtras = (item.extrasSeleccionados || []).reduce((sum, extra) => sum + (extra.precio * item.cantidad), 0);
                              return (precioBase + precioExtras).toLocaleString('es-AR');
                            })()}
                          </p>
                        </div>

                        {item.extrasSeleccionados.length > 0 && (
                          <div className="mt-2 pt-2 border-t-2 border-slate-400 text-xs text-slate-700 space-y-0.5">
                            {item.extrasSeleccionados.map((extra, idx) => (
                              <p key={idx} className="font-medium">+ {extra.nombre} (+${(extra.precio * item.cantidad).toLocaleString('es-AR')})</p>
                            ))}
                          </div>
                        )}

                        {item.observacion && (
                          <div className="mt-2 pt-2 border-t-2 border-slate-400">
                            <p className="text-xs text-slate-600 italic">
                              <span className="font-semibold">Obs:</span> {item.observacion}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Resumen del carrito - siempre visible */}
                  <div className="border-t-2 border-slate-400 pt-2 flex-shrink-0">
                    <div className="bg-white border border-slate-300 rounded-md p-2 space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-700 font-medium">Subtotal:</span>
                        <span className="font-bold text-slate-900">
                          ${calcularSubtotal().toLocaleString('es-AR')}
                        </span>
                      </div>
                      
                      {/* Descuento */}
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Descuento"
                          value={descuento || ''}
                          onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
                          className="h-7 text-sm"
                        />
                        <span className="text-sm text-slate-600 font-medium">%</span>
                      </div>
                      
                      {calcularDescuento() > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span className="font-medium">Descuento:</span>
                          <span className="font-bold">
                            -${calcularDescuento().toLocaleString('es-AR')}
                          </span>
                        </div>
                      )}

                      <Separator className="my-1" />
                      <div className="flex justify-between text-base font-bold text-slate-900">
                        <span>Total:</span>
                        <span>${(calcularSubtotal() - calcularDescuento()).toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : pasoModal === 2 ? (
          // PASO 2: Datos del Cliente
          <div className="py-3 pr-3 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* Datos Básicos del Cliente */}
            <div className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-md">
              <h3 className="text-base font-semibold text-slate-800 mb-3">👤 Datos del Cliente</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Nombre del Cliente *</Label>
                  <Input
                    value={cliente.nombre}
                    onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                    className="mt-1 h-8 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium">Teléfono *</Label>
                  <Input
                    value={cliente.telefono}
                    onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                    placeholder="Ej: 3815-123456"
                    className="mt-1 h-8 text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <Label className="text-xs font-medium">Email (opcional)</Label>
                  <Input
                    type="email"
                    value={cliente.email}
                    onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                    placeholder="Ej: cliente@email.com"
                    className="mt-1 h-8 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Tipo de Entrega */}
            <div className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-md">
              <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Tipo de Entrega
              </h3>
              <div className="grid grid-cols-2 gap-3">
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
              <div className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-md">
                <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Dirección de Entrega
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium">Calle *</Label>
                    <Input
                      value={cliente.direccion.calle}
                      onChange={(e) => setCliente({
                        ...cliente,
                        direccion: { ...cliente.direccion, calle: e.target.value }
                      })}
                      placeholder="Ej: Av. Belgrano"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Número/Altura *</Label>
                    <Input
                      value={cliente.direccion.numero}
                      onChange={(e) => setCliente({
                        ...cliente,
                        direccion: { ...cliente.direccion, numero: e.target.value }
                      })}
                      placeholder="Ej: 1234"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Edificio/Casa</Label>
                    <Input
                      value={cliente.direccion.edificio}
                      onChange={(e) => setCliente({
                        ...cliente,
                        direccion: { ...cliente.direccion, edificio: e.target.value }
                      })}
                      placeholder="Ej: Torre A"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Piso/Depto</Label>
                    <Input
                      value={cliente.direccion.piso}
                      onChange={(e) => setCliente({
                        ...cliente,
                        direccion: { ...cliente.direccion, piso: e.target.value }
                      })}
                      placeholder="Ej: 3° A"
                      className="mt-1 h-8 text-sm"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-xs font-medium">Observaciones</Label>
                    <Textarea
                      value={cliente.direccion.observaciones}
                      onChange={(e) => setCliente({
                        ...cliente,
                        direccion: { ...cliente.direccion, observaciones: e.target.value }
                      })}
                      placeholder="Ej: Timbre B, portón verde"
                      rows={2}
                      className="mt-1 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Configuración Adicional */}
            <div className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-md">
              <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuración del Pedido
              </h3>
              <div className="grid grid-cols-3 gap-3">
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
                      onChange={(e) => setHoraProgramada(e.target.value)}
                      className="mt-1 h-8 font-mono text-sm"
                    />
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
          // PASO 3: Resumen
          <div className="py-3 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* Resumen del Pedido */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">📋 Resumen del Pedido</h3>
              
              {/* Items del pedido */}
              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-sm text-slate-700">Items:</h4>
                {carrito.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start bg-white p-2 rounded border border-slate-200">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-800">{item.nombre}</p>
                      <p className="text-xs text-slate-600">Cantidad: {item.cantidad}</p>
                      {item.extrasSeleccionados.length > 0 && (
                        <div className="mt-1 text-[10px] text-slate-500">
                          {item.extrasSeleccionados.map((extra, eIdx) => (
                            <p key={eIdx}>+ {extra.nombre}</p>
                          ))}
                        </div>
                      )}
                      {item.observacion && (
                        <p className="text-xs text-slate-600 italic mt-1">
                          <span className="font-semibold">Obs:</span> {item.observacion}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-sm text-slate-800">
                      ${(() => {
                        const precioBase = item.precio * item.cantidad;
                        const precioExtras = (item.extrasSeleccionados || []).reduce((sum, extra) => sum + (extra.precio * item.cantidad), 0);
                        return (precioBase + precioExtras).toLocaleString('es-AR');
                      })()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Datos del cliente */}
              <div className="mb-4 pb-4 border-b-2 border-slate-400">
                <h4 className="font-medium text-sm text-slate-700 mb-1.5">Cliente:</h4>
                <p className="text-xs text-slate-600">{cliente.nombre}</p>
                <p className="text-xs text-slate-600">{cliente.telefono}</p>
                {tipoEntrega === 'delivery' && cliente.direccion.calle && (
                  <p className="text-xs text-slate-600 mt-1">
                    {cliente.direccion.calle} {cliente.direccion.numero}
                  </p>
                )}
              </div>

              {/* Resumen financiero */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold text-slate-800">
                    ${calcularSubtotal().toLocaleString('es-AR')}
                  </span>
                </div>

                {calcularDescuento() > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento:</span>
                    <span className="font-semibold">
                      -${calcularDescuento().toLocaleString('es-AR')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">IVA (21%):</span>
                  <span className="font-semibold text-slate-800">
                    ${calcularIVA().toLocaleString('es-AR')}
                  </span>
                </div>

                {calcularEnvio() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Envío:</span>
                    <span className="font-semibold text-slate-800">
                      ${calcularEnvio().toLocaleString('es-AR')}
                    </span>
                  </div>
                )}

                <Separator className="bg-slate-400 my-2" />

                <div className="flex justify-between text-lg font-bold text-slate-800">
                  <span>TOTAL:</span>
                  <span>${calcularTotal().toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <DialogFooter className="flex justify-between gap-3 pt-4 border-t flex-shrink-0">
          {pasoModal === 1 ? (
            <>
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => setPasoModal(2)}
                disabled={carrito.length === 0}
                className="gap-2 bg-green-600 hover:bg-green-700"
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
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Volver
              </Button>
              <Button
                onClick={() => setPasoModal(3)}
                disabled={!cliente.nombre || !cliente.telefono || (tipoEntrega === 'delivery' && !cliente.direccion.calle)}
                className="gap-2 bg-green-600 hover:bg-green-700"
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
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Volver
              </Button>
              <Button
                onClick={handleCrearPedido}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                <Check className="h-5 w-5" />
                Crear Pedido
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
