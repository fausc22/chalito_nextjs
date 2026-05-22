import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil } from 'lucide-react';
import {
  formatStockValue,
  getConsumoMostrado,
  getDetalleId,
  getNombreInsumoDetalle,
  getStockFinalDetalle,
  getStockInicialDetalle,
} from './semanaActualUtils';

export function SemanaActualDetalleTable({ detalles, onEditarDetalle, edicionHabilitada = true }) {
  const sorted = [...detalles].sort((a, b) =>
    getNombreInsumoDetalle(a).localeCompare(getNombreInsumoDetalle(b), 'es', { sensitivity: 'base' })
  );

  return (
    <div className="hidden lg:block overflow-x-auto rounded-lg border border-border shadow-sm">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="font-semibold text-foreground">Insumo</TableHead>
            <TableHead className="text-right font-semibold text-foreground w-[120px]">Stock inicial</TableHead>
            <TableHead className="text-right font-semibold text-foreground w-[120px]">Stock final</TableHead>
            <TableHead className="text-right font-semibold text-foreground w-[120px]">Consumo</TableHead>
            <TableHead className="font-semibold text-foreground min-w-[140px]">Observaciones</TableHead>
            {edicionHabilitada ? (
              <TableHead className="w-[100px] text-center font-semibold text-foreground">Acciones</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((detalle) => {
            const id = getDetalleId(detalle);
            return (
              <TableRow key={id ?? JSON.stringify(detalle)} className="hover:bg-muted/80">
                <TableCell className="font-medium">{getNombreInsumoDetalle(detalle)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatStockValue(getStockInicialDetalle(detalle))}</TableCell>
                <TableCell className="text-right tabular-nums">{formatStockValue(getStockFinalDetalle(detalle))}</TableCell>
                <TableCell className="text-right tabular-nums font-medium text-foreground">
                  {formatStockValue(getConsumoMostrado(detalle))}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[240px]">
                  <span className="line-clamp-2">{detalle.observaciones?.trim() ? detalle.observaciones : '—'}</span>
                </TableCell>
                {edicionHabilitada ? (
                  <TableCell className="text-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => onEditarDetalle(detalle)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
