export function RecentActivityPanel({ items }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Actividad reciente</h2>
      </header>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Todavia no hay actividad reciente para mostrar.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-800">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
