import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Pencil, Trash2 } from 'lucide-react';

const formatMoney = (amount) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
}).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return '--';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const TYPE_META = {
  BONO: { label: 'Bono', className: 'border-emerald-200 bg-emerald-100 text-emerald-700' },
  DESCUENTO: { label: 'Descuento', className: 'border-red-200 bg-red-100 text-red-700' },
  ADELANTO: { label: 'Adelanto', className: 'border-amber-200 bg-amber-100 text-amber-700' },
  CONSUMO: { label: 'Consumo', className: 'border-indigo-200 bg-indigo-100 text-indigo-700' },
};

const getTypeMeta = (type) => TYPE_META[type] || { label: type || 'Movimiento', className: 'border-slate-200 bg-slate-100 text-slate-700' };

const MSG_NO_ELIMINAR_LIQUIDADO = 'No es posible eliminar este movimiento porque ya forma parte de una liquidación guardada';

export function MovimientoTable({ rows, onEdit, onDelete, loading, isDeleting }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(rows.length / itemsPerPage);

  useEffect(() => {
    if (totalPages === 0) {
      if (currentPage !== 1) setCurrentPage(1);
      return;
    }
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
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

  if (loading && rows.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-10 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rows.length) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-8 text-center text-sm text-slate-500">
          No hay movimientos para mostrar con los filtros seleccionados.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Empleado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="w-[180px]">Descripción</TableHead>
                <TableHead>Registrado por</TableHead>
                <TableHead className="w-[88px] text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.map((row) => {
                const typeMeta = getTypeMeta(row.tipo);
                const puedeEliminar = row.puedeEliminarse !== false;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-slate-700">
                      {formatDate(row.fecha)}
                    </TableCell>
                    <TableCell>{row.empleadoNombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeMeta.className}>
                        {typeMeta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-700">
                      {formatMoney(row.monto)}
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      <p className="truncate text-sm text-slate-700">{row.descripcion || '-'}</p>
                    </TableCell>
                    <TableCell className="text-slate-600">{row.registradoPor}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-end gap-0.5 sm:justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(row)}
                          disabled={isDeleting}
                          title="Editar"
                          className="h-8 w-8 shrink-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (!puedeEliminar) {
                              onDelete?.(row, { blocked: true });
                              return;
                            }
                            onDelete?.(row);
                          }}
                          disabled={isDeleting}
                          aria-disabled={!puedeEliminar || isDeleting}
                          title={
                            puedeEliminar
                              ? 'Eliminar'
                              : MSG_NO_ELIMINAR_LIQUIDADO
                          }
                          className={
                            puedeEliminar
                              ? 'h-8 w-8 shrink-0 text-slate-600 hover:bg-red-50 hover:text-destructive'
                              : 'h-8 w-8 shrink-0 cursor-not-allowed text-slate-300 hover:bg-transparent hover:text-slate-300'
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 ? (
          <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Mostrando {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, rows.length)} de {rows.length} movimientos
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
      </CardContent>
    </Card>
  );
}
