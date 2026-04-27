import { useMemo } from 'react';
import { formatCountAr, formatPercentage, getPercentage, safeNumber } from './reportesUtils';

const ORIGENES_ORDENADOS = ['MOSTRADOR', 'TELEFONO', 'WHATSAPP', 'WEB'];
const MODALIDADES_ORDENADAS = ['RETIRO', 'DELIVERY'];

function normalizeRows({ rows, labelKey, orderedKeys }) {
  const map = new Map(
    rows.map((row) => [
      String(row?.[labelKey] || `SIN_${labelKey.toUpperCase()}`).toUpperCase(),
      safeNumber(row?.cantidadPedidos),
    ])
  );

  const normalized = orderedKeys.map((key) => ({
    key,
    cantidad: map.get(key) || 0,
  }));

  const remaining = rows
    .filter((row) =>
      !orderedKeys.includes(String(row?.[labelKey] || `SIN_${labelKey.toUpperCase()}`).toUpperCase())
    )
    .map((row) => ({
      key: row?.[labelKey] || `SIN_${labelKey.toUpperCase()}`,
      cantidad: safeNumber(row?.cantidadPedidos),
    }));

  return [...normalized, ...remaining];
}

export function OrigenesModalidadesCard({ origenes = [], modalidades = [] }) {
  const origenesRows = useMemo(
    () =>
      normalizeRows({
        rows: Array.isArray(origenes) ? origenes : [],
        labelKey: 'origenPedido',
        orderedKeys: ORIGENES_ORDENADOS,
      }),
    [origenes]
  );

  const modalidadesRows = useMemo(
    () =>
      normalizeRows({
        rows: Array.isArray(modalidades) ? modalidades : [],
        labelKey: 'modalidad',
        orderedKeys: MODALIDADES_ORDENADAS,
      }),
    [modalidades]
  );

  const totalOrigenes = useMemo(
    () => origenesRows.reduce((acc, row) => acc + row.cantidad, 0),
    [origenesRows]
  );
  const totalModalidades = useMemo(
    () => modalidadesRows.reduce((acc, row) => acc + row.cantidad, 0),
    [modalidadesRows]
  );

  return (
    <section className="grid gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Origen de pedidos</h3>
          <p className="text-sm text-slate-500">
            Distribución de demanda según cómo ingresan los pedidos.
          </p>
        </div>

        {origenesRows.length === 0 ? (
          <p className="text-sm text-slate-600">No hay orígenes registrados.</p>
        ) : (
          <div className="space-y-3">
            {origenesRows.map((origen) => {
              const percent = getPercentage(origen.cantidad, totalOrigenes);
              return (
                <article key={origen.key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{origen.key}</p>
                    <p className="text-xs font-medium text-slate-600">{formatPercentage(percent)}</p>
                  </div>
                  <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="text-sm text-slate-600">
                    Cantidad de pedidos: <span className="font-semibold text-slate-800">{formatCountAr(origen.cantidad)}</span>
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Modalidades</h3>
          <p className="text-sm text-slate-500">
            Reparto entre retiro en local y entregas.
          </p>
        </div>

        {modalidadesRows.length === 0 ? (
          <p className="text-sm text-slate-600">No hay modalidades registradas.</p>
        ) : (
          <div className="space-y-3">
            {modalidadesRows.map((modalidad) => {
              const percent = getPercentage(modalidad.cantidad, totalModalidades);
              return (
                <article key={modalidad.key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{modalidad.key}</p>
                    <p className="text-xs font-medium text-slate-600">{formatPercentage(percent)}</p>
                  </div>
                  <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="text-sm text-slate-600">
                    Cantidad de pedidos: <span className="font-semibold text-slate-800">{formatCountAr(modalidad.cantidad)}</span>
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

