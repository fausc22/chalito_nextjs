import { useState } from 'react';
import { CalendarDays, ChevronDown, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RANGE_BUTTONS = [
  { key: 'hoy', label: 'Hoy' },
  { key: 'semana', label: 'Esta semana' },
  { key: 'mes', label: 'Este mes' },
];

const LIMIT_OPTIONS = [5, 10, 20, 50];
const ADVANCED_PLACEHOLDER = 'proximamente';

export function ReportesFiltros({
  filtros,
  loading = false,
  activeQuickRange = null,
  onChangeFiltro,
  onAplicar,
  onQuickRange,
}) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-slate-600" />
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">Filtros</h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsAdvancedOpen((prev) => !prev)}
          className="h-8 px-2.5 text-slate-600"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Avanzados
          <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(170px,1fr)_minmax(170px,1fr)_minmax(170px,1fr)_auto] md:items-end">
        <div>
          <label htmlFor="filtro-desde" className="block text-sm font-medium text-slate-600 mb-1.5">
            Fecha desde
          </label>
          <Input
            id="filtro-desde"
            type="date"
            value={filtros.desde}
            onChange={(event) => onChangeFiltro('desde', event.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="filtro-hasta" className="block text-sm font-medium text-slate-600 mb-1.5">
            Fecha hasta
          </label>
          <Input
            id="filtro-hasta"
            type="date"
            value={filtros.hasta}
            onChange={(event) => onChangeFiltro('hasta', event.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">
            Ranking de productos
          </label>
          <Select
            value={String(filtros.limit)}
            onValueChange={(value) => onChangeFiltro('limit', Number(value))}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná límite" />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((limit) => (
                <SelectItem key={limit} value={String(limit)}>
                  Top {limit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          onClick={onAplicar}
          disabled={loading}
          className="h-10 w-full px-5 bg-blue-700 text-white shadow-sm hover:bg-blue-800 md:w-auto"
        >
          <Filter className="h-4 w-4 mr-1.5" />
          Aplicar filtros
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {RANGE_BUTTONS.map((button) => (
          <Button
            key={button.key}
            type="button"
            variant={activeQuickRange === button.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onQuickRange(button.key)}
            disabled={loading}
            className={`w-full sm:w-auto ${
              activeQuickRange === button.key ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''
            }`}
          >
            {button.label}
          </Button>
        ))}
      </div>

      {isAdvancedOpen ? (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="mb-3 text-sm font-medium text-slate-700">Filtros avanzados</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Medio de pago</label>
              <Select
                value={filtros.medioPago || ADVANCED_PLACEHOLDER}
                onValueChange={(value) => onChangeFiltro('medioPago', value)}
                disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder="Proximamente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ADVANCED_PLACEHOLDER}>Proximamente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Origen del pedido</label>
              <Select
                value={filtros.origenPedido || ADVANCED_PLACEHOLDER}
                onValueChange={(value) => onChangeFiltro('origenPedido', value)}
                disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder="Proximamente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ADVANCED_PLACEHOLDER}>Proximamente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Modalidad</label>
              <Select
                value={filtros.modalidad || ADVANCED_PLACEHOLDER}
                onValueChange={(value) => onChangeFiltro('modalidad', value)}
                disabled
              >
                <SelectTrigger>
                  <SelectValue placeholder="Proximamente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ADVANCED_PLACEHOLDER}>Proximamente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Esta seccion queda preparada para cuando backend habilite filtros avanzados.
          </p>
        </div>
      ) : null}
    </section>
  );
}

