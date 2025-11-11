import { useState, useEffect, useCallback, useMemo } from 'react';
import { articulosService } from '../services/articulosService';
import { useDebounce } from './useDebounce';

const useArticulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    disponibles: 0,
    noDisponibles: 0,
    totalCategorias: 0
  });

  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    disponible: 'todos',
    precioMin: '',
    precioMax: ''
  });

  // Debounce para búsqueda (evita requests excesivos)
  const debouncedBusqueda = useDebounce(filtros.busqueda, 300);

  // Cargar artículos y categorías
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [articulosResponse, categoriasResponse, estadisticasResponse] = await Promise.all([
        articulosService.obtenerArticulos(),
        articulosService.obtenerCategorias(),
        articulosService.obtenerEstadisticas()
      ]);

      if (articulosResponse.success) {
        setArticulos(articulosResponse.data);
      } else {
        throw new Error(articulosResponse.error);
      }

      if (categoriasResponse.success) {
        setCategorias(categoriasResponse.data);
      }

      if (estadisticasResponse.success) {
        setEstadisticas(estadisticasResponse.data);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar filtros a los artículos (optimizado con useMemo y debounce)
  const articulosFiltrados = useMemo(() => {
    let resultado = [...articulos];

    // Filtro de búsqueda con debounce
    if (debouncedBusqueda) {
      const termino = debouncedBusqueda.toLowerCase();
      resultado = resultado.filter(articulo =>
        articulo.nombre.toLowerCase().includes(termino) ||
        articulo.codigo.toLowerCase().includes(termino) ||
        (articulo.descripcion && articulo.descripcion.toLowerCase().includes(termino))
      );
    }

    // Filtro de categoría
    if (filtros.categoria) {
      resultado = resultado.filter(articulo => articulo.categoria === filtros.categoria);
    }

    // Filtro de disponibilidad
    if (filtros.disponible !== 'todos') {
      const disponible = filtros.disponible === 'disponible';
      resultado = resultado.filter(articulo => articulo.disponible === disponible);
    }

    // Filtro de precio mínimo
    if (filtros.precioMin) {
      resultado = resultado.filter(articulo => articulo.precio >= parseFloat(filtros.precioMin));
    }

    // Filtro de precio máximo
    if (filtros.precioMax) {
      resultado = resultado.filter(articulo => articulo.precio <= parseFloat(filtros.precioMax));
    }

    return resultado;
  }, [articulos, debouncedBusqueda, filtros.categoria, filtros.disponible, filtros.precioMin, filtros.precioMax]);

  // Crear artículo
  const crearArticulo = async (articuloData) => {
    try {
      const response = await articulosService.crearArticulo(articuloData);

      if (response.success) {
        await cargarDatos(); // Recargar todos los datos
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      console.error('Error al crear artículo:', err);
      return { success: false, error: err.message };
    }
  };

  // Actualizar artículo
  const actualizarArticulo = async (id, articuloData) => {
    try {
      const response = await articulosService.actualizarArticulo(id, articuloData);

      if (response.success) {
        await cargarDatos(); // Recargar todos los datos
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      console.error('Error al actualizar artículo:', err);
      return { success: false, error: err.message };
    }
  };

  // Eliminar artículo
  const eliminarArticulo = async (id) => {
    try {
      const response = await articulosService.eliminarArticulo(id);

      if (response.success) {
        await cargarDatos(); // Recargar todos los datos
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      console.error('Error al eliminar artículo:', err);
      return { success: false, error: err.message };
    }
  };

  // Actualizar filtros
  const actualizarFiltros = (nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      categoria: '',
      disponible: 'todos',
      precioMin: '',
      precioMax: ''
    });
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return {
    articulos: articulosFiltrados,
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
    recargarDatos: cargarDatos
  };
};

export default useArticulos;
