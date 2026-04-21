import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmpleadosFeedback } from '@/components/empleados/EmpleadosFeedback';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const formatDate = (date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const formatMoney = (amount) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
}).format(Number(amount) || 0);

export function LiquidacionesHistoryTable({
  rows,
  loading,
  error,
  onRefresh,
  onViewDetail,
  loadingDetailId,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(rows.length / itemsPerPage);

  useEffect(() => {
    if (totalPages === 0) {
      if (currentPage !== 1) setCurrentPage(1);
      return;
    }
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rows.length]);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return rows.slice(startIndex, startIndex + itemsPerPage);
  }, [rows, currentPage]);

  const handlePageChange = (page) => {
    const nextPage = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(nextPage);
  };

  const paginationItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const items = [1];
    if (currentPage > 3) items.push('start-ellipsis');

    const middleStart = Math.max(2, currentPage - 1);
    const middleEnd = Math.min(totalPages - 1, currentPage + 1);
    for (let page = middleStart; page <= middleEnd; page += 1) {
      items.push(page);
    }

    if (currentPage < totalPages - 2) items.push('end-ellipsis');
    items.push(totalPages);
    return items;
  }, [currentPage, totalPages]);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-lg text-slate-800">Liquidaciones guardadas</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Historial reciente de liquidaciones persistidas.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => onRefresh()} disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar historial'}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {error ? (
          <div className="mx-6 mb-6">
            <EmpleadosFeedback type="error" message={error} />
          </div>
        ) : null}

        {!error && rows.length === 0 ? (
          <div className="px-6 pb-6">
            <EmpleadosFeedback type="empty" message="Todavia no hay liquidaciones guardadas para listar." />
          </div>
        ) : null}

        {rows.length > 0 ? (
          <div className="overflow-x-auto">
          <Table>
              <TableHeader>
                <TableRow>
                <TableHead className="w-[18%]">Empleado</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead>Hasta</TableHead>
                <TableHead className="text-right">Total final</TableHead>
                <TableHead>Registrada</TableHead>
                <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {paginatedRows.map((row) => (
                  <TableRow key={row.id}>
                  <TableCell className="font-medium text-slate-700">{row.empleadoNombre}</TableCell>
                  <TableCell>{formatDate(row.fechaDesde)}</TableCell>
                  <TableCell>{formatDate(row.fechaHasta)}</TableCell>
                    <TableCell className="text-right font-semibold text-slate-700">
                      {formatMoney(row.totalFinal)}
                    </TableCell>
                  <TableCell>{formatDate(row.createdAt)}</TableCell>
                  <TableCell>
                      <Button
                        type="button"
                        size="sm"
                      variant="outline"
                        onClick={() => onViewDetail(row)}
                        disabled={loadingDetailId === row.id}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        {loadingDetailId === row.id ? 'Cargando...' : 'Ver detalle'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

          {totalPages > 1 ? (
            <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Mostrando {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, rows.length)} de {rows.length} liquidaciones
              </p>

              <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                    />
                  </PaginationItem>

                  {paginationItems.map((item, index) => (
                    typeof item === 'number' ? (
                      <PaginationItem key={item}>
                        <PaginationLink
                          onClick={() => handlePageChange(item)}
                          isActive={currentPage === item}
                          className="cursor-pointer"
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={`${item}-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
