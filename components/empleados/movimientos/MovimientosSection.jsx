import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useMovimientos } from '@/hooks/empleados/useMovimientos';
import { EmpleadosFeedback } from '@/components/empleados/EmpleadosFeedback';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MovimientoFilters } from './MovimientoFilters';
import { MovimientoSummaryCard } from './MovimientoSummaryCard';
import { MovimientoTable } from './MovimientoTable';
import { MovimientoFormModal } from './MovimientoFormModal';

const DEFAULT_FILTERS = {
  empleado_id: 'all',
  tipo: 'all',
  fecha_desde: '',
  fecha_hasta: '',
};

const toApiFilters = (filters) => {
  const apiFilters = {};
  if (filters.empleado_id && filters.empleado_id !== 'all') apiFilters.empleado_id = filters.empleado_id;
  if (filters.tipo && filters.tipo !== 'all') apiFilters.tipo = filters.tipo;
  if (filters.fecha_desde) apiFilters.fecha_desde = filters.fecha_desde;
  if (filters.fecha_hasta) apiFilters.fecha_hasta = filters.fecha_hasta;
  return apiFilters;
};

const formatMoneyShort = (amount) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
}).format(Number(amount) || 0);

const MSG_MOVIMIENTO_LIQUIDADO =
  'No es posible eliminar este movimiento porque ya forma parte de una liquidación guardada';

export function MovimientosSection() {
  const router = useRouter();
  const {
    movimientos,
    empleados,
    resumen,
    loading,
    error,
    isMutating,
    isDeleting,
    cargarMovimientos,
    recargar,
    crearMovimiento,
    actualizarMovimiento,
    eliminarMovimiento,
  } = useMovimientos();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [movimientoEditando, setMovimientoEditando] = useState(null);
  const [movimientoEliminar, setMovimientoEliminar] = useState(null);
  const eliminarEnCursoRef = useRef(false);

  const filtrosApi = useMemo(() => toApiFilters(filters), [filters]);

  useEffect(() => {
    cargarMovimientos(filtrosApi);
  }, [cargarMovimientos, filtrosApi]);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.nuevo !== '1') return;

    setMovimientoEditando(null);
    setIsFormOpen(true);

    const nextQuery = { ...router.query };
    delete nextQuery.nuevo;
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
  }, [router]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleEdit = (movimiento) => {
    setMovimientoEditando(movimiento);
    setIsFormOpen(true);
  };

  const handleSolicitudEliminar = (row, meta) => {
    if (meta?.blocked) {
      toast.error(MSG_MOVIMIENTO_LIQUIDADO);
      return;
    }
    if (row?.puedeEliminarse === false || row?.estaLiquidado) {
      toast.error(MSG_MOVIMIENTO_LIQUIDADO);
      return;
    }
    setMovimientoEliminar(row);
  };

  const handleDeleteDialogOpenChange = (open) => {
    if (open) return;
    if (eliminarEnCursoRef.current || isDeleting) return;
    setMovimientoEliminar(null);
  };

  const handleConfirmarEliminar = async () => {
    if (!movimientoEliminar) return;

    eliminarEnCursoRef.current = true;
    try {
      const response = await eliminarMovimiento(movimientoEliminar.id);
      if (!response.success) {
        const porLiquidacion =
          response.enLiquidacion
          || response.status === 409
          || /liquidaci/i.test(String(response.error || ''));
        if (porLiquidacion) {
          toast.error(response.error || MSG_MOVIMIENTO_LIQUIDADO);
          await recargar();
        } else {
          toast.error('No se pudo eliminar el movimiento', { description: response.error });
        }
        return;
      }

      toast.success('Movimiento eliminado');
      if (movimientoEditando?.id === movimientoEliminar.id) {
        setIsFormOpen(false);
        setMovimientoEditando(null);
      }
      setMovimientoEliminar(null);
    } finally {
      eliminarEnCursoRef.current = false;
    }
  };

  const handleSave = async (formData) => {
    const response = movimientoEditando
      ? await actualizarMovimiento(movimientoEditando.id, formData)
      : await crearMovimiento(formData);

    if (!response.success) {
      toast.error('No se pudo guardar el movimiento', { description: response.error });
      return;
    }

    toast.success(movimientoEditando ? 'Movimiento actualizado' : 'Movimiento creado');
    setIsFormOpen(false);
    setMovimientoEditando(null);
    await cargarMovimientos(filtrosApi);
  };

  return (
    <div className="space-y-6">
      <MovimientoFilters
        filtros={filters}
        empleados={empleados}
        loading={loading}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        onRefresh={recargar}
      />

      {error ? (
        <EmpleadosFeedback type="error" message={error} />
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MovimientoSummaryCard title="Total bonos" value={resumen.BONO} accentClass="text-slate-900" />
        <MovimientoSummaryCard title="Total descuentos" value={resumen.DESCUENTO} accentClass="text-slate-900" />
        <MovimientoSummaryCard title="Total adelantos" value={resumen.ADELANTO} accentClass="text-slate-900" />
        <MovimientoSummaryCard title="Total consumos" value={resumen.CONSUMO} accentClass="text-slate-900" />
      </div>

      <MovimientoTable
        rows={movimientos}
        onEdit={handleEdit}
        onDelete={handleSolicitudEliminar}
        loading={loading}
        isDeleting={isDeleting}
      />

      <AlertDialog open={!!movimientoEliminar} onOpenChange={handleDeleteDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Eliminar movimiento
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>¿Seguro que querés eliminar este movimiento? Se quitará del registro del empleado.</p>
                {movimientoEliminar ? (
                  <div className="rounded-lg border bg-muted p-3 text-left text-sm text-foreground">
                    <p className="font-medium">{movimientoEliminar.empleadoNombre}</p>
                    <p className="mt-1 text-muted-foreground">
                      {movimientoEliminar.tipoLabel || movimientoEliminar.tipo}
                      {' · '}
                      {formatMoneyShort(movimientoEliminar.monto)}
                    </p>
                    {movimientoEliminar.descripcion ? (
                      <p className="mt-1 line-clamp-2 text-muted-foreground">{movimientoEliminar.descripcion}</p>
                    ) : null}
                  </div>
                ) : null}
                <p className="text-sm font-medium text-destructive">Esta acción no se puede deshacer.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarEliminar}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MovimientoFormModal
        isOpen={isFormOpen}
        onClose={() => {
          if (isMutating) return;
          setIsFormOpen(false);
          setMovimientoEditando(null);
        }}
        movimiento={movimientoEditando}
        empleados={empleados}
        onSubmit={handleSave}
        isMutating={isMutating}
      />
    </div>
  );
}
