import { useState, useEffect, useRef } from 'react';
import { Plus, AlertCircle, AlertTriangle, Pencil, Trash2, X, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { AdicionalesForm } from './AdicionalesForm';
import { AdicionalesCard } from './AdicionalesCard';
import { AdicionalesTable } from './AdicionalesTable';
import { AdicionalesFilters } from './AdicionalesFilters';
import { ModalAsignarAdicionales } from './ModalAsignarAdicionales';
import { ModalSeleccionarArticulo } from './ModalSeleccionarArticulo';
import { ArticulosConAdicionales } from './ArticulosConAdicionales';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

export function AdicionalesTab({
  adicionales,
  loadingAdicionales,
  errorAdicionales,
  metaAdicionales,
  onCargarAdicionales,
  onCrearAdicional,
  onEditarAdicional,
  onEliminarAdicional,
  articulos,
  onObtenerAdicionalesPorArticulo,
  onAsignarAdicionalesAArticulo
}) {
  // Estados para el formulario
  const [modalAbierto, setModalAbierto] = useState(false);
  const [adicionalEditando, setAdicionalEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    precio_extra: 0,
    disponible: 1,
  });

  // Estados para confirmación de eliminación
  const [adicionalEliminar, setAdicionalEliminar] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Estado para modales de asignar adicionales
  const [modalSeleccionarArticulo, setModalSeleccionarArticulo] = useState(false);
  const [modalAsignarAbierto, setModalAsignarAbierto] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);

  // Estado para items por página según tamaño de pantalla
  const [itemsPerPage, setItemsPerPage] = useState(6);
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
        newItems = 6;
      } else if (width < 1024) {
        newItems = 8;
      } else {
        newItems = 10;
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
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // Cargar adicionales al montar
  useEffect(() => {
    onCargarAdicionales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resetear paginación cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filtros.nombre, filtros.disponible]);

  // Abrir modal para crear
  const abrirModalCrear = () => {
    setAdicionalEditando(null);
    setFormulario({
      nombre: '',
      descripcion: '',
      precio_extra: 0,
      disponible: 1,
    });
    setModalAbierto(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (adicional) => {
    setAdicionalEditando(adicional);
    setFormulario({
      nombre: adicional.nombre,
      descripcion: adicional.descripcion || '',
      precio_extra: adicional.precio_extra || 0,
      disponible: adicional.disponible,
    });
    setModalAbierto(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalAbierto(false);
    setAdicionalEditando(null);
    setFormulario({
      nombre: '',
      descripcion: '',
      precio_extra: 0,
      disponible: 1,
    });
  };

  // Abrir modal para seleccionar artículo
  const abrirModalSeleccionarArticulo = () => {
    setModalSeleccionarArticulo(true);
  };

  // Cuando se selecciona un artículo, abrir modal de asignar adicionales
  const handleArticuloSeleccionado = (articulo) => {
    setArticuloSeleccionado(articulo);
    setModalAsignarAbierto(true);
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    setLoadingSubmit(true);

    if (!formulario.nombre || formulario.nombre.trim() === '') {
      toast.error('El nombre del adicional es obligatorio');
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

      if (adicionalEditando) {
        resultado = await onEditarAdicional(adicionalEditando.id, datos);
      } else {
        resultado = await onCrearAdicional(datos);
      }

      if (resultado.success) {
        toast.success(adicionalEditando
          ? 'Adicional actualizado correctamente'
          : 'Adicional creado correctamente'
        );
        cerrarModal();
        onCargarAdicionales();
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
    if (!adicionalEliminar) return;
    setLoadingSubmit(true);

    try {
      const resultado = await onEliminarAdicional(adicionalEliminar.id);

      if (resultado.success) {
        toast.success('Adicional eliminado correctamente');
        setAdicionalEliminar(null);
        onCargarAdicionales();
      } else {
        toast.error(resultado.error || 'No se pudo eliminar el adicional');
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
  const adicionalesFiltrados = adicionales.filter(adicional => {
    if (filtros.nombre && !adicional.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())) {
      return false;
    }
    if (filtros.disponible === 'active' && adicional.disponible !== 1) {
      return false;
    }
    if (filtros.disponible === 'inactive' && adicional.disponible === 1) {
      return false;
    }
    return true;
  });

  // Ajustar página actual si queda fuera de rango después de operaciones
  useEffect(() => {
    const totalPages = Math.ceil(adicionalesFiltrados.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [adicionalesFiltrados.length, currentPage, itemsPerPage]);

  // Calcular paginación local
  const totalPages = Math.ceil(adicionalesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAdicionales = adicionalesFiltrados.slice(startIndex, endIndex);

  const handleCambiarPagina = (nuevaPagina) => {
    setCurrentPage(nuevaPagina);
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loadingAdicionales) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando adicionales...</p>
        </div>
      </div>
    );
  }

  if (errorAdicionales) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los adicionales: {errorAdicionales}
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
            <Plus className="h-6 w-6" />
            Gestión de Adicionales
          </h2>
          <p className="text-muted-foreground mt-1">
            Total: {adicionales.length} adicionales
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
          <Button onClick={abrirModalCrear} className="gap-2 w-[200px] sm:w-auto">
            <Plus className="h-4 w-4" />
            Nuevo Adicional
          </Button>
          <Button 
            onClick={abrirModalSeleccionarArticulo} 
            className="gap-2 w-[200px] sm:w-auto"
          >
            <Link2 className="h-4 w-4" />
            Asignar a Artículo
          </Button>
        </div>
      </div>

      {/* Tabs para Adicionales y Artículos con Adicionales */}
      <Tabs defaultValue="adicionales" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="adicionales">Adicionales</TabsTrigger>
          <TabsTrigger value="articulos">Artículos con Adicionales</TabsTrigger>
        </TabsList>

        <TabsContent value="adicionales" className="space-y-6">
          {/* Filtros */}
          <AdicionalesFilters
            filtros={filtros}
            onFiltroChange={handleFiltroChange}
            onLimpiarFiltros={limpiarFiltros}
          />

          {/* Contenido */}
      {adicionales.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay adicionales</h3>
          <p className="text-muted-foreground mb-4">
            Comienza creando tu primer adicional
          </p>
          <Button onClick={abrirModalCrear} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Primer Adicional
          </Button>
        </div>
      ) : adicionalesFiltrados.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron adicionales</h3>
          <p className="text-muted-foreground mb-4">
            Probá ajustando los filtros o creá un nuevo adicional
          </p>
          <Button onClick={limpiarFiltros} variant="outline" className="gap-2">
            <X className="h-4 w-4 mr-2" />
            Limpiar Filtros 
          </Button>
        </div>
      ) : (
        <>
          {/* Vista Desktop - Tabla */}
          <AdicionalesTable
            adicionales={currentAdicionales}
            onEditar={abrirModalEditar}
            onEliminar={setAdicionalEliminar}
          />

          {/* Vista Mobile/Tablet - Cards */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentAdicionales.map((adicional) => (
              <AdicionalesCard
                key={adicional.id}
                adicional={adicional}
                onEditar={abrirModalEditar}
                onEliminar={setAdicionalEliminar}
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
          )}
        </>
      )}
        </TabsContent>

        <TabsContent value="articulos" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Artículos con Adicionales Asignados
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Aquí puedes ver y editar los adicionales asignados a cada artículo
            </p>
            <ArticulosConAdicionales
              onObtenerAdicionalesPorArticulo={onObtenerAdicionalesPorArticulo}
              onAsignarAdicionalesAArticulo={onAsignarAdicionalesAArticulo}
              onEditarArticulo={(articulo) => {
                setArticuloSeleccionado(articulo);
                setModalAsignarAbierto(true);
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de formulario */}
      <AdicionalesForm
        isOpen={modalAbierto}
        onClose={cerrarModal}
        formulario={formulario}
        setFormulario={setFormulario}
        onSubmit={handleSubmit}
        isEditing={!!adicionalEditando}
        loading={loadingSubmit}
      />

      {/* Modal para seleccionar artículo */}
      <ModalSeleccionarArticulo
        isOpen={modalSeleccionarArticulo}
        onClose={() => {
          setModalSeleccionarArticulo(false);
        }}
        onArticuloSeleccionado={handleArticuloSeleccionado}
      />

      {/* Modal para asignar adicionales a artículo */}
      {articuloSeleccionado && (
        <ModalAsignarAdicionales
          isOpen={modalAsignarAbierto}
          onClose={() => {
            setModalAsignarAbierto(false);
            setArticuloSeleccionado(null);
            // Disparar evento para actualizar la lista
            window.dispatchEvent(new CustomEvent('adicionalesActualizados'));
          }}
          articulo={articuloSeleccionado}
          onObtenerAdicionalesPorArticulo={onObtenerAdicionalesPorArticulo}
          onAsignarAdicionalesAArticulo={onAsignarAdicionalesAArticulo}
        />
      )}

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={!!adicionalEliminar} onOpenChange={() => setAdicionalEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Eliminar Adicional
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                ¿Estás seguro de que quieres eliminar este adicional?
              </p>
              {adicionalEliminar && (
                <Card className="bg-muted">
                  <CardContent className="p-4">
                    <p className="font-semibold">{adicionalEliminar.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      Será marcado como no disponible y no se podrá asignar a nuevos artículos.
                    </p>
                  </CardContent>
                </Card>
              )}
              <p className="text-sm">
                Esta acción se puede revertir editando el adicional posteriormente.
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

