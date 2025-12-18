import { useState } from 'react';
import { Package, Bike, Eye, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ModalPedidosEntregados({ pedidos, isOpen, onClose }) {
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Package className="h-5 w-5 text-slate-700" />
            Pedidos Entregados
            <Badge className="bg-slate-700 text-white ml-2 text-xs">
              {pedidos.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="py-3 overflow-y-auto flex-1 min-h-0">
          {pedidos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                No hay pedidos entregados
              </h3>
              <p className="text-slate-500">
                Los pedidos que marques como listos y cobrados aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {pedidos.map((pedido) => (
                <Card key={pedido.id} className="border-2 border-slate-300 bg-white shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-slate-800">#{pedido.id}</span>
                        {pedido.tipoEntrega === 'delivery' && (
                          <Bike className="h-3.5 w-3.5 text-blue-600" />
                        )}
                      </div>
                      <Badge className="bg-slate-700 text-white text-xs px-1.5 py-0.5">
                        ✓
                      </Badge>
                    </div>

                    <div className="mb-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">{pedido.clienteNombre}</p>
                      <p className="text-xs text-slate-500">
                        {pedido.horaEntrega && new Date(pedido.horaEntrega).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="space-y-0.5 mb-2">
                      {pedido.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-slate-700">
                          <span className="font-bold text-slate-800">{item.cantidad}x</span> {item.nombre}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t-2 border-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-slate-900">
                          ${pedido.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-slate-100"
                          onClick={() => setPedidoSeleccionado(pedido)}
                        >
                          <Eye className="h-4 w-4 text-slate-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 pt-3 border-t-2 border-slate-300">
          <Button variant="outline" onClick={onClose} className="border-slate-300">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Modal de detalles del pedido */}
      <Dialog open={!!pedidoSeleccionado} onOpenChange={() => setPedidoSeleccionado(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Package className="h-5 w-5 text-slate-700" />
              Detalles del Pedido #{pedidoSeleccionado?.id}
            </DialogTitle>
          </DialogHeader>

          {pedidoSeleccionado && (
            <div className="space-y-4 py-4 pr-2">
              {/* Información del cliente */}
              <div className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-md">
                <h3 className="text-base font-semibold text-slate-800 mb-3">👤 Cliente</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Nombre: </span>
                    <span className="text-slate-900">{pedidoSeleccionado.clienteNombre}</span>
                  </div>
                  {pedidoSeleccionado.telefono && (
                    <div>
                      <span className="font-medium text-slate-700">Teléfono: </span>
                      <span className="text-slate-900">{pedidoSeleccionado.telefono}</span>
                    </div>
                  )}
                  {pedidoSeleccionado.email && (
                    <div>
                      <span className="font-medium text-slate-700">Email: </span>
                      <span className="text-slate-900">{pedidoSeleccionado.email}</span>
                    </div>
                  )}
                  {pedidoSeleccionado.direccion && (
                    <div>
                      <span className="font-medium text-slate-700">Dirección: </span>
                      <span className="text-slate-900">{pedidoSeleccionado.direccion}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items del pedido */}
              <div className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-md">
                <h3 className="text-base font-semibold text-slate-800 mb-3">📦 Items del Pedido</h3>
                <div className="space-y-2">
                  {pedidoSeleccionado.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start border-b-2 border-slate-300 pb-2 last:border-b-0">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 text-sm">
                          {item.cantidad}x {item.nombre}
                        </div>
                        {item.extras && item.extras.length > 0 && (
                          <div className="text-xs text-slate-600 mt-1 ml-4">
                            <div className="font-medium mb-1">Extras:</div>
                            {Array.isArray(item.extras) ? (
                              item.extras.map((extra, extraIdx) => (
                                <div key={extraIdx} className="ml-2">
                                  • {typeof extra === 'string' ? extra : (extra.nombre || extra.name || JSON.stringify(extra))}
                                </div>
                              ))
                            ) : (
                              Object.entries(item.extras).map(([key, value]) => (
                                <div key={key} className="ml-2">
                                  • {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </div>
                              ))
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
                          ${((item.precio || 0) * (item.cantidad || 1)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-slate-500">
                          ${(item.precio || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })} c/u
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen financiero */}
              <div className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-md">
                <h3 className="text-base font-semibold text-slate-800 mb-3">💰 Resumen Financiero</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700 font-medium">Subtotal:</span>
                    <span className="font-bold text-slate-900">
                      ${(pedidoSeleccionado.subtotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {pedidoSeleccionado.descuento > 0 && (
                    <div className="flex justify-between text-sm text-slate-700">
                      <span className="font-medium">Descuento:</span>
                      <span className="font-bold">
                        -${(pedidoSeleccionado.descuento || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700 font-medium">IVA (21%):</span>
                    <span className="font-bold text-slate-900">
                      ${(pedidoSeleccionado.ivaTotal || pedidoSeleccionado.iva_total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t-2 border-slate-400 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-slate-900">
                      <span>TOTAL:</span>
                      <span>${(pedidoSeleccionado.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-md">
                <h3 className="text-base font-semibold text-slate-800 mb-3">ℹ️ Información Adicional</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Tipo de entrega: </span>
                    <Badge variant="outline" className={pedidoSeleccionado.tipoEntrega === 'delivery' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}>
                      {pedidoSeleccionado.tipoEntrega === 'delivery' ? 'DELIVERY' : 'RETIRO'}
                    </Badge>
                  </div>
                  {pedidoSeleccionado.medioPago && (
                    <div>
                      <span className="font-medium text-slate-700">Método de pago: </span>
                      <span className="text-slate-900 capitalize">{pedidoSeleccionado.medioPago}</span>
                    </div>
                  )}
                  {pedidoSeleccionado.horaEntrega && (
                    <div>
                      <span className="font-medium text-slate-700">Hora de entrega: </span>
                      <span className="text-slate-900">
                        {new Date(pedidoSeleccionado.horaEntrega).toLocaleString('es-AR')}
                      </span>
                    </div>
                  )}
                  {pedidoSeleccionado.observaciones && (
                    <div>
                      <span className="font-medium text-slate-700">Observaciones: </span>
                      <span className="text-slate-900">{pedidoSeleccionado.observaciones}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 pt-3 border-t-2 border-slate-300">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implementar impresión de factura/ticket para cliente
                console.log('Imprimir factura/ticket:', pedidoSeleccionado?.id);
              }}
              className="flex items-center gap-2 border-slate-300"
            >
              <Printer className="h-4 w-4" />
              Imprimir Factura/Ticket
            </Button>
            <Button variant="outline" onClick={() => setPedidoSeleccionado(null)} className="border-slate-300">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}







