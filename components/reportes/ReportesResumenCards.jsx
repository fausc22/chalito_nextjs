import { CreditCard, ShoppingBag, Percent, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import { formatCurrencyAr, formatCountAr } from './reportesUtils';

const SECONDARY_ITEMS = [
  {
    key: 'cantidadVentas',
    label: 'Cantidad de ventas',
    icon: ShoppingBag,
    formatter: formatCountAr,
  },
  {
    key: 'ticketPromedio',
    label: 'Ticket promedio',
    icon: Receipt,
    formatter: formatCurrencyAr,
  },
  {
    key: 'descuentoTotal',
    label: 'Descuentos aplicados',
    icon: Percent,
    formatter: formatCurrencyAr,
  },
];

export function ReportesResumenCards({ resumen = {} }) {
  return (
    <section className="grid gap-4 xl:grid-cols-12">
      <article className="xl:col-span-5 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-50">Total vendido</p>
            <p className="mt-2 text-3xl font-semibold leading-tight sm:text-[2.1rem]">
              {formatCurrencyAr(resumen?.totalVendido)}
            </p>
          </div>
          <span className="rounded-lg bg-white/20 p-2 border border-white/30">
            <CreditCard className="h-5 w-5" />
          </span>
        </div>
      </article>

      <div className="xl:col-span-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SECONDARY_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-600">{item.label}</p>
                  <p className="text-xl font-semibold text-slate-800 mt-2">
                    {item.formatter(resumen?.[item.key])}
                  </p>
                </div>
                <span className="rounded-lg bg-slate-100 p-2 border border-slate-200 text-slate-600">
                  <Icon className="h-4 w-4" />
                </span>
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
            tone: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          },
          {
            key: 'ventaMinima',
            label: 'Venta mínima',
            icon: TrendingDown,
            value: formatCurrencyAr(resumen?.ventaMinima),
            tone: 'text-rose-700 bg-rose-50 border-rose-200',
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

