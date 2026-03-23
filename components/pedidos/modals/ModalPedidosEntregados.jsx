import { useMemo, useState, useEffect } from 'react';
import { Bike, Eye, Printer } from 'lucide-react';
import { getItemExtras } from '@/lib/extrasUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ModalPedidosEntregados({ pedidos, isOpen, onClose }) {
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(6);

  // Calcular items por página de forma responsiva según ancho de ventana
  useEffect(() => {
    const calcularItemsPorPagina = () => {
      if (typeof window === 'undefined') return;
      const width = window.innerWidth;
      if (width < 640) {
        // Mobile: menos items
        setItemsPorPagina(4);
      } else if (width < 1024) {
        // Tablets / notebooks pequeños
        setItemsPorPagina(6);
      } else {
        // Pantallas grandes
        setItemsPorPagina(9);
      }
    };

    calcularItemsPorPagina();
    window.addEventListener('resize', calcularItemsPorPagina);
    return () => window.removeEventListener('resize', calcularItemsPorPagina);
  }, []);

  // Ordenar pedidos entregados: más recientes primero (por horaEntrega / horario_entrega / id)
  const pedidosOrdenados = useMemo(() => {
    if (!pedidos || pedidos.length === 0) return [];

    const getEntregaTime = (p) => {
      if (p.horaEntrega) {
        const d = new Date(p.horaEntrega);
        const t = d.getTime();
        if (!Number.isNaN(t)) return t;
      }
      if (p.horario_entrega) {
        const d = new Date(p.horario_entrega);
        const t = d.getTime();
        if (!Number.isNaN(t)) return t;
      }
      const idNum = Number(p.id);
      return Number.isNaN(idNum) ? 0 : idNum;
    };

    const copia = [...pedidos];
    copia.sort((a, b) => getEntregaTime(b) - getEntregaTime(a));
    return copia;
  }, [pedidos]);

  const totalPaginas = useMemo(() => {
    if (!pedidosOrdenados || pedidosOrdenados.length === 0) return 1;
    return Math.ceil(pedidosOrdenados.length / itemsPorPagina);
  }, [pedidosOrdenados, itemsPorPagina]);

  const pedidosPaginados = useMemo(() => {
    if (!pedidosOrdenados || pedidosOrdenados.length === 0) return [];
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return pedidosOrdenados.slice(inicio, fin);
  }, [pedidosOrdenados, paginaActual, itemsPorPagina]);

  const irAPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-0.75rem)] sm:w-full max-w-4xl h-[90dvh] sm:h-[85vh] flex flex-col p-3 sm:p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            Pedidos Entregados
            <Badge className="bg-slate-700 text-white ml-2 text-xs">
              {pedidos.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="py-3 overflow-y-auto flex-1 min-h-0">
          {pedidos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                No hay pedidos entregados
              </h3>
              <p className="text-slate-500">
                Los pedidos que marques como listos y cobrados aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
              {pedidosPaginados.map((pedido) => (
                <Card key={pedido.id} className="flex flex-col h-full border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden">
                  <CardContent className="p-3 flex flex-col flex-1 min-h-0">
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-slate-800">#{pedido.id}</span>
                          {pedido.tipoEntrega === 'delivery' && (
                            <Bike className="h-3.5 w-3.5 text-blue-600" />
                          )}
                        </div>
                        <Badge className="bg-green-600 text-white text-xs px-1.5 py-0.5">
                          ✓
                        </Badge>
                      </div>

                      <div className="mb-2">
                        <p className="text-sm font-semibold text-slate-800 truncate">{pedido.clienteNombre}</p>
                      </div>

                      <div className="space-y-0.5">
                        {(() => {
                          const items = pedido.items || [];
                          const maxItemsPreview = 6;
                          const itemsToShow = items.slice(0, maxItemsPreview);
                          const remaining = items.length - itemsToShow.length;

                          return (
                            <>
                              {itemsToShow.map((item, idx) => (
                                <div key={idx} className="text-xs text-slate-700">
                                  <span className="font-bold text-slate-800">{item.cantidad}x</span> {item.nombre}
                                </div>
                              ))}
                              {remaining > 0 && (
                                <div className="text-[11px] text-slate-500 italic">
                                  … y {remaining} ítem{remaining > 1 ? 's' : ''} más
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between items-center">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-xs text-slate-500">
            Página {paginaActual} de {totalPaginas}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => irAPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => irAPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Modal de detalles del pedido */}
      <Dialog open={!!pedidoSeleccionado} onOpenChange={() => setPedidoSeleccionado(null)}>
        <DialogContent className="w-[calc(100vw-0.75rem)] sm:w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Detalles del Pedido #{pedidoSeleccionado?.id}
            </DialogTitle>
          </DialogHeader>

          {pedidoSeleccionado && (
            <div className="space-y-4 py-4 pr-2">
              {/* Información del cliente */}
              <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
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
                  {pedidoSeleccionado.observaciones && (
                    <div>
                      <span className="font-medium text-slate-700">Observaciones: </span>
                      <span className="text-slate-900">{pedidoSeleccionado.observaciones}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items del pedido */}
              <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                <h3 className="text-base font-semibold text-slate-800 mb-3">📦 Items del Pedido</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {pedidoSeleccionado.items?.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-between items-start border-b border-slate-200 pb-2 last:border-b-0">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 text-sm">
                          {item.cantidad}x {item.nombre}
                        </div>
                        {(() => {
                          const { extras } = getItemExtras(item);
                          return extras.length > 0 && (
                            <div className="text-xs text-slate-600 mt-1 ml-4">
                              <div className="font-medium mb-1">Extras:</div>
                              {extras.map((extra, extraIdx) => (
                                <div key={extraIdx} className="ml-2">
                                  • {extra.nombre}  {extra.precio > 0 ? `+$${extra.precio.toLocaleString('es-AR')}` : ''}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
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
              <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
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
              <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
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
                  {(pedidoSeleccionado.horaEntrega || pedidoSeleccionado.horario_entrega || pedidoSeleccionado.horario_entrega_formateado) && (
                    <div>
                      <span className="font-medium text-slate-700">Hora de entrega: </span>
                      <span className="text-slate-900">
                        {(() => {
                          // Prioridad:
                          // 1) horaEntrega (Date o string con fecha real de entrega)
                          // 2) horario_entrega (del backend, si viene con fecha/hora completa)
                          // 3) horario_entrega_formateado (fallback solo hora/minutos)
                          const raw =
                            pedidoSeleccionado.horaEntrega ||
                            pedidoSeleccionado.horario_entrega ||
                            pedidoSeleccionado.horario_entrega_formateado;

                          const fecha = new Date(raw);

                          if (Number.isNaN(fecha.getTime())) {
                            // Si no se puede parsear como fecha, mostrar el valor crudo
                            return String(raw);
                          }

                          const horas = String(fecha.getHours()).padStart(2, '0');
                          const minutos = String(fecha.getMinutes()).padStart(2, '0');
                          const dia = String(fecha.getDate()).padStart(2, '0');
                          const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                          const año = fecha.getFullYear();
                          return `${dia}/${mes}/${año} ${horas}:${minutos}`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t-2 border-slate-300">
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







