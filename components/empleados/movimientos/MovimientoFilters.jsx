import { Filter, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const TIPO_OPTIONS = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'BONO', label: 'Bonos' },
  { value: 'DESCUENTO', label: 'Descuentos' },
  { value: 'ADELANTO', label: 'Adelantos' },
  { value: 'CONSUMO', label: 'Consumos' },
];

export function MovimientoFilters({
  filtros,
  empleados,
  loading,
  onChange,
  onClear,
  onRefresh,
}) {
  const hasActiveFilters = Boolean(
    (filtros.empleado_id && filtros.empleado_id !== 'all')
    || (filtros.tipo && filtros.tipo !== 'all')
    || filtros.fecha_desde
    || filtros.fecha_hasta
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Filter className="h-4 w-4" />
        Filtros
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_0.9fr_0.9fr_auto]">
        <select
          value={filtros.empleado_id}
          onChange={(event) => onChange('empleado_id', event.target.value)}
          className="h-10 min-w-[210px] rounded-md border border-slate-300 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">Todos los empleados</option>
          {empleados.map((empleado) => (
            <option key={empleado.id} value={empleado.id}>
              {empleado.nombreCompleto}
            </option>
          ))}
        </select>

        <select
          value={filtros.tipo}
          onChange={(event) => onChange('tipo', event.target.value)}
          className="h-10 min-w-[170px] rounded-md border border-slate-300 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          {TIPO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <Input
          type="date"
          value={filtros.fecha_desde}
          onChange={(event) => onChange('fecha_desde', event.target.value)}
          placeholder="Desde"
        />

        <Input
          type="date"
          value={filtros.fecha_hasta}
          onChange={(event) => onChange('fecha_hasta', event.target.value)}
          placeholder="Hasta"
        />

        <div className="flex justify-end gap-2 xl:justify-self-end">
          <Button
            type="button"
            variant="outline"
            className="border-slate-300 px-3 text-slate-700"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              className="border-slate-300 px-3 text-slate-700"
              onClick={onClear}
              disabled={loading}
              aria-label="Limpiar filtros"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
