import { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LocalPagination } from './LocalPagination';
import { formatCountAr, formatCurrencyAr, formatDateLabel } from './reportesUtils';

export function VentasPorDiaTable({ data = [] }) {
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((Array.isArray(data) ? data.length : 0) / rowsPerPage)),
    [data]
  );

  const paginatedRows = useMemo(() => {
    const safeData = Array.isArray(data) ? data : [];
    const startIndex = (page - 1) * rowsPerPage;
    return safeData.slice(startIndex, startIndex + rowsPerPage);
  }, [data, page]);

  useEffect(() => {
    setPage(1);
  }, [data]);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const manyColumns = (Array.isArray(data) ? data.length : 0) > 0;

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold text-slate-800">Ventas por día</h2>
        <p className="mt-2 text-sm text-slate-600">No hay ventas registradas para este período.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Ventas por día</h2>
        <p className="text-sm text-slate-500">
          Evolución diaria de ventas y ticket promedio en el rango seleccionado
          {manyColumns ? '. Deslizá horizontalmente si usás pantalla chica.' : '.'}
        </p>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead>Día</TableHead>
              <TableHead className="text-right">Cantidad de ventas</TableHead>
              <TableHead className="text-right">Total vendido</TableHead>
              <TableHead className="text-right">Ticket promedio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.map((row, index) => (
              <TableRow key={`${row?.dia || 'sin-fecha'}-${index}`}>
                <TableCell className="font-medium">{formatDateLabel(row?.dia)}</TableCell>
                <TableCell className="text-right">{formatCountAr(row?.cantidadVentas)}</TableCell>
                <TableCell className="text-right">{formatCurrencyAr(row?.totalVendido)}</TableCell>
                <TableCell className="text-right">{formatCurrencyAr(row?.ticketPromedio)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2.5 md:hidden">
        {paginatedRows.map((row, index) => (
          <article
            key={`${row?.dia || 'sin-fecha'}-mobile-${index}`}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <p className="text-sm font-semibold text-slate-800">{formatDateLabel(row?.dia)}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <p className="text-slate-600">
                Ventas: <span className="font-semibold text-slate-800">{formatCountAr(row?.cantidadVentas)}</span>
              </p>
              <p className="text-slate-600">
                Ticket: <span className="font-semibold text-slate-800">{formatCurrencyAr(row?.ticketPromedio)}</span>
              </p>
              <p className="col-span-2 text-slate-600">
                Total vendido: <span className="font-semibold text-slate-800">{formatCurrencyAr(row?.totalVendido)}</span>
              </p>
            </div>
          </article>
        ))}
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

