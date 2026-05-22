import { useCallback, useEffect, useState } from 'react';
import { Bike, Eye, Loader2, Printer } from 'lucide-react';
import { getItemExtras } from '@/lib/extrasUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { pedidosService } from '@/services/pedidosService';

const ITEMS_POR_PAGINA_DEFAULT = 20;

function formatHoraEntrega(pedido) {
  const raw = pedido.horaEntrega || pedido.horario_entrega || pedido.horario_entrega_formateado;
  if (!raw) return null;
  const fecha = new Date(raw);
  if (Number.isNaN(fecha.getTime())) return String(raw);
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const año = fecha.getFullYear();
  return `${dia}/${mes}/${año} ${horas}:${minutos}`;
}

export function ModalPedidosEntregados({ isOpen, onClose, onImprimirPedido }) {
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(ITEMS_POR_PAGINA_DEFAULT);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cargarPagina = useCallback(async (page) => {
    setLoading(true);
    setError('');
    try {
      const result = await pedidosService.obtenerPedidosEntregados({
        page,
        limit: itemsPorPagina,
      });
      if (!result.success) {
        setPedidos([]);
        setPagination(null);
        setError(result.error || 'No se pudieron cargar los pedidos entregados');
        return;
      }
      setPedidos(result.data || []);
      setPagination(result.pagination);
      setPaginaActual(page);
    } catch (err) {
      setPedidos([]);
      setPagination(null);
      setError(err?.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }, [itemsPorPagina]);

  useEffect(() => {
    if (!isOpen) {
      setPedidoSeleccionado(null);
      return;
    }
    setPaginaActual(1);
    cargarPagina(1);
  }, [isOpen, cargarPagina]);

  const handleClose = (open) => {
    if (!open) {
      setPedidoSeleccionado(null);
      onClose?.();
    }
  };

  const totalPaginas = pagination?.totalPages ?? 1;
  const totalRegistros = pagination?.total ?? pedidos.length;
  const inicio = totalRegistros === 0 ? 0 : (paginaActual - 1) * itemsPorPagina + 1;
  const fin = Math.min(paginaActual * itemsPorPagina, totalRegistros);

  const abrirDetalle = async (pedido) => {
    if (pedido?.items?.length) {
      setPedidoSeleccionado(pedido);
      return;
    }
    const result = await pedidosService.obtenerPedidoPorId(pedido.id);
    if (result.success && result.data) {
      setPedidoSeleccionado(result.data);
    } else {
      setPedidoSeleccionado(pedido);
    }
  };

  const irAPagina = (nuevaPagina) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPaginas || loading) return;
    cargarPagina(nuevaPagina);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-0.75rem)] sm:w-full max-w-4xl h-[90dvh] sm:h-[85vh] flex flex-col p-3 sm:p-6">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            Pedidos Entregados
            <Badge className="bg-slate-700 text-white ml-2 text-xs">
              {loading && !pagination ? '…' : totalRegistros}
            </Badge>
          </DialogTitle>
          {pagination ? (
            <p className="text-xs text-muted-foreground">Historial completo · entregados y cobrados</p>
          ) : null}
        </DialogHeader>

        <div className="py-3 overflow-y-auto flex-1 min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Cargando pedidos…</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-red-600 text-sm">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => cargarPagina(paginaActual)}>
                Reintentar
              </Button>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">No hay pedidos entregados</h3>
              <p className="text-muted-foreground">
                Los pedidos que marques como listos y cobrados aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
              {pedidos.map((pedido) => {
                const items = pedido.items || [];
                const itemsToShow = items.slice(0, 6);
                const remaining = items.length - itemsToShow.length;
                return (
                  <Card
                    key={pedido.id}
                    className="flex flex-col h-full border border-border bg-card shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden"
                  >
                    <CardContent className="p-3 flex flex-col flex-1 min-h-0">
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-foreground">#{pedido.id}</span>
                            {pedido.tipoEntrega === 'delivery' && (
                              <Bike className="h-3.5 w-3.5 text-blue-600" />
                            )}
                          </div>
                          <Badge className="bg-green-600 text-white text-xs px-1.5 py-0.5">✓</Badge>
                        </div>
                        <p className="text-sm font-semibold text-foreground truncate mb-2">
                          {pedido.clienteNombre}
                        </p>
                        <div className="space-y-0.5">
                          {itemsToShow.map((item, idx) => (
                            <div key={idx} className="text-xs text-foreground">
                              <span className="font-bold text-foreground">{item.cantidad}x</span> {item.nombre}
                            </div>
                          ))}
                          {remaining > 0 && (
                            <p className="text-[11px] text-muted-foreground italic">
                              … y {remaining} ítem{remaining > 1 ? 's' : ''} más
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 pt-2 border-t border-border flex justify-between items-center">
                        <span className="text-base font-bold text-foreground">
                          ${pedido.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-muted"
                          onClick={() => abrirDetalle(pedido)}
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 pt-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {totalRegistros > 0
              ? `Mostrando ${inicio}–${fin} de ${totalRegistros} · Página ${paginaActual} de ${totalPaginas}`
              : `Página ${paginaActual} de ${totalPaginas}`}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => irAPagina(paginaActual - 1)}
              disabled={paginaActual <= 1 || loading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => irAPagina(paginaActual + 1)}
              disabled={paginaActual >= totalPaginas || loading}
            >
              Siguiente
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <Dialog open={!!pedidoSeleccionado} onOpenChange={() => setPedidoSeleccionado(null)}>
        <DialogContent className="w-[calc(100vw-0.75rem)] sm:w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Detalles del Pedido #{pedidoSeleccionado?.id}
            </DialogTitle>
          </DialogHeader>

          {pedidoSeleccionado && (
            <div className="space-y-4 py-4 pr-2">
              <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
                <h3 className="text-base font-semibold text-foreground mb-3">Cliente</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium text-foreground">Nombre: </span>
                    {pedidoSeleccionado.clienteNombre}
                  </p>
                  {pedidoSeleccionado.telefono && (
                    <p>
                      <span className="font-medium text-foreground">Teléfono: </span>
                      {pedidoSeleccionado.telefono}
                    </p>
                  )}
                  {pedidoSeleccionado.email && (
                    <p>
                      <span className="font-medium text-foreground">Email: </span>
                      {pedidoSeleccionado.email}
                    </p>
                  )}
                  {pedidoSeleccionado.direccion && (
                    <p>
                      <span className="font-medium text-foreground">Dirección: </span>
                      {pedidoSeleccionado.direccion}
                    </p>
                  )}
                  {pedidoSeleccionado.observaciones && (
                    <p>
                      <span className="font-medium text-foreground">Observaciones: </span>
                      {pedidoSeleccionado.observaciones}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
                <h3 className="text-base font-semibold text-foreground mb-3">Items del Pedido</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {pedidoSeleccionado.items?.map((item, idx) => {
                    const { extras } = getItemExtras(item);
                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row gap-2 justify-between border-b border-border pb-2 last:border-b-0"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">
                            {item.cantidad}x {item.nombre}
                          </p>
                          {extras.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1 ml-4">
                              <p className="font-medium mb-1">Extras:</p>
                              {extras.map((extra, extraIdx) => (
                                <p key={extraIdx} className="ml-2">
                                  • {extra.nombre}
                                  {extra.precio > 0 ? ` +$${extra.precio.toLocaleString('es-AR')}` : ''}
                                </p>
                              ))}
                            </div>
                          )}
                          {item.observaciones && (
                            <p className="text-xs text-muted-foreground italic mt-1 ml-4">Obs: {item.observaciones}</p>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          ${((item.precio || 0) * (item.cantidad || 1)).toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
                <h3 className="text-base font-semibold text-foreground mb-3">Total</h3>
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>TOTAL:</span>
                  <span>
                    ${(pedidoSeleccionado.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
                <h3 className="text-base font-semibold text-foreground mb-3">Información adicional</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium text-foreground">Tipo de entrega: </span>
                    <Badge
                      variant="outline"
                      className={
                        pedidoSeleccionado.tipoEntrega === 'delivery'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }
                    >
                      {pedidoSeleccionado.tipoEntrega === 'delivery' ? 'DELIVERY' : 'RETIRO'}
                    </Badge>
                  </p>
                  {pedidoSeleccionado.medioPago && (
                    <p>
                      <span className="font-medium text-foreground">Método de pago: </span>
                      <span className="capitalize">{pedidoSeleccionado.medioPago}</span>
                    </p>
                  )}
                  {formatHoraEntrega(pedidoSeleccionado) && (
                    <p>
                      <span className="font-medium text-foreground">Hora de entrega: </span>
                      {formatHoraEntrega(pedidoSeleccionado)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t-2 border-border sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                if (pedidoSeleccionado && onImprimirPedido) onImprimirPedido(pedidoSeleccionado);
                setPedidoSeleccionado(null);
              }}
              className="flex items-center gap-2 border-border"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={() => setPedidoSeleccionado(null)} className="border-border">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
