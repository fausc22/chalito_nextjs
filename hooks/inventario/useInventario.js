import { useState, useCallback, useRef } from 'react';
import { articulosService } from '../../services/articulosService';
import { categoriasService } from '../../services/categoriasService';
import { ingredientesService } from '../../services/ingredientesService';
import { adicionalesService } from '../../services/adicionalesService';
import { insumosSemanalesService } from '../../services/insumosSemanalesService';
import { stockSemanalSemanasService } from '../../services/stockSemanalSemanasService';

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
  // ESTADOS - INSUMOS SEMANALES (stock semanal)
  // ==========================================
  const [insumosSemanales, setInsumosSemanales] = useState([]);
  const [loadingInsumosSemanales, setLoadingInsumosSemanales] = useState(false);
  const [errorInsumosSemanales, setErrorInsumosSemanales] = useState(null);

  // Semana abierta (null = cargado y no hay; undefined = aún no se consultó)
  const [semanaAbierta, setSemanaAbierta] = useState(undefined);
  const [loadingSemanaAbierta, setLoadingSemanaAbierta] = useState(false);
  const [errorSemanaAbierta, setErrorSemanaAbierta] = useState(null);

  const [semanasHistorico, setSemanasHistorico] = useState(undefined);
  const [loadingSemanasHistorico, setLoadingSemanasHistorico] = useState(false);
  const [errorSemanasHistorico, setErrorSemanasHistorico] = useState(null);
  /** Conserva última query del listado (filtro + página) para refrescos como cierre de semana */
  const historicoQueryRef = useRef({ limit: 5, page: 1 });

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

  const crearArticulo = async (articuloData) => {
    setIsMutatingArticulos(true);

    try {
      const response = await articulosService.crearArticulo(articuloData);

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

  const obtenerCostoArticulo = async (id) => {
    try {
      const response = await articulosService.obtenerCostoArticulo(id);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al obtener costos del artículo' };
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

  // ==========================================
  // FUNCIONES - INSUMOS SEMANALES
  // ==========================================

  const cargarInsumosSemanales = useCallback(async (filtros = {}) => {
    setLoadingInsumosSemanales(true);
    setErrorInsumosSemanales(null);

    try {
      const merged = { incluir_inactivos: true, ...filtros };
      const response = await insumosSemanalesService.obtenerInsumos(merged);

      if (response.success) {
        setInsumosSemanales(response.data);
      } else {
        setErrorInsumosSemanales(response.error);
      }
    } catch (error) {
      setErrorInsumosSemanales('Error al cargar insumos semanales');
      console.error(error);
    } finally {
      setLoadingInsumosSemanales(false);
    }
  }, []);

  const crearInsumoSemanal = async (datos) => {
    try {
      const response = await insumosSemanalesService.crearInsumo(datos);
      if (response.success) {
        await cargarInsumosSemanales();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al crear insumo semanal' };
    }
  };

  const editarInsumoSemanal = async (id, datos) => {
    try {
      const response = await insumosSemanalesService.actualizarInsumo(id, datos);
      if (response.success) {
        await cargarInsumosSemanales();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al actualizar insumo semanal' };
    }
  };

  const setActivoInsumoSemanal = async (id, activo) => {
    try {
      const response = await insumosSemanalesService.actualizarActivo(id, activo);
      if (response.success) {
        await cargarInsumosSemanales();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al cambiar el estado del insumo' };
    }
  };

  const eliminarInsumoSemanal = async (id) => {
    try {
      const response = await insumosSemanalesService.eliminarInsumo(id);
      if (response.success) {
        await cargarInsumosSemanales();
        return { success: true, data: response.data, mensaje: response.mensaje };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al eliminar el insumo' };
    }
  };

  // ==========================================
  // FUNCIONES - SEMANA ABIERTA (stock semanal)
  // ==========================================

  const cargarSemanaAbierta = useCallback(async () => {
    setLoadingSemanaAbierta(true);
    setErrorSemanaAbierta(null);

    try {
      const response = await stockSemanalSemanasService.obtenerSemanaAbierta();

      if (response.success) {
        setSemanaAbierta(response.data);
      } else {
        setErrorSemanaAbierta(response.error);
      }
    } catch (error) {
      setErrorSemanaAbierta(
        error.response?.data?.message ||
          error.response?.data?.mensaje ||
          'Error al cargar la semana abierta'
      );
      console.error(error);
    } finally {
      setLoadingSemanaAbierta(false);
    }
  }, []);

  const crearSemanaStock = async (payload) => {
    try {
      const response = await stockSemanalSemanasService.crearSemana(payload);
      if (response.success) {
        await cargarSemanaAbierta();
        await cargarSemanasHistorico({ page: 1 });
        return { success: true, data: response.data, mensaje: response.mensaje };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al crear la semana' };
    }
  };

  const cargarSemanasHistorico = useCallback(async (params = {}) => {
    setLoadingSemanasHistorico(true);
    setErrorSemanasHistorico(null);
    try {
      const merged = { ...historicoQueryRef.current, ...params };
      if ('estado' in params) {
        if (params.estado === undefined || params.estado === null || params.estado === '') {
          delete merged.estado;
        } else {
          merged.estado = params.estado;
        }
      }
      historicoQueryRef.current = {
        limit: merged.limit ?? merged.limite ?? 5,
        page: merged.page ?? merged.pagina ?? 1,
        ...(merged.estado ? { estado: merged.estado } : {}),
      };

      const query = {
        limit: historicoQueryRef.current.limit,
        page: historicoQueryRef.current.page,
      };
      if (historicoQueryRef.current.estado) {
        query.estado = historicoQueryRef.current.estado;
      }

      const response = await stockSemanalSemanasService.listarHistoricoSemanas(query);
      if (response.success) {
        setSemanasHistorico(response.data);
      } else {
        setErrorSemanasHistorico(response.error);
        setSemanasHistorico(null);
      }
    } catch (error) {
      setErrorSemanasHistorico('Error al cargar el histórico de semanas');
      setSemanasHistorico(null);
      console.error(error);
    } finally {
      setLoadingSemanasHistorico(false);
    }
  }, []);

  const obtenerSemanaStockPorId = async (id) => {
    try {
      return await stockSemanalSemanasService.obtenerSemanaPorId(id);
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al obtener la semana' };
    }
  };

  const actualizarStockInicialDetalle = async (_semanaId, detalleId, stock_inicial, observaciones) => {
    try {
      const body = {};
      if (stock_inicial !== undefined) body.stock_inicial = stock_inicial;
      if (observaciones !== undefined) body.observaciones = observaciones;
      const response = await stockSemanalSemanasService.actualizarStockInicial(detalleId, body);
      if (response.success) {
        await cargarSemanaAbierta();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al actualizar stock inicial' };
    }
  };

  const actualizarStockFinalDetalle = async (_semanaId, detalleId, stock_final, observaciones) => {
    try {
      const body = {};
      if (stock_final !== undefined) body.stock_final = stock_final;
      if (observaciones !== undefined) body.observaciones = observaciones;
      const response = await stockSemanalSemanasService.actualizarStockFinal(detalleId, body);
      if (response.success) {
        await cargarSemanaAbierta();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al actualizar stock final' };
    }
  };

  const cerrarSemanaStock = async (semanaId) => {
    try {
      const response = await stockSemanalSemanasService.cerrarSemana(semanaId);
      if (response.success) {
        await cargarSemanaAbierta();
        await cargarSemanasHistorico({ page: 1 });
        return { success: true, data: response.data, mensaje: response.mensaje };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error al cerrar la semana' };
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
    obtenerCostoArticulo,

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
    eliminarAdicionalDeArticulo,

    // Estados - INSUMOS SEMANALES
    insumosSemanales,
    loadingInsumosSemanales,
    errorInsumosSemanales,

    // Acciones - INSUMOS SEMANALES
    cargarInsumosSemanales,
    crearInsumoSemanal,
    editarInsumoSemanal,
    setActivoInsumoSemanal,
    eliminarInsumoSemanal,

    // Estados - SEMANA ABIERTA
    semanaAbierta,
    loadingSemanaAbierta,
    errorSemanaAbierta,

    // Histórico de semanas (stock semanal)
    semanasHistorico,
    loadingSemanasHistorico,
    errorSemanasHistorico,

    // Acciones - SEMANA ABIERTA
    cargarSemanaAbierta,
    crearSemanaStock,
    actualizarStockInicialDetalle,
    actualizarStockFinalDetalle,
    cerrarSemanaStock,
    cargarSemanasHistorico,
    obtenerSemanaStockPorId,
  };
};
