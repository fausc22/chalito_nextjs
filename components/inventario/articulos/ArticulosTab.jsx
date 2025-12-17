import { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, AlertTriangle, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { ArticulosFilters } from './ArticulosFilters';
import { ArticulosTable } from './ArticulosTable';
import { ArticulosCard } from './ArticulosCard';
import { ArticulosForm } from './ArticulosForm';
import { ArticulosPageSkeleton } from '../../common/LoadingSkeleton';
import { toast } from '@/hooks/use-toast';

export function ArticulosTab({
  articulos,
  loadingArticulos,
  errorArticulos,
  metaArticulos,
  isMutatingArticulos,
  categorias,
  ingredientesDisponibles,
  onCargarArticulos,
  onCrearArticulo,
  onEditarArticulo,
  onEliminarArticulo,
  onObtenerArticuloPorId
}) {

  // Estados locales para UI
  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);

  // Estados locales para filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    tipo: '',
    mostrarInactivos: false
  });

  // Aplicar filtros a los artículos
  const articulosFiltrados = useMemo(() => {
    return articulos.filter(articulo => {
      // Filtro por búsqueda (nombre)
      if (filtros.busqueda && !articulo.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())) {
        return false;
      }

      // Filtro por categoría
      if (filtros.categoria && articulo.categoria !== filtros.categoria) {
        return false;
      }

      // Filtro por tipo
      if (filtros.tipo && articulo.tipo !== filtros.tipo) {
        return false;
      }

      // Filtro por activos/inactivos
      if (!filtros.mostrarInactivos && !articulo.activo) {
        return false;
      }

      return true;
    });
  }, [articulos, filtros.busqueda, filtros.categoria, filtros.tipo, filtros.mostrarInactivos]);

  // Estados para paginación móvil
  const [currentPageMobile, setCurrentPageMobile] = useState(1);
  const itemsPerPageMobile = 4;
  const mobileViewRef = useRef(null);
  const containerRef = useRef(null);

  // Resetear paginación cuando cambien los filtros
  useEffect(() => {
    setCurrentPageMobile(1);
  }, [filtros.busqueda, filtros.categoria, filtros.tipo, filtros.mostrarInactivos]);

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    tipo: 'OTRO',
    tiempoPreparacion: '',
    stock_actual: '',
    stock_minimo: '',
    activo: true,
    ingredientes: []
  });

  // Estados para imagen
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  // Paginación para vista móvil
  const totalPagesMobile = useMemo(
    () => Math.ceil(articulosFiltrados.length / itemsPerPageMobile),
    [articulosFiltrados.length, itemsPerPageMobile]
  );
  const currentArticulosMobile = useMemo(() => {
    const startIndexMobile = (currentPageMobile - 1) * itemsPerPageMobile;
    const endIndexMobile = startIndexMobile + itemsPerPageMobile;
    return articulosFiltrados.slice(startIndexMobile, endIndexMobile);
  }, [articulosFiltrados, currentPageMobile, itemsPerPageMobile]);

  // Handler para cambio de página en móvil
  const handlePageChangeMobile = (page) => {
    setCurrentPageMobile(page);
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    setFormulario({
      codigo: '',
      nombre: '',
      descripcion: '',
      precio: '',
      categoria: '',
      tipo: 'OTRO',
      tiempoPreparacion: '',
      stock_actual: '',
      stock_minimo: '',
      activo: true,
      ingredientes: []
    });
    // Limpiar imagen
    if (imagenPreview) {
      URL.revokeObjectURL(imagenPreview);
    }
    setImagenFile(null);
    setImagenPreview(null);
  };

  const validarCamposObligatorios = () => {
    if (!formulario.nombre.trim()) {
      return 'El nombre es obligatorio';
    }

    if (!formulario.precio || parseFloat(formulario.precio) <= 0) {
      return 'El precio debe ser mayor a 0';
    }

    if (!formulario.categoria.trim()) {
      return 'La categoría es obligatoria';
    }

    return null;
  };

  const obtenerCategoriaId = () => {
    const categoriaObj = categorias.find(c =>
      (typeof c === 'string' ? c : c.nombre) === formulario.categoria
    );
    return typeof categoriaObj === 'string' ? null : categoriaObj?.id;
  };

  const construirPayloadArticulo = (categoria_id) => ({
    ...formulario,
    categoria_id
  });

  // Handlers
  const handleCrearArticulo = async () => {
    const errorValidacion = validarCamposObligatorios();
    if (errorValidacion) {
      toast.error(errorValidacion);
      return;
    }

    const categoria_id = obtenerCategoriaId();
    if (!categoria_id) {
      toast.error('Categoría no válida');
      return;
    }

    // Pasar el archivo de imagen al servicio
    const resultado = await onCrearArticulo(construirPayloadArticulo(categoria_id), imagenFile);

    if (resultado.success) {
      setModalAgregar(false);
      limpiarFormulario();
      toast.success('Artículo creado correctamente');
      // Recargar la lista de artículos
      onCargarArticulos();
    } else {
      toast.error(resultado.error);
    }
  };

  const handleActualizarArticulo = async () => {
    const errorValidacion = validarCamposObligatorios();
    if (errorValidacion) {
      toast.error(errorValidacion);
      return;
    }

    // Validación: No permitir cambiar tipo si el artículo original tiene ingredientes asociados
    const ingredientesOriginales = articuloSeleccionado?.contenido || articuloSeleccionado?.ingredientes || [];
    if (articuloSeleccionado?.tipo === 'ELABORADO' &&
        formulario.tipo !== 'ELABORADO' &&
        ingredientesOriginales.length > 0) {
      toast.error('No se puede cambiar el tipo de un artículo cuando ya tiene ingredientes asociados. Primero eliminá los ingredientes.');
      return;
    }

    const categoria_id = obtenerCategoriaId();
    if (!categoria_id) {
      toast.error('Categoría no válida');
      return;
    }

    const resultado = await onEditarArticulo(
      articuloSeleccionado.id,
      construirPayloadArticulo(categoria_id)
    );

    if (resultado.success) {
      setModalEditar(false);
      setArticuloSeleccionado(null);
      limpiarFormulario();
      toast.success('Artículo actualizado correctamente');
      // Recargar la lista de artículos
      onCargarArticulos();
    } else {
      toast.error(resultado.error);
    }
  };

  const handleEliminarArticulo = async () => {
    const resultado = await onEliminarArticulo(articuloSeleccionado.id);

    if (resultado.success) {
      setModalEliminar(false);
      setArticuloSeleccionado(null);
      toast.success('Artículo eliminado correctamente');
      // Recargar la lista de artículos
      onCargarArticulos();
    } else {
      toast.error(resultado.error);
    }
  };

  const handleEditar = async (articulo) => {
    try {
      // Obtener el artículo completo con sus ingredientes
      const resultado = await onObtenerArticuloPorId(articulo.id);

      if (resultado.success) {
        const articuloCompleto = resultado.data;
        setArticuloSeleccionado(articuloCompleto);
        setFormulario({
          codigo: articuloCompleto.codigo || articuloCompleto.codigo_barra || '',
          nombre: articuloCompleto.nombre,
          descripcion: articuloCompleto.descripcion || '',
          precio: articuloCompleto.precio ? articuloCompleto.precio.toString() : '',
          categoria: articuloCompleto.categoria,
          tipo: articuloCompleto.tipo || 'OTRO',
          tiempoPreparacion: articuloCompleto.tiempoPreparacion ? articuloCompleto.tiempoPreparacion.toString() : '',
          stock_actual: articuloCompleto.stock_actual !== undefined && articuloCompleto.stock_actual !== null ? articuloCompleto.stock_actual.toString() : '',
          stock_minimo: articuloCompleto.stock_minimo !== undefined && articuloCompleto.stock_minimo !== null ? articuloCompleto.stock_minimo.toString() : '',
          activo: articuloCompleto.activo,
          ingredientes: articuloCompleto.contenido || articuloCompleto.ingredientes || []
        });
        setModalEditar(true);
      } else {
        toast.error('Error al cargar el artículo');
      }
    } catch (error) {
      toast.error('Error al cargar el artículo');
    }
  };

  const handleEliminar = (articulo) => {
    setArticuloSeleccionado(articulo);
    setModalEliminar(true);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      categoria: '',
      tipo: '',
      mostrarInactivos: false
    });
    setCurrentPageMobile(1); // Reset pagination when clearing filters
  };

  const handleCloseModal = () => {
    setModalAgregar(false);
    setModalEditar(false);
    setModalEliminar(false);
    setArticuloSeleccionado(null);
    limpiarFormulario();
  };

  // Loading state
  if (loadingArticulos) {
    return <ArticulosPageSkeleton />;
  }

  // Error state
  if (errorArticulos) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error al cargar artículos</AlertTitle>
        <AlertDescription>{errorArticulos}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center justify-center sm:justify-start gap-2">
            <Box className="h-6 w-6" />
            Gestión de Artículos
          </h2>
          <p className="text-muted-foreground mt-1">
            Administrá los productos del menú
          </p>
        </div>

        <Button onClick={() => setModalAgregar(true)} className="gap-2 w-[200px] sm:w-auto">
          <Plus className="h-4 w-4" />
          Nuevo Artículo
        </Button>
      </div>

      {/* Filtros */}
      <ArticulosFilters
        filtros={filtros} 
        categorias={categorias}
        onFiltroChange={handleFiltroChange}
        onLimpiarFiltros={limpiarFiltros}
      />

      {/* Vista Desktop - Tabla */}
      <div className="hidden md:block">
        <ArticulosTable
          articulos={articulosFiltrados}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
          scrollRef={containerRef}
        />
      </div>

      {/* Vista Mobile - Cards con paginación */}
      <div ref={mobileViewRef} className="md:hidden">
        {articulosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No se encontraron artículos</p>
              <p className="text-sm text-muted-foreground mt-2">
                Prueba ajustando los filtros o agrega un nuevo artículo
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {currentArticulosMobile.map((articulo) => (
                <ArticulosCard
                  key={articulo.id}
                  articulo={articulo}
                  onEditar={handleEditar}
                  onEliminar={handleEliminar}
                />
              ))}
            </div>

            {/* Paginación móvil */}
            {totalPagesMobile > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChangeMobile(Math.max(1, currentPageMobile - 1))}
                        className={`cursor-pointer text-xs ${
                          currentPageMobile === 1 ? 'pointer-events-none opacity-50' : ''
                        }`}
                      />
                    </PaginationItem>

                    {/* Indicador de página actual en móvil */}
                    <div className="flex items-center px-3 text-sm text-muted-foreground">
                      {currentPageMobile} / {totalPagesMobile}
                    </div>

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChangeMobile(Math.min(totalPagesMobile, currentPageMobile + 1))}
                        className={`cursor-pointer text-xs ${
                          currentPageMobile === totalPagesMobile ? 'pointer-events-none opacity-50' : ''
                        }`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Agregar/Editar */}
      <ArticulosForm
        isOpen={modalAgregar || modalEditar}
        onClose={handleCloseModal}
        formulario={formulario}
        setFormulario={setFormulario}
        categorias={categorias}
        ingredientes={ingredientesDisponibles}
        onSubmit={modalAgregar ? handleCrearArticulo : handleActualizarArticulo}
        isEditing={modalEditar}
        loading={isMutatingArticulos}
        imagenFile={imagenFile}
        setImagenFile={setImagenFile}
        imagenPreview={imagenPreview}
        setImagenPreview={setImagenPreview}
      />

      {/* AlertDialog Eliminar */}
      <AlertDialog open={modalEliminar} onOpenChange={setModalEliminar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Eliminar Artículo
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  ¿Estás seguro de que quieres eliminar este artículo?
                </p>
                {articuloSeleccionado && (
                  <div className="bg-muted rounded-lg p-4 border">
                    <p className="font-semibold">{articuloSeleccionado.nombre}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Será eliminado permanentemente.
                    </p>
                  </div>
                )}
                <p className="text-sm text-destructive font-medium">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutatingArticulos}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminarArticulo}
              disabled={isMutatingArticulos}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isMutatingArticulos ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
