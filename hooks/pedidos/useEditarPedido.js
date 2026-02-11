import { useState, useCallback, useMemo, useEffect } from 'react';
import { z } from 'zod';
import { articulosService } from '../../services/articulosService';
import { pedidosService } from '../../services/pedidosService';
import { adicionalesService } from '../../services/adicionalesService';
import { toast } from '@/hooks/use-toast';

// Esquema de validación para el cliente (mismo que useNuevoPedido)
const clienteSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es demasiado largo'),
  telefono: z.string().min(1, 'El teléfono es requerido').max(20, 'El teléfono es demasiado largo'),
  email: z.preprocess(
    (val) => {
      if (!val || (typeof val === 'string' && val.trim() === '')) {
        return undefined;
      }
      return val;
    },
    z.string().email('Email inválido').optional()
  ),
  direccion: z.object({
    calle: z.string().optional(),
    numero: z.string().optional(),
    edificio: z.string().optional(),
    piso: z.string().optional(),
    observaciones: z.string().optional(),
  }).optional(),
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

export const useEditarPedido = () => {
  // Estados del modal
  const [isOpen, setIsOpen] = useState(false);
  const [pedidoOriginal, setPedidoOriginal] = useState(null);
  const [pasoModal, setPasoModal] = useState(1);

  // Paso 1: Armar Pedido
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [carrito, setCarrito] = useState([]);
  
  // Datos desde el backend
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [loadingPedido, setLoadingPedido] = useState(false);

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
  const [descuento, setDescuento] = useState(0);

  // Cargar categorías y productos desde el backend
  useEffect(() => {
    const cargarDatos = async () => {
      // Cargar categorías
      setLoadingCategorias(true);
      try {
        const categoriasResponse = await articulosService.obtenerCategorias();
        if (categoriasResponse.success && Array.isArray(categoriasResponse.data)) {
          setCategorias(categoriasResponse.data);
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
          const productosTransformados = await Promise.all(
            productosResponse.data.map(async (p) => {
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
                imagen_url: p.imagen_url,
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

  // Cargar datos del pedido cuando se abre el modal
  const cargarPedido = useCallback(async (pedidoId) => {
    setLoadingPedido(true);
    try {
      const response = await pedidosService.obtenerPedidoPorId(pedidoId);
      if (response.success && response.data) {
        const pedido = response.data;
        setPedidoOriginal(pedido);

        // Verificar que no esté ENTREGADO o CANCELADO
        if (pedido.estado === 'entregado' || pedido.estado === 'cancelado') {
          toast.error('No se puede editar un pedido entregado o cancelado');
          setIsOpen(false);
          return;
        }

        // Cargar datos del pedido en el formulario
        setCliente({
          nombre: pedido.clienteNombre || '',
          telefono: pedido.telefono || '',
          email: pedido.email || '',
          direccion: {
            calle: pedido.direccion?.split(',')[0]?.trim() || '',
            numero: pedido.direccion?.split(',')[1]?.trim() || '',
            edificio: '',
            piso: '',
            observaciones: ''
          }
        });
        
        setTipoEntrega(pedido.tipoEntrega || 'retiro');
        setOrigen(pedido.origen || 'mostrador');
        setTipoPedido(pedido.tipo || 'ya');
        setHoraProgramada(pedido.horaProgramada || '');
        setMedioPago(pedido.medioPago ?? 'efectivo');
        setEstadoPago(pedido.paymentStatus || 'pending');
        setDescuento(0); // Descuento no se almacena en el pedido

        // Transformar items del pedido al formato del carrito
        const itemsCarrito = (pedido.items || []).map((item, index) => {
          // Extraer extras/personalizaciones (asegurar que sea array)
          const rawExtras = item.extras ?? item.personalizaciones?.extras;
          const extras = Array.isArray(rawExtras) ? rawExtras : [];
          const extrasSeleccionados = extras.map(extra => ({
            id: extra.id || extra.adicional_id,
            nombre: extra.nombre || extra.adicional_nombre || extra.nombre,
            precio: parseFloat(extra.precio || extra.precio_extra || 0)
          }));

          return {
            id: item.id || item.articulo_id,
            nombre: item.nombre || item.articulo_nombre,
            precio: parseFloat(item.precio) || 0,
            cantidad: parseInt(item.cantidad) || 1,
            extrasSeleccionados: extrasSeleccionados,
            observacion: item.observaciones || null,
            carritoId: `edit-${pedido.id}-${index}-${Date.now()}`
          };
        });

        setCarrito(itemsCarrito);
        setPasoModal(1);
      } else {
        toast.error(response.error || 'Error al cargar el pedido');
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error al cargar pedido:', error);
      toast.error('Error al cargar el pedido');
      setIsOpen(false);
    } finally {
      setLoadingPedido(false);
    }
  }, []);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    if (!categoriaSeleccionada) return [];
    
    return productos.filter(p => {
      const matchCategoria = p.categoria === categoriaSeleccionada;
      const matchBusqueda = p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase());
      return matchCategoria && matchBusqueda;
    });
  }, [productos, categoriaSeleccionada, busquedaProducto]);

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
    setPedidoOriginal(null);
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

  // Abrir modal con pedido
  const abrirModal = useCallback((pedido) => {
    if (!pedido || !pedido.id) {
      toast.error('Pedido inválido');
      return;
    }

    // Verificar que no esté ENTREGADO o CANCELADO
    if (pedido.estado === 'entregado' || pedido.estado === 'cancelado') {
      toast.error('No se puede editar un pedido entregado o cancelado');
      return;
    }

    setIsOpen(true);
    cargarPedido(pedido.id);
  }, [cargarPedido]);

  // Agregar producto al carrito (misma lógica que useNuevoPedido)
  const agregarProductoConExtras = useCallback((producto, cantidad) => {
    const tieneExtras = producto.extrasDisponibles && producto.extrasDisponibles.length > 0;

    if (tieneExtras) {
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
      const nuevoItem = {
        ...producto,
        cantidad: cantidad,
        extrasSeleccionados: [],
        observacion: undefined,
        carritoId: Date.now() + Math.random()
      };
      setCarrito(prev => [...prev, nuevoItem]);
      
      toast({
        title: "✅ Producto agregado",
        description: `${cantidad} × ${producto.nombre}`,
        duration: 2000,
      });
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

  // Toggle extra
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
      const nuevaUnidad = {
        producto: productoParaExtras,
        extras: [...extrasSeleccionados],
        observacion: observacionItem.trim() || undefined
      };
      const unidadesActualizadas = [...unidadesConfiguradas, nuevaUnidad];

      if (unidadActual < totalUnidades) {
        setUnidadesConfiguradas(unidadesActualizadas);
        setUnidadActual(unidadActual + 1);
        setExtrasSeleccionados([]);
        setObservacionItem('');
      } else {
        const nuevosItems = unidadesActualizadas.map(unidad => ({
          ...unidad.producto,
          cantidad: 1,
          extrasSeleccionados: unidad.extras,
          observacion: unidad.observacion,
          carritoId: Date.now() + Math.random()
        }));
        setCarrito(prev => [...prev, ...nuevosItems]);
        cerrarModalExtras();
      }
    }
  }, [editandoItemCarrito, extrasSeleccionados, observacionItem, productoParaExtras, unidadesConfiguradas, unidadActual, totalUnidades, cerrarModalExtras]);

  // Actualizar pedido
  const actualizarPedido = useCallback(async (onSuccess) => {
    if (!pedidoOriginal || !pedidoOriginal.id) {
      toast.error('No hay pedido seleccionado');
      return null;
    }

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
        const primerError = error.errors && error.errors.length > 0 ? error.errors[0] : null;
        if (primerError) {
          let mensaje = primerError.message;
          if (primerError.path && primerError.path.length > 0) {
            const campo = primerError.path[primerError.path.length - 1];
            const camposTraducidos = {
              'nombre': 'Nombre',
              'telefono': 'Teléfono',
              'email': 'Email',
              'calle': 'Calle',
              'numero': 'Número',
              'cliente': 'Cliente',
              'carrito': 'Carrito',
              'tipoEntrega': 'Tipo de entrega',
              'origen': 'Origen',
              'tipoPedido': 'Tipo de pedido',
              'medioPago': 'Medio de pago',
              'estadoPago': 'Estado de pago',
              'descuento': 'Descuento'
            };
            const campoTraducido = camposTraducidos[campo] || campo;
            mensaje = `${campoTraducido}: ${primerError.message}`;
          }
          toast.error(mensaje || 'Error de validación');
        } else {
          toast.error('Error de validación');
        }
        return null;
      }
      toast.error('Error de validación');
      return null;
    }

    // Preparar datos del pedido para el backend (mantener estado original)
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
      items: carrito.map(item => {
        const precioBase = parseFloat(item.precio) || 0;
        const cantidad = parseInt(item.cantidad) || 1;
        const precioExtras = (item.extrasSeleccionados || []).reduce((s, e) => s + (parseFloat(e.precio) || 0), 0);
        const subtotalItem = (precioBase + precioExtras) * cantidad;

        return {
          id: item.id,
          articulo_id: item.id,
          nombre: item.nombre,
          articulo_nombre: item.nombre,
          cantidad: cantidad,
          precio: precioBase,
          subtotal: subtotalItem,
          extras: item.extrasSeleccionados || [],
          observaciones: item.observacion || null
        };
      }),
      subtotal: calcularSubtotal() - calcularDescuento(),
      ivaTotal: calcularIVA(),
      total: calcularTotal(),
      paymentStatus: estadoPago,
      // NO cambiar el estado - mantener el estado original
      estado: pedidoOriginal.estado,
      tipoEntrega: tipoEntrega,
      medioPago: medioPago ? medioPago : (estadoPago === 'paid' ? 'efectivo' : null),
      observaciones: pedidoOriginal.observaciones || ''
    };

    try {
      const response = await pedidosService.actualizarPedido(pedidoOriginal.id, pedidoData);
      
      if (response.success) {
        toast.success('Pedido actualizado correctamente');
        const pedidoDesdeBackend = response.data;
        if (pedidoDesdeBackend && onSuccess) {
          onSuccess({ ...pedidoDesdeBackend, id: String(pedidoDesdeBackend.id || pedidoOriginal.id) });
        }
        resetearModal();
        setIsOpen(false);
        return pedidoDesdeBackend;
      } else {
        toast.error(response.error || 'Error al actualizar el pedido');
        return null;
      }
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      const msg = error.response?.data?.mensaje || error.response?.data?.message || error.message;
      toast.error(msg || 'Error al actualizar el pedido');
      return null;
    }
  }, [pedidoOriginal, cliente, carrito, origen, tipoPedido, horaProgramada, estadoPago, tipoEntrega, medioPago, descuento, calcularSubtotal, calcularDescuento, calcularIVA, calcularTotal, resetearModal]);

  return {
    // Estados
    isOpen,
    setIsOpen,
    pedidoOriginal,
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
    loadingPedido,
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
    abrirModal,
    cargarPedido,
    agregarProductoConExtras,
    modificarCantidad,
    eliminarDelCarrito,
    editarExtrasItem,
    cerrarModalExtras,
    toggleExtra,
    confirmarExtras,
    actualizarPedido,
  };
};


