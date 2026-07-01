import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ITEMS_PER_PAGE = 8;

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
  return 'border-border bg-muted text-foreground';
};

export function AsistenciaRecentTable({ rows }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE);

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
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return rows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
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
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-foreground">
          Actividad reciente
        </CardTitle>
      </CardHeader>
      <CardContent className={rows.length > 0 ? 'p-0' : undefined}>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted p-6 text-sm text-muted-foreground">
            Aun no hay movimientos registrados hoy.
          </div>
        ) : (
          <>
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
                  {paginatedRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-semibold text-foreground">{formatHour(row.fecha)}</TableCell>
                      <TableCell>{row.empleadoNombre}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getActionBadgeClass(row.accion)}>
                          {row.accion}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.registradoPor}</TableCell>
                      <TableCell className="text-muted-foreground">{row.estado}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 ? (
              <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, rows.length)} de {rows.length} movimientos
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
