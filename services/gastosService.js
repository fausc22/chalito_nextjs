import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestión de gastos (egresos)
 */

export const gastosService = {
    // =====================================================
    // GASTOS
    // =====================================================

    /**
     * Obtener lista de gastos con filtros
     */
    obtenerGastos: async (filtros = {}) => {
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
            if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id);
            if (filtros.cuenta_id) params.append('cuenta_id', filtros.cuenta_id);
            if (filtros.forma_pago) params.append('forma_pago', filtros.forma_pago);
            if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
            
            // Paginación
            if (filtros.page) params.append('page', filtros.page);
            if (filtros.limit) params.append('limit', filtros.limit);
            
            const queryString = params.toString();
            const url = queryString 
                ? `${API_CONFIG.ENDPOINTS.GASTOS.LIST}?${queryString}`
                : API_CONFIG.ENDPOINTS.GASTOS.LIST;
            
            const response = await apiRequest.get(url);
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al obtener gastos'
                };
            }
            
            return {
                success: true,
                data: response.data?.data || [],
                meta: response.data?.meta || {}
            };
        } catch (error) {
            console.error('❌ Error al obtener gastos:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener gastos'
            };
        }
    },

    /**
     * Obtener un gasto por ID
     */
    obtenerGastoPorId: async (id) => {
        try {
            const response = await apiRequest.get(API_CONFIG.ENDPOINTS.GASTOS.BY_ID(id));
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al obtener gasto'
                };
            }
            
            return {
                success: true,
                data: response.data?.data
            };
        } catch (error) {
            console.error('❌ Error al obtener gasto:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener gasto'
            };
        }
    },

    /**
     * Crear un nuevo gasto
     */
    crearGasto: async (gastoData) => {
        try {
            console.log('💸 Creando gasto:', gastoData);
            
            const payload = {
                categoria_id: parseInt(gastoData.categoria_id),
                descripcion: gastoData.descripcion,
                monto: parseFloat(gastoData.monto),
                forma_pago: gastoData.forma_pago || 'EFECTIVO',
                cuenta_id: gastoData.cuenta_id ? parseInt(gastoData.cuenta_id) : null,
                observaciones: gastoData.observaciones || null
            };
            
            const response = await apiRequest.post(API_CONFIG.ENDPOINTS.GASTOS.CREATE, payload);
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al crear gasto',
                    errors: response.data?.errors
                };
            }
            
            console.log('✅ Gasto creado:', response.data);
            
            return {
                success: true,
                data: response.data?.data,
                message: response.data?.message || 'Gasto creado exitosamente'
            };
        } catch (error) {
            console.error('❌ Error al crear gasto:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al crear gasto',
                errors: error.response?.data?.errors
            };
        }
    },

    /**
     * Actualizar un gasto existente
     */
    actualizarGasto: async (id, gastoData) => {
        try {
            console.log('✏️ Actualizando gasto:', id, gastoData);
            
            const payload = {};
            
            if (gastoData.categoria_id !== undefined) {
                payload.categoria_id = parseInt(gastoData.categoria_id);
            }
            if (gastoData.descripcion !== undefined) {
                payload.descripcion = gastoData.descripcion;
            }
            if (gastoData.monto !== undefined) {
                payload.monto = parseFloat(gastoData.monto);
            }
            if (gastoData.forma_pago !== undefined) {
                payload.forma_pago = gastoData.forma_pago;
            }
            if (gastoData.cuenta_id !== undefined) {
                payload.cuenta_id = gastoData.cuenta_id ? parseInt(gastoData.cuenta_id) : null;
            }
            if (gastoData.observaciones !== undefined) {
                payload.observaciones = gastoData.observaciones;
            }
            
            const response = await apiRequest.put(API_CONFIG.ENDPOINTS.GASTOS.UPDATE(id), payload);
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al actualizar gasto',
                    errors: response.data?.errors
                };
            }
            
            console.log('✅ Gasto actualizado:', response.data);
            
            return {
                success: true,
                data: response.data?.data,
                message: response.data?.message || 'Gasto actualizado exitosamente'
            };
        } catch (error) {
            console.error('❌ Error al actualizar gasto:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al actualizar gasto',
                errors: error.response?.data?.errors
            };
        }
    },

    /**
     * Eliminar un gasto
     */
    eliminarGasto: async (id) => {
        try {
            console.log('🗑️ Eliminando gasto:', id);
            
            const response = await apiRequest.delete(API_CONFIG.ENDPOINTS.GASTOS.DELETE(id));
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al eliminar gasto'
                };
            }
            
            console.log('✅ Gasto eliminado:', response.data);
            
            return {
                success: true,
                data: response.data?.data,
                message: response.data?.message || 'Gasto eliminado exitosamente'
            };
        } catch (error) {
            console.error('❌ Error al eliminar gasto:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al eliminar gasto'
            };
        }
    },

    // =====================================================
    // CATEGORÍAS DE GASTOS
    // =====================================================

    /**
     * Obtener categorías de gastos
     */
    obtenerCategorias: async (soloActivas = false) => {
        try {
            const url = soloActivas 
                ? `${API_CONFIG.ENDPOINTS.GASTOS.CATEGORIAS}?activa=true`
                : API_CONFIG.ENDPOINTS.GASTOS.CATEGORIAS;
            
            const response = await apiRequest.get(url);
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al obtener categorías'
                };
            }
            
            return {
                success: true,
                data: response.data?.data || []
            };
        } catch (error) {
            console.error('❌ Error al obtener categorías:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al obtener categorías'
            };
        }
    },

    /**
     * Crear categoría de gasto
     */
    crearCategoria: async (categoriaData) => {
        try {
            const response = await apiRequest.post(API_CONFIG.ENDPOINTS.GASTOS.CATEGORIAS, {
                nombre: categoriaData.nombre,
                descripcion: categoriaData.descripcion || null
            });
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al crear categoría'
                };
            }
            
            return {
                success: true,
                data: response.data?.data,
                message: response.data?.message || 'Categoría creada exitosamente'
            };
        } catch (error) {
            console.error('❌ Error al crear categoría:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al crear categoría'
            };
        }
    },

    /**
     * Actualizar categoría de gasto
     */
    actualizarCategoria: async (id, categoriaData) => {
        try {
            const payload = {};
            if (categoriaData.nombre !== undefined) payload.nombre = categoriaData.nombre;
            if (categoriaData.descripcion !== undefined) payload.descripcion = categoriaData.descripcion;
            if (categoriaData.activa !== undefined) payload.activa = categoriaData.activa;
            
            const response = await apiRequest.put(
                API_CONFIG.ENDPOINTS.GASTOS.CATEGORIA_BY_ID(id),
                payload
            );
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al actualizar categoría'
                };
            }
            
            return {
                success: true,
                data: response.data?.data,
                message: response.data?.message || 'Categoría actualizada exitosamente'
            };
        } catch (error) {
            console.error('❌ Error al actualizar categoría:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al actualizar categoría'
            };
        }
    },

    /**
     * Eliminar categoría de gasto
     */
    eliminarCategoria: async (id) => {
        try {
            const response = await apiRequest.delete(API_CONFIG.ENDPOINTS.GASTOS.CATEGORIA_BY_ID(id));
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al eliminar categoría'
                };
            }
            
            return {
                success: true,
                data: response.data?.data,
                message: response.data?.message || 'Categoría eliminada exitosamente'
            };
        } catch (error) {
            console.error('❌ Error al eliminar categoría:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al eliminar categoría'
            };
        }
    },

    // =====================================================
    // AUXILIARES
    // =====================================================

    /**
     * Obtener cuentas de fondos disponibles
     */
    obtenerCuentas: async () => {
        try {
            const response = await apiRequest.get(API_CONFIG.ENDPOINTS.GASTOS.CUENTAS);
            
            if (response.data?.success === false) {
                return {
                    success: false,
                    error: response.data?.message || 'Error al obtener cuentas'
                };
            }
            
            return {
                success: true,
                data: response.data?.data || []
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
     * Obtener resumen de gastos
     */
    obtenerResumen: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            
            if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
            if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
            
            const queryString = params.toString();
            const url = queryString 
                ? `${API_CONFIG.ENDPOINTS.GASTOS.RESUMEN}?${queryString}`
                : API_CONFIG.ENDPOINTS.GASTOS.RESUMEN;
            
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
    }
};

