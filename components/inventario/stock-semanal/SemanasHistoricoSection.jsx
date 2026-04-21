import { useCallback, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Eye, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateShort, formatEstadoSemana } from './semanaActualUtils';
import { SemanaHistoricoDetalleModal } from './SemanaHistoricoDetalleModal';

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function insumosCount(row) {
  if (row?.cantidad_insumos == null) return null;
  const n = Number(row.cantidad_insumos);
  return Number.isFinite(n) ? n : null;
}

const FILTRO_TODAS = 'all';
const FILTRO_CERRADA = 'CERRADA';
const FILTRO_ABIERTA = 'ABIERTA';

export function SemanasHistoricoSection({
  data,
  loading = false,
  error = null,
  onRefrescar,
  onObtenerSemanaPorId,
}) {
  const [filtroEstado, setFiltroEstado] = useState(FILTRO_TODAS);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumenFila, setResumenFila] = useState(null);
  const [detalleSemana, setDetalleSemana] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleError, setDetalleError] = useState(null);

  const primeraCarga = data === undefined;
  const items = Array.isArray(data?.items) ? data.items : [];
  const pag = data?.paginacion;
  const paginaActual = pag?.pagina ?? pag?.page ?? 1;
  const totalPaginas = pag?.total_paginas ?? pag?.totalPages ?? 0;

  const recargar = useCallback(
    (extra = {}) => {
      const lim = 5;
      const pg = extra.page ?? extra.pagina ?? paginaActual;
      const q = { limit: lim, page: pg };
      if (filtroEstado !== FILTRO_TODAS) {
        q.estado = filtroEstado;
      } else {
        q.estado = undefined;
      }
      onRefrescar(q);
    },
    [filtroEstado, onRefrescar, paginaActual]
  );

  const handleFiltroChange = (value) => {
    setFiltroEstado(value);
    const q = { page: 1, limit: 5 };
    if (value !== FILTRO_TODAS) {
      q.estado = value;
    } else {
      q.estado = undefined;
    }
    onRefrescar(q);
  };

  const abrirDetalle = async (fila) => {
    if (!onObtenerSemanaPorId || !fila?.id) return;
    setResumenFila(fila);
    setDetalleSemana(null);
    setDetalleError(null);
    setDetalleLoading(true);
    setModalOpen(true);
    try {
      const res = await onObtenerSemanaPorId(fila.id);
      if (res.success) {
        setDetalleSemana(res.data);
      } else {
        setDetalleError(res.error || 'No se pudo cargar el detalle');
      }
    } catch {
      setDetalleError('Error al cargar el detalle');
    } finally {
      setDetalleLoading(false);
    }
  };

  const cerrarModal = (open) => {
    if (!open) {
      setModalOpen(false);
      setResumenFila(null);
      setDetalleSemana(null);
      setDetalleError(null);
      setDetalleLoading(false);
    }
  };

  const semanaParaCabecera = detalleSemana ?? resumenFila;
  const lineasDetalle = Array.isArray(detalleSemana?.detalles)
    ? detalleSemana.detalles
    : Array.isArray(detalleSemana?.detalle)
      ? detalleSemana.detalle
      : [];

  if (primeraCarga && loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#315e92]" />
        <p className="text-muted-foreground text-sm">Cargando histórico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end sm:justify-between gap-4">
        <div className="space-y-2 min-w-[200px] max-w-xs">
          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Estado</p>
          <Select value={filtroEstado} onValueChange={handleFiltroChange}>
            <SelectTrigger className="w-full sm:w-[220px] border-slate-200">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTRO_TODAS}>Todas las semanas</SelectItem>
              <SelectItem value={FILTRO_CERRADA}>Solo cerradas</SelectItem>
              <SelectItem value={FILTRO_ABIERTA}>Solo abiertas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => recargar()} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refrescar
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span>{error}</span>
            <Button type="button" size="sm" variant="outline" onClick={() => recargar()}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {items.length === 0 && !error ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 py-10 px-4 text-center text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-slate-700">No hay resultados</p>
          <p>
            {filtroEstado === FILTRO_TODAS
              ? 'Todavía no hay semanas registradas. Creá una semana en la sección superior cuando estés listo.'
              : 'Ninguna semana coincide con el filtro. Probá con «Todas las semanas» o revisá el estado en el listado.'}
          </p>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="hidden lg:block overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-800 whitespace-nowrap">Fecha inicio</TableHead>
                <TableHead className="font-semibold text-slate-800 whitespace-nowrap">Fecha fin</TableHead>
                <TableHead className="font-semibold text-slate-800">Estado</TableHead>
                <TableHead className="font-semibold text-slate-800 whitespace-nowrap">Fecha cierre</TableHead>
                <TableHead className="text-right font-semibold text-slate-800 w-[100px]">Insumos</TableHead>
                <TableHead className="w-[130px] text-center font-semibold text-slate-800">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => {
                const nInsumos = insumosCount(row);
                return (
                  <TableRow key={row.id} className="hover:bg-slate-50/80">
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap text-sm">
                      {formatDateShort(row.fecha_inicio)}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap text-sm">
                      {formatDateShort(row.fecha_fin)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-slate-800 border-slate-300">
                        {formatEstadoSemana(row.estado)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700 whitespace-nowrap">{formatDateTime(row.fecha_cierre)}</TableCell>
                    <TableCell className="text-right tabular-nums text-slate-800 font-medium">
                      {nInsumos != null ? nInsumos : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1 text-[#315e92] border-slate-200 hover:bg-slate-50"
                        disabled={!onObtenerSemanaPorId}
                        onClick={() => abrirDetalle(row)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((row) => {
            const nInsumos = insumosCount(row);
            return (
              <div key={row.id} className="rounded-lg border border-slate-200 bg-white shadow-sm p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    Semana {formatDateShort(row.fecha_inicio)} - {formatDateShort(row.fecha_fin)}
                  </p>
                  <p className="text-sm text-slate-700">
                    Estado:{' '}
                    <Badge variant="outline" className="text-slate-800 border-slate-300 align-middle">
                      {formatEstadoSemana(row.estado)}
                    </Badge>
                  </p>
                  <p className="text-sm text-slate-700">
                    Obs:{' '}
                    <span className="text-muted-foreground">
                      {row.observaciones?.trim() ? row.observaciones : 'Sin observaciones'}
                    </span>
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Insumos: {nInsumos != null ? nInsumos : '—'}</span>
                  <span>Cierre: {formatDateTime(row.fecha_cierre)}</span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-1 text-[#315e92] border-slate-200 hover:bg-slate-50"
                  disabled={!onObtenerSemanaPorId}
                  onClick={() => abrirDetalle(row)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ver detalle
                </Button>
              </div>
            );
          })}
        </div>
      ) : null}

      {items.length > 0 && totalPaginas > 1 ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <p className="text-xs text-muted-foreground order-2 sm:order-none">
            Página {paginaActual} de {totalPaginas}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={loading || paginaActual <= 1}
              onClick={() => recargar({ page: paginaActual - 1 })}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={loading || paginaActual >= totalPaginas}
              onClick={() => recargar({ page: paginaActual + 1 })}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <SemanaHistoricoDetalleModal
        open={modalOpen}
        onOpenChange={cerrarModal}
        semana={semanaParaCabecera}
        detalles={lineasDetalle}
        loading={detalleLoading}
        error={detalleError}
      />
    </div>
  );
}
