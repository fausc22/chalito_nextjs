import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from '@/hooks/use-toast';
import { useEmpleados } from '@/hooks/empleados/useEmpleados';
import { EmpleadosFeedback } from '@/components/empleados/EmpleadosFeedback';
import { EmpleadoCard } from './EmpleadoCard';
import { EmpleadoFormModal } from './EmpleadoFormModal';
import { EmpleadosFilters } from './EmpleadosFilters';

export function EmpleadosSection() {
  const router = useRouter();
  const {
    empleados,
    loading,
    error,
    isMutating,
    cargarEmpleados,
    crearEmpleado,
    actualizarEmpleado,
    cambiarEstadoEmpleado,
  } = useEmpleados();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('activos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);

  useEffect(() => {
    cargarEmpleados(estadoFiltro);
  }, [cargarEmpleados, estadoFiltro]);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.nuevo !== '1') return;

    setEmpleadoEditando(null);
    setIsFormOpen(true);

    const nextQuery = { ...router.query };
    delete nextQuery.nuevo;
    router.replace(
      { pathname: router.pathname, query: nextQuery },
      undefined,
      { shallow: true }
    );
  }, [router]);

  const empleadosFiltrados = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return empleados.filter((empleado) => {
      if (!normalizedSearch) return true;
      return (
        empleado.nombreCompleto.toLowerCase().includes(normalizedSearch) ||
        empleado.nombre.toLowerCase().includes(normalizedSearch) ||
        empleado.apellido.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [empleados, searchTerm]);

  const openEditarEmpleado = (empleado) => {
    setEmpleadoEditando(empleado);
    setIsFormOpen(true);
  };

  const handleSaveEmpleado = async (formData) => {
    const response = empleadoEditando
      ? await actualizarEmpleado(empleadoEditando.id, formData)
      : await crearEmpleado(formData);

    if (!response.success) {
      toast.error('No se pudo guardar el empleado', { description: response.error });
      return;
    }

    toast.success(empleadoEditando ? 'Empleado actualizado' : 'Empleado creado');
    await cargarEmpleados(estadoFiltro);
    setIsFormOpen(false);
    setEmpleadoEditando(null);
  };

  const handleToggleEstado = async (empleado) => {
    const nextState = !empleado.activo;
    const response = await cambiarEstadoEmpleado(empleado.id, nextState);
    if (!response.success) {
      toast.error('No se pudo actualizar el estado', { description: response.error });
      return;
    }

    toast.success(nextState ? 'Empleado activado' : 'Empleado inactivado');
    await cargarEmpleados(estadoFiltro);
  };

  if (loading && empleados.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-60 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EmpleadosFilters
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        estadoValue={estadoFiltro}
        onEstadoChange={setEstadoFiltro}
        onRefresh={() => cargarEmpleados(estadoFiltro)}
        loading={loading}
      />

      {error ? (
        <EmpleadosFeedback type="error" message={error} />
      ) : null}

      {empleadosFiltrados.length === 0 ? (
        <EmpleadosFeedback
          type="empty"
          message="No hay empleados para mostrar con los filtros actuales."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {empleadosFiltrados.map((empleado) => (
            <EmpleadoCard
              key={empleado.id}
              empleado={empleado}
              isMutating={isMutating}
              onEdit={openEditarEmpleado}
              onToggle={handleToggleEstado}
            />
          ))}
        </div>
      )}

      <EmpleadoFormModal
        isOpen={isFormOpen}
        onClose={() => {
          if (isMutating) return;
          setIsFormOpen(false);
          setEmpleadoEditando(null);
        }}
        empleado={empleadoEditando}
        onSubmit={handleSaveEmpleado}
        isMutating={isMutating}
      />
    </div>
  );
}
