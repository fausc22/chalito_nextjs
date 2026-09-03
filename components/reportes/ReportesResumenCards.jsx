import { DollarSign, Hash, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrencyAr, formatCountAr } from './reportesUtils';

const SECONDARY_ITEMS = [
  {
    key: 'cantidadVentas',
    label: 'Cantidad de ventas',
    icon: Hash,
    formatter: formatCountAr,
    iconWrapClass: 'rounded-lg bg-slate-600 p-2 text-white shrink-0',
    labelClass: 'text-sm text-muted-foreground',
    valueClass: 'text-xl font-bold text-foreground mt-1',
  },
  {
    key: 'ticketPromedio',
    label: 'Ticket promedio',
    icon: DollarSign,
    formatter: formatCurrencyAr,
    iconWrapClass: 'inline-flex items-center justify-center rounded-lg bg-transparent p-2 text-foreground shrink-0',
    labelClass: 'text-sm text-foreground',
    valueClass: 'text-xl font-bold text-foreground mt-1',
  },
  {
    key: 'cantidadProductosVendidos',
    label: 'Cant. productos vendidos',
    icon: Hash,
    formatter: formatCountAr,
    iconWrapClass: 'inline-flex items-center justify-center rounded-lg bg-muted p-2 border border-border text-muted-foreground shrink-0',
    labelClass: 'text-sm text-muted-foreground',
    valueClass: 'text-xl font-semibold text-foreground mt-1',
  },
];

export function ReportesResumenCards({ resumen = {} }) {
  return (
    <section className="grid gap-4 xl:grid-cols-12">
      <article className="xl:col-span-5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white shadow-sm min-h-[92px]">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-emerald-500/100 p-2 border border-emerald-400">
            <DollarSign className="h-5 w-5 text-white" />
          </span>
          <div>
            <p className="text-base font-semibold text-emerald-50">Total vendido</p>
            <p className="text-2xl font-bold leading-tight mt-1">
              {formatCurrencyAr(resumen?.totalVendido)}
            </p>
          </div>
        </div>
      </article>

      <div className="xl:col-span-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SECONDARY_ITEMS.map((item) => {
          const Icon = item.icon;
          const isLeftIconMetric = item.key === 'cantidadVentas' || item.key === 'ticketPromedio' || item.key === 'cantidadProductosVendidos';
          return (
            <article key={item.key} className="rounded-xl border border-border bg-card p-4 shadow-sm min-h-[92px]">
              <div className="flex items-start justify-between gap-2">
                {isLeftIconMetric ? (
                  <div className="flex items-center gap-3">
                    <span className={item.iconWrapClass}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className={item.labelClass}>{item.label}</p>
                      <p className={item.valueClass}>
                        {item.formatter(resumen?.[item.key])}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className={item.labelClass}>{item.label}</p>
                      <p className={item.valueClass}>
                        {item.formatter(resumen?.[item.key])}
                      </p>
                    </div>
                    <span className={item.iconWrapClass}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="xl:col-span-12 grid gap-3 sm:grid-cols-2">
        {[
          {
            key: 'ventaMaxima',
            label: 'Venta máxima',
            icon: TrendingUp,
            value: formatCurrencyAr(resumen?.ventaMaxima),
            tone: 'text-emerald-700 bg-emerald-500/10 border-emerald-200',
          },
          {
            key: 'ventaMinima',
            label: 'Venta mínima',
            icon: TrendingDown,
            value: formatCurrencyAr(resumen?.ventaMinima),
            tone: 'text-red-700 bg-destructive/10 border-red-200',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.key} className={`rounded-lg border p-3 shadow-sm ${item.tone}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-85">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold">{item.value}</p>
                </div>
                <Icon className="h-4 w-4 opacity-80" />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

