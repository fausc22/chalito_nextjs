import { useState } from 'react';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Plus,
  Clock,
  Phone,
  MapPin,
  Home,
  Bike,
  DollarSign,
  Eye,
  Play,
  CheckCircle,
  Trash2,
  Search,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

// Datos estáticos
const CATEGORIAS = [
  { id: 1, nombre: 'Hamburguesas', icono: '🍔', color: 'bg-orange-500' },
  { id: 2, nombre: 'Pizzas', icono: '🍕', color: 'bg-red-500' },
  { id: 3, nombre: 'Sandwiches', icono: '🥪', color: 'bg-yellow-500' },
  { id: 4, nombre: 'Bebidas', icono: '🥤', color: 'bg-blue-500' },
  { id: 5, nombre: 'Postres', icono: '🍰', color: 'bg-pink-500' },
  { id: 6, nombre: 'Acompañamientos', icono: '🍟', color: 'bg-amber-600' },
];

const PRODUCTOS = [
  {
    id: 1,
    nombre: 'Lomito Completo',
    precio: 2500,
    categoria: 1,
    imagen: '🍔',
    elaborado: true,
    ingredientes: [
      { id: 1, nombre: 'Carne', incluido: true },
      { id: 2, nombre: 'Queso', incluido: true },
      { id: 3, nombre: 'Tomate', incluido: true },
      { id: 4, nombre: 'Lechuga', incluido: true },
    ],
    extrasDisponibles: [
      { id: 10, nombre: 'Extra Queso', precio: 200 },
      { id: 11, nombre: 'Extra Panceta', precio: 300 },
      { id: 12, nombre: 'Huevo Frito', precio: 150 },
    ]
  },
  {
    id: 2,
    nombre: 'Hamburguesa Completa',
    precio: 1800,
    categoria: 1,
    imagen: '🍔',
    elaborado: true,
    ingredientes: [
      { id: 1, nombre: 'Carne', incluido: true },
      { id: 2, nombre: 'Queso', incluido: true },
      { id: 3, nombre: 'Tomate', incluido: true },
    ],
    extrasDisponibles: [
      { id: 10, nombre: 'Extra Queso', precio: 200 },
      { id: 11, nombre: 'Extra Panceta', precio: 300 },
    ]
  },
  { id: 3, nombre: 'Hamburguesa Simple', precio: 1500, categoria: 1, imagen: '🍔', elaborado: true, ingredientes: [], extrasDisponibles: [] },
  { id: 4, nombre: 'Pizza Muzzarella', precio: 3000, categoria: 2, imagen: '🍕', elaborado: true, ingredientes: [], extrasDisponibles: [] },
  { id: 5, nombre: 'Pizza Napolitana', precio: 3200, categoria: 2, imagen: '🍕', elaborado: true, ingredientes: [], extrasDisponibles: [] },
  { id: 6, nombre: 'Sandwich de Bondiola', precio: 1200, categoria: 3, imagen: '🥪', elaborado: true, ingredientes: [], extrasDisponibles: [] },
  { id: 7, nombre: 'Sandwich de Vacío', precio: 1600, categoria: 3, imagen: '🥪', elaborado: true, ingredientes: [], extrasDisponibles: [] },
  { id: 8, nombre: 'Coca Cola 500ml', precio: 600, categoria: 4, imagen: '🥤', elaborado: false, ingredientes: [], extrasDisponibles: [] },
  { id: 9, nombre: 'Coca Cola 1.5L', precio: 1200, categoria: 4, imagen: '🥤', elaborado: false, ingredientes: [], extrasDisponibles: [] },
  { id: 10, nombre: 'Agua Mineral', precio: 500, categoria: 4, imagen: '💧', elaborado: false, ingredientes: [], extrasDisponibles: [] },
  { id: 11, nombre: 'Flan con Dulce de Leche', precio: 800, categoria: 5, imagen: '🍮', elaborado: true, ingredientes: [], extrasDisponibles: [] },
  { id: 12, nombre: 'Helado', precio: 1000, categoria: 5, imagen: '🍦', elaborado: false, ingredientes: [], extrasDisponibles: [] },
  { id: 13, nombre: 'Papas Fritas', precio: 800, categoria: 6, imagen: '🍟', elaborado: true, ingredientes: [], extrasDisponibles: [] },
  { id: 14, nombre: 'Empanadas (x6)', precio: 2400, categoria: 6, imagen: '🥟', elaborado: true, ingredientes: [], extrasDisponibles: [] },
];

