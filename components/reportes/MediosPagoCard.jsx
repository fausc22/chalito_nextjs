import { useMemo } from 'react';
import {
  formatCountAr,
  formatCurrencyAr,
  formatPercentage,
  getPercentage,
  safeNumber,
} from './reportesUtils';

export function MediosPagoCard({ data = [] }) {
  const rows = useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((medio) => ({
        nombre: medio?.medioPago || 'SIN_MEDIO_PAGO',
        cantidadVentas: safeNumber(medio?.cantidadVentas),
        totalVendido: safeNumber(medio?.totalVendido),
      })),
    [data]
  );

  const totalVentas = useMemo(
    () => rows.reduce((acc, row) => acc + row.totalVendido, 0),
    [rows]
  );
  const totalCantidad = useMemo(
    () => rows.reduce((acc, row) => acc + row.cantidadVentas, 0),
    [rows]
  );

  if (rows.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold text-slate-800">Medios de pago</h2>
        <p className="mt-2 text-sm text-slate-600">No hay medios de pago registrados.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Medios de pago</h2>
        <p className="text-sm text-slate-500">
          Distribución de ventas por método de cobro.
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((medio, index) => {
          const percent = totalVentas > 0
            ? getPercentage(medio.totalVendido, totalVentas)
            : getPercentage(medio.cantidadVentas, totalCantidad);

          return (
            <article key={`${medio.nombre}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{medio.nombre}</p>
                <p className="text-xs font-medium text-slate-600">{formatPercentage(percent)}</p>
              </div>
              <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                <p>
                  Cantidad: <span className="font-semibold text-slate-800">{formatCountAr(medio.cantidadVentas)}</span>
                </p>
                <p>
                  Total vendido: <span className="font-semibold text-slate-800">{formatCurrencyAr(medio.totalVendido)}</span>
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

