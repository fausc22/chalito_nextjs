import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';

/**
 * Servicio para gestión de ventas
 * Mapea la estructura del frontend a la estructura del backend
 */

// Mapear medio de pago del frontend al backend
const mapearMedioPagoFrontendABackend = (medioPagoFrontend) => {
  const mapeo = {
    'efectivo': 'EFECTIVO',
    'debito': 'DEBITO',
    'credito': 'CREDITO',
    'transferencia': 'TRANSFERENCIA',
    'mercadopago': 'MERCADOPAGO'
  };
  return mapeo[medioPagoFrontend] || 'EFECTIVO';
};

// Transformar venta del frontend al formato del backend
const transformarVentaFrontendABackend = (ventaFrontend) => {
  return {
    cliente_nombre: ventaFrontend.clienteNombre || ventaFrontend.cliente?.nombre || '',
    cliente_direccion: ventaFrontend.cliente?.direccion || ventaFrontend.direccion || '',
    cliente_telefono: ventaFrontend.cliente?.telefono || ventaFrontend.telefono || '',
    cliente_email: ventaFrontend.cliente?.email || ventaFrontend.email || null,
    subtotal: ventaFrontend.subtotal || 0,
    iva_total: ventaFrontend.ivaTotal || ventaFrontend.iva_total || 0,
    descuento: ventaFrontend.descuento || 0,
    total: ventaFrontend.total || 0,
    medio_pago: mapearMedioPagoFrontendABackend(ventaFrontend.medioPago || ventaFrontend.medio_pago || 'efectivo'),
    cuenta_id: ventaFrontend.cuenta_id || null,
    estado: 'FACTURADA',
    observaciones: ventaFrontend.observaciones || null,
    tipo_factura: ventaFrontend.tipo_factura || null,
    articulos: ventaFrontend.items?.map(item => {
      // Asegurarse de que articulo_id sea un número
      const articuloId = item.articulo_id || item.id;
      const articuloIdNum = typeof articuloId === 'string' ? parseInt(articuloId, 10) : articuloId;
      
      if (!articuloIdNum || isNaN(articuloIdNum)) {
        console.error('❌ Item sin articulo_id válido:', item);
        return null;
      }
      
      return {
        articulo_id: articuloIdNum,
        articulo_nombre: item.articulo_nombre || item.nombre || '',
        cantidad: item.cantidad || 1,
        precio: parseFloat(item.precio) || 0,
        subtotal: parseFloat(item.subtotal) || (parseFloat(item.precio) * (item.cantidad || 1)) || 0
      };
    }).filter(item => item !== null) || []
  };
};

export const ventasService = {
  /**
   * Crear una nueva venta
   */
  crearVenta: async (ventaData) => {
    try {
      console.log('💰 Creando venta con datos:', ventaData);
      const ventaBackend = transformarVentaFrontendABackend(ventaData);
      console.log('💰 Datos transformados para backend:', ventaBackend);

      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.VENTAS.CREATE,
        ventaBackend
      );

      console.log('💰 Respuesta del backend:', response.data);

      if (response.data?.error === true || response.data?.success === false) {
        console.error('❌ Error del backend completo:', JSON.stringify(response.data, null, 2));
        
        const errorData = response.data.data || response.data;
        
        // Verificar si es rate limit
        const isRateLimit = response.data.status === 429 || 
                           response.data.rateLimit === true ||
                           errorData?.mensaje?.includes('Rate limit') ||
                           errorData?.mensaje?.includes('rate limit');
        
        if (isRateLimit) {
          const retryAfter = response.data.retryAfter || errorData?.retryAfter || 300;
          return {
            success: false,
            error: `Rate limit excedido. Por favor espera ${Math.round(retryAfter / 60)} minutos antes de intentar nuevamente.`,
            rateLimit: true,
            retryAfter: retryAfter
          };
        }
        
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          console.error('❌ Errores de validación detallados:', errorData.errors);
          const erroresDetalle = errorData.errors.map(e => `${e.path || 'campo'}: ${e.message}`).join(', ');
          return {
            success: false,
            error: `Error de validación: ${erroresDetalle}`,
            errores: errorData.errors
          };
        }
        
        return {
          success: false,
          error: response.data.mensaje || errorData?.mensaje || errorData?.message || 'Error al crear venta',
          errores: errorData?.errors
        };
      }

      const ventaCreada = response.data.data || response.data;
      
      console.log('✅ Venta creada exitosamente:', ventaCreada);
      
      return {
        success: true,
        data: {
          id: String(ventaCreada.id),
          ...ventaData
        },
        mensaje: response.data.message || 'Venta creada exitosamente'
      };
    } catch (error) {
      console.error('❌ Error al crear venta:', error);
      
      if (error.response?.data?.errors) {
        console.error('❌ Errores de validación:', error.response.data.errors);
        const erroresDetalle = error.response.data.errors.map(e => `${e.path || 'campo'}: ${e.message}`).join(', ');
        return {
          success: false,
          error: `Error de validación: ${erroresDetalle}`,
          errores: error.response.data.errors
        };
      }
      
      let errorMessage = 'Error al crear venta';
      if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }
};

