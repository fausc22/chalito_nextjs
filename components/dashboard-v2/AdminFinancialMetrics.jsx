function MoneyCard({ label, value }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">
        ${Number(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
      </p>
    </article>
  );
}

export function AdminFinancialMetrics({ metrics }) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-base font-semibold text-slate-900">Metricas financieras</h2>
        <p className="mt-1 text-sm text-slate-500">Visible solo para perfiles administradores.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <MoneyCard label="Ventas del dia" value={metrics.ventasDelDia} />
        <MoneyCard label="Total cobrado" value={metrics.totalCobrado} />
        <MoneyCard label="Ticket promedio" value={metrics.ticketPromedio} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Medios de pago</h3>
          <div className="mt-3 space-y-2">
            {metrics.mediosPago.length === 0 ? (
              <p className="text-sm text-slate-500">Sin datos disponibles.</p>
            ) : (
              metrics.mediosPago.slice(0, 4).map((item, idx) => (
                <div key={`${item.metodo || item.label || idx}`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{item.metodo || item.label || 'Metodo'}</span>
                    <span>{Number(item.porcentaje || item.percent || 0).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${Math.max(0, Math.min(100, Number(item.porcentaje || item.percent || 0)))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Productos mas vendidos</h3>
          <div className="mt-3 space-y-2">
            {metrics.productosMasVendidos.length === 0 ? (
              <p className="text-sm text-slate-500">Sin datos disponibles.</p>
            ) : (
              metrics.productosMasVendidos.slice(0, 5).map((item, idx) => (
                <div
                  key={`${item.id || item.articulo_id || idx}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <span className="truncate text-slate-700">{item.nombre || item.producto || `Producto ${idx + 1}`}</span>
                  <span className="font-semibold text-slate-900">{item.cantidad || item.unidades || 0}</span>
                </div>
              ))
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
