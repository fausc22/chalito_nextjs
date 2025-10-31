import { useState, useRef } from 'react';
import Image from 'next/image';
import { ProtectedRoute } from '../src/components/auth/ProtectedRoute';
import { Layout } from '../src/components/layout/Layout';
import ErrorBoundary from '../src/components/common/ErrorBoundary';
import { ArticulosPageSkeleton, StatsGridSkeleton } from '../src/components/common/LoadingSkeleton';
import useArticulos from '../src/hooks/useArticulos';
import {
  BsPlus,
  BsSearch,
  BsTrash,
  BsFilter,
  BsX,
  BsCheck2,
  BsExclamationTriangle,
  BsPencil
} from 'react-icons/bs';
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

  // Estados locales solo para UI
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);

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

  // Funciones auxiliares de UI
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

    const resultado = await crearArticulo(formulario);
    if (resultado.success) {
      setModalAgregar(false);
      limpiarFormulario();
      toast.success('Artículo creado exitosamente');
    } else {
      toast.error(resultado.error);
    }
  };

  const handleActualizarArticulo = async () => {
    const resultado = await actualizarArticulo(articuloSeleccionado.id, formulario);
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
    const resultado = await eliminarArticulo(articuloSeleccionado.id);
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

  if (loading) {
    return (
      <Layout title="Artículos">
        <ArticulosPageSkeleton />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Artículos">
        <div className="main-content">
          <div className="card bg-danger-50 border-danger-200">
            <h3 className="text-danger-800 text-xl font-bold mb-2">Error al cargar artículos</h3>
            <p className="text-danger-600">{error}</p>
          </div>
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
              <h1 className="text-4xl font-bold text-primary-700 mb-2">Gestión de Artículos</h1>
              <p className="text-gray-600 text-lg">Administra tu menú y productos</p>
            </div>

            <button
              onClick={() => setModalAgregar(true)}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <BsPlus size={20} />
              Agregar Artículo
            </button>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="card mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  value={filtros.busqueda}
                  onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                  className="input pl-12 w-full"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  className={`btn flex items-center gap-2 ${mostrarFiltros ? 'btn-primary' : 'btn-outline'}`}
                >
                  <BsFilter />
                  Filtros
                </button>

                {(filtros.busqueda || filtros.categoria || filtros.disponible !== 'todos' || filtros.precioMin || filtros.precioMax) && (
                  <button
                    onClick={limpiarFiltros}
                    className="btn-danger flex items-center gap-2"
                  >
                    <BsX />
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Panel de filtros expandible */}
            {mostrarFiltros && (
              <div className="pt-6 border-t border-gray-200 animate-slide-down">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Categoría</label>
                    <select
                      value={filtros.categoria}
                      onChange={(e) => handleFiltroChange('categoria', e.target.value)}
                      className="input"
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map(categoria => (
                        <option key={categoria} value={categoria}>{categoria}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Disponibilidad</label>
                    <select
                      value={filtros.disponible}
                      onChange={(e) => handleFiltroChange('disponible', e.target.value)}
                      className="input"
                    >
                      <option value="todos">Todos</option>
                      <option value="disponible">Disponibles</option>
                      <option value="no_disponible">No disponibles</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Rango de precio</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filtros.precioMin}
                        onChange={(e) => handleFiltroChange('precioMin', e.target.value)}
                        className="input flex-1"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filtros.precioMax}
                        onChange={(e) => handleFiltroChange('precioMax', e.target.value)}
                        className="input flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-4xl font-bold text-blue-600 mb-2">{estadisticas.total}</div>
            <div className="text-gray-700 font-medium">Total Artículos</div>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-4xl font-bold text-green-600 mb-2">{estadisticas.disponibles}</div>
            <div className="text-gray-700 font-medium">Disponibles</div>
          </div>
          <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="text-4xl font-bold text-red-600 mb-2">{estadisticas.noDisponibles}</div>
            <div className="text-gray-700 font-medium">No Disponibles</div>
          </div>
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-4xl font-bold text-purple-600 mb-2">{estadisticas.totalCategorias}</div>
            <div className="text-gray-700 font-medium">Categorías</div>
          </div>
        </div>

        {/* Tabla de artículos */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Imagen</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ingredientes</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tiempo</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articulos.map((articulo) => (
                  <tr key={articulo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        {articulo.imagen ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL}${articulo.imagen}`}
                            alt={articulo.nombre}
                            fill
                            className="object-cover"
                            sizes="64px"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                            Sin imagen
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{articulo.nombre}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs">
                        {articulo.descripcion || 'Sin descripción'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge-primary">{articulo.categoria}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">${articulo.precio}</span>
                    </td>
                    <td className="px-6 py-4">
                      {articulo.disponible ? (
                        <span className="badge-success flex items-center gap-1 w-fit">
                          <BsCheck2 />
                          Disponible
                        </span>
                      ) : (
                        <span className="badge-danger flex items-center gap-1 w-fit">
                          <BsX />
                          No disponible
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{articulo.tiempoPreparacion} min</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEditar(articulo)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                          title="Editar"
                        >
                          <BsPencil size={16} />
                        </button>
                        <button
                          onClick={() => handleEliminar(articulo)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                          title="Eliminar"
                        >
                          <BsTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {articulos.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron artículos</h3>
                <p className="text-gray-500">Prueba ajustando los filtros o agrega un nuevo artículo</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Agregar/Editar */}
        {(modalAgregar || modalEditar) && (
          <div className="overlay">
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen p-4">
                <div className="card max-w-2xl w-full animate-bounce-in">
                  <div className="border-b border-gray-200 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-primary-700">
                      {modalAgregar ? 'Agregar Artículo' : 'Editar Artículo'}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Código*</label>
                        <input
                          type="text"
                          value={formulario.codigo}
                          onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
                          className="input"
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Nombre*</label>
                        <input
                          type="text"
                          value={formulario.nombre}
                          onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                          className="input"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Descripción</label>
                      <textarea
                        value={formulario.descripcion}
                        onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                        className="input resize-none"
                        rows="3"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Precio*</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formulario.precio}
                          onChange={(e) => setFormulario({ ...formulario, precio: e.target.value })}
                          className="input"
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Tiempo Preparación (min)*</label>
                        <input
                          type="number"
                          value={formulario.tiempoPreparacion}
                          onChange={(e) => setFormulario({ ...formulario, tiempoPreparacion: e.target.value })}
                          className="input"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Categoría*</label>
                      <select
                        value={formulario.categoria}
                        onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value })}
                        className="input"
                        required
                      >
                        <option value="">Seleccionar categoría</option>
                        {categorias.map(categoria => (
                          <option key={categoria} value={categoria}>{categoria}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="disponible"
                        checked={formulario.disponible}
                        onChange={(e) => setFormulario({ ...formulario, disponible: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="disponible" className="label mb-0">Disponible</label>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setModalAgregar(false);
                        setModalEditar(false);
                        setArticuloSeleccionado(null);
                        limpiarFormulario();
                      }}
                      className="btn-ghost flex-1"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={modalAgregar ? handleCrearArticulo : handleActualizarArticulo}
                      className="btn-primary flex-1"
                    >
                      {modalAgregar ? 'Crear' : 'Actualizar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Eliminar */}
        {modalEliminar && (
          <div className="overlay">
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen p-4">
                <div className="card max-w-md w-full animate-bounce-in">
                  <div className="border-b border-gray-200 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-danger-700">Eliminar Artículo</h2>
                  </div>

                  <div className="text-center py-6">
                    <BsExclamationTriangle size={48} className="text-danger-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      ¿Estás seguro de que quieres eliminar este artículo?
                    </h3>
                    <p className="text-gray-600 mb-4">
                      <strong>{articuloSeleccionado?.nombre}</strong> será marcado como inactivo y no estará disponible para nuevos pedidos.
                    </p>
                    <p className="text-sm text-gray-500">
                      Esta acción se puede revertir editando el artículo posteriormente.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setModalEliminar(false);
                        setArticuloSeleccionado(null);
                      }}
                      className="btn-ghost flex-1"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleEliminarArticulo}
                      className="btn-danger flex-1"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
