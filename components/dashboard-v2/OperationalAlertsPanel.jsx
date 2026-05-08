import { CircleAlert } from 'lucide-react';

export function OperationalAlertsPanel({ alerts }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-center gap-2">
        <CircleAlert className="h-4 w-4 text-amber-600" />
        <h2 className="text-base font-semibold text-slate-900">Alertas operativas</h2>
      </header>
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            Todo en orden. No hay alertas activas.
          </p>
        ) : (
          alerts.map((alert) => (
            <article
              key={alert.id}
              className={`rounded-xl border p-3 text-sm ${
                alert.level === 'danger'
                  ? 'border-rose-200 bg-rose-50 text-rose-800'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              <p className="font-medium">{alert.title}</p>
              <p className="mt-1 opacity-90">{alert.description}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
