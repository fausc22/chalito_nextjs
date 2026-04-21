import { ClipboardList, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  formatDateShort,
  formatEstadoSemana,
  formatStockValue,
  getConsumoMostrado,
  getDetalleId,
  getNombreInsumoDetalle,
  getStockFinalDetalle,
  getStockInicialDetalle,
} from './semanaActualUtils';

export function SemanaHistoricoDetalleModal({ open, onOpenChange, semana, detalles, loading, error }) {
  const haySemana = semana != null && typeof semana === 'object';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-0.75rem)] sm:max-w-3xl max-h-[min(90vh,720px)] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2 pr-8">
            <ClipboardList className="h-5 w-5 text-[#315e92] shrink-0" />
            Detalle de semana
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap items-center gap-2 text-left text-sm text-slate-600 pt-1">
              {haySemana ? (
                <>
                  <span className="font-medium text-slate-800">
                    {formatDateShort(semana.fecha_inicio)} — {formatDateShort(semana.fecha_fin)}
                  </span>
                  <Badge variant="outline" className="text-slate-800 border-slate-300">
                    {formatEstadoSemana(semana.estado)}
                  </Badge>
                  {semana.observaciones?.trim() ? (
                    <span className="text-muted-foreground w-full text-xs sm:text-sm line-clamp-2">
                      Obs.: {semana.observaciones}
                    </span>
                  ) : null}
                </>
              ) : (
                <span>Cargando información de la semana…</span>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-9 w-9 animate-spin text-[#315e92]" />
              <p className="text-sm text-muted-foreground">Cargando líneas de stock…</p>
            </div>
          ) : null}

          {!loading && error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {!loading && !error && Array.isArray(detalles) && detalles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Esta semana no tiene líneas de detalle.</p>
          ) : null}

          {!loading && !error && detalles?.length > 0 ? (
            <div className="hidden lg:block rounded-lg border border-slate-200 overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-[1]">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-800 min-w-[140px]">Insumo</TableHead>
                    <TableHead className="text-right font-semibold text-slate-800 w-[110px]">Stock inicial</TableHead>
                    <TableHead className="text-right font-semibold text-slate-800 w-[110px]">Stock final</TableHead>
                    <TableHead className="text-right font-semibold text-slate-800 w-[110px]">Consumo</TableHead>
                    <TableHead className="font-semibold text-slate-800 min-w-[120px]">Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalles.map((row) => (
                    <TableRow key={getDetalleId(row) ?? JSON.stringify(row)} className="hover:bg-slate-50/80">
                      <TableCell className="font-medium text-slate-900">{getNombreInsumoDetalle(row)}</TableCell>
                      <TableCell className="text-right tabular-nums text-slate-800">
                        {formatStockValue(getStockInicialDetalle(row))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-slate-800">
                        {formatStockValue(getStockFinalDetalle(row))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium text-slate-900">
                        {formatStockValue(getConsumoMostrado(row))}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                        <span className="line-clamp-3">{row.observaciones?.trim() ? row.observaciones : '—'}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}

          {!loading && !error && detalles?.length > 0 ? (
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detalles.map((row) => (
                <div key={getDetalleId(row) ?? JSON.stringify(row)} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                  <p className="text-sm font-semibold text-slate-900">{getNombreInsumoDetalle(row)}</p>
                  <p className="text-sm text-slate-700">
                    Stock inicial:{' '}
                    <span className="font-medium text-slate-900">{formatStockValue(getStockInicialDetalle(row))}</span>
                  </p>
                  <p className="text-sm text-slate-700">
                    Stock final:{' '}
                    <span className="font-medium text-slate-900">{formatStockValue(getStockFinalDetalle(row))}</span>
                  </p>
                  <p className="text-sm text-slate-700">
                    Consumo:{' '}
                    <span className="font-medium text-slate-900">{formatStockValue(getConsumoMostrado(row))}</span>
                  </p>
                  <p className="text-sm text-slate-700">
                    Observaciones:{' '}
                    <span className="text-muted-foreground">{row.observaciones?.trim() ? row.observaciones : '—'}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
