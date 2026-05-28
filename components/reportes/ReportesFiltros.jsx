import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const LIMIT_OPTIONS = [
  { value: 5, label: '5 productos' },
  { value: 10, label: '10 productos' },
  { value: 20, label: '20 productos' },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'DEBITO', label: 'Debito' },
  { value: 'CREDITO', label: 'Credito' },
  { value: 'MERCADOPAGO', label: 'MercadoPago' },
];

const ORIGIN_OPTIONS = [
  { value: 'MOSTRADOR', label: 'Mostrador' },
  { value: 'TELEFONO', label: 'Teléfono' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'WEB', label: 'Web' },
];

export function ReportesFiltros({
  filtros,
  years = [],
  showAdvanced = false,
  onChangeFiltro,
  onAplicar,
  onLimpiar,
  loading = false,
}) {
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
            <div className="space-y-1.5">
              <Label htmlFor="filtro-desde">Desde</Label>
              <Input
                id="filtro-desde"
                type="date"
                value={filtros.desde || ''}
                onChange={(e) => onChangeFiltro('desde', e.target.value)}
                disabled={loading}
                aria-label="Fecha desde"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filtro-hasta">Hasta</Label>
              <Input
                id="filtro-hasta"
                type="date"
                value={filtros.hasta || ''}
                onChange={(e) => onChangeFiltro('hasta', e.target.value)}
                disabled={loading}
                aria-label="Fecha hasta"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="filtro-ranking">Cantidad en el ranking</Label>
              <Select
                value={String(filtros.limit)}
                onValueChange={(value) => onChangeFiltro('limit', Number(value))}
                disabled={loading}
              >
                <SelectTrigger id="filtro-ranking">
                  <SelectValue placeholder="Productos más vendidos a mostrar" />
                </SelectTrigger>
                <SelectContent>
                  {LIMIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define cuántos productos aparecen en el ranking de productos más vendidos.
              </p>
            </div>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
