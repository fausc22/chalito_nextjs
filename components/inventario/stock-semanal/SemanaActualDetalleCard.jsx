import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil } from 'lucide-react';
import {
  formatStockValue,
  getConsumoMostrado,
  getNombreInsumoDetalle,
  getStockFinalDetalle,
  getStockInicialDetalle,
} from './semanaActualUtils';

export function SemanaActualDetalleCard({ detalle, onEditarDetalle, edicionHabilitada = true }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base leading-tight">{getNombreInsumoDetalle(detalle)}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 text-sm pt-0">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Inicial</p>
          <p className="font-medium tabular-nums">{formatStockValue(getStockInicialDetalle(detalle))}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Final</p>
          <p className="font-medium tabular-nums">{formatStockValue(getStockFinalDetalle(detalle))}</p>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Consumo</p>
          <p className="font-semibold tabular-nums text-slate-900">{formatStockValue(getConsumoMostrado(detalle))}</p>
        </div>
        {detalle.observaciones?.trim() ? (
          <div className="col-span-2">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Observaciones</p>
            <p className="text-sm text-slate-700">{detalle.observaciones}</p>
          </div>
        ) : null}
      </CardContent>
      {edicionHabilitada ? (
        <CardFooter className="border-t bg-slate-50/50 py-2">
          <Button type="button" variant="outline" size="sm" className="w-full gap-1" onClick={() => onEditarDetalle(detalle)}>
            <Pencil className="h-4 w-4" />
            Editar stock
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
