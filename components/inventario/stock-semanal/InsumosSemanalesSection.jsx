import { useEffect, useState } from 'react';
import { Plus, AlertCircle, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { InsumosSemanalesFormModal } from './InsumosSemanalesFormModal';
import { InsumosSemanalesTable } from './InsumosSemanalesTable';
import { InsumosSemanalesCard } from './InsumosSemanalesCard';
import { toast } from '@/hooks/use-toast';
import { clearFieldError, hasErrors } from '@/lib/form-errors';
import { isInsumoSemanalActivo } from './insumosSemanalesUtils';

const emptyForm = () => ({
  nombre: '',
  descripcion: '',
  activo: 1,
});

function validateForm(formulario) {
  const nextErrors = {};
  const nombre = (formulario.nombre || '').trim();
  if (!nombre) {
    nextErrors.nombre = 'El nombre es obligatorio';
  }
  return nextErrors;
}

function buildApiPayload(formulario, isEditing) {
  const nombre = (formulario.nombre || '').trim();
  const descripcionRaw = (formulario.descripcion || '').trim();
  const base = {
    nombre,
    descripcion: descripcionRaw ? descripcionRaw : null,
  };
  if (isEditing) {
    return base;
  }
  return {
    ...base,
    activo: formulario.activo !== 0 && formulario.activo !== false,
  };
}

export function InsumosSemanalesSection({
  insumosSemanales,
  loadingInsumosSemanales,
  errorInsumosSemanales,
  onCargarInsumosSemanales,
  onCrearInsumoSemanal,
  onEditarInsumoSemanal,
  onSetActivoInsumoSemanal,
  onEliminarInsumoSemanal,
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [insumoEditando, setInsumoEditando] = useState(null);
  const [formulario, setFormulario] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [insumoEliminar, setInsumoEliminar] = useState(null);
  const [loadingEliminar, setLoadingEliminar] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [insumosSemanales.length]);

  const totalPages = Math.ceil(insumosSemanales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInsumos = insumosSemanales.slice(startIndex, startIndex + itemsPerPage);

  const handleCambiarPagina = (nuevaPagina) => {
    setCurrentPage(nuevaPagina);
  };

  const abrirCrear = () => {
    setInsumoEditando(null);
    setFormulario(emptyForm());
    setErrors({});
    setModalAbierto(true);
  };

  const abrirEditar = (insumo) => {
    setInsumoEditando(insumo);
    setFormulario({
      nombre: insumo.nombre || '',
      descripcion: insumo.descripcion || '',
      activo: isInsumoSemanalActivo(insumo) ? 1 : 0,
    });
    setErrors({});
    setModalAbierto(true);
  };

  const resetModalState = () => {
    setModalAbierto(false);
    setInsumoEditando(null);
    setFormulario(emptyForm());
    setErrors({});
  };

  const handleDialogOpenChange = (open) => {
    if (!open && !loadingSubmit) {
      resetModalState();
    }
  };

  const onFieldChange = (campo, valor) => {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
    setErrors((prev) => clearFieldError(prev, campo));
  };

  const handleSubmit = async () => {
    const nextErrors = validateForm(formulario);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      toast.error(Object.values(nextErrors)[0]);
      return;
    }

    const payload = buildApiPayload(formulario, Boolean(insumoEditando));
    const activoDeseado = formulario.activo !== 0 && formulario.activo !== false;
    setLoadingSubmit(true);

    try {
      let resultado;
      if (insumoEditando) {
        const estabaActivo = isInsumoSemanalActivo(insumoEditando);
        resultado = await onEditarInsumoSemanal(insumoEditando.id, payload);
        if (resultado.success && estabaActivo !== activoDeseado) {
          const resultadoEstado = await onSetActivoInsumoSemanal(insumoEditando.id, activoDeseado);
          if (!resultadoEstado.success) {
            toast.error(resultadoEstado.error || 'No se pudo actualizar el estado del insumo');
            return;
          }
        }
      } else {
        resultado = await onCrearInsumoSemanal(payload);
      }

      if (resultado.success) {
        toast.success(insumoEditando ? 'Insumo actualizado' : 'Insumo creado');
        resetModalState();
      } else {
        toast.error(resultado.error || 'No se pudo guardar');
      }
    } catch {
      toast.error('Error inesperado al guardar');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleEliminarInsumo = async () => {
    if (!insumoEliminar) return;
    setLoadingEliminar(true);
    try {
      const resultado = await onEliminarInsumoSemanal(insumoEliminar.id);
      if (resultado.success) {
        toast.success('Insumo eliminado correctamente');
        setInsumoEliminar(null);
      } else {
        toast.error(resultado.error || 'No se pudo eliminar el insumo');
      }
    } catch {
      toast.error('Error al eliminar el insumo');
    } finally {
      setLoadingEliminar(false);
    }
  };

  if (loadingInsumosSemanales && insumosSemanales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#315e92]" aria-hidden />
        <p className="text-muted-foreground text-sm">Cargando insumos semanales…</p>
      </div>
    );
  }

  if (errorInsumosSemanales) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span>{errorInsumosSemanales}</span>
            <Button type="button" size="sm" variant="outline" onClick={() => onCargarInsumosSemanales()}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {loadingInsumosSemanales && insumosSemanales.length > 0 ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px]"
          aria-busy="true"
        >
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 shadow-sm text-sm text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin text-[#315e92]" />
            Actualizando…
          </div>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={abrirCrear}
          className="gap-2 w-full sm:w-auto shrink-0 bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Nuevo insumo
        </Button>
      </div>

      {insumosSemanales.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2">No hay insumos configurados</h4>
          <p className="text-muted-foreground mb-4">Creá el primero para empezar el control semanal</p>
          <Button type="button" onClick={abrirCrear} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo insumo
          </Button>
        </div>
      ) : (
        <>
          <InsumosSemanalesTable
            insumos={currentInsumos}
            onEditar={abrirEditar}
            onEliminar={setInsumoEliminar}
          />
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentInsumos.map((insumo) => (
              <InsumosSemanalesCard
                key={insumo.id}
                insumo={insumo}
                onEditar={abrirEditar}
                onEliminar={setInsumoEliminar}
              />
            ))}
          </div>
          {totalPages > 1 ? (
            <Pagination>
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handleCambiarPagina(Math.max(1, currentPage - 1))}
                    className={`cursor-pointer text-xs md:text-sm ${
                      currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }`}
                  />
                </PaginationItem>

                <div className="hidden sm:flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index + 1}>
                      <PaginationLink
                        onClick={() => handleCambiarPagina(index + 1)}
                        isActive={currentPage === index + 1}
                        className="cursor-pointer"
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                </div>

                <div className="flex sm:hidden items-center px-3 text-sm text-muted-foreground">
                  {currentPage} / {totalPages}
                </div>

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handleCambiarPagina(Math.min(totalPages, currentPage + 1))}
                    className={`cursor-pointer text-xs md:text-sm ${
                      currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </>
      )}

      <InsumosSemanalesFormModal
        isOpen={modalAbierto}
        onOpenChange={handleDialogOpenChange}
        formulario={formulario}
        onFieldChange={onFieldChange}
        errors={errors}
        onSubmit={handleSubmit}
        isEditing={Boolean(insumoEditando)}
        loading={loadingSubmit}
      />

      <AlertDialog open={!!insumoEliminar} onOpenChange={() => setInsumoEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar insumo semanal</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>¿Confirmás que querés eliminar este insumo semanal?</p>
                {insumoEliminar ? (
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="font-medium text-slate-900">{insumoEliminar.nombre}</p>
                    <p className="text-sm text-muted-foreground">Se eliminará definitivamente de la base de datos.</p>
                  </div>
                ) : null}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingEliminar}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminarInsumo}
              disabled={loadingEliminar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loadingEliminar ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
