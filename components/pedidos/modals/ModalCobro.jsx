import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Banknote, CreditCard, Building2, Smartphone, Wallet, FileText } from 'lucide-react';
import { ventasService } from '@/services/ventasService';
import { pedidosService } from '@/services/pedidosService';
import { toast } from '@/hooks/use-toast';

export function ModalCobro({ pedido, isOpen, onClose, onCobroExitoso }) {
  const [medioPago, setMedioPago] = useState('efectivo');
  const [tipoFactura, setTipoFactura] = useState('');
  const [loading, setLoading] = useState(false);
  const [pedidoCompleto, setPedidoCompleto] = useState(null);

  // Obtener pedido completo cuando se abre el modal
  useEffect(() => {
    const obtenerPedidoCompleto = async () => {
      if (isOpen && pedido?.id && pedido.id !== 'nuevo') {
        try {
          console.log('🔍 Obteniendo pedido completo para cobro:', pedido.id);
          const response = await pedidosService.obtenerPedidoPorId(pedido.id);
          if (response.success) {
            console.log('✅ Pedido completo obtenido:', response.data);
            console.log('📦 Items del pedido:', response.data.items);
            setPedidoCompleto(response.data);
          } else {
            console.warn('⚠️ No se pudo obtener pedido completo, usando datos del pedido:', response.error);
            setPedidoCompleto(pedido);
          }
        } catch (error) {
          console.error('❌ Error al obtener pedido completo:', error);
          setPedidoCompleto(pedido);
        }
      } else if (isOpen && pedido) {
        // Si es un pedido nuevo, usar los datos directamente
        setPedidoCompleto(pedido);
      }
    };

    obtenerPedidoCompleto();
  }, [isOpen, pedido]);

  // Resetear medio de pago y tipo de factura cuando se abre el modal
  useEffect(() => {
    if (isOpen && pedidoCompleto) {
      setMedioPago(pedidoCompleto.medioPago || 'efectivo');
      setTipoFactura(''); // Resetear tipo de factura cada vez que se abre el modal
    }
  }, [isOpen, pedidoCompleto]);

  const pedidoParaMostrar = pedidoCompleto || pedido;
  if (!pedidoParaMostrar) return null;

  // Calcular totales del pedido
  const subtotal = pedidoParaMostrar.subtotal || 0;
  const descuento = pedidoParaMostrar.descuento || 0;
  const ivaTotal = pedidoParaMostrar.ivaTotal || pedidoParaMostrar.iva_total || 0;
  const total = pedidoParaMostrar.total || 0;

  const handleCobrar = async () => {
    if (!pedidoParaMostrar) return;

    setLoading(true);
    try {
      // Obtener items del pedido completo si están disponibles
      let items = [];
      if (pedidoParaMostrar.items && pedidoParaMostrar.items.length > 0) {
        items = pedidoParaMostrar.items.map(item => {
          // El articulo_id puede venir como número o string, asegurarse de que sea número
          const articuloId = item.articulo_id || item.id;
          const articuloIdNum = typeof articuloId === 'string' ? parseInt(articuloId, 10) : articuloId;
          
          if (!articuloIdNum || isNaN(articuloIdNum)) {
            console.error('❌ Item sin articulo_id válido:', item);
            return null;
          }
          
          return {
            articulo_id: articuloIdNum,
            articulo_nombre: item.articulo_nombre || item.nombre || 'Artículo sin nombre',
            cantidad: item.cantidad || 1,
            precio: parseFloat(item.precio) || 0,
            subtotal: parseFloat(item.subtotal) || (parseFloat(item.precio) * (item.cantidad || 1)) || 0
          };
        }).filter(item => item !== null); // Filtrar items inválidos
      }
      
      if (items.length === 0) {
        toast.error('Error al procesar items del pedido', {
          description: 'No se pudieron obtener los items del pedido'
        });
        setLoading(false);
        return;
      }
      
      console.log('💰 Items preparados para venta:', items);

      // Preparar datos de la venta
      const ventaData = {
        clienteNombre: pedidoParaMostrar.clienteNombre,
        cliente: {
          nombre: pedidoParaMostrar.clienteNombre,
          telefono: pedidoParaMostrar.telefono || '',
          email: pedidoParaMostrar.email || null,
          direccion: pedidoParaMostrar.direccion || ''
        },
        direccion: pedidoParaMostrar.direccion || '',
        telefono: pedidoParaMostrar.telefono || '',
        email: pedidoParaMostrar.email || null,
        subtotal: subtotal,
        ivaTotal: ivaTotal,
        descuento: descuento,
        total: total,
        medioPago: medioPago,
        tipo_factura: tipoFactura || null,
        items: items
      };

      const response = await ventasService.crearVenta(ventaData);

      if (response.success) {
        // Si es un pedido existente (no nuevo), actualizar su estado_pago a PAGADO
        if (pedidoParaMostrar.id !== 'nuevo') {
          try {
            // Actualizar el pedido para marcar como pagado
            await pedidosService.actualizarEstadoPagoPedido(pedidoParaMostrar.id, 'PAGADO', medioPago);
          } catch (error) {
            console.warn('No se pudo actualizar el estado de pago del pedido:', error);
            // Si es rate limit, no es crítico, la venta ya se registró
            const isRateLimit = error.message?.includes('Rate limit') || 
                               error.response?.status === 429;
            if (!isRateLimit) {
              throw error; // Re-lanzar si no es rate limit
            }
          }
        }

        // Si es un pedido nuevo, no mostrar toast aquí, se mostrará cuando se cree el pedido
        if (pedidoParaMostrar.id !== 'nuevo') {
          toast.success('Venta registrada exitosamente', {
            description: `Pedido #${pedidoParaMostrar.id} cobrado correctamente`
          });
        }
        
        if (onCobroExitoso) {
          // Si es un pedido nuevo, pasar el medio de pago seleccionado
          if (pedidoParaMostrar.id === 'nuevo') {
            onCobroExitoso(medioPago);
          } else {
            onCobroExitoso(pedidoParaMostrar.id);
          }
        }
        
        // Solo cerrar si no es un pedido nuevo (el nuevo se cerrará después de crearse)
        if (pedidoParaMostrar.id !== 'nuevo') {
          onClose();
        }
      } else {
        // Verificar si es rate limit
        const isRateLimit = response.rateLimit === true || 
                           response.error?.includes('Rate limit') ||
                           response.error?.includes('rate limit');
        
        if (isRateLimit) {
          const retryAfter = response.retryAfter || 300;
          const minutos = Math.round(retryAfter / 60);
          toast.error('Rate limit excedido', {
            description: `Por favor espera ${minutos} minuto${minutos !== 1 ? 's' : ''} antes de intentar nuevamente. El pedido no se ha cobrado.`,
            duration: 10000 // Mostrar por más tiempo
          });
        } else {
          toast.error('Error al registrar venta', {
            description: response.error || 'No se pudo registrar la venta'
          });
        }
      }
    } catch (error) {
      console.error('Error al cobrar pedido:', error);
      
      // Verificar si es rate limit
      const isRateLimit = error.message?.includes('Rate limit') || 
                         error.message?.includes('rate limit') ||
                         error.response?.status === 429;
      
      if (isRateLimit) {
        const retryAfter = error.response?.data?.retryAfter || 300;
        const minutos = Math.round(retryAfter / 60);
        toast.error('Rate limit excedido', {
          description: `Por favor espera ${minutos} minuto${minutos !== 1 ? 's' : ''} antes de intentar nuevamente. El pedido no se ha cobrado.`,
          duration: 10000 // Mostrar por más tiempo
        });
      } else {
        toast.error('Error al cobrar pedido', {
          description: error.message || 'Ocurrió un error inesperado'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Cobrar Pedido #{pedidoParaMostrar.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 pr-2">
          {/* Items del Pedido */}
          {pedidoParaMostrar.items && pedidoParaMostrar.items.length > 0 && (
            <div className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-md">
              <h3 className="text-base font-semibold text-slate-800 mb-3">📦 Items del Pedido</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-3">
                {pedidoParaMostrar.items.map((item, index) => {
                  const precioUnitario = parseFloat(item.precio) || 0;
                  const cantidad = item.cantidad || 1;
                  const subtotalItem = parseFloat(item.subtotal) || (precioUnitario * cantidad);
                  
                  // Manejar diferentes formatos de extras
                  let extras = item.extras || item.personalizaciones || [];
                  
                  // Si extras es un objeto con una propiedad 'extras' que es un array, extraerlo
                  if (extras && typeof extras === 'object' && !Array.isArray(extras) && extras.extras && Array.isArray(extras.extras)) {
                    extras = extras.extras;
                  }
                  
                  const tieneExtras = extras && (Array.isArray(extras) ? extras.length > 0 : Object.keys(extras).length > 0);
                  
                  return (
                    <div key={index} className="border-b border-slate-200 pb-2 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900 text-sm">
                            {cantidad}x {item.articulo_nombre || item.nombre || 'Artículo'}
                          </div>
                          {tieneExtras && (
                            <div className="text-xs text-slate-600 mt-1 ml-4">
                              <div className="font-medium mb-1">Extras:</div>
                              {Array.isArray(extras) ? (
                                extras.map((extra, idx) => {
                                  // Manejar diferentes formatos de extra
                                  let nombreExtra = '';
                                  let precioExtra = null;
                                  
                                  if (typeof extra === 'string') {
                                    nombreExtra = extra;
                                  } else if (typeof extra === 'object' && extra !== null) {
                                    nombreExtra = extra.nombre || extra.name || JSON.stringify(extra);
                                    precioExtra = extra.precio || extra.price || null;
                                  } else {
                                    nombreExtra = String(extra);
                                  }
                                  
                                  return (
                                    <div key={idx} className="ml-2">
                                      • {nombreExtra} {precioExtra ? `(+$${parseFloat(precioExtra).toLocaleString('es-AR', { minimumFractionDigits: 2 })})` : ''}
                                    </div>
                                  );
                                })
                              ) : (
                                Object.entries(extras).map(([key, value]) => {
                                  // Convertir value a string si es un objeto
                                  const valueStr = typeof value === 'object' && value !== null 
                                    ? (value.nombre || value.name || JSON.stringify(value))
                                    : String(value);
                                  
                                  return (
                                    <div key={key} className="ml-2">
                                      • {key}: {valueStr}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                          {item.observaciones && (
                            <div className="text-xs text-slate-500 italic mt-1 ml-4">
                              Obs: {item.observaciones}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-900">
                            ${subtotalItem.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-slate-500">
                            ${precioUnitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Datos del Cliente */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-md">
            <h3 className="text-base font-semibold text-slate-800 mb-3">👤 Datos del Cliente</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-slate-700">Nombre: </span>
                <span className="text-slate-900">{pedidoParaMostrar.clienteNombre}</span>
              </div>
              {pedidoParaMostrar.telefono && (
                <div>
                  <span className="font-medium text-slate-700">Teléfono: </span>
                  <span className="text-slate-900">{pedidoParaMostrar.telefono}</span>
                </div>
              )}
              {pedidoParaMostrar.email && (
                <div>
                  <span className="font-medium text-slate-700">Email: </span>
                  <span className="text-slate-900">{pedidoParaMostrar.email}</span>
                </div>
              )}
              {pedidoParaMostrar.direccion && (
                <div>
                  <span className="font-medium text-slate-700">Dirección: </span>
                  <span className="text-slate-900">{pedidoParaMostrar.direccion}</span>
                </div>
              )}
            </div>
          </div>

          {/* Resumen Financiero */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-md">
            <h3 className="text-base font-semibold text-slate-800 mb-3">💰 Resumen Financiero</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 font-medium">Subtotal:</span>
                <span className="font-bold text-slate-900">
                  ${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              {descuento > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="font-medium">Descuento:</span>
                  <span className="font-bold">
                    -${descuento.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-slate-700 font-medium">IVA (21%):</span>
                <span className="font-bold text-slate-900">
                  ${ivaTotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between text-lg font-bold text-slate-900">
                <span>TOTAL:</span>
                <span>${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Tipo de Factura */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-md">
            <Label htmlFor="tipoFactura" className="text-base font-semibold text-slate-800 mb-2 block">
              <FileText className="h-4 w-4 inline mr-2" />
              Tipo de Factura
            </Label>
            <Select value={tipoFactura} onValueChange={setTipoFactura}>
              <SelectTrigger id="tipoFactura" className="mt-1 h-9 text-sm">
                <SelectValue placeholder="Selecciona tipo de factura (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A - Responsable Inscripto</SelectItem>
                <SelectItem value="B">B - Consumidor Final</SelectItem>
                <SelectItem value="C">C - Exento</SelectItem>
                <SelectItem value="M">M - Monotributo</SelectItem>
                <SelectItem value="X">X - Remito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Método de Pago */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-md">
            <h3 className="text-base font-semibold text-slate-800 mb-3">💳 Método de Pago</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={medioPago === 'efectivo' ? 'default' : 'outline'}
                className={`h-12 text-sm font-medium ${medioPago === 'efectivo' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                onClick={() => setMedioPago('efectivo')}
              >
                <Wallet className="h-4 w-4 mr-1.5" />
                Efectivo
              </Button>
              <Button
                variant={medioPago === 'debito' ? 'default' : 'outline'}
                className={`h-12 text-sm font-medium ${medioPago === 'debito' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                onClick={() => setMedioPago('debito')}
              >
                <CreditCard className="h-4 w-4 mr-1.5" />
                Débito
              </Button>
              <Button
                variant={medioPago === 'credito' ? 'default' : 'outline'}
                className={`h-12 text-sm font-medium ${medioPago === 'credito' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                onClick={() => setMedioPago('credito')}
              >
                <CreditCard className="h-4 w-4 mr-1.5" />
                Crédito
              </Button>
              <Button
                variant={medioPago === 'transferencia' ? 'default' : 'outline'}
                className={`h-12 text-sm font-medium ${medioPago === 'transferencia' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                onClick={() => setMedioPago('transferencia')}
              >
                <Building2 className="h-4 w-4 mr-1.5" />
                Transferencia
              </Button>
              <Button
                variant={medioPago === 'mercadopago' ? 'default' : 'outline'}
                className={`h-12 text-sm font-medium col-span-2 ${medioPago === 'mercadopago' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                onClick={() => setMedioPago('mercadopago')}
              >
                <Smartphone className="h-4 w-4 mr-1.5" />
                MercadoPago
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCobrar}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Registrando...' : 'Confirmar Cobro'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

