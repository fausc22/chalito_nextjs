import Link from 'next/link';
import { AlertTriangle, CheckCircle2, WifiOff } from 'lucide-react';
import { ROUTES } from '@/config/routes';

function PulseChip({ href, children, tone = 'neutral' }) {
  const tones = {
    danger: 'border-red-200 bg-destructive/10 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200',
    warning:
      'border-amber-200 bg-amber-500/10 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200',
    ok: 'border-emerald-200 bg-emerald-500/10 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200',
  };

  const className = `inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-90 ${tones[tone] || tones.neutral}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return <span className={className}>{children}</span>;
}

export function HomePulseStrip({
  pedidosAtrasadosCount = 0,
  workerActive = true,
  pollingActive = true,
  lastPollingError = null,
}) {
  const systemIssue = !workerActive || !pollingActive || Boolean(lastPollingError);
  const hasDelayed = pedidosAtrasadosCount > 0;
  const hasAlerts = hasDelayed || systemIssue;

  if (!hasAlerts) {
    return (
      <section className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
        <p className="text-sm font-medium text-foreground">Operación al día</p>
      </section>
    );
  }

  return (
    <section className="flex flex-wrap gap-2">
      {hasDelayed ? (
        <PulseChip href={ROUTES.PEDIDOS} tone="danger">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {pedidosAtrasadosCount} pedido{pedidosAtrasadosCount !== 1 ? 's atrasados' : ' atrasado'}
        </PulseChip>
      ) : null}
      {systemIssue ? (
        <PulseChip href={ROUTES.PEDIDOS} tone="warning">
          <WifiOff className="h-4 w-4 shrink-0" />
          Revisar estado del sistema
        </PulseChip>
      ) : null}
    </section>
  );
}
