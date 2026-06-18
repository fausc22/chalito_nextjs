import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Receipt, Loader2, AlertTriangle, Copy, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  printPedido,
  getAgentErrorMessage,
  checkPrintAgentHealth
} from '@/services/printAgentService';
import { printPayloadBrowser } from '@/lib/printUtilsBrowser';
import { isBrowserPrintFallbackEnabled } from '@/lib/printConfig';
import { buildPrintIncidentReport, copyPrintIncidentReport, openSupportEmail } from '@/lib/printIncidentReport';

const PRINT_REQUEST_TIMEOUT_MS = 20000;

export function ModalImprimir({ pedido, open, onOpenChange }) {
  const [phase, setPhase] = useState('idle');
  const [errorInfo, setErrorInfo] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);
  const [lastKind, setLastKind] = useState(null);
  const isMountedRef = useRef(true);
  const activeRequestIdRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setPhase('idle');
      setErrorInfo(null);
      setLastPayload(null);
      setLastKind(null);
    }
  }, [open]);

  const pedidoEntregado = useMemo(() => {
    const estado = String(pedido?.estado || pedido?.status || '').trim().toUpperCase();
    return estado === 'ENTREGADO';
  }, [pedido?.estado, pedido?.status]);

  const phaseLabel = useMemo(() => {
    if (phase === 'fetching') return 'Obteniendo datos del pedido…';
    if (phase === 'printing') return 'Imprimiendo en ticketera…';
    if (phase === 'success') return 'Impresión enviada';
    return null;
  }, [phase]);

  const closeModal = () => {
    if (phase === 'fetching' || phase === 'printing') return;
    onOpenChange(false);
  };

  const runThermalPrint = async (kind) => {
    if (!pedido) return;

    if (kind === 'customer' && !pedidoEntregado) {
      toast.error('No se puede imprimir la factura', {
        description: 'El pedido debe estar ENTREGADO para imprimir la factura ARCA.'
      });
      return;
    }

    const requestId = Date.now();
    activeRequestIdRef.current = requestId;
    setPhase('fetching');
    setErrorInfo(null);
    setLastKind(kind);

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Tiempo de espera agotado')), PRINT_REQUEST_TIMEOUT_MS);
      });

      setPhase('printing');
      const result = await Promise.race([printPedido(kind, pedido.id), timeoutPromise]);

      if (!isMountedRef.current || activeRequestIdRef.current !== requestId) return;

      if (result.success) {
        setPhase('success');
        setLastPayload(result.payload);
        toast.success(kind === 'kitchen' ? 'Ticket impreso' : 'Factura impresa', {
          description: 'Enviado a la ticketera'
        });
        setTimeout(() => onOpenChange(false), 600);
        return;
      }

      setLastPayload(result.payload || null);
      const agentHealth = await checkPrintAgentHealth({ force: true });
      setErrorInfo({
        code: result.code || 'UNKNOWN',
        message: result.message || getAgentErrorMessage(result.code),
        kind,
        agentHealth
      });
      setPhase('error');
    } catch (error) {
      if (!isMountedRef.current || activeRequestIdRef.current !== requestId) return;
      const agentHealth = await checkPrintAgentHealth({ force: true }).catch(() => null);
      setErrorInfo({
        code: 'UNKNOWN',
        message: error?.message || 'Error inesperado al imprimir',
        kind,
        agentHealth
      });
      setPhase('error');
    }
  };

  const handleBrowserFallback = () => {
    if (!lastPayload) {
      toast.error('Sin datos para imprimir', {
        description: 'Reintentá la impresión primero.'
      });
      return;
    }
    const ok = printPayloadBrowser(lastPayload);
    if (ok) {
      toast.info('Impresión por navegador', {
        description: 'Elegí la ticketera en el diálogo del sistema.'
      });
      onOpenChange(false);
    } else {
      toast.error('No se pudo abrir la ventana de impresión', {
        description: 'Habilitá popups en el navegador.'
      });
    }
  };

  const handleCopyReport = async () => {
    const report = buildPrintIncidentReport({
      pedidoId: pedido?.id,
      kind: lastKind || errorInfo?.kind,
      errorCode: errorInfo?.code,
      errorMessage: errorInfo?.message,
      agentHealth: errorInfo?.agentHealth,
      phase
    });
    const copied = await copyPrintIncidentReport(report);
    if (copied.success) {
      toast.success('Reporte copiado', {
        description: 'Envialo por WhatsApp a soporte para recibir ayuda.'
      });
      openSupportEmail(report);
    } else {
      toast.error('No se pudo copiar', { description: copied.error });
    }
  };

  if (!pedido) return null;

  const isBusy = phase === 'fetching' || phase === 'printing';
  const showErrorPanel = phase === 'error' && errorInfo;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Imprimir Pedido #{pedido.id}</DialogTitle>
          <DialogDescription>
            Ticket para comandera/cliente (siempre) o factura ARCA (solo pedido entregado con CAE).
          </DialogDescription>
        </DialogHeader>

        {phaseLabel && (
          <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-primary/10 px-3 py-2 text-sm text-blue-800">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            {phaseLabel}
          </div>
        )}

        {showErrorPanel && (
          <div className="rounded-md border border-amber-300 bg-amber-500/10 px-3 py-3 text-sm text-amber-900 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">No se pudo imprimir</p>
                <p className="mt-1">{errorInfo.message}</p>
                {errorInfo.code && (
                  <p className="text-xs text-amber-700 mt-1">Código: {errorInfo.code}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => runThermalPrint(errorInfo.kind || lastKind || 'kitchen')}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Reintentar
              </Button>
              {isBrowserPrintFallbackEnabled() && lastPayload && (
                <Button type="button" size="sm" variant="outline" className="h-8" onClick={handleBrowserFallback}>
                  Imprimir con navegador
                </Button>
              )}
              <Button type="button" size="sm" variant="outline" className="h-8" onClick={handleCopyReport}>
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copiar reporte
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 py-2">
          <Button
            onClick={() => runThermalPrint('kitchen')}
            disabled={isBusy}
            className="w-full justify-start gap-3 h-auto py-4 whitespace-normal"
            variant="outline"
          >
            <Printer className="h-5 w-5 shrink-0" />
            <div className="flex min-w-0 flex-col items-start text-left">
              <span className="font-semibold">Imprimir Ticket</span>
              <span className="text-xs text-muted-foreground">Comandera y cliente — disponible desde que se crea el pedido</span>
            </div>
          </Button>

          <Button
            onClick={() => runThermalPrint('customer')}
            disabled={isBusy || !pedidoEntregado}
            className="w-full justify-start gap-3 h-auto py-4 whitespace-normal"
            variant="outline"
          >
            <Receipt className="h-5 w-5 shrink-0" />
            <div className="flex min-w-0 flex-col items-start text-left">
              <span className="font-semibold">Imprimir Factura</span>
              <span className="text-xs text-muted-foreground">
                {pedidoEntregado
                  ? 'Comprobante oficial ARCA con CAE y QR'
                  : 'Requiere pedido ENTREGADO y CAE emitido'}
              </span>
            </div>
          </Button>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={closeModal} disabled={isBusy} className="w-full sm:w-auto">
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
