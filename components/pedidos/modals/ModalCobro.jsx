import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Building2, Smartphone, Wallet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { pedidosService } from '@/services/pedidosService';
import { toast } from '@/hooks/use-toast';
import { getItemExtras } from '@/lib/extrasUtils';
import { calculateLineSubtotalFromSnapshot } from '@/lib/pedidoTotals';

const MEDIO_OPCIONES = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'debito', label: 'Débito' },
  { value: 'credito', label: 'Crédito' },
  { value: 'transferencia', label: 'Transferencia (sin factura)' },
  { value: 'transferencia_facturada', label: 'Transferencia (con factura)' },
  { value: 'mercadopago', label: 'MercadoPago' },
];

export function ModalCobro({ pedido, isOpen, onClose, onCobroExitoso }) {
  const [medioPago, setMedioPago] = useState('efectivo');
  const [dividirPago, setDividirPago] = useState(false);
  const [medio2, setMedio2] = useState('transferencia');
  const [monto1, setMonto1] = useState('');
  const [loading, setLoading] = useState(false);

  const mediosConArca = ['mercadopago', 'debito', 'credito', 'transferencia_facturada'];
  const requiereFacturaElectronica = dividirPago
    ? mediosConArca.includes(medioPago) || mediosConArca.includes(medio2)
    : mediosConArca.includes(medioPago);
  const [pedidoCompleto, setPedidoCompleto] = useState(null);
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
  const submittedRef = useRef(false);
  const roundTo2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

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
      setDescuentoPorcentaje(0);
      setDividirPago(false);
      setMedio2('transferencia');
      setMonto1('');
    }
  }, [isOpen, pedidoCompleto]);

  // Reset guard al cerrar modal para permitir nuevo cobro (hooks deben ir antes de cualquier return)
  useEffect(() => {
    if (!isOpen) submittedRef.current = false;
  }, [isOpen]);

  const pedidoParaMostrar = pedidoCompleto || pedido;
  if (!pedidoParaMostrar) return null;

  const totalOriginal = Number(pedidoParaMostrar.total) || 0;
  const porcentajeNormalizado = Math.min(Math.max(Number(descuentoPorcentaje) || 0, 0), 100);
  const descuentoCalculadoPreview = roundTo2(totalOriginal * (porcentajeNormalizado / 100));
  const totalFinalPreview = roundTo2(Math.max(totalOriginal - descuentoCalculadoPreview, 0));
  const monto1Num = parseFloat(monto1) || 0;
  const monto2Auto = roundTo2(Math.max(totalFinalPreview - monto1Num, 0));
  const sumaMediosValida = dividirPago
    ? Math.abs(monto1Num + monto2Auto - totalFinalPreview) <= 0.01
    : true;

  const handleCobrar = async () => {
    if (!pedidoParaMostrar) return;
    if (submittedRef.current) return;
    if (porcentajeNormalizado < 0 || porcentajeNormalizado > 100) {
      toast.error('El descuento (%) debe estar entre 0 y 100');
      return;
    }
    if (dividirPago) {
      if (medioPago === medio2) {
        toast.error('Los dos medios de pago deben ser distintos');
        return;
      }
      if (monto1Num <= 0 || monto2Auto <= 0) {
        toast.error('Ambos montos deben ser mayores a 0');
        return;
      }
      if (!sumaMediosValida) {
        toast.error('La suma de los medios no coincide con el total a cobrar');
        return;
      }
    }

    submittedRef.current = true;
    setLoading(true);
    try {
      // PEDIDO EXISTENTE: usar endpoint de cobro del backend (evita ventas duplicadas)
      if (pedidoParaMostrar.id !== 'nuevo') {
        const cobroPayload = dividirPago
          ? {
              mediosPago: [
                { medioPago, monto: monto1Num },
                { medioPago: medio2, monto: monto2Auto },
              ],
              descuentoPorcentaje: porcentajeNormalizado,
            }
          : {
              medioPago,
              descuentoPorcentaje: porcentajeNormalizado,
            };

        const response = await pedidosService.cobrarPedido(pedidoParaMostrar.id, cobroPayload);

        if (response.success) {
          toast.success('Pedido cobrado correctamente', {
            description: `Pedido #${pedidoParaMostrar.id} - Venta registrada`
          });
          const pedidoActualizado = response.data?.pedido ?? null;
          if (onCobroExitoso) onCobroExitoso(pedidoParaMostrar.id, pedidoActualizado);
          onClose();
        } else {
          submittedRef.current = false;
          if (response.code === 'PEDIDO_YA_PAGADO') {
            toast.error('El pedido ya está cobrado', {
              description: 'No se puede cobrar dos veces'
            });
            onClose();
          } else {
            toast.error(response.error || 'Error al cobrar pedido');
          }
        }
        setLoading(false);
        return;
      }

      // PEDIDO NUEVO: solo capturar datos de cobro.
      // La venta se crea después de crear el pedido para tener pedido_id real.
      let items = [];
      if (pedidoParaMostrar.items && pedidoParaMostrar.items.length > 0) {
        items = pedidoParaMostrar.items.map(item => {
          const articuloId = item.articulo_id || item.id;
          const articuloIdNum = typeof articuloId === 'string' ? parseInt(articuloId, 10) : articuloId;
          if (!articuloIdNum || isNaN(articuloIdNum)) return null;
          return {
            articulo_id: articuloIdNum,
            articulo_nombre: item.articulo_nombre || item.nombre || 'Artículo sin nombre',
            cantidad: item.cantidad || 1,
            precio: parseFloat(item.precio) || 0,
            subtotal: calculateLineSubtotalFromSnapshot(item),
          };
        }).filter(item => item !== null);
      }
      
      if (items.length === 0) {
        toast.error('Error al procesar items del pedido');
        submittedRef.current = false;
        setLoading(false);
        return;
      }

      const ventaData = {
        pedido_id: null,
        clienteNombre: pedidoParaMostrar.clienteNombre,
        cliente: { nombre: pedidoParaMostrar.clienteNombre, telefono: pedidoParaMostrar.telefono || '', email: pedidoParaMostrar.email || null, direccion: pedidoParaMostrar.direccion || '' },
        direccion: pedidoParaMostrar.direccion || '',
        telefono: pedidoParaMostrar.telefono || '',
        email: pedidoParaMostrar.email || null,
        subtotal: totalOriginal,
        descuento_porcentaje: porcentajeNormalizado,
        total: totalFinalPreview,
        medioPago,
        items
      };

      if (onCobroExitoso) {
        onCobroExitoso({
          medioPago,
          ventaData
        });
      }
      // No cerrar aquí: el flujo "nuevo + pagado" necesita conservar
      // datos temporales hasta confirmar y crear el pedido.
    } catch (error) {
      submittedRef.current = false;
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
      <DialogContent className="w-[calc(100vw-0.75rem)] sm:w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Cobrar Pedido #{pedidoParaMostrar.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3 sm:py-4 pr-0 sm:pr-2">
          {/* Items del Pedido */}
          {pedidoParaMostrar.items && pedidoParaMostrar.items.length > 0 && (
            <div className="bg-card border-2 border-border rounded-lg p-3 shadow-md">
              <h3 className="text-base font-semibold text-foreground mb-3">📦 Items del Pedido</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-3">
                {pedidoParaMostrar.items.map((item, index) => {
                  const precioUnitario = parseFloat(item.precio) || 0;
                  const cantidad = item.cantidad || 1;
                  const subtotalItem = calculateLineSubtotalFromSnapshot(item);
                  
                  const { extras } = getItemExtras(item);
                  const tieneExtras = extras && extras.length > 0;
                  
                  return (
                    <div key={index} className="border-b border-border pb-2 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-foreground text-sm">
                            {cantidad}x {item.articulo_nombre || item.nombre || 'Artículo'}
                          </div>
                          {tieneExtras && (
                            <div className="text-xs text-muted-foreground mt-1 ml-4">
                              <div className="font-medium mb-1">Extras:</div>
                              {extras.map((extra, idx) => (
                                <div key={idx} className="ml-2">
                                  • {extra.nombre}  {extra.precio > 0 ? `+$${extra.precio.toLocaleString('es-AR')}` : ''}
                                </div>
                              ))}
                            </div>
                          )}
                          {item.observaciones && (
                            <div className="text-xs text-muted-foreground italic mt-1 ml-4">
                              Obs: {item.observaciones}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-foreground">
                            ${subtotalItem.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-muted-foreground">
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
          <div className="bg-card border-2 border-border rounded-lg p-3 shadow-md">
            <h3 className="text-base font-semibold text-foreground mb-3">👤 Datos del Cliente</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-foreground">Nombre: </span>
                <span className="text-foreground">{pedidoParaMostrar.clienteNombre}</span>
              </div>
              {pedidoParaMostrar.telefono && (
                <div>
                  <span className="font-medium text-foreground">Teléfono: </span>
                  <span className="text-foreground">{pedidoParaMostrar.telefono}</span>
                </div>
              )}
              {pedidoParaMostrar.email && (
                <div>
                  <span className="font-medium text-foreground">Email: </span>
                  <span className="text-foreground">{pedidoParaMostrar.email}</span>
                </div>
              )}
              {pedidoParaMostrar.direccion && (
                <div>
                  <span className="font-medium text-foreground">Dirección: </span>
                  <span className="text-foreground">{pedidoParaMostrar.direccion}</span>
                </div>
              )}
            </div>
          </div>

          {/* Resumen de cobro */}
          <div className="bg-card border-2 border-border rounded-lg p-3 shadow-md">
            <h3 className="text-base font-semibold text-foreground mb-3">💰 Resumen de Cobro</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground font-medium">Total original:</span>
                <span className="font-bold text-foreground">
                  ${totalOriginal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="space-y-1">
                <Label htmlFor="descuentoCobro" className="text-sm font-medium text-foreground">
                  Descuento (%)
                </Label>
                <Input
                  id="descuentoCobro"
                  type="number"
                  min="0"
                  step="0.01"
                  max="100"
                  value={descuentoPorcentaje}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (!Number.isFinite(value) || value < 0) {
                      setDescuentoPorcentaje(0);
                      return;
                    }
                    setDescuentoPorcentaje(Math.min(value, 100));
                  }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">Descuento (%):</span>
                <span className="font-bold text-foreground">
                  {porcentajeNormalizado.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%
                </span>
              </div>
              <div className="flex justify-between text-sm text-green-700">
                <span className="font-medium">Descuento calculado:</span>
                <span className="font-bold">
                  -${descuentoCalculadoPreview.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between text-lg font-bold text-foreground">
                <span>Total final a cobrar:</span>
                <span>${totalFinalPreview.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {requiereFacturaElectronica ? (
            <Alert className="border-blue-200 bg-primary/10">
              <AlertDescription className="text-sm text-blue-900">
                Este medio emite Factura C electrónica (ARCA) al entregar el pedido.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-border bg-muted">
              <AlertDescription className="text-sm text-foreground">
                Comprobante interno (sin factura electrónica). El importe se registra en cuenta operativa.
              </AlertDescription>
            </Alert>
          )}

          {/* Método de Pago */}
          <div className="bg-card border-2 border-border rounded-lg p-3 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-foreground">💳 Método de Pago</h3>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                <Checkbox
                  checked={dividirPago}
                  onCheckedChange={(checked) => {
                    setDividirPago(Boolean(checked));
                    setMonto1('');
                  }}
                />
                <span>Dividir en 2 medios</span>
              </label>
            </div>

            {!dividirPago ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  Transferencia (sin factura)
                </Button>
                <Button
                  variant={medioPago === 'transferencia_facturada' ? 'default' : 'outline'}
                  className={`h-12 text-sm font-medium ${medioPago === 'transferencia_facturada' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => setMedioPago('transferencia_facturada')}
                >
                  <Building2 className="h-4 w-4 mr-1.5" />
                  Transferencia (con factura)
                </Button>
                <Button
                  variant={medioPago === 'mercadopago' ? 'default' : 'outline'}
                  className={`h-12 text-sm font-medium sm:col-span-2 ${medioPago === 'mercadopago' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => setMedioPago('mercadopago')}
                >
                  <Smartphone className="h-4 w-4 mr-1.5" />
                  MercadoPago
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Medio 1</Label>
                    <Select value={medioPago} onValueChange={setMedioPago}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDIO_OPCIONES.map((op) => (
                          <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="monto1" className="text-sm font-medium">Monto medio 1</Label>
                    <Input
                      id="monto1"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={monto1}
                      onChange={(e) => setMonto1(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Medio 2</Label>
                    <Select value={medio2} onValueChange={setMedio2}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDIO_OPCIONES.map((op) => (
                          <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Monto medio 2 (automático)</Label>
                    <div className="h-10 flex items-center px-3 rounded-md border border-input bg-muted text-sm font-semibold">
                      ${monto2Auto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${sumaMediosValida && monto1Num > 0 ? 'text-green-700' : 'text-muted-foreground'}`}>
                  Suma medios: ${(monto1Num + monto2Auto).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {' / '}
                  Total: ${totalFinalPreview.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {sumaMediosValida && monto1Num > 0 && monto2Auto > 0 ? ' ✓' : ''}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCobrar}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
          >
            {loading ? 'Registrando...' : 'Confirmar Cobro'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