const PEDIDOS_MOCK = [
  {
    id: 156,
    cliente: { nombre: 'Juan Pérez', telefono: '3815-123456', direccion: null },
    horario: '20:30',
    items: [
      { nombre: 'Hamburguesa Completa', cantidad: 2, precio: 1800 },
      { nombre: 'Coca Cola', cantidad: 1, precio: 600 }
    ],
    total: 4200,
    modalidad: 'retiro',
    estado: 'RECIBIDO',
    pagado: false,
    origen: 'telefono'
  },
  {
    id: 157,
    cliente: { nombre: 'Ana López', telefono: '3815-654321', direccion: 'Av. Siempreviva 742' },
    horario: 'AHORA',
    items: [
      { nombre: 'Lomito', cantidad: 1, precio: 2500 },
      { nombre: 'Papas Fritas', cantidad: 1, precio: 800 }
    ],
    total: 3600,
    modalidad: 'retiro',
    estado: 'RECIBIDO',
    pagado: true,
    origen: 'presencial'
  },
  {
    id: 158,
    cliente: { nombre: 'Carlos Díaz', telefono: '3815-987654', direccion: 'Calle Falsa 123' },
    horario: '21:00',
    items: [
      { nombre: 'Pizza Napolitana', cantidad: 3, precio: 3200 }
    ],
    total: 9900,
    modalidad: 'delivery',
    estado: 'RECIBIDO',
    pagado: true,
    origen: 'online'
  },
  {
    id: 152,
    cliente: { nombre: 'María García', telefono: '3815-111222', direccion: 'San Martín 456' },
    horario: '19:30',
    items: [
      { nombre: 'Pizza Muzza', cantidad: 1, precio: 3000 },
      { nombre: 'Coca 1.5L', cantidad: 1, precio: 1200 }
    ],
    total: 4500,
    modalidad: 'delivery',
    estado: 'EN_PREPARACION',
    pagado: false,
    origen: 'telefono'
  },
  {
    id: 153,
    cliente: { nombre: 'Pedro Gómez', telefono: '3815-333444', direccion: null },
    horario: '19:45',
    items: [
      { nombre: 'Lomito Completo', cantidad: 1, precio: 2500 }
    ],
    total: 2500,
    modalidad: 'retiro',
    estado: 'EN_PREPARACION',
    pagado: false,
    origen: 'presencial'
  },
  {
    id: 154,
    cliente: { nombre: 'Carla Ruiz', telefono: '3815-555666', direccion: 'Belgrano 789' },
    horario: '20:00',
    items: [
      { nombre: 'Empanadas', cantidad: 2, precio: 2400 }
    ],
    total: 5100,
    modalidad: 'delivery',
    estado: 'EN_PREPARACION',
    pagado: false,
    origen: 'telefono'
  },
];

