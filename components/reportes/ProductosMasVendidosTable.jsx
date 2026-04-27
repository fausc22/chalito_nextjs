import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LocalPagination } from './LocalPagination';
import { formatCountAr, formatCurrencyAr, safeNumber } from './reportesUtils';

export function ProductosMasVendidosTable({ data = [], rankingLimit = 10 }) {
  const [sortBy, setSortBy] = useState('cantidadVendida');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const sortedData = useMemo(() => {
    const safeData = Array.isArray(data) ? [...data] : [];
    if (sortBy === 'totalGenerado') {
      return safeData.sort(
        (a, b) => safeNumber(b?.totalGenerado) - safeNumber(a?.totalGenerado)
      );
    }

    return safeData.sort(
      (a, b) => safeNumber(b?.cantidadVendida) - safeNumber(a?.cantidadVendida)
    );
  }, [data, sortBy]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedData.length / rowsPerPage)),
    [sortedData.length]
  );

  const paginatedRows = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [page, sortedData]);

  useEffect(() => {
    setPage(1);
  }, [data, rankingLimit, sortBy]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  if (sortedData.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold text-slate-800">Productos más vendidos</h2>
        <p className="mt-2 text-sm text-slate-600">No hay productos vendidos para este período.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Productos más vendidos</h2>
          <p className="text-sm text-slate-500">
            Ranking de productos por cantidad vendida y facturación generada.
          </p>
        </div>
        <div className="w-full md:w-[240px]">
          <label className="mb-1.5 block text-sm font-medium text-slate-600">Orden visual</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Ordenar productos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cantidadVendida">Ordenar por cantidad vendida</SelectItem>
              <SelectItem value="totalGenerado">Ordenar por total generado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead>Posición</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad vendida</TableHead>
              <TableHead className="text-right">Total generado</TableHead>
              <TableHead className="text-right">Precio promedio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.map((item, index) => {
              const globalIndex = (page - 1) * rowsPerPage + index;
              return (
                <TableRow
                  key={`${item.articuloId ?? item.articuloNombre}-${globalIndex}`}
                  className={globalIndex === 0 ? 'bg-emerald-50/70' : ''}
                >
                  <TableCell>
                    <Badge variant={globalIndex === 0 ? 'default' : 'outline'}>#{globalIndex + 1}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.articuloNombre || 'Sin nombre'}</TableCell>
                  <TableCell className="text-right">{formatCountAr(item.cantidadVendida)}</TableCell>
                  <TableCell className="text-right">{formatCurrencyAr(item.totalGenerado)}</TableCell>
                  <TableCell className="text-right">{formatCurrencyAr(item.precioPromedio)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2.5 md:hidden">
        {paginatedRows.map((item, index) => {
          const globalIndex = (page - 1) * rowsPerPage + index;
          return (
            <article
              key={`${item.articuloId ?? item.articuloNombre}-mobile-${globalIndex}`}
              className={`rounded-lg border p-3 ${
                globalIndex === 0 ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{item.articuloNombre || 'Sin nombre'}</p>
                <Badge variant={globalIndex === 0 ? 'default' : 'outline'}>#{globalIndex + 1}</Badge>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <p className="text-slate-600">
                  Cantidad: <span className="font-semibold text-slate-800">{formatCountAr(item.cantidadVendida)}</span>
                </p>
                <p className="text-slate-600">
                  Promedio: <span className="font-semibold text-slate-800">{formatCurrencyAr(item.precioPromedio)}</span>
                </p>
                <p className="col-span-2 text-slate-600">
                  Total generado: <span className="font-semibold text-slate-800">{formatCurrencyAr(item.totalGenerado)}</span>
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <LocalPagination
        page={page}
        totalPages={totalPages}
        onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
      />
    </section>
  );
}

