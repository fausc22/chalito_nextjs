import { useCallback, useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { checkPrintAgentHealth } from '@/services/printAgentService';
import { isPrintAgentEnabled } from '@/lib/printConfig';

const POLL_MS = 30000;

/**
 * Indicador de estado del agente de impresión local (sidebar Pedidos)
 */
export function PrinterStatusIndicator({ onOpenHelp, compact = false }) {
  const [status, setStatus] = useState('checking');
  const [tooltip, setTooltip] = useState('Verificando impresora…');

  const refresh = useCallback(async () => {
    if (!isPrintAgentEnabled()) {
      setStatus('disabled');
      setTooltip('Impresión por agente deshabilitada');
      return;
    }
    setStatus('checking');
    const health = await checkPrintAgentHealth({ force: true });
    if (health.ok) {
      setStatus('online');
      setTooltip(
        health.simulate
          ? 'Agente OK (simulación)'
          : `Impresora lista${health.printerName ? `: ${health.printerName}` : ''}`
      );
    } else {
      setStatus('offline');
      setTooltip(health.message || 'Sin agente — clic para ayuda');
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  if (!isPrintAgentEnabled()) return null;

  const colorClass =
    status === 'online'
      ? 'bg-emerald-500/100'
      : status === 'checking'
        ? 'bg-slate-400 animate-pulse'
        : 'bg-destructive/100';

  return (
    <button
      type="button"
      onClick={onOpenHelp}
      className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-slate-700/80 ${
        compact ? 'w-full justify-center' : ''
      }`}
      title={tooltip}
      aria-label={tooltip}
    >
      <Printer className="h-3.5 w-3.5 text-slate-300 shrink-0" />
      {!compact && (
        <span className="text-[10px] font-medium text-slate-300 truncate max-w-[100px]">
          {status === 'online' ? 'Impresora' : status === 'checking' ? '…' : 'Sin agente'}
        </span>
      )}
      <span className={`h-2 w-2 rounded-full shrink-0 ${colorClass}`} />
    </button>
  );
}
