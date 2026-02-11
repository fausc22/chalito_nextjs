import { useState, useEffect, useRef } from 'react';
import { Plus, Tag, AlertCircle } from 'lucide-react';
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
import { CategoriaCard } from './CategoriaCard';
import { CategoriasForm } from './CategoriasForm';
import { toast } from '@/hooks/use-toast';

export function CategoriasTab({
  categorias,
  loadingCategorias,
  errorCategorias,
  onCrearCategoria,
  onEditarCategoria,
  onEliminarCategoria,
  articulos = []
}) {
  // Estados para el formulario
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
  });

  // Estados para confirmación de eliminación
  const [categoriaEliminar, setCategoriaEliminar] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Estados para paginación
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef(null);

  // Detectar tamaño de pantalla y actualizar items por página
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;

      let newItems;
      if (width < 768) {
        newItems = 6; // Mobile
      } else if (width < 1024) {
        newItems = 8; // Tablet
      } else if (width < 1280) {
        newItems = 9; // Desktop (3 columnas)
      } else {
        newItems = 12; // XL (4 columnas)
      }

      setItemsPerPage(prev => {
        if (prev !== newItems) {
          setCurrentPage(1);
          return newItems;
        }
        return prev;
      });
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);

    return () => {
      window.removeEventListener('resize', updateItemsPerPage);
    };
  }, []);

  // Ajustar página actual si queda fuera de rango después de operaciones
  useEffect(() => {
    const totalPages = Math.ceil(categorias.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [categorias.length, currentPage, itemsPerPage]);

  // Abrir modal para crear
  const abrirModalCrear = () => {
    setCategoriaEditando(null);
    setFormulario({
      nombre: '',
      descripcion: '',
      activo: true,
    });
    setModalAbierto(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (categoria) => {
    setCategoriaEditando(categoria);
    setFormulario({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      activo: (categoria.activo === 1 || categoria.activo === "1" || categoria.activo === true) ? 1 : 0,
    });
    setModalAbierto(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalAbierto(false);
    setCategoriaEditando(null);
    setFormulario({
      nombre: '',
      descripcion: '',
      activo: true,
    });
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    setLoadingSubmit(true);

    // Validaciones
    if (!formulario.nombre || formulario.nombre.trim() === '') {
      toast.error('El nombre de la categoría es obligatorio');
      setLoadingSubmit(false);
      return;
    }

    if (formulario.nombre.trim().length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres');
      setLoadingSubmit(false);
      return;
    }

    try {
      let resultado;

      if (categoriaEditando) {
        resultado = await onEditarCategoria(categoriaEditando.id, formulario);
      } else {
        resultado = await onCrearCategoria(formulario);
      }

      if (resultado.success) {
        toast.success(categoriaEditando
          ? 'Categoría actualizada correctamente'
          : 'Categoría creada correctamente'
        );
        cerrarModal();
      } else {
        toast.error(resultado.error || 'Ha ocurrido un error');
      }
    } catch (error) {
      console.error('❌ Error en handleSubmit:', error);
      toast.error('Ha ocurrido un error inesperado');
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Confirmar eliminación
  const confirmarEliminacion = async () => {
    if (!categoriaEliminar) return;

    const articulosActivos = articulos.filter(
      (articulo) =>
        (articulo.categoria === categoriaEliminar.nombre ||
          articulo.categoria_id === categoriaEliminar.id) &&
        (articulo.activo === true || articulo.activo === 1 || articulo.activo === "1")
    );

    if (articulosActivos.length > 0) {
      toast.error('No se puede eliminar. Hay artículos activos asociados a esta categoría.');
      setCategoriaEliminar(null);
      return;
    }

    setLoadingSubmit(true);

    try {
      const resultado = await onEliminarCategoria(categoriaEliminar.id);

      if (resultado.success) {
        toast.success('Categoría eliminada correctamente');
        setCategoriaEliminar(null);
      } else {
        if (resultado.articulos_asociados) {
          toast.error(`No se puede eliminar. Tiene ${resultado.articulos_asociados} artículos asociados`);
        } else {
          toast.error(resultado.error || 'No se pudo eliminar la categoría');
        }
      }
    } catch (error) {
      toast.error('Ha ocurrido un error inesperado');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingCategorias) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (errorCategorias) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar las categorías: {errorCategorias}
        </AlertDescription>
      </Alert>
    );
  }

  // Ordenar categorías alfabéticamente
  const categoriasOrdenadas = [...categorias].sort((a, b) =>
    a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase())
  );

  // Calcular paginación
  const totalPages = Math.ceil(categoriasOrdenadas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategorias = categoriasOrdenadas.slice(startIndex, endIndex);

  const handleCambiarPagina = (nuevaPagina) => {
    setCurrentPage(nuevaPagina);
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center justify-center sm:justify-start gap-2">
            <Tag className="h-6 w-6" />
            Gestión de Categorías
          </h2>
          <p className="text-muted-foreground mt-1">
            Total: {categorias.length} categorías
          </p>
        </div>
        <Button onClick={abrirModalCrear} className="gap-2 w-[200px] sm:w-auto bg-green-500 hover:bg-green-600">
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* Grid de Cards */}
      {categorias.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay categorías</h3>
          <p className="text-muted-foreground mb-4">
            Comienza creando tu primera categoría
          </p>
          <Button onClick={abrirModalCrear} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Primera Categoría
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentCategorias.map((categoria) => (
              <CategoriaCard
                key={categoria.id}
                categoria={categoria}
                onEditar={abrirModalEditar}
                onEliminar={setCategoriaEliminar}
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
      <CategoriasForm
        isOpen={modalAbierto}
        onClose={cerrarModal}
        formulario={formulario}
        setFormulario={setFormulario}
        onSubmit={handleSubmit}
        isEditing={!!categoriaEditando}
        loading={loadingSubmit}
      />

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={!!categoriaEliminar} onOpenChange={() => setCategoriaEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la categoría {categoriaEliminar?.nombre}.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingSubmit}>Cancelar</AlertDialogCancel>
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
