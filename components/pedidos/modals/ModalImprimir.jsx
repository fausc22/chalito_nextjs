import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Receipt } from 'lucide-react';
import { pedidosService } from '@/services/pedidosService';
import { toast } from '@/hooks/use-toast';
import { imprimirComanda, imprimirTicket } from '@/lib/printUtils';

const PRINT_REQUEST_TIMEOUT_MS = 15000;
const isPedidosDebugEnabled = () => {
  if (typeof window === 'undefined') return false;
  return window.__PEDIDOS_DEBUG__ === true || window.localStorage?.getItem('pedidos_debug') === '1';
};

const debugPrint = (event, payload = {}) => {
  if (!isPedidosDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.debug(`[PedidosDebug][ModalImprimir] ${event}`, payload);
};

export function ModalImprimir({ pedido, open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(false);
  const activeRequestIdRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    debugPrint('mount');
    return () => {
      isMountedRef.current = false;
      debugPrint('unmount');
    };
  }, []);

  useEffect(() => {
    debugPrint('open_state_change', {
      open,
      pedidoId: pedido?.id ?? null,
      loading,
    });
  }, [open, pedido?.id, loading]);

  const canPrintTicket = useMemo(() => pedido?.paymentStatus === 'paid', [pedido?.paymentStatus]);

  const closeModal = () => {
    if (loading) {
      debugPrint('close_blocked_loading', { pedidoId: pedido?.id ?? null });
      return;
    }
    debugPrint('close_requested', { pedidoId: pedido?.id ?? null });
    onOpenChange(false);
  };

  const runPrint = async ({ type, fetchData, executePrint, invalidMessage }) => {
    if (!pedido) return;

    if (invalidMessage) {
      toast.error('No se puede imprimir el ticket', {
        description: invalidMessage,
      });
      return;
    }

    const requestId = Date.now();
    activeRequestIdRef.current = requestId;
    setLoading(true);
    debugPrint('print_start', {
      requestId,
      type,
      pedidoId: pedido.id,
    });

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Timeout al obtener datos para ${type}`));
        }, PRINT_REQUEST_TIMEOUT_MS);
      });
      const response = await Promise.race([fetchData(pedido.id), timeoutPromise]);

      if (!response.success) {
        debugPrint('print_fetch_failed', {
          requestId,
          type,
          pedidoId: pedido.id,
          error: response.error || null,
        });
        toast.error(`Error al imprimir ${type}`, {
          description: response.error || `No se pudo obtener los datos de ${type}`,
        });
        return;
      }

      debugPrint('print_execute', {
        requestId,
        type,
        pedidoId: pedido.id,
      });
      executePrint(response.data);
      onOpenChange(false);
    } catch (error) {
      debugPrint('print_exception', {
        requestId,
        type,
        pedidoId: pedido.id,
        error: error?.message || String(error),
      });
      console.error(`Error al imprimir ${type}:`, error);
      toast.error(`Error al imprimir ${type}`, {
        description: error?.message || 'Ocurrió un error inesperado',
      });
    } finally {
      if (!isMountedRef.current || activeRequestIdRef.current !== requestId) {
        return;
      }
      setLoading(false);
      debugPrint('print_end', {
        requestId,
        type,
        pedidoId: pedido.id,
      });
    }
  };

  const handleImprimirComanda = async () => {
    await runPrint({
      type: 'comanda',
      fetchData: pedidosService.obtenerComandaParaImprimir,
      executePrint: imprimirComanda,
    });
  };

  const handleImprimirTicket = async () => {
    await runPrint({
      type: 'ticket',
      fetchData: pedidosService.obtenerTicketParaImprimir,
      executePrint: imprimirTicket,
      invalidMessage: canPrintTicket ? null : 'El pedido debe estar cobrado para imprimir el ticket/factura',
    });
  };

  if (!pedido) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100vw-0.75rem)] sm:w-full sm:max-w-md"
        onCloseAutoFocus={() => {
          debugPrint('close_auto_focus');
        }}
      >
        <DialogHeader>
          <DialogTitle>Imprimir Pedido #{pedido.id}</DialogTitle>
          <DialogDescription>
            Elegi el tipo de impresion para este pedido. Al cerrar, la pantalla de pedidos debe seguir disponible inmediatamente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          <Button
            onClick={handleImprimirComanda}
            disabled={loading}
            className="w-full justify-start gap-3 h-auto py-4"
            variant="outline"
          >
            <Printer className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Imprimir Comanda</span>
            </div>
          </Button>

          <Button
            onClick={handleImprimirTicket}
            disabled={loading || !canPrintTicket}
            className="w-full justify-start gap-3 h-auto py-4"
            variant="outline"
          >
            <Receipt className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Imprimir Ticket / Factura</span>
              <span className="text-xs text-slate-500">
                {canPrintTicket
                  ? 'Solo disponible si está cobrado' 
                  : 'El pedido debe estar cobrado'}
              </span>
            </div>
          </Button>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={closeModal} disabled={loading} className="w-full sm:w-auto">
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

