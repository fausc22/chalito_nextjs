import { apiRequest } from './api';
import { API_CONFIG } from '../config/api';
import { resolveControlaStock } from '../lib/articulosStock';

const normalizarArticulo = (articulo = {}) => ({
  ...articulo,
  activo:
    articulo.activo === true ||
    articulo.activo === 1 ||
    articulo.activo === '1' ||
    articulo.activo === 'true',
  categoria: articulo.categoria ?? articulo.categoria_nombre ?? '',
  codigo: articulo.codigo ?? articulo.codigo_barra ?? '',
  controla_stock: resolveControlaStock(articulo),
  contenido: Array.isArray(articulo.contenido) ? articulo.contenido : (Array.isArray(articulo.ingredientes) ? articulo.ingredientes : [])
});

export const articulosService = {
  // ==================== SUBIR IMAGEN A CLOUDINARY ====================
  // Sube una imagen al backend que la procesa con Cloudinary
  subirImagenArticulo: async (imagenFile) => {
    try {
      // Validar que hay archivo
      if (!imagenFile) {
        return {
          success: false,
          error: 'No se proporcionó ninguna imagen'
        };
      }

      // Crear FormData
      const formData = new FormData();
      formData.append('imagen', imagenFile);

      // Subir al backend (que sube a Cloudinary)
      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.ARTICULOS.UPLOAD_IMAGEN,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Verificar respuesta
      if (response.data?.error === true || response.data?.success === false) {
        return {
          success: false,
          error: response.data.mensaje || 'Error al subir imagen'
        };
      }

      // Retornar URL de Cloudinary
      return {
        success: true,
        imagen_url: response.data.imagen_url || response.data.data?.imagen_url,
        public_id: response.data.public_id || response.data.data?.public_id
      };

    } catch (error) {
      console.error('Error al subir imagen:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.message || 'Error al subir imagen'
      };
    }
  },

  // Obtener todos los artículos
  obtenerArticulos: async (filtros = {}) => {
    try {
      const params = new URLSearchParams();

      // Mapear filtros del frontend a los que espera articulosController
      if (filtros.categoria || filtros.categoria_id) {
        params.append('categoria', filtros.categoria || filtros.categoria_id);
      }
      const incluirInactivos = filtros.incluirInactivos === true;
      const tieneFiltroDisponibilidad =
        filtros.disponible !== undefined &&
        filtros.disponible !== null &&
        filtros.disponible !== '' &&
        filtros.disponible !== 'all';

      // articulosController usa 'disponible' en query string
      if (tieneFiltroDisponibilidad) {
        params.append('disponible', filtros.disponible ? 'true' : 'false');
      }
      if (filtros.controla_stock !== undefined && filtros.controla_stock !== null && filtros.controla_stock !== '') {
        params.append('controla_stock', filtros.controla_stock ? 'true' : 'false');
      }
      // Por defecto traer solo activos, salvo que se pida incluir inactivos.
      if (!tieneFiltroDisponibilidad && !incluirInactivos) {
        params.append('disponible', 'true');
      }

      const url = API_CONFIG.ENDPOINTS.ARTICULOS.LIST + (params.toString() ? `?${params.toString()}` : '');
      const response = await apiRequest.get(url);

      // Verificar si la respuesta es un error transformado por el interceptor
      if (response.data?.error === true || response.data?.success === false) {
        console.error('Error al obtener artículos:', response.data.mensaje || response.data.message);
        return {
          success: false,
          data: [],
          error: response.data.mensaje || response.data.message || 'Error al obtener artículos'
        };
      }

      // El backend devuelve { success: true, data: [...] } o { data: [...] }
      const articulos = response.data.data || response.data || [];
      const articulosArray = Array.isArray(articulos) ? articulos.map(normalizarArticulo) : [];

      return {
        success: true,
        data: articulosArray
      };
    } catch (error) {
      console.error('Error al obtener artículos:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.response?.data?.message || error.message || 'Error al obtener artículos',
        data: []
      };
    }
  },

  // Obtener artículo por ID
  obtenerArticuloPorId: async (id) => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.ARTICULOS.BY_ID(id));

      return {
        success: true,
        data: normalizarArticulo(response.data.data || response.data)
      };
    } catch (error) {
      console.error('Error al obtener artículo:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || 'Error al obtener artículo'
      };
    }
  },

  // Obtener costos calculados de un artículo elaborado
  obtenerCostoArticulo: async (id) => {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.ARTICULOS.COSTO(id));

      // Soportar tanto { success, data } como payload directo
      if (response.data?.error === true || response.data?.success === false) {
        return {
          success: false,
          error: response.data.mensaje || response.data.message || 'Error al obtener costos del artículo'
        };
      }

      const data = response.data.data || response.data;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error al obtener costos del artículo:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.response?.data?.message || 'Error al obtener costos del artículo'
      };
    }
  },

  // Obtener categorías disponibles
  obtenerCategorias: async () => {
    try {
      // Usar el endpoint dropdown que devuelve todas las categorías sin paginación
      const response = await apiRequest.get(`${API_CONFIG.ENDPOINTS.CATEGORIAS.LIST}/dropdown`);

      // Verificar si la respuesta es un error transformado
      if (response.data?.error === true || response.data?.success === false) {
        return {
          success: false,
          data: [],
          error: response.data.mensaje || response.data.message || 'Error al obtener categorías'
        };
      }

      const categorias = response.data.data || response.data || [];
      
      // Asegurar que siempre sea un array
      const categoriasArray = Array.isArray(categorias) ? categorias : [];

      return {
        success: true,
        data: categoriasArray
      };
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  // Crear nuevo artículo
  crearArticulo: async (articuloData) => {
    try {
      // ==================== SUBIDA DE IMAGEN A CLOUDINARY ====================
      let imagen_url = null;

      // Si hay una imagen seleccionada, subirla primero
      if (articuloData.imagenFile) {
        console.log('📸 Subiendo imagen a Cloudinary...');
        const uploadResult = await articulosService.subirImagenArticulo(articuloData.imagenFile);
        
        if (uploadResult.success) {
          imagen_url = uploadResult.imagen_url;
          console.log('✅ Imagen subida correctamente:', imagen_url);
        } else {
          // Si falla la subida de imagen, mostrar advertencia pero continuar
          console.warn('⚠️ No se pudo subir la imagen:', uploadResult.error);
          // Opción: puedes decidir si fallar todo o continuar sin imagen
          // return { success: false, error: uploadResult.error };
        }
      }
      // ==================== FIN SUBIDA ====================

      // Mapear campos del frontend al backend
      const controlaStock = articuloData.controla_stock !== undefined
        ? articuloData.controla_stock === true || articuloData.controla_stock === 1 || articuloData.controla_stock === '1'
        : resolveControlaStock(articuloData);
      const dataToSend = {
        categoria_id: articuloData.categoria_id,
        nombre: articuloData.nombre,
        descripcion: articuloData.descripcion || null,
        precio: parseFloat(articuloData.precio),
        peso: parseInt(articuloData.peso, 10),
        codigo_barra: articuloData.codigo || null,
        controla_stock: controlaStock,
        stock_actual: controlaStock && articuloData.stock_actual ? parseInt(articuloData.stock_actual, 10) : 0,
        stock_minimo: controlaStock && articuloData.stock_minimo ? parseInt(articuloData.stock_minimo, 10) : 0,
        tipo: articuloData.tipo || 'OTRO',
        imagen_url: imagen_url, // URL de Cloudinary o null
        ingredientes: articuloData.tipo === 'ELABORADO' ? (articuloData.ingredientes || []) : []
      };

      const response = await apiRequest.post(
        API_CONFIG.ENDPOINTS.ARTICULOS.CREATE,
        dataToSend
      );

      // Verificar si la respuesta es un error transformado por el interceptor
      if (response.data?.error === true) {
        const status = response.data.status;
        let errorMessage = 'Error al crear artículo';

        if (status === 409) {
          errorMessage = response.data.mensaje || 'Ya existe un artículo con ese nombre o código de barras';
        } else if (status === 400) {
          errorMessage = response.data.mensaje || 'Datos inválidos. Verifica la información ingresada';
        } else {
          errorMessage = response.data.mensaje || `Error ${status}: No se pudo crear el artículo`;
        }

        return {
          success: false,
          error: errorMessage
        };
      }

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || 'Artículo creado correctamente'
      };
    } catch (error) {
      console.error('Error al crear artículo:', error);

      // Manejo específico para diferentes códigos de error
      let errorMessage = 'Error al crear artículo';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 409) {
          errorMessage = data?.mensaje || data?.message || 'Ya existe un artículo con ese nombre o código de barras';
        } else if (status === 400) {
          errorMessage = data?.mensaje || data?.message || 'Datos inválidos. Verifica la información ingresada';
        } else {
          errorMessage = data?.mensaje || data?.message || `Error ${status}: No se pudo crear el artículo`;
        }
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Actualizar artículo existente
  actualizarArticulo: async (id, articuloData) => {
    try {
      // ==================== ACTUALIZACIÓN DE IMAGEN CON CLOUDINARY ====================
      let imagen_url = articuloData.imagen_url; // Mantener URL existente por defecto

      // Si hay una nueva imagen seleccionada, subirla
      if (articuloData.imagenFile) {
        console.log('📸 Subiendo nueva imagen a Cloudinary...');
        const uploadResult = await articulosService.subirImagenArticulo(articuloData.imagenFile);
        
        if (uploadResult.success) {
          imagen_url = uploadResult.imagen_url;
          console.log('✅ Imagen actualizada correctamente:', imagen_url);
          // NOTA: Si se desea eliminar la imagen anterior de Cloudinary,
          // se puede hacer aquí usando el public_id de la imagen anterior
        } else {
          console.warn('⚠️ No se pudo subir la nueva imagen:', uploadResult.error);
          // Mantener la imagen anterior si falla la subida
        }
      }
      // ==================== FIN ACTUALIZACIÓN ====================

      // Mapear campos del frontend al backend
      const controlaStock = articuloData.controla_stock !== undefined
        ? articuloData.controla_stock === true || articuloData.controla_stock === 1 || articuloData.controla_stock === '1'
        : resolveControlaStock(articuloData);
      const dataToSend = {
        categoria_id: articuloData.categoria_id,
        nombre: articuloData.nombre,
        descripcion: articuloData.descripcion || null,
        precio: parseFloat(articuloData.precio),
        peso: parseInt(articuloData.peso, 10),
        codigo_barra: articuloData.codigo || null,
        controla_stock: controlaStock,
        stock_actual: controlaStock && articuloData.stock_actual !== undefined && articuloData.stock_actual !== '' ? parseInt(articuloData.stock_actual, 10) : 0,
        stock_minimo: controlaStock && articuloData.stock_minimo !== undefined && articuloData.stock_minimo !== '' ? parseInt(articuloData.stock_minimo, 10) : 0,
        tipo: articuloData.tipo || 'OTRO',
        activo: articuloData.activo ? 1 : 0,
        imagen_url: imagen_url, // URL actualizada o existente
        ingredientes: articuloData.tipo === 'ELABORADO' ? (articuloData.ingredientes || []) : []
      };

      const response = await apiRequest.put(
        API_CONFIG.ENDPOINTS.ARTICULOS.BY_ID(id),
        dataToSend
      );

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || 'Artículo actualizado correctamente'
      };
    } catch (error) {
      console.error('Error al actualizar artículo:', error);
      return {
        success: false,
        error: error.response?.data?.mensaje || error.response?.data?.message || 'Error al actualizar artículo'
      };
    }
  },

  // Eliminar artículo (marcar como inactivo)
  eliminarArticulo: async (id) => {
    try {
      const response = await apiRequest.delete(API_CONFIG.ENDPOINTS.ARTICULOS.BY_ID(id));

      // Verificar si la respuesta del backend indica éxito
      if (response.data?.success === false) {
        console.warn('⚠️ Backend rechazó la eliminación:', response.data.message);
        return {
          success: false,
          error: response.data.message || response.data.mensaje || 'No se puede eliminar el artículo'
        };
      }

      return {
        success: true,
        data: response.data.data || response.data,
        mensaje: response.data.mensaje || response.data.message || 'Artículo eliminado correctamente'
      };
    } catch (error) {
      console.error('❌ Error al eliminar artículo:', error);
      // El backend devuelve 400 cuando no se puede eliminar
      const errorMessage = error.response?.data?.message || error.response?.data?.mensaje || 'Error al eliminar artículo';
      console.error('   Mensaje de error:', errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Obtener estadísticas de artículos
  obtenerEstadisticas: async () => {
    try {
      const response = await articulosService.obtenerArticulos();

      if (!response.success) {
        throw new Error('Error al obtener artículos');
      }

      const articulos = response.data;
      const categoriasUnicas = [...new Set(articulos.map(a => a.categoria))];

      return {
        success: true,
        data: {
          total: articulos.length,
          disponibles: articulos.filter(a => a.activo).length,
          noDisponibles: articulos.filter(a => !a.activo).length,
          totalCategorias: categoriasUnicas.length,
          promedioPrecios: articulos.length > 0
            ? (articulos.reduce((sum, a) => sum + a.precio, 0) / articulos.length).toFixed(2)
            : 0,
          promedioTiempoPrep: articulos.length > 0
            ? Math.round(articulos.reduce((sum, a) => sum + a.tiempoPreparacion, 0) / articulos.length)
            : 0
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        success: false,
        data: {
          total: 0,
          disponibles: 0,
          noDisponibles: 0,
          totalCategorias: 0,
          promedioPrecios: 0,
          promedioTiempoPrep: 0
        },
        error: error.message
      };
    }
  }
};
