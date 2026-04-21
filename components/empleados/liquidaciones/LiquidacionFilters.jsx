import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const MESES = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

export function LiquidacionFilters({
  filters,
  empleados,
  onChange,
  onModeChange,
  onCalculate,
  calculando,
}) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, idx) => String(currentYear - 3 + idx));
  const isPorMes = filters.modo_calculo === 'mes';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-800">
          Seleccioná empleado y período por mes o rango para generar la liquidación
        </p>
      </div>

      <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => onModeChange('mes')}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            isPorMes
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          )}
        >
          Por mes
        </button>
        <button
          type="button"
          onClick={() => onModeChange('rango')}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            !isPorMes
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          )}
        >
          Por rango
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="xl:col-span-1">
          <Label htmlFor="liquidacion-empleado">Empleado *</Label>
          <select
            id="liquidacion-empleado"
            value={filters.empleado_id}
            onChange={(event) => onChange('empleado_id', event.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Seleccionar empleado</option>
            {empleados.map((empleado) => (
              <option key={empleado.id} value={empleado.id}>
                {empleado.nombreCompleto}
              </option>
            ))}
          </select>
        </div>

        {isPorMes ? (
          <>
            <div>
              <Label htmlFor="liquidacion-anio">Año *</Label>
              <select
                id="liquidacion-anio"
                value={filters.anio}
                onChange={(event) => onChange('anio', event.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="liquidacion-mes">Mes *</Label>
              <select
                id="liquidacion-mes"
                value={filters.mes}
                onChange={(event) => onChange('mes', event.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {MESES.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <Label htmlFor="liquidacion-desde">Fecha desde *</Label>
              <Input
                id="liquidacion-desde"
                type="date"
                className="mt-1"
                value={filters.fecha_desde}
                onChange={(event) => onChange('fecha_desde', event.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="liquidacion-hasta">Fecha hasta *</Label>
              <Input
                id="liquidacion-hasta"
                type="date"
                className="mt-1"
                value={filters.fecha_hasta}
                onChange={(event) => onChange('fecha_hasta', event.target.value)}
              />
            </div>
          </>
        )}

        <div className="flex items-end">
          <Button
            type="button"
            onClick={onCalculate}
            disabled={calculando}
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <Calculator className={`h-4 w-4 ${calculando ? 'animate-pulse' : ''}`} />
            {calculando ? 'Calculando...' : 'Calcular'}
          </Button>
        </div>
      </div>
    </div>
  );
}
