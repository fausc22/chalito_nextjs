import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldError } from '@/components/ui/field-error';
import { getInputErrorProps } from '@/lib/form-errors';
import { formatStockValue, getNombreInsumoDetalle } from './semanaActualUtils';

export function EditarDetalleStockModal({
  open,
  onOpenChange,
  detalle,
  stockInicialInput,
  stockFinalInput,
  observacionesInput,
  stockFinalMax,
  onStockInicialChange,
  onStockFinalChange,
  onObservacionesChange,
  errors = {},
  onSubmit,
  loading = false,
  disableSubmit = false,
}) {
  if (!detalle) return null;

  const nombre = getNombreInsumoDetalle(detalle);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="h-5 w-5 text-[#315e92]" />
            Cargar stock
          </DialogTitle>
          <DialogDescription className="text-left">
            <span className="font-medium text-slate-800">{nombre}</span>
            <span className="block text-sm text-muted-foreground mt-1">
              Editá stock inicial y/o final. Los valores vacíos no se envían al guardar.
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_stock_inicial">Stock inicial</Label>
            <Input
              id="edit_stock_inicial"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={stockInicialInput}
              onChange={(e) => onStockInicialChange(e.target.value)}
              placeholder={formatStockValue(detalle.stock_inicial ?? detalle.stock_inicio)}
              className={errors?.stock_inicial ? 'border-red-500 focus-visible:ring-red-500' : undefined}
              {...getInputErrorProps(errors, 'stock_inicial').inputProps}
            />
            <FieldError error={errors?.stock_inicial} id="edit_stock_inicial-error" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_stock_final">Stock final</Label>
            <Input
              id="edit_stock_final"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={stockFinalInput}
              max={stockFinalMax}
              onChange={(e) => onStockFinalChange(e.target.value)}
              placeholder={formatStockValue(detalle.stock_final)}
              className={errors?.stock_final ? 'border-red-500 focus-visible:ring-red-500' : undefined}
              {...getInputErrorProps(errors, 'stock_final').inputProps}
            />
            <FieldError error={errors?.stock_final} id="edit_stock_final-error" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_observaciones">Observaciones</Label>
            <Textarea
              id="edit_observaciones"
              rows={3}
              value={observacionesInput}
              onChange={(e) => onObservacionesChange(e.target.value)}
              placeholder={detalle.observaciones?.trim() ? detalle.observaciones : 'Opcional'}
            />
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={loading || disableSubmit}
            onClick={handleSubmit}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
