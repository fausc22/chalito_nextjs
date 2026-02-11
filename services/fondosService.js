import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestión de fondos (cuentas y movimientos)
 */

export const fondosService = {
    // =====================================================
    // CUENTAS DE FONDOS
    // =====================================================

    /**
     * Obtener lista de cuentas de fondos
     */
    obtenerCuentas: async () => {
        try {
            const response = await apiRequest.get(API_CONFIG.ENDPOINTS.FONDOS.CUENTAS.LIST);
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al obtener cuentas'
                };
            }
            
            return {
                success: true,
                data: response.data?.data || [],
                meta: response.data?.meta || {}
            };
        } catch (error) {
            console.error('❌ Error al obtener cuentas:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener cuentas'
            };
        }
    },

    /**
     * Obtener una cuenta por ID
     */
    obtenerCuentaPorId: async (id) => {
        try {
            const response = await apiRequest.get(API_CONFIG.ENDPOINTS.FONDOS.CUENTAS.BY_ID(id));
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al obtener cuenta'
                };
            }
            
            return {
                success: true,
                data: response.data?.data
            };
        } catch (error) {
            console.error('❌ Error al obtener cuenta:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener cuenta'
            };
        }
    },

    /**
     * Crear una nueva cuenta de fondos
     */
    crearCuenta: async (datos) => {
        try {
            const response = await apiRequest.post(
                API_CONFIG.ENDPOINTS.FONDOS.CUENTAS.CREATE,
                datos
            );
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al crear cuenta'
                };
            }
            
            return {
                success: true,
                data: response.data?.data,
                message: response.data?.message || 'Cuenta creada exitosamente'
            };
        } catch (error) {
            console.error('❌ Error al crear cuenta:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al crear cuenta'
            };
        }
    },

    /**
     * Actualizar una cuenta de fondos
     */
    actualizarCuenta: async (id, datos) => {
        try {
            const response = await apiRequest.put(
                API_CONFIG.ENDPOINTS.FONDOS.CUENTAS.UPDATE(id),
                datos
            );
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al actualizar cuenta'
                };
            }
            
            return {
                success: true,
                data: response.data?.data,
                message: response.data?.message || 'Cuenta actualizada exitosamente'
            };
        } catch (error) {
            console.error('❌ Error al actualizar cuenta:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al actualizar cuenta'
            };
        }
    },

    /**
     * Eliminar una cuenta de fondos
     */
    eliminarCuenta: async (id) => {
        try {
            const response = await apiRequest.delete(API_CONFIG.ENDPOINTS.FONDOS.CUENTAS.DELETE(id));
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al eliminar cuenta'
                };
            }
            
            return {
                success: true,
                message: response.data?.message || 'Cuenta eliminada exitosamente'
            };
        } catch (error) {
            console.error('❌ Error al eliminar cuenta:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al eliminar cuenta'
            };
        }
    },

    // =====================================================
    // MOVIMIENTOS DE FONDOS
    // =====================================================

    /**
     * Obtener movimientos de una cuenta
     */
    obtenerMovimientos: async (cuentaId, filtros = {}) => {
        try {
            const params = new URLSearchParams();
            
            if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
            if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
            if (filtros.tipo) params.append('tipo', filtros.tipo);
            if (filtros.page) params.append('page', filtros.page);
            if (filtros.limit) params.append('limit', filtros.limit);
            
            const queryString = params.toString();
            const url = queryString 
                ? `${API_CONFIG.ENDPOINTS.FONDOS.CUENTAS.MOVIMIENTOS(cuentaId)}?${queryString}`
                : API_CONFIG.ENDPOINTS.FONDOS.CUENTAS.MOVIMIENTOS(cuentaId);
            
            const response = await apiRequest.get(url);
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al obtener movimientos'
                };
            }
            
            return {
                success: true,
                data: response.data?.data || [],
                meta: response.data?.meta || {}
            };
        } catch (error) {
            console.error('❌ Error al obtener movimientos:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener movimientos'
            };
        }
    },

    /**
     * Obtener historial unificado (ventas, gastos, movimientos)
     */
    obtenerHistorialUnificado: async (cuentaId, filtros = {}) => {
        try {
            const params = new URLSearchParams();
            
            if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
            if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
            if (filtros.page) params.append('page', filtros.page);
            if (filtros.limit) params.append('limit', filtros.limit);
            
            const queryString = params.toString();
            const url = queryString 
                ? `${API_CONFIG.ENDPOINTS.FONDOS.CUENTAS.HISTORIAL(cuentaId)}?${queryString}`
                : API_CONFIG.ENDPOINTS.FONDOS.CUENTAS.HISTORIAL(cuentaId);
            
            const response = await apiRequest.get(url);
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al obtener historial'
                };
            }
            
            return {
                success: true,
                data: response.data?.data || [],
                meta: response.data?.meta || {}
            };
        } catch (error) {
            console.error('❌ Error al obtener historial:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener historial'
            };
        }
    },

    /**
     * Registrar un movimiento manual (ingreso o egreso)
     */
    registrarMovimiento: async (datos) => {
        try {
            const response = await apiRequest.post(
                API_CONFIG.ENDPOINTS.FONDOS.MOVIMIENTOS.CREATE,
                datos
            );
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al registrar movimiento'
                };
            }
            
            return {
                success: true,
                data: response.data?.data,
                message: response.data?.message || 'Movimiento registrado exitosamente'
            };
        } catch (error) {
            console.error('❌ Error al registrar movimiento:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al registrar movimiento'
            };
        }
    }
};

