import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatCountAr, safeNumber } from './reportesUtils';

export function HorariosDemandaCard({ data = [] }) {
  const rows = useMemo(
    () =>
      (Array.isArray(data) ? data : [])
        .map((row) => ({
          franja: row?.franja || 'Sin franja',
          cantidadPedidos: safeNumber(row?.cantidadPedidos),
        }))
        .sort((a, b) => b.cantidadPedidos - a.cantidadPedidos),
    [data]
  );

  const maxCantidad = useMemo(
    () => rows.reduce((acc, row) => Math.max(acc, row.cantidadPedidos), 0),
    [rows]
  );

  const horarioPico = rows[0];

  if (rows.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold text-foreground">Horarios de mayor demanda</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No hay pedidos registrados para analizar la demanda.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Horarios de mayor demanda</h2>
        <p className="text-sm text-muted-foreground">
          Identificá las franjas con más pedidos para mejorar la operación.
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-primary/10 p-3 mb-3">
        <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">Horario pico</p>
        <p className="text-base font-semibold text-blue-900">
          {horarioPico?.franja || 'Sin datos'} {horarioPico?.cantidadPedidos ? `(${formatCountAr(horarioPico.cantidadPedidos)} pedidos)` : ''}
        </p>
      </div>

      <div className="space-y-2">
        {rows.map((franja) => {
          const currentCount = safeNumber(franja.cantidadPedidos);
          const isPeak = maxCantidad > 0 && currentCount === maxCantidad;
          const widthPercent = maxCantidad > 0 ? Math.max(6, (currentCount / maxCantidad) * 100) : 0;
          const pedidosLabel = currentCount === 1 ? 'pedido' : 'pedidos';
          return (
            <div
              key={franja.franja}
              className={`rounded-lg border p-3 flex items-center justify-between gap-2 ${
                isPeak ? 'border-emerald-300 bg-emerald-500/10' : 'border-border bg-muted'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{franja.franja}</p>
                {isPeak ? (
                  <Badge className="mt-1 bg-emerald-600 hover:bg-emerald-600">
                    Mayor demanda
                  </Badge>
                ) : null}
                <div className="mt-2 h-2 rounded-full bg-accent overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isPeak ? 'bg-emerald-500/100' : 'bg-primary/100'}`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {formatCountAr(currentCount)} {pedidosLabel}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

