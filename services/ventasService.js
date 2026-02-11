import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestión de ventas (ingresos)
 */

export const ventasService = {
    // =====================================================
    // VENTAS
    // =====================================================

    /**
     * Obtener lista de ventas con filtros y paginación
     */
    obtenerVentas: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            
            // Filtros de mes/año (prioritarios)
            if (filtros.month !== null && filtros.month !== undefined) {
                params.append('month', filtros.month === 'all' ? 'all' : String(filtros.month));
            }
            if (filtros.year !== null && filtros.year !== undefined) {
                params.append('year', String(filtros.year));
            }
            
            // Filtros de fecha (si no se usa month/year)
            if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
            if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
            
            // Otros filtros
            if (filtros.estado) params.append('estado', filtros.estado);
            if (filtros.medio_pago) params.append('medio_pago', filtros.medio_pago);
            if (filtros.cuenta_id) params.append('cuenta_id', filtros.cuenta_id);
            if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
            
            // Paginación
            if (filtros.page) params.append('page', filtros.page);
            if (filtros.limite) params.append('limit', filtros.limite);
            
            const queryString = params.toString();
            const url = queryString 
                ? `${API_CONFIG.ENDPOINTS.VENTAS.LIST}?${queryString}`
                : API_CONFIG.ENDPOINTS.VENTAS.LIST;
            
            const response = await apiRequest.get(url);
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al obtener ventas'
                };
            }
            
            return {
                success: true,
                data: response.data?.data || [],
                meta: response.data?.meta || {}
            };
        } catch (error) {
            console.error('❌ Error al obtener ventas:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener ventas'
            };
        }
    },

    /**
     * Obtener una venta por ID con detalle completo
     */
    obtenerVentaPorId: async (id) => {
        try {
            const response = await apiRequest.get(API_CONFIG.ENDPOINTS.VENTAS.BY_ID(id));
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al obtener venta'
                };
            }
            
            return {
                success: true,
                data: response.data?.data
            };
        } catch (error) {
            console.error('❌ Error al obtener venta:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener venta'
            };
        }
    },

    /**
     * Anular una venta
     */
    anularVenta: async (id, motivo = '') => {
        try {
            console.log('🚫 Anulando venta:', id);
            
            const response = await apiRequest.put(
                API_CONFIG.ENDPOINTS.VENTAS.ANULAR(id),
                { motivo }
            );
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al anular venta'
                };
            }
            
            console.log('✅ Venta anulada:', response.data);
            
            return {
                success: true,
                data: response.data?.data,
                message: response.data?.message || 'Venta anulada exitosamente'
            };
        } catch (error) {
            console.error('❌ Error al anular venta:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al anular venta'
            };
        }
    },

    // =====================================================
    // AUXILIARES
    // =====================================================

    /**
     * Obtener resumen de ventas
     */
    obtenerResumen: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            
            if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
            if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
            
            const queryString = params.toString();
            const url = queryString 
                ? `${API_CONFIG.ENDPOINTS.VENTAS.RESUMEN}?${queryString}`
                : API_CONFIG.ENDPOINTS.VENTAS.RESUMEN;
            
            const response = await apiRequest.get(url);
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al obtener resumen'
                };
            }
            
            return {
                success: true,
                data: response.data?.data || {}
            };
        } catch (error) {
            console.error('❌ Error al obtener resumen:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener resumen'
            };
        }
    },

    /**
     * Obtener medios de pago disponibles
     */
    obtenerMediosPago: async () => {
        try {
            const response = await apiRequest.get(API_CONFIG.ENDPOINTS.VENTAS.MEDIOS_PAGO);
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al obtener medios de pago'
                };
            }
            
            return {
                success: true,
                data: response.data?.data || []
            };
        } catch (error) {
            console.error('❌ Error al obtener medios de pago:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener medios de pago'
            };
        }
    }
};
