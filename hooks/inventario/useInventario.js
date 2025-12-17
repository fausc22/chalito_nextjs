import { useState, useCallback } from 'react';
import { articulosService } from '../../services/articulosService';
import { categoriasService } from '../../services/categoriasService';
import { ingredientesService } from '../../services/ingredientesService';
import { adicionalesService } from '../../services/adicionalesService';

export const useInventario = () => {

  // ==========================================
  // ESTADOS - ARTÍCULOS
  // ==========================================
  const [articulos, setArticulos] = useState([]);
  const [loadingArticulos, setLoadingArticulos] = useState(false);
  const [isMutatingArticulos, setIsMutatingArticulos] = useState(false);
  const [errorArticulos, setErrorArticulos] = useState(null);
  const [metaArticulos, setMetaArticulos] = useState({
    pagina_actual: 1,
    total_registros: 0,
    total_paginas: 0,
    registros_por_pagina: 10,
    hay_mas: false
  });

  // ==========================================
  // ESTADOS - CATEGORÍAS
  // ==========================================
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [errorCategorias, setErrorCategorias] = useState(null);

  // ==========================================
  // ESTADOS - INGREDIENTES (para selector de artículos)
  // ==========================================
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState([]);
  const [loadingIngredientesDisponibles, setLoadingIngredientesDisponibles] = useState(false);

  // ==========================================
  // ESTADOS - INGREDIENTES
  // ==========================================
  const [ingredientes, setIngredientes] = useState([]);
  const [loadingIngredientes, setLoadingIngredientes] = useState(false);
  const [errorIngredientes, setErrorIngredientes] = useState(null);
  const [metaIngredientes, setMetaIngredientes] = useState({
    pagina_actual: 1,
    total_registros: 0,
    total_paginas: 0,
    registros_por_pagina: 10,
    hay_mas: false
  });

  // ==========================================
  // ESTADOS - ADICIONALES
  // ==========================================
  const [adicionales, setAdicionales] = useState([]);
  const [loadingAdicionales, setLoadingAdicionales] = useState(false);
  const [errorAdicionales, setErrorAdicionales] = useState(null);
  const [metaAdicionales, setMetaAdicionales] = useState({
    pagina_actual: 1,
    total_registros: 0,
    total_paginas: 0,
    registros_por_pagina: 10,
    hay_mas: false
  });
  const [adicionalesDisponibles, setAdicionalesDisponibles] = useState([]);
  const [loadingAdicionalesDisponibles, setLoadingAdicionalesDisponibles] = useState(false);

  // ==========================================
  // FUNCIONES - CATEGORÍAS
  // ==========================================

  // Cargar categorías
  const cargarCategorias = useCallback(async () => {
    setLoadingCategorias(true);
    setErrorCategorias(null);

    try {
      const response = await categoriasService.obtenerCategorias();

      if (response.success) {
        setCategorias(response.data);
      } else {
        setErrorCategorias(response.error);
      }
    } catch (error) {
      setErrorCategorias('Error al cargar categorías');
      console.error(error);
    } finally {
      setLoadingCategorias(false);
    }
  }, []);

  // Crear categoría
  const crearCategoria = async (categoriaData) => {
    setLoadingCategorias(true);

    try {
      const response = await categoriasService.crearCategoria(categoriaData);

      if (response.success) {
        await cargarCategorias(); // Recargar lista
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al crear categoría' };
    } finally {
      setLoadingCategorias(false);
    }
  };

  // Editar categoría
  const editarCategoria = async (id, categoriaData) => {
    setLoadingCategorias(true);

    try {
      const response = await categoriasService.actualizarCategoria(id, categoriaData);

      if (response.success) {
        await cargarCategorias();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al editar categoría' };
    } finally {
      setLoadingCategorias(false);
    }
  };

  // Eliminar categoría
  const eliminarCategoria = useCallback(async (id) => {
    setLoadingCategorias(true);

    try {
      const response = await categoriasService.eliminarCategoria(id);

      if (response.success) {
        await cargarCategorias();
        return { success: true, data: response.data };
      } else {
        return {
          success: false,
          error: response.error,
          articulos_asociados: response.articulos_asociados
        };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al eliminar categoría' };
    } finally {
      setLoadingCategorias(false);
    }
  }, [cargarCategorias]);

  // ==========================================
  // FUNCIONES - ARTÍCULOS
  // ==========================================

  const cargarArticulos = useCallback(async (filtros = {}) => {
    setLoadingArticulos(true);
    setErrorArticulos(null);

    try {
      const response = await articulosService.obtenerArticulos(filtros);

      if (response.success) {
        setArticulos(response.data);
        if (response.meta) {
          setMetaArticulos(response.meta);
        }
      } else {
        setErrorArticulos(response.error);
      }
    } catch (error) {
      setErrorArticulos('Error al cargar artículos');
      console.error(error);
    } finally {
      setLoadingArticulos(false);
    }
  }, []);

  const crearArticulo = async (articuloData, imagenFile = null) => {
    setIsMutatingArticulos(true);

    try {
      const response = await articulosService.crearArticulo(articuloData, imagenFile);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al crear artículo' };
    } finally {
      setIsMutatingArticulos(false);
    }
  };

  const editarArticulo = async (id, articuloData) => {
    setIsMutatingArticulos(true);

    try {
      const response = await articulosService.actualizarArticulo(id, articuloData);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al editar artículo' };
    } finally {
      setIsMutatingArticulos(false);
    }
  };

  const eliminarArticulo = async (id) => {
    setIsMutatingArticulos(true);

    try {
      const response = await articulosService.eliminarArticulo(id);

      if (response.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error,
          code: response.code
        };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al eliminar artículo' };
    } finally {
      setIsMutatingArticulos(false);
    }
  };

  const obtenerArticuloPorId = async (id) => {
    try {
      const response = await articulosService.obtenerArticuloPorId(id);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al obtener artículo' };
    }
  };

  // ==========================================
  // FUNCIONES - INGREDIENTES
  // ==========================================

  // Funcion para cargar ingredientes activos (para el tab ARTICULOS)
  const cargarIngredientesActivos = useCallback(async () => {
    setLoadingIngredientesDisponibles(true);

    try {
      const response = await ingredientesService.obtenerIngredientesActivos();

      if (response.success) {
        setIngredientesDisponibles(response.data);
      }
    } catch (error) {
      console.error('Error al cargar ingredientes:', error);
    } finally {
      setLoadingIngredientesDisponibles(false);
    }
  }, []);

  // Funcion para cargar los ingredientes
  const cargarIngredientes = useCallback(async (filtros = {}) => {
    setLoadingIngredientes(true);
    setErrorIngredientes(null);
    try {
      const response = await ingredientesService.obtenerIngredientes(filtros);
      if (response.success) {
        setIngredientes(response.data);
        if (response.meta) {
          setMetaIngredientes(response.meta);
        }
      } else {
        setErrorIngredientes(response.error);
      }
    } catch (error) {
      console.log(error)
      setErrorIngredientes('Error al cargar ingredientes');
    } finally {
      setLoadingIngredientes(false);
    }
  }, []);

  // Crear ingrediente
  const crearIngrediente = async (ingredienteData) => {
    setLoadingIngredientes(true);

    try {
      const response = await ingredientesService.crearIngrediente(ingredienteData);
      return { success: response.success, data: response.data, error: response.error };
    } catch (error) {
      console.log(error)
      return { success: false, error: 'Error al crear ingrediente' };
    } finally {
      setLoadingIngredientes(false);
    }
  };

  // Editar ingrediente
  const editarIngrediente = async (id, ingredienteData) => {
    setLoadingIngredientes(true);

    try {
      const response = await ingredientesService.actualizarIngrediente(id, ingredienteData);
      return { success: response.success, data: response.data, error: response.error };
    } catch (error) {
      console.log(error)
      return { success: false, error: 'Error al editar ingrediente' };
    } finally {
      setLoadingIngredientes(false);
    }
  };

  // Eliminar ingrediente
  const eliminarIngrediente = async (id) => {
    setLoadingIngredientes(true);

    try {
      const response = await ingredientesService.eliminarIngrediente(id);
      return { success: response.success, error: response.error };
    } catch (error) {
      console.log(error)
      return { success: false, error: 'Error al eliminar ingrediente' };
    } finally {
      setLoadingIngredientes(false);
    }
  };

  // ==========================================
  // FUNCIONES - ADICIONALES
  // ==========================================

  // Funcion para cargar adicionales activos (para selectores)
  const cargarAdicionalesActivos = useCallback(async () => {
    setLoadingAdicionalesDisponibles(true);

    try {
      const response = await adicionalesService.obtenerAdicionalesActivos();

      if (response.success) {
        setAdicionalesDisponibles(response.data);
      }
    } catch (error) {
      console.error('Error al cargar adicionales:', error);
    } finally {
      setLoadingAdicionalesDisponibles(false);
    }
  }, []);

  // Funcion para cargar los adicionales
  const cargarAdicionales = useCallback(async (filtros = {}) => {
    setLoadingAdicionales(true);
    setErrorAdicionales(null);
    try {
      const response = await adicionalesService.obtenerAdicionales(filtros);
      if (response.success) {
        setAdicionales(response.data);
        if (response.meta) {
          setMetaAdicionales(response.meta);
        }
      } else {
        setErrorAdicionales(response.error);
      }
    } catch (error) {
      console.log(error)
      setErrorAdicionales('Error al cargar adicionales');
    } finally {
      setLoadingAdicionales(false);
    }
  }, []);

  // Crear adicional
  const crearAdicional = async (adicionalData) => {
    setLoadingAdicionales(true);

    try {
      const response = await adicionalesService.crearAdicional(adicionalData);
      return { success: response.success, data: response.data, error: response.error };
    } catch (error) {
      console.log(error)
      return { success: false, error: 'Error al crear adicional' };
    } finally {
      setLoadingAdicionales(false);
    }
  };

  // Editar adicional
  const editarAdicional = async (id, adicionalData) => {
    setLoadingAdicionales(true);

    try {
      const response = await adicionalesService.actualizarAdicional(id, adicionalData);
      return { success: response.success, data: response.data, error: response.error };
    } catch (error) {
      console.log(error)
      return { success: false, error: 'Error al editar adicional' };
    } finally {
      setLoadingAdicionales(false);
    }
  };

  // Eliminar adicional
  const eliminarAdicional = async (id) => {
    setLoadingAdicionales(true);

    try {
      const response = await adicionalesService.eliminarAdicional(id);
      return { success: response.success, error: response.error };
    } catch (error) {
      console.log(error)
      return { success: false, error: 'Error al eliminar adicional' };
    } finally {
      setLoadingAdicionales(false);
    }
  };

  // Obtener adicionales asignados a un artículo
  const obtenerAdicionalesPorArticulo = async (articuloId) => {
    try {
      const response = await adicionalesService.obtenerAdicionalesPorArticulo(articuloId);
      return { success: response.success, data: response.data || [], error: response.error };
    } catch (error) {
      console.error('Error al obtener adicionales del artículo:', error);
      return { success: false, data: [], error: 'Error al obtener adicionales del artículo' };
    }
  };

  // Asignar adicionales a un artículo
  const asignarAdicionalesAArticulo = async (articuloId, adicionalesIds) => {
    try {
      const response = await adicionalesService.asignarAdicionalesAArticulo(articuloId, adicionalesIds);
      return { success: response.success, data: response.data, error: response.error };
    } catch (error) {
      console.error('Error al asignar adicionales:', error);
      return { success: false, error: 'Error al asignar adicionales' };
    }
  };

  // Eliminar adicional de un artículo
  const eliminarAdicionalDeArticulo = async (articuloId, adicionalId) => {
    try {
      const response = await adicionalesService.eliminarAdicionalDeArticulo(articuloId, adicionalId);
      return { success: response.success, error: response.error };
    } catch (error) {
      console.error('Error al eliminar adicional del artículo:', error);
      return { success: false, error: 'Error al eliminar adicional del artículo' };
    }
  };

  return {
    // Estados - ARTÍCULOS
    articulos,
    loadingArticulos,
    errorArticulos,
    metaArticulos,
    isMutatingArticulos,

    // Acciones - ARTÍCULOS
    cargarArticulos,
    crearArticulo,
    editarArticulo,
    eliminarArticulo,
    obtenerArticuloPorId,

    // Estados - CATEGORÍAS
    categorias,
    loadingCategorias,
    errorCategorias,

    // Acciones - CATEGORÍAS
    cargarCategorias,
    crearCategoria,
    editarCategoria,
    eliminarCategoria,

    // Ingredientes (disponibles para selector)
    ingredientesDisponibles,
    loadingIngredientesDisponibles,
    cargarIngredientesActivos,

    // Estados - INGREDIENTES
    ingredientes,
    loadingIngredientes,
    errorIngredientes,
    metaIngredientes,

    //Acciones - INGREDIENTES
    cargarIngredientes,
    crearIngrediente,
    editarIngrediente,
    eliminarIngrediente,

    // Adicionales (disponibles para selector)
    adicionalesDisponibles,
    loadingAdicionalesDisponibles,
    cargarAdicionalesActivos,

    // Estados - ADICIONALES
    adicionales,
    loadingAdicionales,
    errorAdicionales,
    metaAdicionales,

    // Acciones - ADICIONALES
    cargarAdicionales,
    crearAdicional,
    editarAdicional,
    eliminarAdicional,
    obtenerAdicionalesPorArticulo,
    asignarAdicionalesAArticulo,
    eliminarAdicionalDeArticulo
  };
};
