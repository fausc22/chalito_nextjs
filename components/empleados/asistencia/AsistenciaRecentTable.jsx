import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formatHour = (date) => {
  if (!date) return '--:--';
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const getActionBadgeClass = (accion) => {
  if (accion === 'Ingreso') return 'border-blue-200 bg-blue-100 text-blue-700';
  if (accion === 'Egreso') return 'border-green-200 bg-green-100 text-green-700';
  return 'border-slate-200 bg-slate-100 text-slate-700';
};

export function AsistenciaRecentTable({ rows }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-slate-800">
          Actividad reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            Aun no hay movimientos registrados hoy.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Accion</TableHead>
                  <TableHead>Registrado por</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 10).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-semibold text-slate-700">{formatHour(row.fecha)}</TableCell>
                    <TableCell>{row.empleadoNombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getActionBadgeClass(row.accion)}>
                        {row.accion}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.registradoPor}</TableCell>
                    <TableCell className="text-slate-600">{row.estado}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
