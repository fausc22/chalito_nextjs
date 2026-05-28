import { Filter, RefreshCw, X } from 'lucide-react';
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
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Filter className="h-4 w-4" />
        Filtros
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={filtros.empleado_id}
            onChange={(event) => onChange('empleado_id', event.target.value)}
            className="h-10 min-w-0 w-full rounded-md border border-border bg-card px-3 pr-9 text-sm text-foreground outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
            className="h-10 min-w-0 w-full rounded-md border border-border bg-card px-3 pr-9 text-sm text-foreground outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
            aria-label="Fecha desde"
          />

          <Input
            type="date"
            value={filtros.fecha_hasta}
            onChange={(event) => onChange('fecha_hasta', event.target.value)}
            aria-label="Fecha hasta"
          />
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-border text-foreground flex-1 sm:flex-initial"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              className="gap-2 border-border text-foreground flex-1 sm:flex-initial"
              onClick={onClear}
              disabled={loading}
            >
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
