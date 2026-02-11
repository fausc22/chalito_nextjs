import { useState, useCallback } from 'react';
import { fondosService } from '../../services/fondosService';

export const useFondos = () => {
    // ==========================================
    // ESTADOS - CUENTAS
    // ==========================================
    const [cuentas, setCuentas] = useState([]);
    const [loadingCuentas, setLoadingCuentas] = useState(false);
    const [isMutatingCuentas, setIsMutatingCuentas] = useState(false);
    const [errorCuentas, setErrorCuentas] = useState(null);
    const [metaCuentas, setMetaCuentas] = useState({
        total_cuentas: 0,
        total_saldo: 0,
        cuentas_activas: 0
    });

    // ==========================================
    // ESTADOS - HISTORIAL
    // ==========================================
    const [historial, setHistorial] = useState([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);
    const [errorHistorial, setErrorHistorial] = useState(null);
    const [metaHistorial, setMetaHistorial] = useState({
        pagina_actual: 1,
        total_registros: 0,
        total_paginas: 0,
        registros_por_pagina: 50
    });

    // ==========================================
    // FUNCIONES - CUENTAS
    // ==========================================

    // Cargar cuentas
    const cargarCuentas = useCallback(async () => {
        setLoadingCuentas(true);
        setErrorCuentas(null);

        try {
            const response = await fondosService.obtenerCuentas();

            if (response.success) {
                setCuentas(response.data);
                if (response.meta) {
                    setMetaCuentas(response.meta);
                }
            } else {
                setErrorCuentas(response.error);
            }
        } catch (error) {
            setErrorCuentas('Error al cargar cuentas');
            console.error(error);
        } finally {
            setLoadingCuentas(false);
        }
    }, []);

    // Crear cuenta
    const crearCuenta = async (datos) => {
        setIsMutatingCuentas(true);

        try {
            const response = await fondosService.crearCuenta(datos);

            if (response.success) {
                await cargarCuentas();
                return { success: true, data: response.data, message: response.message };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error al crear cuenta' };
        } finally {
            setIsMutatingCuentas(false);
        }
    };

    // Actualizar cuenta
    const actualizarCuenta = async (id, datos) => {
        setIsMutatingCuentas(true);

        try {
            const response = await fondosService.actualizarCuenta(id, datos);

            if (response.success) {
                await cargarCuentas();
                return { success: true, data: response.data, message: response.message };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error al actualizar cuenta' };
        } finally {
            setIsMutatingCuentas(false);
        }
    };

    // Eliminar cuenta
    const eliminarCuenta = async (id) => {
        setIsMutatingCuentas(true);

        try {
            const response = await fondosService.eliminarCuenta(id);

            if (response.success) {
                await cargarCuentas();
                return { success: true, message: response.message };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error al eliminar cuenta' };
        } finally {
            setIsMutatingCuentas(false);
        }
    };

    // ==========================================
    // FUNCIONES - MOVIMIENTOS
    // ==========================================

    // Registrar movimiento manual
    const registrarMovimiento = async (datos) => {
        setIsMutatingCuentas(true);

        try {
            const response = await fondosService.registrarMovimiento(datos);

            if (response.success) {
                await cargarCuentas();
                return { success: true, data: response.data, message: response.message };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error al registrar movimiento' };
        } finally {
            setIsMutatingCuentas(false);
        }
    };

    // ==========================================
    // FUNCIONES - HISTORIAL
    // ==========================================

    // Cargar historial unificado
    const cargarHistorial = useCallback(async (cuentaId, filtros = {}) => {
        setLoadingHistorial(true);
        setErrorHistorial(null);

        try {
            const response = await fondosService.obtenerHistorialUnificado(cuentaId, filtros);

            if (response.success) {
                setHistorial(response.data);
                if (response.meta) {
                    setMetaHistorial(response.meta);
                }
            } else {
                setErrorHistorial(response.error);
            }
        } catch (error) {
            setErrorHistorial('Error al cargar historial');
            console.error(error);
        } finally {
            setLoadingHistorial(false);
        }
    }, []);

    return {
        // Estados - CUENTAS
        cuentas,
        loadingCuentas,
        errorCuentas,
        metaCuentas,
        isMutatingCuentas,

        // Acciones - CUENTAS
        cargarCuentas,
        crearCuenta,
        actualizarCuenta,
        eliminarCuenta,

        // Acciones - MOVIMIENTOS
        registrarMovimiento,

        // Estados - HISTORIAL
        historial,
        loadingHistorial,
        errorHistorial,
        metaHistorial,

        // Acciones - HISTORIAL
        cargarHistorial
    };
};

