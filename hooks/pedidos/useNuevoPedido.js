import { useState, useCallback, useMemo, useEffect } from 'react';
import { z } from 'zod';
import { articulosService } from '../../services/articulosService';
import { pedidosService } from '../../services/pedidosService';
import { adicionalesService } from '../../services/adicionalesService';
import { toast } from '@/hooks/use-toast';

// Patrones para validación: sin símbolos raros (email se valida aparte)
const SOLO_LETRAS_ESPACIOS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']*$/; // nombre: letras, espacios, guión, apóstrofe
const SOLO_NUMEROS_TELEFONO = /^\+?[\d\s\-()]*$/; // teléfono: + opcional, luego solo dígitos, espacios, guiones, paréntesis
const DIRECCION_SEGURA = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,\-'/°]*$/; // calle, edificio, piso, observaciones (guión al final = literal)
const NUMERO_ALTURA = /^[a-zA-Z0-9\s\-°]*$/; // número/altura (ej. "1234" o "1234 B")

// Esquema de validación para el cliente
const clienteSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo')
    .regex(SOLO_LETRAS_ESPACIOS, 'El nombre solo puede contener letras, espacios, guiones o apóstrofes'),
  telefono: z
    .string()
    .min(1, 'El teléfono es requerido')
    .max(20, 'El teléfono es demasiado largo')
    .regex(SOLO_NUMEROS_TELEFONO, 'El teléfono solo puede contener números, espacios, guiones o paréntesis')
    .refine((v) => (v.replace(/\D/g, '').length >= 6), 'El teléfono debe tener al menos 6 dígitos'),
  email: z.preprocess(
    (val) => {
      if (!val || (typeof val === 'string' && val.trim() === '')) {
        return undefined;
      }
      return val;
    },
    z.string().email('Email inválido').optional()
  ),
  direccion: z
    .object({
      calle: z.string().max(200).regex(DIRECCION_SEGURA, 'Caracteres no permitidos en calle').optional().or(z.literal('')),
      numero: z.string().max(30).regex(NUMERO_ALTURA, 'Caracteres no permitidos en número').optional().or(z.literal('')),
      edificio: z.string().max(100).regex(DIRECCION_SEGURA, 'Caracteres no permitidos').optional().or(z.literal('')),
      piso: z.string().max(50).regex(DIRECCION_SEGURA, 'Caracteres no permitidos').optional().or(z.literal('')),
      observaciones: z.string().max(300).regex(DIRECCION_SEGURA, 'Caracteres no permitidos').optional().or(z.literal('')),
    })
    .optional(),
});

// Esquema de validación para el carrito
const carritoSchema = z.array(
  z.object({
    id: z.number().or(z.string()),
    nombre: z.string(),
    precio: z.number().min(0),
    cantidad: z.number().int().min(1),
    extrasSeleccionados: z.array(z.any()).optional(),
    observacion: z.string().optional().nullable(),
  })
).min(1, 'Debe agregar al menos un producto al carrito');

// Esquema de validación para el pedido completo
const pedidoSchema = z.object({
  cliente: clienteSchema,
  carrito: carritoSchema,
  tipoEntrega: z.enum(['delivery', 'retiro']),
  origen: z.string().min(1),
  tipoPedido: z.string().min(1),
  horaProgramada: z.string().optional().nullable(),
  medioPago: z.string().optional(),
  estadoPago: z.string(),
  descuento: z.number().min(0).max(100).optional(),
});

