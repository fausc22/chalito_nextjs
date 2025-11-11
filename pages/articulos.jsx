import { useState } from 'react';
import { BsPlus, BsExclamationTriangle } from 'react-icons/bs';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Layout } from '../components/layout/Layout';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { ArticulosPageSkeleton } from '../components/common/LoadingSkeleton';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ConfirmModal } from '../components/common/Modal';
import { ArticulosFilters } from '../components/articulos/ArticulosFilters';
import { ArticulosStats } from '../components/articulos/ArticulosStats';
import { ArticulosTable } from '../components/articulos/ArticulosTable';
import { ArticulosForm } from '../components/articulos/ArticulosForm';
import useArticulos from '../hooks/useArticulos';
import toast from 'react-hot-toast';

function ArticulosContent() {
  // Hook personalizado
  const {
    articulos,
    categorias,
    loading,
    error,
    filtros,
    estadisticas,
    crearArticulo,
    actualizarArticulo,
    eliminarArticulo,
    actualizarFiltros,
    limpiarFiltros,
  } = useArticulos();

  // Estados locales para UI
  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    tiempoPreparacion: '',
    disponible: true,
    ingredientes: []
  });

  // Limpiar formulario
  const limpiarFormulario = () => {
    setFormulario({
      codigo: '',
      nombre: '',
      descripcion: '',
      precio: '',
      categoria: '',
      tiempoPreparacion: '',
      disponible: true,
      ingredientes: []
    });
  };

  // Handlers
  const handleCrearArticulo = async () => {
    // Validaciones
    if (!formulario.codigo.trim()) {
      toast.error('El código es obligatorio');
      return;
    }

    if (!formulario.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    if (!formulario.precio || parseFloat(formulario.precio) <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }

    if (!formulario.tiempoPreparacion || parseInt(formulario.tiempoPreparacion) <= 0) {
      toast.error('El tiempo de preparación debe ser mayor a 0');
      return;
    }

    if (!formulario.categoria.trim()) {
      toast.error('La categoría es obligatoria');
      return;
    }

    setLoadingAction(true);
    const resultado = await crearArticulo(formulario);
    setLoadingAction(false);

    if (resultado.success) {
      setModalAgregar(false);
      limpiarFormulario();
      toast.success('Artículo creado exitosamente');
    } else {
      toast.error(resultado.error);
    }
  };

  const handleActualizarArticulo = async () => {
    setLoadingAction(true);
    const resultado = await actualizarArticulo(articuloSeleccionado.id, formulario);
    setLoadingAction(false);

    if (resultado.success) {
      setModalEditar(false);
      setArticuloSeleccionado(null);
      limpiarFormulario();
      toast.success('Artículo actualizado exitosamente');
    } else {
      toast.error(resultado.error);
    }
  };

  const handleEliminarArticulo = async () => {
    setLoadingAction(true);
    const resultado = await eliminarArticulo(articuloSeleccionado.id);
    setLoadingAction(false);

    if (resultado.success) {
      setModalEliminar(false);
      setArticuloSeleccionado(null);
      toast.success('Artículo eliminado exitosamente');
    } else {
      toast.error(resultado.error);
    }
  };

  const handleEditar = (articulo) => {
    setArticuloSeleccionado(articulo);
    setFormulario({
      codigo: articulo.codigo,
      nombre: articulo.nombre,
      descripcion: articulo.descripcion,
      precio: articulo.precio.toString(),
      categoria: articulo.categoria,
      tiempoPreparacion: articulo.tiempoPreparacion.toString(),
      disponible: articulo.disponible,
      ingredientes: articulo.ingredientes || []
    });
    setModalEditar(true);
  };

  const handleEliminar = (articulo) => {
    setArticuloSeleccionado(articulo);
    setModalEliminar(true);
  };

  const handleFiltroChange = (campo, valor) => {
    actualizarFiltros({ [campo]: valor });
  };

  const handleCloseModal = () => {
    setModalAgregar(false);
    setModalEditar(false);
    setModalEliminar(false);
    setArticuloSeleccionado(null);
    limpiarFormulario();
  };

  // Loading state
  if (loading) {
    return (
      <Layout title="Artículos">
        <ArticulosPageSkeleton />
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout title="Artículos">
        <div className="main-content">
          <Card className="bg-danger-50 border-danger-200">
            <h3 className="text-danger-800 text-xl font-bold mb-2">
              Error al cargar artículos
            </h3>
            <p className="text-danger-600">{error}</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Artículos">
      <main className="main-content">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-primary-700 mb-2">
                Gestión de Artículos
              </h1>
              <p className="text-gray-600 text-lg">
                Administra tu menú y productos
              </p>
            </div>

            <Button
              icon={<BsPlus size={20} />}
              onClick={() => setModalAgregar(true)}
            >
              Agregar Artículo
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <ArticulosFilters
          filtros={filtros}
          categorias={categorias}
          onFiltroChange={handleFiltroChange}
          onLimpiarFiltros={limpiarFiltros}
        />

        {/* Estadísticas */}
        <ArticulosStats estadisticas={estadisticas} />

        {/* Tabla de artículos */}
        <ArticulosTable
          articulos={articulos}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />

        {/* Modal Agregar/Editar */}
        <ArticulosForm
          isOpen={modalAgregar || modalEditar}
          onClose={handleCloseModal}
          formulario={formulario}
          setFormulario={setFormulario}
          categorias={categorias}
          onSubmit={modalAgregar ? handleCrearArticulo : handleActualizarArticulo}
          isEditing={modalEditar}
          loading={loadingAction}
        />

        {/* Modal Eliminar */}
        <ConfirmModal
          isOpen={modalEliminar}
          onClose={handleCloseModal}
          onConfirm={handleEliminarArticulo}
          title="Eliminar Artículo"
          message={`¿Estás seguro de que quieres eliminar este artículo?\n\n${articuloSeleccionado?.nombre} será marcado como inactivo y no estará disponible para nuevos pedidos.\n\nEsta acción se puede revertir editando el artículo posteriormente.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
          icon={<BsExclamationTriangle size={48} />}
          loading={loadingAction}
        />
      </main>
    </Layout>
  );
}

export default function ArticulosPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <ArticulosContent />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}

