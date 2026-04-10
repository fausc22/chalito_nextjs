import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { z } from 'zod';
import { articulosService } from '../../services/articulosService';
import { pedidosService } from '../../services/pedidosService';
import { adicionalesService } from '../../services/adicionalesService';
import { toast } from '@/hooks/use-toast';
import { crearItemCarrito, mergeItemEnCarrito, reagruparCarrito } from './cartUtils';
import { formatDireccionEntrega, parseClienteDireccion } from '../../lib/formatters';
import { getItemExtras } from '../../lib/extrasUtils';
import { calculateCartSubtotal } from '../../lib/pedidoTotals';

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
});

// Normalización para comparar nombres de categorías (ignora tildes y mayúsculas/minúsculas)
const normalizarCategoria = (value) =>
  (value ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

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
  const datosInicialesCargadosRef = useRef(false);

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

  // Mapa de categorías: id -> nombre (necesario para decidir flujo por categoría)
  const categoriaIdToNombre = useMemo(() => {
    const map = new Map();
    categorias.forEach((cat) => {
      const id = cat?.id ?? cat?.categoria_id ?? cat?.categoriaId;
      if (id === undefined || id === null) return;
      const nombre = cat?.nombre ?? cat?.nombre_categoria ?? cat?.nombreCategoria ?? '';
      map.set(String(id), nombre);
    });
    return map;
  }, [categorias]);

  const esCategoriaSandwiches = useCallback(
    (producto) => {
      const catId = producto?.categoria ?? producto?.categoria_id ?? producto?.categoriaId;
      const nombre = categoriaIdToNombre.get(String(catId ?? ''));
      const n = normalizarCategoria(nombre);
      return n === 'SANDWICHES' || n.includes('SANDWICH');
    },
    [categoriaIdToNombre]
  );

  const esCategoriaPapas = useCallback(
    (producto) => {
      const catId = producto?.categoria ?? producto?.categoria_id ?? producto?.categoriaId;
      const nombre = categoriaIdToNombre.get(String(catId ?? ''));
      const n = normalizarCategoria(nombre);
      return n === 'PAPAS' || n.includes('PAPA');
    },
    [categoriaIdToNombre]
  );

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

  // Cargar categorías y productos solo al abrir modal (una vez)
  useEffect(() => {
    if (!isOpen || datosInicialesCargadosRef.current) return;

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
    datosInicialesCargadosRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

        // Cargar datos del pedido en el formulario (parsea formato nuevo y antiguo)
        const dir = parseClienteDireccion(pedido.direccion || pedido.cliente_direccion || '');
        setCliente({
          nombre: pedido.clienteNombre || '',
          telefono: pedido.telefono || '',
          email: pedido.email || '',
          direccion: {
            calle: dir.calle,
            numero: dir.altura,
            edificio: dir.edificioCasa,
            piso: dir.pisoDepto,
            observaciones: pedido.tipoEntrega === 'delivery' ? (pedido.observaciones || '') : ''
          }
        });
        
        setTipoEntrega(pedido.tipoEntrega || 'retiro');
        setOrigen(pedido.origen || 'mostrador');
        setTipoPedido(pedido.tipo || 'ya');
        setHoraProgramada(pedido.horaProgramada || '');
        setMedioPago(pedido.medioPago ?? 'efectivo');
        setEstadoPago(pedido.paymentStatus || 'pending');

        // Transformar items del pedido al formato del carrito
        const itemsCarrito = (pedido.items || []).map((item, index) => {
          // Fuente de verdad al abrir editar: snapshot persistido (precio/subtotal/personalizaciones)
          // No usar precios actuales de articulos/adicionales para evitar desfasajes.
          const cantidad = parseInt(item.cantidad, 10) || 1;
          const { extras, extrasTotal } = getItemExtras(item);
          const subtotalSnapshot = Number.parseFloat(item.subtotal);
          const precioSnapshot = Number.parseFloat(item.precio);
          const subtotalLinea = Number.isFinite(subtotalSnapshot)
            ? subtotalSnapshot
            : (Number.isFinite(precioSnapshot) ? precioSnapshot * cantidad : 0);
          const precioUnitarioSnapshot = cantidad > 0 ? subtotalLinea / cantidad : 0;
          const precioBaseUnitario = Math.max(0, precioUnitarioSnapshot - extrasTotal);

          return {
            id: item.id || item.articulo_id,
            product_id: item.id || item.articulo_id,
            nombre: item.nombre || item.articulo_nombre,
            // Guardamos precio base unitario derivado del snapshot para no duplicar extras.
            price: precioBaseUnitario,
            precio: precioBaseUnitario,
            quantity: cantidad,
            cantidad: cantidad,
            extras: extras,
            extrasSeleccionados: extras,
            subtotalSnapshot: subtotalLinea,
            observaciones: item.observaciones || '',
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
  }, [productos, categoriaIdToNombre, esCategoriaSandwiches, esCategoriaPapas]);

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
    return calculateCartSubtotal(carrito);
  }, [carrito]);

  const calcularTotal = useCallback(() => calcularSubtotal(), [calcularSubtotal]);

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

    const esCategoriaHamburguesas = (() => {
      const catId = producto?.categoria ?? producto?.categoria_id ?? producto?.categoriaId;
      const nombre = categoriaIdToNombre.get(String(catId ?? ''));
      const n = normalizarCategoria(nombre);
      return n === 'HAMBURGUESAS' || n.includes('HAMBURGUES');
    })();

    const esCategoriaEspecialObservacion =
      esCategoriaHamburguesas || esCategoriaSandwiches(producto) || esCategoriaPapas(producto);

    // PAPAS / SANDWICHES / HAMBURGUESAS SIN EXTRAS:
    // abrir el modal grande de observaciones (ModalExtras) para capturar observación.
    if (!tieneExtras && esCategoriaEspecialObservacion) {
      setProductoParaExtras({ ...producto, _editarProductoTitulo: true });
      setCantidadProducto(cantidad);
      setTotalUnidades(cantidad);
      setUnidadActual(1);
      setUnidadesConfiguradas([]);
      setExtrasSeleccionados([]);
      setObservacionItem('');
      setEditandoItemCarrito(null);
      setModalExtras(true);
      return;
    }

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
      return;
    }

    // Resto de categorías: si NO tiene extras, agregar directamente
    const nuevoItem = crearItemCarrito({
      product_id: producto.id,
      nombre: producto.nombre,
      price: producto.precio,
      extras: [],
      observaciones: '',
      quantity: cantidad,
      sourceProduct: producto,
    });

    setCarrito((prev) => mergeItemEnCarrito(prev, nuevoItem));

    toast({
      title: "✅ Producto agregado",
      description: `${cantidad} × ${producto.nombre}`,
      duration: 2000,
    });
  }, [esCategoriaPapas, esCategoriaSandwiches, categoriaIdToNombre]);

  // Modificar cantidad en carrito
  const modificarCantidad = useCallback((carritoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setCarrito(prev => prev.filter(item => item.carritoId !== carritoId));
    } else {
      setCarrito(prev => prev.map(item =>
        item.carritoId === carritoId
          ? { ...item, quantity: nuevaCantidad, cantidad: nuevaCantidad }
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
    // Enriquecer con categoría si falta (items cargados desde backend pueden no traerla)
    const itemProductId = item?.product_id ?? item?.id ?? item?.articulo_id;
    const productoEncontrado = itemProductId
      ? productos.find((p) => String(p.id) === String(itemProductId))
      : null;

    const itemEnriquecido = {
      ...item,
      ...(productoEncontrado ? { categoria: productoEncontrado.categoria } : {}),
    };

    const tieneExtras = itemEnriquecido?.extrasDisponibles && itemEnriquecido.extrasDisponibles.length > 0;
    const esCategoriaHamburguesas = (() => {
      const catId = itemEnriquecido?.categoria ?? itemEnriquecido?.categoria_id ?? itemEnriquecido?.categoriaId;
      const nombre = categoriaIdToNombre.get(String(catId ?? ''));
      const n = normalizarCategoria(nombre);
      return n === 'HAMBURGUESAS' || n.includes('HAMBURGUES');
    })();

    const esCategoriaEspecialObservacion =
      esCategoriaHamburguesas || esCategoriaSandwiches(itemEnriquecido) || esCategoriaPapas(itemEnriquecido);

    const productoParaModal =
      !tieneExtras && esCategoriaEspecialObservacion
        ? { ...itemEnriquecido, _editarProductoTitulo: true }
        : itemEnriquecido;

    setProductoParaExtras(productoParaModal);
    setCantidadProducto(item.quantity ?? item.cantidad ?? 1);
    setExtrasSeleccionados([...(item.extras ?? item.extrasSeleccionados ?? [])]);
    setObservacionItem(item.observaciones || item.observacion || '');
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
      setCarrito(prev => {
        const updated = prev.map(item =>
          item.carritoId === editandoItemCarrito
            ? { 
                ...item,
                extras: [...extrasSeleccionados],
                extrasSeleccionados: [...extrasSeleccionados],
                observaciones: observacionItem.trim(),
                observacion: observacionItem.trim() || undefined
              }
            : item
        );
        return reagruparCarrito(updated);
      });
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
        const nuevosItems = unidadesActualizadas.map(unidad =>
          crearItemCarrito({
            product_id: unidad.producto.id,
            nombre: unidad.producto.nombre,
            price: unidad.producto.precio,
            extras: unidad.extras,
            observaciones: unidad.observacion || '',
            quantity: 1,
            sourceProduct: unidad.producto
          })
        );
        setCarrito(prev => nuevosItems.reduce((acc, item) => mergeItemEnCarrito(acc, item), prev));
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
      };

      pedidoSchema.parse(datosValidar);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues ?? error.errors ?? [];
        const primerError = issues.length > 0 ? issues[0] : null;
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

    // Preparar datos del pedido para el backend (formato chalito_carta)
    const direccionCompleta = formatDireccionEntrega({
      calle: cliente.direccion?.calle,
      numero: cliente.direccion?.numero,
      edificio: cliente.direccion?.edificio,
      piso: cliente.direccion?.piso
    });

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
        const precioBase = parseFloat(item.price ?? item.precio) || 0;
        const cantidad = parseInt(item.quantity ?? item.cantidad, 10) || 1;
        const extras = item.extras ?? item.extrasSeleccionados ?? [];
        const precioExtras = extras.reduce((s, e) => s + (parseFloat(e.precio) || 0), 0);
        const subtotalItem = (precioBase + precioExtras) * cantidad;

        return {
          id: item.product_id ?? item.id,
          product_id: item.product_id ?? item.id,
          quantity: cantidad,
          articulo_id: item.product_id ?? item.id,
          nombre: item.nombre,
          articulo_nombre: item.nombre,
          cantidad: cantidad,
          precio: precioBase,
          subtotal: subtotalItem,
          extras,
          observaciones: item.observaciones ?? item.observacion ?? null
        };
      }),
      subtotal: calcularTotal(),
      total: calcularTotal(),
      paymentStatus: estadoPago,
      // NO cambiar el estado - mantener el estado original
      estado: pedidoOriginal.estado,
      tipoEntrega: tipoEntrega,
      medioPago: medioPago ? medioPago : (estadoPago === 'paid' ? 'efectivo' : null),
      observaciones: tipoEntrega === 'delivery' ? (cliente.direccion?.observaciones || pedidoOriginal.observaciones || '') : (pedidoOriginal.observaciones || '')
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
  }, [pedidoOriginal, cliente, carrito, origen, tipoPedido, horaProgramada, estadoPago, tipoEntrega, medioPago, calcularTotal, resetearModal]);

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
    // Funciones
    calcularSubtotal,
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


