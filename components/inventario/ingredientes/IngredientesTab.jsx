import { useState, useEffect, useRef } from 'react';
import { Plus, Carrot, AlertCircle, AlertTriangle, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
import { IngredientesForm } from './IngredientesForm';
import { IngredientesCard } from './IngredientesCard';
import { IngredientesTable } from './IngredientesTable';
import { IngredientesFilters } from './IngredientesFilters';
import { toast } from '@/hooks/use-toast';

export function IngredientesTab({
  ingredientes,
  loadingIngredientes,
  errorIngredientes,
  metaIngredientes,
  onCargarIngredientes,
  onCrearIngrediente,
  onEditarIngrediente,
  onEliminarIngrediente
}) {
  // Estados para el formulario
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ingredienteEditando, setIngredienteEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    precio_extra: 0,
    disponible: 1,
  });

  // Estados para confirmación de eliminación
  const [ingredienteEliminar, setIngredienteEliminar] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Estado para items por página según tamaño de pantalla
  const [itemsPerPage, setItemsPerPage] = useState(6); // Empezar con 6 (mobile-first)
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef(null);

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    nombre: '',
    disponible: 'all'
  });

  // Detectar tamaño de pantalla y actualizar items por página
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;

      let newItems;
      if (width < 768) {
        newItems = 6; // Mobile
      } else if (width < 1024) {
        newItems = 8; // Tablet
      } else {
        newItems = 10; // Desktop
      }

      setItemsPerPage(prev => {
        if (prev !== newItems) {
          setCurrentPage(1); // Reset to first page when items per page changes
          return newItems;
        }
        return prev;
      });
    };

    // Ejecutar inmediatamente en mount
    updateItemsPerPage();

    // Agregar listener para resize
    window.addEventListener('resize', updateItemsPerPage);

    return () => {
      window.removeEventListener('resize', updateItemsPerPage);
    };
  }, []);

  // Cargar ingredientes al montar el componente
  useEffect(() => {
    onCargarIngredientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resetear paginación cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filtros.nombre, filtros.disponible]);

  // Abrir modal para crear
  const abrirModalCrear = () => {
    setIngredienteEditando(null);
    setFormulario({
      nombre: '',
      descripcion: '',
      precio_extra: 0,
      disponible: 1,
    });
    setModalAbierto(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (ingrediente) => {
    setIngredienteEditando(ingrediente);
    setFormulario({
      nombre: ingrediente.nombre,
      descripcion: ingrediente.descripcion || '',
      precio_extra: ingrediente.precio_extra || 0,
      disponible: ingrediente.disponible,
    });
    setModalAbierto(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalAbierto(false);
    setIngredienteEditando(null);
    setFormulario({
      nombre: '',
      descripcion: '',
      precio_extra: 0,
      disponible: 1,
    });
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    setLoadingSubmit(true);

    // Validaciones
    if (!formulario.nombre || formulario.nombre.trim() === '') {
      toast.error('El nombre del ingrediente es obligatorio');
      setLoadingSubmit(false);
      return;
    }

    if (formulario.nombre.trim().length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres');
      setLoadingSubmit(false);
      return;
    }

    const precioExtra = parseFloat(formulario.precio_extra);
    if (isNaN(precioExtra) || precioExtra < 0) {
      toast.error('El precio extra debe ser un número válido mayor o igual a 0');
      setLoadingSubmit(false);
      return;
    }

    try {
      const datos = {
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim() || null,
        precio_extra: precioExtra,
        disponible: formulario.disponible
      };

      let resultado;

      if (ingredienteEditando) {
        resultado = await onEditarIngrediente(ingredienteEditando.id, datos);
      } else {
        resultado = await onCrearIngrediente(datos);
      }

      if (resultado.success) {
        toast.success(ingredienteEditando
          ? 'Ingrediente actualizado correctamente'
          : 'Ingrediente creado correctamente'
        );
        cerrarModal();
        onCargarIngredientes();
      } else {
        toast.error(resultado.error || 'Ha ocurrido un error');
      }
    } catch (error) {
      toast.error('Ha ocurrido un error inesperado');
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Confirmar eliminación
  const confirmarEliminacion = async () => {
    if (!ingredienteEliminar) return;

    setLoadingSubmit(true);

    try {
      const resultado = await onEliminarIngrediente(ingredienteEliminar.id);

      if (resultado.success) {
        toast.success('Ingrediente eliminado correctamente');
        setIngredienteEliminar(null);
        onCargarIngredientes();
      } else {
        toast.error(resultado.error || 'No se pudo eliminar el ingrediente');
      }
    } catch (error) {
      toast.error('Ha ocurrido un error inesperado');
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Manejar cambio de filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      nombre: '',
      disponible: 'all'
    });
  };

  // Aplicar filtros localmente
  const ingredientesFiltrados = ingredientes.filter(ingrediente => {
    // Filtro por nombre
    if (filtros.nombre && !ingrediente.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())) {
      return false;
    }

    // Filtro por estado
    if (filtros.disponible === 'active' && ingrediente.disponible !== 1) {
      return false;
    }
    if (filtros.disponible === 'inactive' && ingrediente.disponible === 1) {
      return false;
    }

    return true;
  });

  // Ajustar página actual si queda fuera de rango después de operaciones
  useEffect(() => {
    const totalPages = Math.ceil(ingredientesFiltrados.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [ingredientesFiltrados.length, currentPage, itemsPerPage]);

  // Calcular paginación local
  const totalPages = Math.ceil(ingredientesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIngredientes = ingredientesFiltrados.slice(startIndex, endIndex);

  const handleCambiarPagina = (nuevaPagina) => {
    setCurrentPage(nuevaPagina);
    // Scroll suavemente hasta el inicio del contenedor
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loadingIngredientes) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando ingredientes...</p>
        </div>
      </div>
    );
  }

  if (errorIngredientes) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los ingredientes: {errorIngredientes}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center justify-center sm:justify-start gap-2">
            <Carrot className="h-6 w-6" />
            Gestión de Ingredientes
          </h2>
          <p className="text-muted-foreground mt-1">
            Total: {ingredientes.length} ingredientes
          </p>
        </div>
        <Button onClick={abrirModalCrear} className="gap-2 w-[200px] sm:w-auto bg-green-500 hover:bg-green-600">
          <Plus className="h-4 w-4" />
          Nuevo Ingrediente
        </Button>
      </div>

      {/* Filtros */}
      <IngredientesFilters
        filtros={filtros}
        onFiltroChange={handleFiltroChange}
        onLimpiarFiltros={limpiarFiltros}
      />

      {/* Contenido */}
      {ingredientes.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Carrot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay ingredientes</h3>
          <p className="text-muted-foreground mb-4">
            Comienza creando tu primer ingrediente
          </p>
          <Button onClick={abrirModalCrear} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Primer Ingrediente
          </Button>
        </div>
      ) : ingredientesFiltrados.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Carrot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron ingredientes</h3>
          <p className="text-muted-foreground mb-4">
            Probá ajustando los filtros o creá un nuevo ingrediente
          </p>
          <Button onClick={limpiarFiltros} variant="outline" className="gap-2">
            <X className="h-4 w-4 mr-2" />
            Limpiar Filtros 
          </Button>
        </div>
      ) : (
        <>
          {/* Vista Desktop - Tabla */}
          <IngredientesTable
            ingredientes={currentIngredientes}
            onEditar={abrirModalEditar}
            onEliminar={setIngredienteEliminar}
          />

          {/* Vista Mobile/Tablet - Cards */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentIngredientes.map((ingrediente) => (
              <IngredientesCard
                key={ingrediente.id}
                ingrediente={ingrediente}
                onEditar={abrirModalEditar}
                onEliminar={setIngredienteEliminar}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
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

                {/* Números de página - Ocultos en móvil pequeño, visibles desde 640px */}
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

                {/* Indicador de página actual en móvil pequeño */}
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
          )}
        </>
      )}

      {/* Modal de formulario */}
      <IngredientesForm
        isOpen={modalAbierto}
        onClose={cerrarModal}
        formulario={formulario}
        setFormulario={setFormulario}
        onSubmit={handleSubmit}
        isEditing={!!ingredienteEditando}
        loading={loadingSubmit}
      />

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={!!ingredienteEliminar} onOpenChange={() => setIngredienteEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Eliminar Ingrediente
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                ¿Estás seguro de que quieres eliminar este ingrediente?
              </p>
              {ingredienteEliminar && (
                <Card className="bg-muted">
                  <CardContent className="p-4">
                    <p className="font-semibold">{ingredienteEliminar.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      Será marcado como no disponible y no se podrá usar en nuevos artículos.
                    </p>
                  </CardContent>
                </Card>
              )}
              <p className="text-sm">
                Esta acción se puede revertir editando el ingrediente posteriormente.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingSubmit}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarEliminacion}
              disabled={loadingSubmit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loadingSubmit ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
