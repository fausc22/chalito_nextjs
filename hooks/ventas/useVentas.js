import { useState, useCallback } from 'react';
import { ventasService } from '../../services/ventasService';

export const useVentas = () => {

    // ==========================================
    // ESTADOS - VENTAS
    // ==========================================
    const [ventas, setVentas] = useState([]);
    const [loadingVentas, setLoadingVentas] = useState(false);
    const [isMutatingVentas, setIsMutatingVentas] = useState(false);
    const [errorVentas, setErrorVentas] = useState(null);
    const [metaVentas, setMetaVentas] = useState({
        pagina_actual: 1,
        total_registros: 0,
        total_paginas: 0,
        registros_por_pagina: 50,
        hay_mas: false,
        total_monto: 0,
        total_facturado: 0,
        total_anulado: 0
    });

    // ==========================================
    // ESTADOS - DETALLE DE VENTA
    // ==========================================
    const [ventaDetalle, setVentaDetalle] = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);

    // ==========================================
    // ESTADOS - MEDIOS DE PAGO
    // ==========================================
    const [mediosPago, setMediosPago] = useState([]);
    const [loadingMediosPago, setLoadingMediosPago] = useState(false);

    // ==========================================
    // ESTADOS - RESUMEN
    // ==========================================
    const [resumen, setResumen] = useState(null);
    const [loadingResumen, setLoadingResumen] = useState(false);

    // ==========================================
    // FUNCIONES - VENTAS
    // ==========================================

    // Cargar ventas con filtros
    const cargarVentas = useCallback(async (filtros = {}) => {
        setLoadingVentas(true);
        setErrorVentas(null);

        try {
            const response = await ventasService.obtenerVentas(filtros);

            if (response.success) {
                setVentas(response.data);
                if (response.meta) {
                    setMetaVentas(response.meta);
                }
            } else {
                setErrorVentas(response.error);
            }
        } catch (error) {
            setErrorVentas('Error al cargar ventas');
            console.error(error);
        } finally {
            setLoadingVentas(false);
        }
    }, []);

    // Obtener venta por ID con detalle
    const obtenerVentaPorId = useCallback(async (id) => {
        setLoadingDetalle(true);

        try {
            const response = await ventasService.obtenerVentaPorId(id);

            if (response.success) {
                setVentaDetalle(response.data);
                return { success: true, data: response.data };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error al obtener venta' };
        } finally {
            setLoadingDetalle(false);
        }
    }, []);

    // Limpiar detalle de venta
    const limpiarVentaDetalle = useCallback(() => {
        setVentaDetalle(null);
    }, []);

    // Anular venta
    const anularVenta = async (id, motivo = '') => {
        setIsMutatingVentas(true);

        try {
            const response = await ventasService.anularVenta(id, motivo);

            if (response.success) {
                return { success: true, data: response.data, message: response.message };
            } else {
                return { success: false, error: response.error };
            }
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Error al anular venta' };
        } finally {
            setIsMutatingVentas(false);
        }
    };

    // ==========================================
    // FUNCIONES - MEDIOS DE PAGO
    // ==========================================

    // Cargar medios de pago disponibles
    const cargarMediosPago = useCallback(async () => {
        setLoadingMediosPago(true);

        try {
            const response = await ventasService.obtenerMediosPago();

            if (response.success) {
                setMediosPago(response.data);
            }
        } catch (error) {
            console.error('Error al cargar medios de pago:', error);
        } finally {
            setLoadingMediosPago(false);
        }
    }, []);

    // ==========================================
    // FUNCIONES - RESUMEN
    // ==========================================

    // Cargar resumen de ventas
    const cargarResumen = useCallback(async (filtros = {}) => {
        setLoadingResumen(true);

        try {
            const response = await ventasService.obtenerResumen(filtros);

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
        // Estados - VENTAS
        ventas,
        loadingVentas,
        errorVentas,
        metaVentas,
        isMutatingVentas,

        // Acciones - VENTAS
        cargarVentas,
        anularVenta,

        // Estados - DETALLE
        ventaDetalle,
        loadingDetalle,

        // Acciones - DETALLE
        obtenerVentaPorId,
        limpiarVentaDetalle,

        // Estados - MEDIOS DE PAGO
        mediosPago,
        loadingMediosPago,

        // Acciones - MEDIOS DE PAGO
        cargarMediosPago,

        // Estados - RESUMEN
        resumen,
        loadingResumen,

        // Acciones - RESUMEN
        cargarResumen
    };
};

