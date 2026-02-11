import { useState, useCallback } from 'react';
import { gastosService } from '../../services/gastosService';

export const useGastos = () => {

    // ==========================================
    // ESTADOS - GASTOS
    // ==========================================
    const [gastos, setGastos] = useState([]);
    const [loadingGastos, setLoadingGastos] = useState(false);
    const [isMutatingGastos, setIsMutatingGastos] = useState(false);
    const [errorGastos, setErrorGastos] = useState(null);
    const [metaGastos, setMetaGastos] = useState({
        pagina_actual: 1,
        total_registros: 0,
        total_paginas: 0,
        registros_por_pagina: 50,
        hay_mas: false,
        total_monto: 0
    });

    // ==========================================
    // ESTADOS - CATEGORÍAS DE GASTOS
    // ==========================================
    const [categorias, setCategorias] = useState([]);
    const [loadingCategorias, setLoadingCategorias] = useState(false);
    const [errorCategorias, setErrorCategorias] = useState(null);

    // ==========================================
    // ESTADOS - CUENTAS DE FONDOS
    // ==========================================
    const [cuentas, setCuentas] = useState([]);
    const [loadingCuentas, setLoadingCuentas] = useState(false);

    // ==========================================
    // ESTADOS - RESUMEN
    // ==========================================
    const [resumen, setResumen] = useState(null);
    const [loadingResumen, setLoadingResumen] = useState(false);

    // ==========================================
    // FUNCIONES - GASTOS
    // ==========================================

    // Cargar gastos con filtros
    const cargarGastos = useCallback(async (filtros = {}) => {
        setLoadingGastos(true);
        setErrorGastos(null);

        try {
            const response = await gastosService.obtenerGastos(filtros);

            if (response.success) {
                setGastos(response.data);
                if (response.meta) {
                    setMetaGastos(response.meta);
                }
            } else {
                setErrorGastos(response.error);
            }
        } catch (error) {
            setErrorGastos('Error al cargar gastos');
            console.error(error);
        } finally {
            setLoadingGastos(false);
        }
    }, []);

    // Crear gasto
    const crearGasto = async (gastoData) => {
        setIsMutatingGastos(true);

        try {
            const response = await gastosService.crearGasto(gastoData);

            if (response.success) {
                return { success: true, data: response.data, message: response.message };
            } else {
                return { success: false, error: response.error, errors: response.errors };
            }
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error al crear gasto' };
        } finally {
            setIsMutatingGastos(false);
        }
    };

    // Editar gasto
    const editarGasto = async (id, gastoData) => {
        setIsMutatingGastos(true);

        try {
            const response = await gastosService.actualizarGasto(id, gastoData);

            if (response.success) {
                return { success: true, data: response.data, message: response.message };
            } else {
                return { success: false, error: response.error, errors: response.errors };
            }
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error al editar gasto' };
        } finally {
            setIsMutatingGastos(false);
        }
    };

    // Eliminar gasto
    const eliminarGasto = async (id) => {
        setIsMutatingGastos(true);

        try {
            const response = await gastosService.eliminarGasto(id);

            if (response.success) {
                return { success: true, data: response.data, message: response.message };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error al eliminar gasto' };
        } finally {
            setIsMutatingGastos(false);
        }
    };

    // Obtener gasto por ID
    const obtenerGastoPorId = async (id) => {
        try {
            const response = await gastosService.obtenerGastoPorId(id);

            if (response.success) {
                return { success: true, data: response.data };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error al obtener gasto' };
        }
    };

    // ==========================================
    // FUNCIONES - CATEGORÍAS
    // ==========================================

    // Cargar categorías
    const cargarCategorias = useCallback(async (soloActivas = false) => {
        setLoadingCategorias(true);
        setErrorCategorias(null);

        try {
            const response = await gastosService.obtenerCategorias(soloActivas);

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
            const response = await gastosService.crearCategoria(categoriaData);

            if (response.success) {
                await cargarCategorias();
                return { success: true, data: response.data, message: response.message };
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
            const response = await gastosService.actualizarCategoria(id, categoriaData);

            if (response.success) {
                await cargarCategorias();
                return { success: true, data: response.data, message: response.message };
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
    const eliminarCategoria = async (id) => {
        setLoadingCategorias(true);

        try {
            const response = await gastosService.eliminarCategoria(id);

            if (response.success) {
                await cargarCategorias();
                return { success: true, data: response.data, message: response.message };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error al eliminar categoría' };
        } finally {
            setLoadingCategorias(false);
        }
    };

    // ==========================================
    // FUNCIONES - CUENTAS
    // ==========================================

    // Cargar cuentas de fondos
    const cargarCuentas = useCallback(async () => {
        setLoadingCuentas(true);

        try {
            const response = await gastosService.obtenerCuentas();

            if (response.success) {
                setCuentas(response.data);
            }
        } catch (error) {
            console.error('Error al cargar cuentas:', error);
        } finally {
            setLoadingCuentas(false);
        }
    }, []);

    // ==========================================
    // FUNCIONES - RESUMEN
    // ==========================================

    // Cargar resumen de gastos
    const cargarResumen = useCallback(async (filtros = {}) => {
        setLoadingResumen(true);

        try {
            const response = await gastosService.obtenerResumen(filtros);

            if (response.success) {
                setResumen(response.data);
            }
        } catch (error) {
            console.error('Error al cargar resumen:', error);
        } finally {
            setLoadingResumen(false);
        }
    }, []);

    return {
        // Estados - GASTOS
        gastos,
        loadingGastos,
        errorGastos,
        metaGastos,
        isMutatingGastos,

        // Acciones - GASTOS
        cargarGastos,
        crearGasto,
        editarGasto,
        eliminarGasto,
        obtenerGastoPorId,

        // Estados - CATEGORÍAS
        categorias,
        loadingCategorias,
        errorCategorias,

        // Acciones - CATEGORÍAS
        cargarCategorias,
        crearCategoria,
        editarCategoria,
        eliminarCategoria,

        // Estados - CUENTAS
        cuentas,
        loadingCuentas,

        // Acciones - CUENTAS
        cargarCuentas,

        // Estados - RESUMEN
        resumen,
        loadingResumen,

        // Acciones - RESUMEN
        cargarResumen
    };
};

