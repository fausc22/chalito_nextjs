import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestión de ventas (ingresos)
 */

const mapearMedioPagoFrontendABackend = (medioPagoFrontend) => {
    if (!medioPagoFrontend) return null;

    const medioNormalizado = String(medioPagoFrontend).toLowerCase().trim();
    const mapeo = {
        efectivo: 'EFECTIVO',
        debito: 'DEBITO',
        credito: 'CREDITO',
        transferencia: 'TRANSFERENCIA',
        mercadopago: 'MERCADOPAGO'
    };

    return mapeo[medioNormalizado] || String(medioPagoFrontend).toUpperCase();
};

const toNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const transformarVentaFrontendABackend = (ventaFrontend = {}) => {
    const articulosFuente = Array.isArray(ventaFrontend.articulos)
        ? ventaFrontend.articulos
        : (Array.isArray(ventaFrontend.items) ? ventaFrontend.items : []);

    const articulos = articulosFuente
        .map((item) => {
            const articuloId = parseInt(item.articulo_id ?? item.id, 10);
            if (!Number.isFinite(articuloId) || articuloId <= 0) return null;

            const cantidad = toNumber(item.cantidad, 1);
            const precio = toNumber(item.precio, 0);
            const subtotal = toNumber(item.subtotal, precio * cantidad);

            return {
                articulo_id: articuloId,
                articulo_nombre: String(item.articulo_nombre || item.nombre || 'Artículo'),
                cantidad,
                precio,
                subtotal
            };
        })
        .filter(Boolean);

    return {
        pedido_id: ventaFrontend.pedido_id ?? ventaFrontend.pedidoId ?? null,
        cliente_nombre: ventaFrontend.cliente_nombre || ventaFrontend.clienteNombre || ventaFrontend.cliente?.nombre || null,
        cliente_direccion: ventaFrontend.cliente_direccion || ventaFrontend.direccion || ventaFrontend.cliente?.direccion || null,
        cliente_telefono: ventaFrontend.cliente_telefono || ventaFrontend.telefono || ventaFrontend.cliente?.telefono || null,
        cliente_email: ventaFrontend.cliente_email || ventaFrontend.email || ventaFrontend.cliente?.email || null,
        subtotal: toNumber(ventaFrontend.subtotal, 0),
        iva_total: toNumber(ventaFrontend.iva_total ?? ventaFrontend.ivaTotal, 0),
        descuento: toNumber(ventaFrontend.descuento, 0),
        total: toNumber(ventaFrontend.total, 0),
        medio_pago: mapearMedioPagoFrontendABackend(ventaFrontend.medio_pago ?? ventaFrontend.medioPago),
        cuenta_id: ventaFrontend.cuenta_id ?? ventaFrontend.cuentaId ?? null,
        observaciones: ventaFrontend.observaciones || null,
        tipo_factura: ventaFrontend.tipo_factura ?? ventaFrontend.tipoFactura ?? null,
        articulos
    };
};

const extraerErrorValidacion = (responseData) => {
    const errorData = responseData?.data || responseData;
    if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        return errorData.errors
            .map((e) => `${e.path || 'campo'}: ${e.message}`)
            .join(', ');
    }
    return null;
};

export const ventasService = {
    // =====================================================
    // VENTAS
    // =====================================================

    /**
     * Crear una nueva venta
     */
    crearVenta: async (ventaData) => {
        try {
            const payload = transformarVentaFrontendABackend(ventaData);
            if (!payload.articulos || payload.articulos.length === 0) {
                return {
                    success: false,
                    error: 'Error de validación: no hay artículos válidos para registrar la venta'
                };
            }

            const response = await apiRequest.post(API_CONFIG.ENDPOINTS.VENTAS.CREATE, payload);

            if (response.data?.error === true || response.data?.success === false) {
                const detalleValidacion = extraerErrorValidacion(response.data);
                return {
                    success: false,
                    error: detalleValidacion
                        ? `Error de validación: ${detalleValidacion}`
                        : (response.data?.mensaje || response.data?.message || 'Error al crear venta'),
                    status: response.data?.status,
                    rateLimit: response.data?.rateLimit === true || response.data?.status === 429,
                    retryAfter: response.data?.retryAfter
                };
            }

            return {
                success: true,
                data: response.data?.data || response.data,
                message: response.data?.mensaje || response.data?.message || 'Venta registrada correctamente'
            };
        } catch (error) {
            console.error('❌ Error al crear venta:', error);
            return {
                success: false,
                error: error.response?.data?.mensaje || error.response?.data?.message || error.message || 'Error al crear venta',
                status: error.response?.status,
                rateLimit: error.response?.status === 429,
                retryAfter: error.response?.data?.retryAfter
            };
        }
    },

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
