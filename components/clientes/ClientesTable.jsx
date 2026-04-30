import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formatMoney = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('es-AR');
};

export function ClientesTable({ clientes = [], onSelectCliente }) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Nombre</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Pedidos</TableHead>
            <TableHead>Última compra</TableHead>
            <TableHead className="text-right">Total gastado</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium">{cliente.nombre}</TableCell>
              <TableCell>{cliente.telefono}</TableCell>
              <TableCell>{cliente.email || '-'}</TableCell>
              <TableCell className="text-right">{cliente.cantidad_pedidos || 0}</TableCell>
              <TableCell>{formatDate(cliente.ultima_compra)}</TableCell>
              <TableCell className="text-right">{formatMoney(cliente.total_gastado)}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => onSelectCliente?.(cliente)}>
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {clientes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No hay clientes para mostrar.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}

export default ClientesTable;
