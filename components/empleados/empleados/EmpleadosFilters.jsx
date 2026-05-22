import { Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FILTERS = [
  { value: 'activos', label: 'Activos' },
  { value: 'inactivos', label: 'Inactivos' },
  { value: 'all', label: 'Todos' },
];

export function EmpleadosFilters({
  searchValue,
  onSearchChange,
  estadoValue,
  onEstadoChange,
  onRefresh,
  loading,
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative lg:min-w-0 lg:flex-[1.6]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nombre o apellido"
            className="pl-9"
          />
        </div>

        <select
          value={estadoValue}
          onChange={(event) => onEstadoChange(event.target.value)}
          className="h-10 min-w-[170px] rounded-md border border-border bg-card px-3 pr-9 text-sm text-foreground outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 lg:flex-[0.9]"
        >
          {FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          className="border-border text-foreground"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>
    </div>
  );
}