export const useNuevoPedido = () => {
  // Estados del modal
  const [isOpen, setIsOpen] = useState(false);
  const [pasoModal, setPasoModal] = useState(1);

  // Paso 1: Armar Pedido
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [carrito, setCarrito] = useState([]);
  const CATEGORIA_ULTIMOS = 'ultimos';

  // Productos más solicitados en últimos pedidos (pestaña ÚLTIMOS)
  const [productosMasSolicitadosIds, setProductosMasSolicitadosIds] = useState([]);
  const [loadingProductosMasSolicitados, setLoadingProductosMasSolicitados] = useState(false);
  
  // Datos desde el backend
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingProductos, setLoadingProductos] = useState(true);

  // Modal de extras
  const [modalExtras, setModalExtras] = useState(false);
  const [productoParaExtras, setProductoParaExtras] = useState(null);
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState([]);
  const [observacionItem, setObservacionItem] = useState('');
  const [editandoItemCarrito, setEditandoItemCarrito] = useState(null);
  const [unidadActual, setUnidadActual] = useState(1);
  const [totalUnidades, setTotalUnidades] = useState(1);
  const [unidadesConfiguradas, setUnidadesConfiguradas] = useState([]);

  // Paso 2: Datos Cliente
  const [tipoEntrega, setTipoEntrega] = useState('retiro');
  const [cliente, setCliente] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: {
      calle: '',
      numero: '',
      edificio: '',
      piso: '',
      observaciones: ''
    }
  });

  // Otros campos
  const [origen, setOrigen] = useState('mostrador');
  const [tipoPedido, setTipoPedido] = useState('ya');
  const [horaProgramada, setHoraProgramada] = useState('');
  const [medioPago, setMedioPago] = useState('efectivo');
  const [estadoPago, setEstadoPago] = useState('pending');
  const [descuento, setDescuento] = useState(0); // Porcentaje de descuento

  // Cargar categorías y productos desde el backend
  useEffect(() => {
    const cargarDatos = async () => {
      // Cargar categorías
      setLoadingCategorias(true);
      try {
        const categoriasResponse = await articulosService.obtenerCategorias();
        if (categoriasResponse.success && Array.isArray(categoriasResponse.data)) {
          setCategorias(categoriasResponse.data);
          // Seleccionar la primera categoría por defecto
          // eslint-disable-next-line react-hooks/exhaustive-deps
          if (categoriasResponse.data.length > 0 && !categoriaSeleccionada) {
            const primeraCategoria = categoriasResponse.data[0];
            const categoriaId = primeraCategoria.id || primeraCategoria.categoria_id;
            if (categoriaId) {
              setCategoriaSeleccionada(categoriaId);
            }
          }
        } else {
          console.warn('No se pudieron cargar las categorías:', categoriasResponse.error);
          setCategorias([]);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        setCategorias([]);
      } finally {
        setLoadingCategorias(false);
      }

      // Cargar productos
      setLoadingProductos(true);
      try {
        const productosResponse = await articulosService.obtenerArticulos({ disponible: true });
        if (productosResponse.success && Array.isArray(productosResponse.data)) {
          // Transformar productos del backend al formato del frontend
          // Y cargar adicionales asignados a cada artículo
          const productosTransformados = await Promise.all(
            productosResponse.data.map(async (p) => {
              // Cargar adicionales asignados a este artículo
              let extrasDisponibles = [];
              try {
                const adicionalesResponse = await adicionalesService.obtenerAdicionalesPorArticulo(p.id);
                if (adicionalesResponse.success && Array.isArray(adicionalesResponse.data)) {
                  extrasDisponibles = adicionalesResponse.data.map(adicional => ({
                    id: adicional.id || adicional.adicional_id,
                    nombre: adicional.nombre || adicional.adicional_nombre,
                    precio: parseFloat(adicional.precio_extra || adicional.precio || 0)
                  }));
                }
              } catch (error) {
                console.warn(`Error al cargar adicionales para artículo ${p.id}:`, error);
              }

              return {
                id: p.id,
                nombre: p.nombre,
                precio: parseFloat(p.precio) || 0,
                categoria: p.categoria_id,
                imagen_url: p.imagen_url, // ✅ Usar imagen_url para Cloudinary
                extrasDisponibles: extrasDisponibles
              };
            })
          );
          setProductos(productosTransformados);
        } else {
          console.warn('No se pudieron cargar los productos:', productosResponse.error);
          setProductos([]);
        }
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setProductos([]);
      } finally {
        setLoadingProductos(false);
      }
    };

    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar productos más solicitados cuando se abre el modal (para pestaña ÚLTIMOS)
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingProductosMasSolicitados(true);
    pedidosService
      .obtenerProductosMasSolicitados(9, 7, 25)
      .then((res) => {
        if (!cancelled && res.success && Array.isArray(res.data)) {
          setProductosMasSolicitadosIds(res.data);
        }
      })
      .catch(() => {
        if (!cancelled) setProductosMasSolicitadosIds([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingProductosMasSolicitados(false);
      });
    return () => { cancelled = true; };
  }, [isOpen]);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    if (!categoriaSeleccionada) return [];
    
    if (categoriaSeleccionada === CATEGORIA_ULTIMOS) {
      const lista = productosMasSolicitadosIds
        .map(id => productos.find(p => p.id === id))
        .filter(Boolean);
      if (busquedaProducto.trim() === '') return lista;
      return lista.filter(p =>
        p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
      );
    }
    
    return productos.filter(p => {
      const matchCategoria = p.categoria === categoriaSeleccionada;
      const matchBusqueda = p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase());
      return matchCategoria && matchBusqueda;
    });
  }, [productos, categoriaSeleccionada, busquedaProducto, productosMasSolicitadosIds]);

  // Calcular subtotal
  const calcularSubtotal = useCallback(() => {
    return carrito.reduce((sum, item) => {
      const precioBase = item.precio * item.cantidad;
      const precioExtras = item.extrasSeleccionados.reduce((s, e) => s + e.precio, 0) * item.cantidad;
      return sum + precioBase + precioExtras;
    }, 0);
  }, [carrito]);

  // Calcular envío
  const calcularEnvio = useCallback(() => {
    return tipoEntrega === 'delivery' && cliente.direccion.calle.trim() !== '' ? 300 : 0;
  }, [tipoEntrega, cliente.direccion.calle]);

  // Calcular descuento
  const calcularDescuento = useCallback(() => {
    if (!descuento || descuento <= 0) return 0;
    return (calcularSubtotal() * descuento) / 100;
  }, [calcularSubtotal, descuento]);

  // Calcular IVA (21%)
  const calcularIVA = useCallback(() => {
    const subtotalConDescuento = calcularSubtotal() - calcularDescuento();
    return subtotalConDescuento * 0.21;
  }, [calcularSubtotal, calcularDescuento]);

  // Calcular total
  const calcularTotal = useCallback(() => {
    const subtotalConDescuento = calcularSubtotal() - calcularDescuento();
    const iva = calcularIVA();
    const envio = calcularEnvio();
    return subtotalConDescuento + iva + envio;
  }, [calcularSubtotal, calcularDescuento, calcularIVA, calcularEnvio]);

  // Resetear modal
  const resetearModal = useCallback(() => {
    setPasoModal(1);
    if (categorias.length > 0) {
      setCategoriaSeleccionada(categorias[0].id);
    }
    setBusquedaProducto('');
    setCarrito([]);
    setTipoEntrega('retiro');
    setCliente({
      nombre: '',
      telefono: '',
      email: '',
      direccion: {
        calle: '',
        numero: '',
        edificio: '',
        piso: '',
        observaciones: ''
      }
    });
    setOrigen('mostrador');
    setTipoPedido('ya');
    setHoraProgramada('');
    setMedioPago('efectivo');
    setEstadoPago('pending');
    setDescuento(0);
  }, [categorias]);

  // Agregar producto al carrito
  const agregarProductoConExtras = useCallback((producto, cantidad) => {
    const tieneExtras = producto.extrasDisponibles && producto.extrasDisponibles.length > 0;

    if (tieneExtras) {
      // ✅ Si tiene extras, SIEMPRE abrir modal (sin importar la cantidad)
      setProductoParaExtras(producto);
      setCantidadProducto(cantidad);
      setTotalUnidades(cantidad);
      setUnidadActual(1);
      setUnidadesConfiguradas([]);
      setExtrasSeleccionados([]);
      setObservacionItem('');
      setEditandoItemCarrito(null);
      setModalExtras(true);
    } else {
      // Si NO tiene extras, agregar directamente al carrito
      const nuevoItem = {
        ...producto,
        cantidad: cantidad,
        extrasSeleccionados: [],
        observacion: undefined,
        carritoId: Date.now() + Math.random()
      };
      setCarrito(prev => [...prev, nuevoItem]);
    }
  }, []);

  // Modificar cantidad en carrito
  const modificarCantidad = useCallback((carritoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setCarrito(prev => prev.filter(item => item.carritoId !== carritoId));
    } else {
      setCarrito(prev => prev.map(item =>
        item.carritoId === carritoId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      ));
    }
  }, []);

  // Eliminar del carrito
  const eliminarDelCarrito = useCallback((carritoId) => {
    setCarrito(prev => prev.filter(item => item.carritoId !== carritoId));
  }, []);

  // Editar extras de un item del carrito
  const editarExtrasItem = useCallback((item) => {
    setProductoParaExtras(item);
    setCantidadProducto(item.cantidad);
    setExtrasSeleccionados([...item.extrasSeleccionados]);
    setObservacionItem(item.observacion || '');
    setEditandoItemCarrito(item.carritoId);
    setTotalUnidades(1);
    setUnidadActual(1);
    setUnidadesConfiguradas([]);
    setModalExtras(true);
  }, []);

  // Cerrar modal de extras
  const cerrarModalExtras = useCallback(() => {
    setModalExtras(false);
    setProductoParaExtras(null);
    setCantidadProducto(1);
    setExtrasSeleccionados([]);
    setObservacionItem('');
    setEditandoItemCarrito(null);
    setUnidadActual(1);
    setTotalUnidades(1);
    setUnidadesConfiguradas([]);
  }, []);

  // Toggle extra (agregar o quitar de la lista)
  const toggleExtra = useCallback((extra) => {
    setExtrasSeleccionados(prev => {
      const existe = prev.find(e => e.id === extra.id);
      if (existe) {
        return prev.filter(e => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  }, []);

  // Confirmar extras y agregar/actualizar en carrito
  const confirmarExtras = useCallback(() => {
    if (editandoItemCarrito) {
      // Estamos editando un item existente
      setCarrito(prev => prev.map(item =>
        item.carritoId === editandoItemCarrito
          ? { 
              ...item, 
              extrasSeleccionados: [...extrasSeleccionados],
              observacion: observacionItem.trim() || undefined
            }
          : item
      ));
      cerrarModalExtras();
    } else {
      // Agregando nuevos productos
      // Guardar la configuración de esta unidad
      const nuevaUnidad = {
        producto: productoParaExtras,
        extras: [...extrasSeleccionados],
        observacion: observacionItem.trim() || undefined
      };
      const unidadesActualizadas = [...unidadesConfiguradas, nuevaUnidad];

      // Verificar si hay más unidades por configurar
      if (unidadActual < totalUnidades) {
        // Hay más unidades, preparar para la siguiente
        setUnidadesConfiguradas(unidadesActualizadas);
        setUnidadActual(unidadActual + 1);
        setExtrasSeleccionados([]); // Limpiar selección para la siguiente unidad
        setObservacionItem(''); // Limpiar observación para la siguiente unidad
        // El modal sigue abierto para la siguiente unidad
      } else {
        // Esta era la última unidad, agregar todas al carrito
        const nuevosItems = unidadesActualizadas.map(unidad => ({
          ...unidad.producto,
          cantidad: 1, // Cada unidad es un item separado
          extrasSeleccionados: unidad.extras,
          observacion: unidad.observacion,
          carritoId: Date.now() + Math.random()
        }));
        setCarrito(prev => [...prev, ...nuevosItems]);
        cerrarModalExtras();
      }
    }
  }, [editandoItemCarrito, extrasSeleccionados, observacionItem, productoParaExtras, unidadesConfiguradas, unidadActual, totalUnidades, cerrarModalExtras]);

  // Validar datos del paso 2 (cliente) para poder avanzar al resumen. Devuelve { valid, mensaje }.
  const validarPasoCliente = useCallback((clienteActual, tipoEntregaActual) => {
    const datosCliente = {
      nombre: clienteActual.nombre,
      telefono: clienteActual.telefono,
      email: clienteActual.email && clienteActual.email.trim() !== '' ? clienteActual.email : undefined,
      direccion: clienteActual.direccion,
    };
    const result = clienteSchema.safeParse(datosCliente);
    if (!result.success) {
      const issues = result.error.issues ?? result.error.errors ?? [];
      const primerError = issues[0];
      const camposTraducidos = {
        nombre: 'Nombre',
        telefono: 'Teléfono',
        email: 'Email',
        calle: 'Calle',
        numero: 'Número',
      };
      let mensaje = primerError?.message || 'Revisá los datos del formulario.';
      if (primerError?.path?.length) {
        const campo = primerError.path[primerError.path.length - 1];
        const campoTraducido = camposTraducidos[campo] ?? campo;
        mensaje = `${campoTraducido}: ${primerError.message}`;
      }
      return { valid: false, mensaje };
    }
    if (tipoEntregaActual === 'delivery' && !(clienteActual.direccion?.calle?.trim())) {
      return { valid: false, mensaje: 'Calle: La calle es requerida para delivery.' };
    }
    return { valid: true };
  }, []);

  // Crear pedido
  const crearPedido = useCallback(async (onSuccess) => {
    // Validar con Zod
    try {
      const datosValidar = {
        cliente: {
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          email: cliente.email && cliente.email.trim() !== '' ? cliente.email : undefined,
          direccion: cliente.direccion,
        },
        carrito: carrito,
        tipoEntrega: tipoEntrega,
        origen: origen,
        tipoPedido: tipoPedido,
        horaProgramada: horaProgramada || null,
        medioPago: medioPago,
        estadoPago: estadoPago,
        descuento: descuento,
      };

      pedidoSchema.parse(datosValidar);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Zod 3/4 usa .issues (no .errors)
        const issues = error.issues ?? error.errors ?? [];
        const primerError = issues.length > 0 ? issues[0] : null;
        const camposTraducidos = {
          nombre: 'Nombre',
          telefono: 'Teléfono',
          email: 'Email',
          calle: 'Calle',
          numero: 'Número',
          cliente: 'Cliente',
          carrito: 'Carrito',
          tipoEntrega: 'Tipo de entrega',
          origen: 'Origen',
          tipoPedido: 'Tipo de pedido',
          medioPago: 'Medio de pago',
          estadoPago: 'Estado de pago',
          descuento: 'Descuento',
        };
        let mensaje = primerError?.message || 'Revisá los datos del formulario.';
        if (primerError?.path?.length) {
          const campo = primerError.path[primerError.path.length - 1];
          const campoTraducido = camposTraducidos[campo] ?? campo;
          mensaje = `${campoTraducido}: ${primerError.message}`;
        }
        toast.error(mensaje);
        return null;
      }
      console.error('Error al validar pedido:', error);
      toast.error('Error de validación');
      return null;
    }

    // Preparar datos del pedido para el backend
    const direccionCompleta = [
      cliente.direccion.calle,
      cliente.direccion.numero,
      cliente.direccion.edificio && `Ed. ${cliente.direccion.edificio}`,
      cliente.direccion.piso && `Piso ${cliente.direccion.piso}`,
      cliente.direccion.observaciones
    ].filter(Boolean).join(', ');

    const pedidoData = {
      clienteNombre: cliente.nombre,
      cliente: {
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email && cliente.email.trim() !== '' ? cliente.email : null,
        direccion: direccionCompleta
      },
      direccion: direccionCompleta,
      telefono: cliente.telefono,
      email: cliente.email && cliente.email.trim() !== '' ? cliente.email : null,
      origen: origen,
      tipo: tipoPedido,
      horaProgramada: tipoPedido === 'programado' ? horaProgramada : null,
      timestamp: Date.now(),
      items: carrito.map(item => {
        const precioBase = parseFloat(item.precio) || 0;
        const cantidad = parseInt(item.cantidad) || 1;
        const precioExtras = (item.extrasSeleccionados || []).reduce((s, e) => s + (parseFloat(e.precio) || 0), 0);
        const subtotalItem = (precioBase + precioExtras) * cantidad;

        return {
          id: item.id,
          articulo_id: item.id, // También incluir articulo_id para compatibilidad
          nombre: item.nombre,
          articulo_nombre: item.nombre, // También incluir articulo_nombre para compatibilidad
          cantidad: cantidad,
          precio: precioBase, // Precio base del producto
          subtotal: subtotalItem,
          extras: item.extrasSeleccionados || [],
          observaciones: item.observacion || null // Corregido: usar observacion (sin 's')
        };
      }),
      subtotal: calcularSubtotal() - calcularDescuento(),
      ivaTotal: calcularIVA(),
      total: calcularTotal(),
      paymentStatus: estadoPago,
      estado: 'recibido',
      tipoEntrega: tipoEntrega,
      // Enviar el medio de pago seleccionado siempre que esté disponible
      // Si no hay medio de pago seleccionado y el estado es "paid", usar 'efectivo' por defecto
      // IMPORTANTE: El medio de pago se guarda siempre que esté seleccionado, independientemente del estado de pago
      medioPago: medioPago ? medioPago : (estadoPago === 'paid' ? 'efectivo' : null),
      observaciones: ''
    };

    // Log para depuración
    console.log('📦 Creando pedido con datos:', {
      medioPago: pedidoData.medioPago,
      estadoPago: pedidoData.paymentStatus,
      medioPagoOriginal: medioPago
    });

    try {
      // Crear pedido en el backend
      const response = await pedidosService.crearPedido(pedidoData);
      
      if (response.success) {
        const nuevoPedido = {
          id: response.data.id,
          clienteNombre: cliente.nombre,
          origen: origen,
          tipo: tipoPedido,
          horaProgramada: tipoPedido === 'programado' ? horaProgramada : null,
          timestamp: Date.now(),
          items: carrito.map(item => {
            const precioBase = parseFloat(item.precio) || 0;
            const cantidad = parseInt(item.cantidad) || 1;
            const precioExtras = (item.extrasSeleccionados || []).reduce((s, e) => s + (parseFloat(e.precio) || 0), 0);
            const subtotalItem = (precioBase + precioExtras) * cantidad;
            
            return {
              id: item.id,
              articulo_id: item.id,
              nombre: item.nombre,
              cantidad: cantidad,
              precio: precioBase + precioExtras,
              subtotal: subtotalItem
            };
          }),
          subtotal: calcularSubtotal() - calcularDescuento(),
          ivaTotal: calcularIVA(),
          descuento: calcularDescuento(),
          total: calcularTotal(),
          paymentStatus: estadoPago,
          estado: 'recibido',
          tipoEntrega: tipoEntrega,
          medioPago: medioPago,
          telefono: cliente.telefono,
          email: cliente.email,
          direccion: tipoEntrega === 'delivery' 
            ? `${cliente.direccion.calle} ${cliente.direccion.numero}`.trim()
            : ''
        };

        // Llamar callback antes de resetear
        if (onSuccess) {
          onSuccess(nuevoPedido);
        }

        // Resetear después de crear
        resetearModal();
        setIsOpen(false);
        
        // El toast se mostrará en el callback onSuccess si es necesario
        // No mostrar aquí para evitar duplicados cuando viene del flujo de cobro
        return nuevoPedido;
      } else {
        toast.error(`Error al crear pedido: ${response.error || 'Error desconocido'}`);
        return null;
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      const mensajeBackend = error.response?.data?.mensaje || error.response?.data?.message;
      const mensaje = mensajeBackend || error.message || 'No se pudo crear el pedido. Intentá de nuevo.';
      toast.error(`Error al crear pedido: ${mensaje}`);
      return null;
    }
  }, [cliente, carrito, origen, tipoPedido, horaProgramada, estadoPago, tipoEntrega, medioPago, descuento, calcularSubtotal, calcularDescuento, calcularIVA, calcularTotal, resetearModal]);

  return {
    // Estados
    isOpen,
    setIsOpen,
    pasoModal,
    setPasoModal,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    busquedaProducto,
    setBusquedaProducto,
    carrito,
    productosFiltrados,
    categorias,
    productos,
    loadingCategorias,
    loadingProductos,
    loadingProductosMasSolicitados,
    modalExtras,
    setModalExtras,
    productoParaExtras,
    setProductoParaExtras,
    cantidadProducto,
    setCantidadProducto,
    extrasSeleccionados,
    setExtrasSeleccionados,
    observacionItem,
    setObservacionItem,
    editandoItemCarrito,
    setEditandoItemCarrito,
    unidadActual,
    setUnidadActual,
    totalUnidades,
    setTotalUnidades,
    unidadesConfiguradas,
    setUnidadesConfiguradas,
    tipoEntrega,
    setTipoEntrega,
    cliente,
    setCliente,
    origen,
    setOrigen,
    tipoPedido,
    setTipoPedido,
    horaProgramada,
    setHoraProgramada,
    medioPago,
    setMedioPago,
    estadoPago,
    setEstadoPago,
    descuento,
    setDescuento,
    // Funciones
    calcularSubtotal,
    calcularEnvio,
    calcularDescuento,
    calcularIVA,
    calcularTotal,
    resetearModal,
    agregarProductoConExtras,
    modificarCantidad,
    eliminarDelCarrito,
    editarExtrasItem,
    cerrarModalExtras,
    toggleExtra,
    confirmarExtras,
    crearPedido,
    validarPasoCliente,
  };
};

