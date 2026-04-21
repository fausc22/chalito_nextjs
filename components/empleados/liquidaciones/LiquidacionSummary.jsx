import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formatMoney = (amount) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
}).format(Number(amount) || 0);

const formatNumber = (value, digits = 2) => `${(Number(value) || 0).toFixed(digits)}`;

const SummaryMetric = ({ label, value, accentClass = 'text-slate-900' }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-3.5">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className={`mt-1 text-base font-semibold sm:text-lg ${accentClass}`}>{value}</p>
  </div>
);

export function LiquidacionSummary({
  liquidacion,
  periodTitle,
  periodRangeLabel,
  ultimaAsistenciaLabel,
  onGuardar,
  guardando,
  canGuardar = true,
}) {
  if (!liquidacion) return null;

  return (
    <Card id="panel-calculo" className="border-slate-200 shadow-sm">
      <CardHeader className="gap-4 border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg text-slate-800">Liquidación calculada</CardTitle>
            <p className="mt-1 text-lg text-slate-700">{liquidacion.empleadoNombre}</p>
            <p className="mt-2 text-md font-medium text-slate-700">
              Periodo liquidado: {periodTitle}
            </p>
            {periodRangeLabel ? (
              <p className="mt-1 text-md text-slate-500">{periodRangeLabel}</p>
            ) : null}
            {ultimaAsistenciaLabel ? (
              <p className="mt-1 text-md text-slate-500">
                Ultima asistencia del mes: {ultimaAsistenciaLabel}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            onClick={onGuardar}
            disabled={guardando || !canGuardar}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {guardando ? 'Guardando...' : canGuardar ? 'Guardar liquidación' : 'Liquidación guardada'}
          </Button>
        </div>

        <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Total a pagar</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {formatMoney(liquidacion.totalFinal)}
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Resultado final de la liquidación para el periodo seleccionado.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trabajo</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SummaryMetric label="Valor hora" value={formatMoney(liquidacion.valorHora)} />
              <SummaryMetric label="Total horas" value={(liquidacion.totalHoras)} />
              <SummaryMetric label="Total asistencias" value={formatNumber(liquidacion.totalAsistencias, 0)} />
              <SummaryMetric label="Total minutos" value={formatNumber(liquidacion.totalMinutos, 0)} />
              <SummaryMetric
                label="Total base"
                value={formatMoney(liquidacion.totalBase)}
                accentClass="text-blue-900"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Movimientos</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SummaryMetric label="Bonos" value={formatMoney(liquidacion.bonos)} accentClass="text-emerald-700" />
              <SummaryMetric label="Adelantos" value={formatMoney(liquidacion.adelantos)} accentClass="text-black" />
              <SummaryMetric label="Descuentos" value={formatMoney(liquidacion.descuentos)} accentClass="text-red-700" />
              <SummaryMetric label="Consumos" value={formatMoney(liquidacion.consumos)} accentClass="text-black" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
