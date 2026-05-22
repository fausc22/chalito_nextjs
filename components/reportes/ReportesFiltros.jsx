import { Calendar, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MONTH_OPTIONS = [
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

const LIMIT_OPTIONS = [5, 10, 20];
const PAYMENT_METHOD_OPTIONS = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'DEBITO', label: 'Debito' },
  { value: 'CREDITO', label: 'Credito' },
  { value: 'MERCADOPAGO', label: 'MercadoPago' },
];
const ORIGIN_OPTIONS = [
  { value: 'WEB', label: 'WEB' },
  { value: 'LOCAL', label: 'LOCAL' },
];

const getAutoRange = (month, year) => {
  if (month === 'all') {
    return {
      desde: `${year}-01-01`,
      hasta: `${year}-12-31`,
    };
  }

  const parsedMonth = Number(month);
  const from = new Date(year, parsedMonth - 1, 1);
  const to = new Date(year, parsedMonth, 0);
  const fromValue = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}`;
  const toValue = `${to.getFullYear()}-${String(to.getMonth() + 1).padStart(2, '0')}-${String(to.getDate()).padStart(2, '0')}`;

  return {
    desde: fromValue,
    hasta: toValue,
  };
};

export function ReportesFiltros({
  filtros,
  years = [],
  showAdvanced = false,
  onChangeFiltro,
  onAplicar,
  onLimpiar,
  loading = false,
}) {
  const autoRange = getAutoRange(filtros.month, Number(filtros.year));
  const hasManualDateRange = filtros.desde !== autoRange.desde || filtros.hasta !== autoRange.hasta;
  const hayFiltrosActivos =
    filtros.month === 'all' ||
    Number(filtros.month) !== new Date().getMonth() + 1 ||
    Number(filtros.year) !== new Date().getFullYear() ||
    hasManualDateRange ||
    Number(filtros.limit) !== 10 ||
    filtros.medioPago ||
    filtros.origenPedido;

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-4 border-b border-border">
            <Select
              value={filtros.month === 'all' ? 'all' : String(filtros.month || '')}
              onValueChange={(value) => onChangeFiltro('month', value === 'all' ? 'all' : Number(value))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los meses</SelectItem>
                {MONTH_OPTIONS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(filtros.year || '')}
              onValueChange={(value) => onChangeFiltro('year', Number(value))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={String(year)} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="filtro-desde"
                type="date"
                value={filtros.desde}
                onChange={(event) => onChangeFiltro('desde', event.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="filtro-hasta"
                type="date"
                value={filtros.hasta}
                onChange={(event) => onChangeFiltro('hasta', event.target.value)}
                className="pl-9"
                disabled={loading}
              />
            </div>

            <Select
              value={String(filtros.limit)}
              onValueChange={(value) => onChangeFiltro('limit', Number(value))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ranking de productos" />
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

          {showAdvanced ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border">
              <Select
                value={filtros.medioPago || 'all'}
                onValueChange={(value) => onChangeFiltro('medioPago', value === 'all' ? '' : value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Medio de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los medios</SelectItem>
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filtros.origenPedido || 'all'}
                onValueChange={(value) => onChangeFiltro('origenPedido', value === 'all' ? '' : value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Origen del pedido" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los origenes</SelectItem>
                  {ORIGIN_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="flex gap-2 w-full sm:w-auto sm:justify-end">
            <Button
              type="button"
              onClick={onAplicar}
              disabled={loading}
              className="gap-2 flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Filter className="h-4 w-4" />
              Filtrar
            </Button>

            {hayFiltrosActivos ? (
              <Button
                type="button"
                variant="outline"
                onClick={onLimpiar}
                disabled={loading}
                className="gap-2 flex-1 sm:flex-initial"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

