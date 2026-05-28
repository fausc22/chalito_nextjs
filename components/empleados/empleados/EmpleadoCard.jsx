import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Pencil, Power } from 'lucide-react';

const formatMoney = (amount) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
}).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('es-AR').format(date);
};

export function EmpleadoCard({
  empleado,
  isMutating,
  onEdit,
  onToggle,
  canMutate = true,
  showHourlyRate = true,
}) {
  return (
    <Card className="border-border shadow-sm transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {empleado.nombreCompleto}
            </h3>
            {showHourlyRate ? (
              <p className="text-sm text-muted-foreground">
                {formatMoney(empleado.valorHora)} / hora
              </p>
            ) : null}
          </div>

          <Badge
            variant="outline"
            className={empleado.activo
              ? 'border-green-200 bg-green-100 text-green-700'
              : 'border-border bg-muted text-muted-foreground'}
          >
            {empleado.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
          <p><span className="font-medium text-foreground">Teléfono:</span> {empleado.telefono || '-'}</p>
          <p><span className="font-medium text-foreground">Email:</span> {empleado.email || '-'}</p>
          <p><span className="font-medium text-foreground">Documento:</span> {empleado.documento || '-'}</p>
          <p><span className="font-medium text-foreground">Ingreso:</span> {formatDate(empleado.fechaIngreso)}</p>
        </div>

        {canMutate ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onEdit(empleado)}
              disabled={isMutating}
              className="border-border text-foreground"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Button
              type="button"
              variant={empleado.activo ? 'outline' : 'default'}
              onClick={() => onToggle(empleado)}
              disabled={isMutating}
              className={empleado.activo ? 'border-amber-300 text-amber-700 hover:bg-amber-500/10' : 'bg-green-600 text-white hover:bg-green-700'}
            >
              <Power className="h-4 w-4" />
              {empleado.activo ? 'Inactivar' : 'Activar'}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
