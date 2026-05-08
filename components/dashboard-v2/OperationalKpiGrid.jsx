const STATUS_STYLES = {
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  blue: 'border-blue-200 bg-blue-50 text-blue-900',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  red: 'border-rose-200 bg-rose-50 text-rose-900',
  neutral: 'border-slate-200 bg-white text-slate-900',
};

function KpiCard({ label, value, tone = 'neutral' }) {
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${STATUS_STYLES[tone] || STATUS_STYLES.neutral}`}>
      <p className="text-sm font-medium opacity-85">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}

export function OperationalKpiGrid({ kpis }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Pedidos de hoy" value={kpis.today} />
      <KpiCard label="Pendientes" value={kpis.pending} tone="amber" />
      <KpiCard label="En preparacion" value={kpis.preparing} tone="blue" />
      <KpiCard label="Listos" value={kpis.ready} tone="green" />
      <KpiCard label="Atrasados" value={kpis.delayed} tone="red" />
      <KpiCard label="Activos" value={kpis.active} />
    </section>
  );
}
