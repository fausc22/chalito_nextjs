import { Clock3, TriangleAlert } from 'lucide-react';

export function OperationalHero({ activeOrders, delayedOrders }) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Pedidos activos</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{activeOrders}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Clock3 className="h-5 w-5" />
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700">Alertas operativas</p>
            <p className="mt-1 text-3xl font-semibold text-amber-800">{delayedOrders}</p>
          </div>
          <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
            <TriangleAlert className="h-5 w-5" />
          </div>
        </div>
      </article>
    </section>
  );
}