export default function VentasPage() {
  const [pedidos, setPedidos] = useState(PEDIDOS_MOCK);
  const [modalNuevoPedido, setModalNuevoPedido] = useState(false);
  const [modalVerPedido, setModalVerPedido] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  // Estados del modal nuevo pedido
  const [pasoModal, setPasoModal] = useState(1); // 1: Armar Pedido, 2: Datos Cliente
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [horarioEntrega, setHorarioEntrega] = useState('');

  // Datos del cliente
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

  // Agregar producto al carrito
  const agregarProducto = (producto) => {
    setCarrito([...carrito, {
      ...producto,
      cantidadCarrito: 1,
      extrasSeleccionados: [],
      ingredientesExcluidos: [],
      carritoId: Date.now() + Math.random()
    }]);
  };

  // Eliminar del carrito
  const eliminarDelCarrito = (carritoId) => {
    setCarrito(carrito.filter(item => item.carritoId !== carritoId));
  };

  // Calcular subtotal
  const calcularSubtotal = () => {
    return carrito.reduce((sum, item) => {
      const precioBase = item.precio * item.cantidadCarrito;
      const precioExtras = item.extrasSeleccionados.reduce((s, e) => s + e.precio, 0);
      return sum + precioBase + precioExtras;
    }, 0);
  };

  // Calcular envío
  const calcularEnvio = () => {
    const tieneDir = cliente.direccion.calle.trim() !== '';
    return tieneDir ? 300 : 0;
  };

  // Calcular total
  const calcularTotal = () => {
    return calcularSubtotal() + calcularEnvio();
  };

  // Cambiar estado de pedido
  const cambiarEstadoPedido = (id, nuevoEstado) => {
    setPedidos(pedidos.map(p =>
      p.id === id ? { ...p, estado: nuevoEstado } : p
    ));
  };

  // Ver detalle del pedido
  const verPedido = (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalVerPedido(true);
  };

  // Resetear modal
  const resetearModal = () => {
    setPasoModal(1);
    setCarrito([]);
    setHorarioEntrega('');
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
  };

  // Confirmar pedido
  const confirmarPedido = () => {
    const nuevoPedido = {
      id: Math.max(...pedidos.map(p => p.id)) + 1,
      cliente: {
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        direccion: cliente.direccion.calle ? `${cliente.direccion.calle} ${cliente.direccion.numero}` : null
      },
      horario: horarioEntrega || 'AHORA',
      items: carrito.map(item => ({
        nombre: item.nombre,
        cantidad: item.cantidadCarrito,
        precio: item.precio
      })),
      total: calcularTotal(),
      modalidad: cliente.direccion.calle ? 'delivery' : 'retiro',
      estado: 'RECIBIDO',
      pagado: false,
      origen: 'presencial'
    };

    setPedidos([nuevoPedido, ...pedidos]);
    setModalNuevoPedido(false);
    resetearModal();
  };

  // Filtrar productos
  const productosFiltrados = PRODUCTOS.filter(p => {
    const matchCategoria = p.categoria === categoriaSeleccionada;
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  const pedidosRecibidos = pedidos.filter(p => p.estado === 'RECIBIDO');
  const pedidosEnPreparacion = pedidos.filter(p => p.estado === 'EN_PREPARACION');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <NavBar />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">🔴 Pedidos en Vivo</h1>
            <p className="text-slate-600">Gestión de pedidos activos</p>
          </div>
          <Button
            size="lg"
            onClick={() => setModalNuevoPedido(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2 h-12"
          >
            <Plus className="h-5 w-5" />
            Nuevo Pedido
          </Button>
        </div>

        {/* Grid de pedidos */}
        <div className="grid grid-cols-2 gap-6">
          {/* Columna: RECIBIDOS */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-slate-700">📥 RECIBIDOS</h2>
              <Badge variant="secondary" className="bg-blue-500 text-white">
                {pedidosRecibidos.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {pedidosRecibidos.map(pedido => (
                <Card key={pedido.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-slate-800">#{pedido.id}</span>
                        {pedido.horario === 'AHORA' ? (
                          <Badge className="bg-red-500 text-white gap-1">
                            ⚡ AHORA
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {pedido.horario}
                          </Badge>
                        )}
                        {pedido.origen === 'online' && (
                          <Badge className="bg-purple-500 text-white">🌐 ONLINE</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {pedido.modalidad === 'retiro' ? (
                          <Home className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Bike className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 mb-3">
                      <p className="font-semibold text-slate-700">{pedido.cliente.nombre}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {pedido.cliente.telefono}
                      </p>
                      {pedido.cliente.direccion && (
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {pedido.cliente.direccion}
                        </p>
                      )}
                    </div>

                    <div className="border-t pt-2 mb-3">
                      {pedido.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-slate-600">
                          {item.cantidad}x {item.nombre}
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-lg text-blue-600">
                        ${pedido.total}
                      </span>
                      {pedido.pagado && (
                        <Badge className="bg-green-500 text-white">💳 PAGADO</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => verPedido(pedido)}
                        className="gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => cambiarEstadoPedido(pedido.id, 'EN_PREPARACION')}
                        className="bg-orange-500 hover:bg-orange-600 gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Preparar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {pedidosRecibidos.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-slate-400">
                    No hay pedidos recibidos
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Columna: EN PREPARACIÓN */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-slate-700">🔥 EN PREPARACIÓN</h2>
              <Badge variant="secondary" className="bg-orange-500 text-white">
                {pedidosEnPreparacion.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {pedidosEnPreparacion.map(pedido => (
                <Card key={pedido.id} className="hover:shadow-lg transition-shadow border-l-4 border-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-slate-800">#{pedido.id}</span>
                        {pedido.horario === 'AHORA' ? (
                          <Badge className="bg-red-500 text-white gap-1">
                            ⏱️ En curso
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {pedido.horario}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {pedido.modalidad === 'retiro' ? (
                          <Home className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Bike className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 mb-3">
                      <p className="font-semibold text-slate-700">{pedido.cliente.nombre}</p>
                    </div>

                    <div className="border-t pt-2 mb-3">
                      {pedido.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-slate-600">
                          {item.cantidad}x {item.nombre}
                        </p>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-lg text-blue-600">
                        ${pedido.total}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => verPedido(pedido)}
                        className="gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => cambiarEstadoPedido(pedido.id, 'LISTO')}
                        className="bg-green-600 hover:bg-green-700 gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Listo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {pedidosEnPreparacion.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-slate-400">
                    No hay pedidos en preparación
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Nuevo Pedido */}
      <Dialog open={modalNuevoPedido} onOpenChange={(open) => {
        setModalNuevoPedido(open);
        if (!open) resetearModal();
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {pasoModal === 1 ? '🛒 Nuevo Pedido - Armar Pedido' : '📝 Nuevo Pedido - Datos del Cliente'}
            </DialogTitle>
          </DialogHeader>

          {pasoModal === 1 ? (
            // PASO 1: Armar Pedido
            <div className="grid grid-cols-12 gap-4 py-4">
              {/* Categorías */}
              <div className="col-span-2 space-y-2">
                <h3 className="font-semibold text-sm text-slate-700 mb-2">Categorías</h3>
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaSeleccionada(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                      categoriaSeleccionada === cat.id
                        ? `${cat.color} text-white shadow-md`
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{cat.icono}</span>
                      <span className="text-xs">{cat.nombre}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Productos */}
              <div className="col-span-6">
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Buscar productos..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 max-h-[500px] overflow-y-auto">
                  {productosFiltrados.map(producto => (
                    <Card
                      key={producto.id}
                      onClick={() => agregarProducto(producto)}
                      className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all p-3 text-center"
                    >
                      <div className="text-3xl mb-1">{producto.imagen}</div>
                      <h4 className="font-semibold text-xs text-slate-700 mb-1 line-clamp-2">
                        {producto.nombre}
                      </h4>
                      <p className="text-sm font-bold text-blue-600">
                        ${producto.precio}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Carrito y Horario */}
              <div className="col-span-4">
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-slate-700 mb-3">
                    🛒 Carrito ({carrito.length})
                  </h3>

                  <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
                    {carrito.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">
                        Sin productos
                      </p>
                    ) : (
                      carrito.map(item => (
                        <div key={item.carritoId} className="bg-white p-2 rounded border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-xs text-slate-700">
                                {item.cantidadCarrito}x {item.nombre}
                              </p>
                              <p className="text-xs font-bold text-blue-600">
                                ${item.precio * item.cantidadCarrito}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => eliminarDelCarrito(item.carritoId)}
                              className="h-6 w-6 p-0 text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Subtotal:</span>
                      <span className="text-blue-600">${calcularSubtotal()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">⏰ Horario de Entrega</Label>
                  <Input
                    type="time"
                    value={horarioEntrega}
                    onChange={(e) => setHorarioEntrega(e.target.value)}
                    placeholder="Ej: 20:30"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Dejá vacío si es para &quot;lo antes posible&quot;
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // PASO 2: Datos del Cliente
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre del Cliente *</Label>
                  <Input
                    value={cliente.nombre}
                    onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Teléfono *</Label>
                  <Input
                    value={cliente.telefono}
                    onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                    placeholder="Ej: 3815-123456"
                    className="mt-1"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Email (opcional)</Label>
                  <Input
                    type="email"
                    value={cliente.email}
                    onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                    placeholder="Ej: cliente@email.com"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-slate-700 mb-3">📍 Dirección de Entrega</h3>
                <p className="text-sm text-slate-500 mb-3">
                  Completá solo si es delivery. Dejá vacío para retiro en local.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Calle</Label>
                    <Input
                      value={cliente.direccion.calle}
                      onChange={(e) => setCliente({
                        ...cliente,
                        direccion: { ...cliente.direccion, calle: e.target.value }
                      })}
                      placeholder="Ej: Av. Belgrano"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Número/Altura</Label>
                    <Input
                      value={cliente.direccion.numero}
                      onChange={(e) => setCliente({
                        ...cliente,
                        direccion: { ...cliente.direccion, numero: e.target.value }
                      })}
                      placeholder="Ej: 1234"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Edificio/Casa/Depto</Label>
                    <Input
                      value={cliente.direccion.edificio}
                      onChange={(e) => setCliente({
                        ...cliente,
                        direccion: { ...cliente.direccion, edificio: e.target.value }
                      })}
                      placeholder="Ej: Edificio Torre 1"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Piso</Label>
                    <Input
                      value={cliente.direccion.piso}
                      onChange={(e) => setCliente({
                        ...cliente,
                        direccion: { ...cliente.direccion, piso: e.target.value }
                      })}
                      placeholder="Ej: 3° A"
                      className="mt-1"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Observaciones de dirección</Label>
                    <Textarea
                      value={cliente.direccion.observaciones}
                      onChange={(e) => setCliente({
                        ...cliente,
                        direccion: { ...cliente.direccion, observaciones: e.target.value }
                      })}
                      placeholder="Ej: Timbre B, portón verde"
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Resumen Final */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">💰 Resumen Total</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${calcularSubtotal()}</span>
                  </div>
                  {calcularEnvio() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Envío:</span>
                      <span className="font-semibold">${calcularEnvio()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>TOTAL:</span>
                    <span className="text-blue-600">${calcularTotal()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between gap-3 pt-4 border-t">
            {pasoModal === 1 ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setModalNuevoPedido(false);
                    resetearModal();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => setPasoModal(2)}
                  disabled={carrito.length === 0}
                  className="gap-2"
                >
                  Siguiente: Datos del Cliente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setPasoModal(1)}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Volver
                </Button>
                <Button
                  onClick={confirmarPedido}
                  disabled={!cliente.nombre || !cliente.telefono}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirmar Pedido
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Ver Pedido */}
      <Dialog open={modalVerPedido} onOpenChange={setModalVerPedido}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Pedido #{pedidoSeleccionado?.id}</DialogTitle>
          </DialogHeader>
          {pedidoSeleccionado && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-slate-600">Cliente</Label>
                  <p className="font-semibold">{pedidoSeleccionado.cliente.nombre}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Teléfono</Label>
                  <p className="font-semibold">{pedidoSeleccionado.cliente.telefono}</p>
                </div>
                {pedidoSeleccionado.cliente.direccion && (
                  <div className="col-span-2">
                    <Label className="text-xs text-slate-600">Dirección</Label>
                    <p className="font-semibold">{pedidoSeleccionado.cliente.direccion}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-slate-600">Horario</Label>
                  <p className="font-semibold">{pedidoSeleccionado.horario}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Modalidad</Label>
                  <p className="font-semibold capitalize">{pedidoSeleccionado.modalidad}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-semibold mb-2 block">Items del Pedido</Label>
                <div className="space-y-2">
                  {pedidoSeleccionado.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between bg-slate-50 p-2 rounded">
                      <span>{item.cantidad}x {item.nombre}</span>
                      <span className="font-semibold">${item.precio * item.cantidad}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between text-xl font-bold">
                <span>TOTAL:</span>
                <span className="text-blue-600">${pedidoSeleccionado.total}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
