import { useState, useEffect } from 'react';
import { Plus, Clock, Check, Edit, Phone, Globe, MessageCircle, Store, ChefHat, Package, Search, Trash2, UserPlus, X, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ============================================
// DATOS MOCK - PRODUCTOS
// ============================================
const PRODUCTOS_MOCK = [
  { id: 1, nombre: 'Burger Clásica', precio: 2500, categoria: 'Hamburguesas' },
  { id: 2, nombre: 'Burger Completa', precio: 3200, categoria: 'Hamburguesas' },
  { id: 3, nombre: 'Burger BBQ', precio: 3500, categoria: 'Hamburguesas' },
  { id: 4, nombre: 'Pizza Muzzarella', precio: 5800, categoria: 'Pizzas' },
  { id: 5, nombre: 'Pizza Napolitana', precio: 6200, categoria: 'Pizzas' },
  { id: 6, nombre: 'Papas Grandes', precio: 1500, categoria: 'Acompañamientos' },
  { id: 7, nombre: 'Papas Medianas', precio: 1000, categoria: 'Acompañamientos' },
  { id: 8, nombre: 'Nuggets x10', precio: 2800, categoria: 'Acompañamientos' },
  { id: 9, nombre: 'Coca-Cola 1.5L', precio: 1200, categoria: 'Bebidas' },
  { id: 10, nombre: 'Fanta 1.5L', precio: 1200, categoria: 'Bebidas' },
  { id: 11, nombre: 'Sprite 1.5L', precio: 1200, categoria: 'Bebidas' },
];

// ============================================
// DATOS MOCK - CLIENTES
// ============================================
const CLIENTES_MOCK = [
  { id: 1, nombre: 'Juan Pérez', telefono: '3512345678', email: 'juan@email.com', direccion: 'Av. Colón 1234' },
  { id: 2, nombre: 'María González', telefono: '3518765432', email: 'maria@email.com', direccion: 'Calle Falsa 567' },
  { id: 3, nombre: 'Carlos Rodríguez', telefono: '3519876543', email: 'carlos@email.com', direccion: 'San Martín 890' },
  { id: 4, nombre: 'Ana López', telefono: '3511234567', email: 'ana@email.com', direccion: 'Belgrano 456' },
];

// ============================================
// DATOS MOCK - PEDIDOS
// ============================================
const PEDIDOS_MOCK = [
  {
    id: 'P001',
    clienteNombre: 'Juan Pérez',
    origen: 'whatsapp', // whatsapp, web, telefono, mostrador
    tipo: 'ya', // ya, programado
    horaProgramada: null,
    timestamp: Date.now() - 300000, // Hace 5 min
    items: [
      { nombre: 'Burger Clásica', cantidad: 2 },
      { nombre: 'Papas Grandes', cantidad: 1 }
    ],
    total: 4500,
    paymentStatus: 'paid', // paid, pending
    estado: 'recibido', // recibido, en_cocina, listo
    tipoEntrega: 'delivery' // delivery, retiro
  },
  {
    id: 'P002',
    clienteNombre: 'María González',
    origen: 'web',
    tipo: 'programado',
    horaProgramada: '20:30',
    timestamp: Date.now() - 600000, // Hace 10 min
    items: [
      { nombre: 'Pizza Muzzarella', cantidad: 1 },
      { nombre: 'Coca-Cola 1.5L', cantidad: 1 }
    ],
    total: 5800,
    paymentStatus: 'pending',
    estado: 'recibido',
    tipoEntrega: 'retiro'
  },
  {
    id: 'P003',
    clienteNombre: 'Carlos Rodríguez',
    origen: 'telefono',
    tipo: 'ya',
    horaProgramada: null,
    timestamp: Date.now() - 900000, // Hace 15 min
    items: [
      { nombre: 'Hamburguesa Completa', cantidad: 3 },
      { nombre: 'Papas Medianas', cantidad: 2 },
      { nombre: 'Fanta', cantidad: 2 }
    ],
    total: 8900,
    paymentStatus: 'paid',
    estado: 'en_cocina',
    tipoEntrega: 'delivery'
  },
  {
    id: 'P004',
    clienteNombre: 'Ana López',
    origen: 'mostrador',
    tipo: 'ya',
    horaProgramada: null,
    timestamp: Date.now() - 420000, // Hace 7 min
    items: [
      { nombre: 'Pizza Napolitana', cantidad: 1 }
    ],
    total: 6200,
    paymentStatus: 'pending',
    estado: 'en_cocina',
    tipoEntrega: 'retiro'
  },
  {
    id: 'P005',
    clienteNombre: 'Roberto Sánchez',
    origen: 'whatsapp',
    tipo: 'programado',
    horaProgramada: '21:00',
    timestamp: Date.now() - 180000, // Hace 3 min
    items: [
      { nombre: 'Burger BBQ', cantidad: 2 },
      { nombre: 'Nuggets x10', cantidad: 1 }
    ],
    total: 7300,
    paymentStatus: 'paid',
    estado: 'recibido',
    tipoEntrega: 'delivery'
  }
];

// ============================================
// COMPONENTE: TopBar
// ============================================
function TopBar({ demoraCocina, setDemoraCocina, onNuevoPedido }) {
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4 shadow-lg border-b-4 border-blue-500">
      <div className="flex items-center justify-between">
        {/* Logo y Estado */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <ChefHat className="h-10 w-10 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold">El Chalito</h1>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-semibold">ABIERTO</span>
              </div>
            </div>
          </div>

          {/* Demora de Cocina */}
          <div className="ml-8 bg-slate-700 px-4 py-2 rounded-lg border border-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-xs text-slate-400">Demora Cocina</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={demoraCocina}
                    onChange={(e) => setDemoraCocina(parseInt(e.target.value) || 0)}
                    className="w-16 bg-slate-600 text-white px-2 py-1 rounded text-lg font-bold border border-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <span className="text-lg font-bold text-orange-400">min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón Nuevo Pedido */}
        <Button
          onClick={onNuevoPedido}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-6 text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
        >
          <Plus className="h-6 w-6 mr-2" />
          NUEVO PEDIDO <span className="ml-2 text-sm opacity-80">(F1)</span>
        </Button>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: OrderCard
// ============================================
function OrderCard({ pedido, onMarcharACocina, onListo, onEditar }) {
  const [tick, setTick] = useState(0);

  // Actualizar cada minuto para el contador
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Calcular tiempo transcurrido
  const tiempoTranscurrido = () => {
    const minutos = Math.floor((Date.now() - pedido.timestamp) / 60000);
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  // Verificar si falta poco para hora programada
  const faltaPoco = () => {
    if (pedido.tipo !== 'programado' || !pedido.horaProgramada) return false;
    const [hora, minuto] = pedido.horaProgramada.split(':');
    const horaObjetivo = new Date();
    horaObjetivo.setHours(parseInt(hora), parseInt(minuto), 0);
    const diferencia = (horaObjetivo - Date.now()) / 60000; // en minutos
    return diferencia <= 15 && diferencia > 0;
  };

  // Icono según origen
  const IconoOrigen = () => {
    switch (pedido.origen) {
      case 'whatsapp': return <MessageCircle className="h-5 w-5 text-green-500" />;
      case 'web': return <Globe className="h-5 w-5 text-blue-500" />;
      case 'telefono': return <Phone className="h-5 w-5 text-purple-500" />;
      case 'mostrador': return <Store className="h-5 w-5 text-orange-500" />;
      default: return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="mb-4 shadow-md hover:shadow-xl transition-all duration-200 border-2 border-slate-200 hover:border-slate-300">
      <CardHeader className="pb-3 bg-slate-50">
        <div className="flex items-start justify-between">
          {/* ID, Nombre, Origen */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold text-slate-800">#{pedido.id}</span>
              <IconoOrigen />
              {pedido.tipoEntrega === 'delivery' && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs">
                  DELIVERY
                </Badge>
              )}
              {pedido.tipoEntrega === 'retiro' && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-xs">
                  RETIRO
                </Badge>
              )}
            </div>
            <p className="text-lg font-semibold text-slate-700">{pedido.clienteNombre}</p>
          </div>

          {/* Tiempo */}
          <div className={`text-right ${pedido.tipo === 'ya' ? 'bg-orange-100 border border-orange-300' : faltaPoco() ? 'bg-red-100 border border-red-300' : 'bg-blue-100 border border-blue-300'} px-3 py-2 rounded-lg`}>
            {pedido.tipo === 'ya' ? (
              <div>
                <p className="text-xs text-orange-600 font-medium">HACE</p>
                <p className="text-lg font-bold text-orange-700">{tiempoTranscurrido()}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-blue-600 font-medium">PARA LAS</p>
                <p className={`text-lg font-bold ${faltaPoco() ? 'text-red-700 animate-pulse' : 'text-blue-700'}`}>
                  {pedido.horaProgramada}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Items */}
        <div className="mb-4 bg-white rounded-lg p-3 border border-slate-200">
          <p className="text-xs text-slate-500 font-medium mb-2">ITEMS:</p>
          <ul className="space-y-1">
            {pedido.items.map((item, idx) => (
              <li key={idx} className="text-sm text-slate-700">
                <span className="font-bold text-slate-900">{item.cantidad}x</span> {item.nombre}
              </li>
            ))}
          </ul>
        </div>

        {/* Badge de Pago - CRÍTICO */}
        <div className="mb-4">
          {pedido.paymentStatus === 'paid' ? (
            <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-4 py-1.5 shadow-md">
              ✓ PAGADO
            </Badge>
          ) : (
            <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold text-sm px-4 py-1.5 shadow-md">
              DEBE: ${pedido.total.toLocaleString('es-AR')}
            </Badge>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          {pedido.estado === 'recibido' && (
            <Button
              onClick={() => onMarcharACocina(pedido.id)}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 shadow-md hover:shadow-lg"
            >
              <ChefHat className="h-4 w-4 mr-2" />
              MARCHAR A COCINA
            </Button>
          )}
          {pedido.estado === 'en_cocina' && (
            <Button
              onClick={() => onListo(pedido.id)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 shadow-md hover:shadow-lg"
            >
              <Check className="h-4 w-4 mr-2" />
              LISTO / ENTREGAR
            </Button>
          )}
          <Button
            onClick={() => onEditar(pedido)}
            variant="outline"
            className="border-2 border-slate-300 hover:bg-slate-100 px-4"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE: Column
// ============================================
function Column({ titulo, color, pedidos, onMarcharACocina, onListo, onEditar }) {
  const colorClasses = {
    amarillo: 'border-amber-400 bg-amber-50',
    verde: 'border-green-400 bg-green-50',
    azul: 'border-blue-400 bg-blue-50'
  };

  const headerClasses = {
    amarillo: 'bg-gradient-to-r from-amber-500 to-amber-600',
    verde: 'bg-gradient-to-r from-green-500 to-green-600',
    azul: 'bg-gradient-to-r from-blue-500 to-blue-600'
  };

  return (
    <div className={`rounded-xl border-4 ${colorClasses[color]} overflow-hidden h-full flex flex-col shadow-xl`}>
      {/* Header */}
      <div className={`${headerClasses[color]} text-white px-6 py-4 shadow-lg`}>
        <h2 className="text-2xl font-bold flex items-center justify-between">
          {titulo}
          <Badge className="bg-white text-slate-800 text-lg px-3 py-1 font-bold">
            {pedidos.length}
          </Badge>
        </h2>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {pedidos.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay pedidos</p>
          </div>
        ) : (
          pedidos.map(pedido => (
            <OrderCard
              key={pedido.id}
              pedido={pedido}
              onMarcharACocina={onMarcharACocina}
              onListo={onListo}
              onEditar={onEditar}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL: VentasGeminiPage
// ============================================
export default function VentasGeminiPage() {
  const [pedidos, setPedidos] = useState(PEDIDOS_MOCK);
  const [demoraCocina, setDemoraCocina] = useState(20);
  const [modalNuevoPedido, setModalNuevoPedido] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [pedidoEditar, setPedidoEditar] = useState(null);

  // Estados del modal de nuevo pedido
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarFormCliente, setMostrarFormCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: ''
  });
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [tipoPedido, setTipoPedido] = useState('ya'); // ya, programado
  const [horaProgramada, setHoraProgramada] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('retiro'); // retiro, delivery
  const [origen, setOrigen] = useState('mostrador'); // mostrador, telefono, whatsapp, web
  const [estadoPago, setEstadoPago] = useState('pending'); // pending, paid

  // Atajo de teclado F1
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setModalNuevoPedido(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Marchar a cocina
  const handleMarcharACocina = (pedidoId) => {
    setPedidos(prev =>
      prev.map(p =>
        p.id === pedidoId ? { ...p, estado: 'en_cocina' } : p
      )
    );
  };

  // Listo / Entregar
  const handleListo = (pedidoId) => {
    // En una app real, aquí se marcaría como entregado y se removería
    setPedidos(prev => prev.filter(p => p.id !== pedidoId));
    alert(`Pedido ${pedidoId} marcado como LISTO/ENTREGADO`);
  };

  // Editar
  const handleEditar = (pedido) => {
    setPedidoEditar(pedido);
    setModalEditar(true);
  };

  // Nuevo pedido
  const handleNuevoPedido = () => {
    setModalNuevoPedido(true);
  };

  // Limpiar formulario de nuevo pedido
  const limpiarFormularioNuevoPedido = () => {
    setBusquedaCliente('');
    setClienteSeleccionado(null);
    setMostrarFormCliente(false);
    setNuevoCliente({ nombre: '', telefono: '', email: '', direccion: '' });
    setBusquedaProducto('');
    setCarrito([]);
    setTipoPedido('ya');
    setHoraProgramada('');
    setTipoEntrega('retiro');
    setOrigen('mostrador');
    setEstadoPago('pending');
  };

  // Filtrar clientes por búsqueda
  const clientesFiltrados = CLIENTES_MOCK.filter(c =>
    c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    c.telefono.includes(busquedaCliente)
  );

  // Seleccionar cliente
  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setBusquedaCliente('');
    setMostrarFormCliente(false);
  };

  // Agregar nuevo cliente
  const agregarNuevoCliente = () => {
    if (!nuevoCliente.nombre || !nuevoCliente.telefono) {
      alert('Nombre y teléfono son obligatorios');
      return;
    }
    const cliente = { id: Date.now(), ...nuevoCliente };
    CLIENTES_MOCK.push(cliente);
    setClienteSeleccionado(cliente);
    setMostrarFormCliente(false);
    setNuevoCliente({ nombre: '', telefono: '', email: '', direccion: '' });
  };

  // Filtrar productos por búsqueda
  const productosFiltrados = PRODUCTOS_MOCK.filter(p =>
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
  );

  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
    setBusquedaProducto('');
  };

  // Modificar cantidad en carrito
  const modificarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setCarrito(carrito.filter(item => item.id !== productoId));
    } else {
      setCarrito(carrito.map(item =>
        item.id === productoId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      ));
    }
  };

  // Calcular total
  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  // Crear pedido
  const crearPedido = () => {
    if (!clienteSeleccionado && !mostrarFormCliente) {
      alert('Debe seleccionar o crear un cliente');
      return;
    }
    if (carrito.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    const nuevoPedido = {
      id: `P${String(pedidos.length + 1).padStart(3, '0')}`,
      clienteNombre: clienteSeleccionado?.nombre || nuevoCliente.nombre,
      origen: origen,
      tipo: tipoPedido,
      horaProgramada: tipoPedido === 'programado' ? horaProgramada : null,
      timestamp: Date.now(),
      items: carrito.map(item => ({
        nombre: item.nombre,
        cantidad: item.cantidad
      })),
      total: calcularTotal(),
      paymentStatus: estadoPago,
      estado: 'recibido',
      tipoEntrega: tipoEntrega
    };

    setPedidos([...pedidos, nuevoPedido]);
    setModalNuevoPedido(false);
    limpiarFormularioNuevoPedido();
    alert(`Pedido ${nuevoPedido.id} creado exitosamente!`);
  };

  // Filtrar pedidos por estado
  const pedidosRecibidos = pedidos.filter(p => p.estado === 'recibido');
  const pedidosEnCocina = pedidos.filter(p => p.estado === 'en_cocina');

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Bar */}
      <TopBar
        demoraCocina={demoraCocina}
        setDemoraCocina={setDemoraCocina}
        onNuevoPedido={handleNuevoPedido}
      />

      {/* Layout Principal - 2 Columnas */}
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6" style={{ height: 'calc(100vh - 140px)' }}>
          {/* Columna Izquierda: RECIBIDOS (35%) */}
          <div className="col-span-4">
            <Column
              titulo="RECIBIDOS / PENDIENTES"
              color="amarillo"
              pedidos={pedidosRecibidos}
              onMarcharACocina={handleMarcharACocina}
              onListo={handleListo}
              onEditar={handleEditar}
            />
          </div>

          {/* Columna Derecha: EN COCINA (65%) */}
          <div className="col-span-8">
            <Column
              titulo="EN COCINA / EN CURSO"
              color="azul"
              pedidos={pedidosEnCocina}
              onMarcharACocina={handleMarcharACocina}
              onListo={handleListo}
              onEditar={handleEditar}
            />
          </div>
        </div>
      </div>

      {/* Modal Nuevo Pedido */}
      <Dialog open={modalNuevoPedido} onOpenChange={(open) => {
        setModalNuevoPedido(open);
        if (!open) limpiarFormularioNuevoPedido();
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-blue-700 flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              Nuevo Pedido
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-6 py-4">
            {/* COLUMNA 1: CLIENTE */}
            <div className="col-span-1 space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
                  �� Cliente
                </h3>

                {!clienteSeleccionado && !mostrarFormCliente ? (
                  <div className="space-y-3">
                    {/* Buscador de clientes */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Buscar cliente..."
                        value={busquedaCliente}
                        onChange={(e) => setBusquedaCliente(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Lista de clientes filtrados */}
                    {busquedaCliente && (
                      <div className="bg-white border rounded-lg max-h-48 overflow-y-auto">
                        {clientesFiltrados.length > 0 ? (
                          clientesFiltrados.map(cliente => (
                            <button
                              key={cliente.id}
                              onClick={() => seleccionarCliente(cliente)}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0"
                            >
                              <p className="font-semibold text-sm">{cliente.nombre}</p>
                              <p className="text-xs text-slate-500">{cliente.telefono}</p>
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-2 text-sm text-slate-500">No se encontraron clientes</p>
                        )}
                      </div>
                    )}

                    {/* Botón nuevo cliente */}
                    <Button
                      onClick={() => setMostrarFormCliente(true)}
                      variant="outline"
                      className="w-full border-2 border-green-500 text-green-700 hover:bg-green-50"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Nuevo Cliente
                    </Button>
                  </div>
                ) : clienteSeleccionado ? (
                  <div className="space-y-2">
                    <div className="bg-white border-2 border-blue-300 rounded-lg p-3">
                      <p className="font-bold text-blue-900">{clienteSeleccionado.nombre}</p>
                      <p className="text-sm text-slate-600">📞 {clienteSeleccionado.telefono}</p>
                      {clienteSeleccionado.email && (
                        <p className="text-sm text-slate-600">📧 {clienteSeleccionado.email}</p>
                      )}
                      {clienteSeleccionado.direccion && (
                        <p className="text-sm text-slate-600">📍 {clienteSeleccionado.direccion}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => setClienteSeleccionado(null)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cambiar Cliente
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-blue-800">Datos del Nuevo Cliente:</h4>
                    <div className="space-y-2">
                      <Input
                        placeholder="Nombre *"
                        value={nuevoCliente.nombre}
                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                      />
                      <Input
                        placeholder="Teléfono *"
                        value={nuevoCliente.telefono}
                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                      />
                      <Input
                        placeholder="Email (opcional)"
                        value={nuevoCliente.email}
                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
                      />
                      <Input
                        placeholder="Dirección (opcional)"
                        value={nuevoCliente.direccion}
                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={agregarNuevoCliente} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        Guardar Cliente
                      </Button>
                      <Button
                        onClick={() => {
                          setMostrarFormCliente(false);
                          setNuevoCliente({ nombre: '', telefono: '', email: '', direccion: '' });
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Configuración del Pedido */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Origen del Pedido</Label>
                    <Select value={origen} onValueChange={setOrigen}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mostrador">🏪 Mostrador</SelectItem>
                        <SelectItem value="telefono">📞 Teléfono</SelectItem>
                        <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                        <SelectItem value="web">🌐 Web</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Tipo de Entrega</Label>
                    <Select value={tipoEntrega} onValueChange={setTipoEntrega}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retiro">🏃 Retiro</SelectItem>
                        <SelectItem value="delivery">🚚 Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">¿Cuándo?</Label>
                    <Select value={tipoPedido} onValueChange={setTipoPedido}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ya">⚡ Lo antes posible</SelectItem>
                        <SelectItem value="programado">🕐 Programado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {tipoPedido === 'programado' && (
                    <Input
                      type="time"
                      value={horaProgramada}
                      onChange={(e) => setHoraProgramada(e.target.value)}
                      className="font-mono text-lg"
                    />
                  )}

                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Estado de Pago</Label>
                    <Select value={estadoPago} onValueChange={setEstadoPago}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">❌ Debe</SelectItem>
                        <SelectItem value="paid">✅ Pagado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA 2: PRODUCTOS */}
            <div className="col-span-1 space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
                  🍔 Productos
                </h3>

                {/* Buscador de productos */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar producto..."
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Lista de productos filtrados */}
                {busquedaProducto && (
                  <div className="bg-white border rounded-lg max-h-64 overflow-y-auto mb-3">
                    {productosFiltrados.length > 0 ? (
                      productosFiltrados.map(producto => (
                        <button
                          key={producto.id}
                          onClick={() => agregarAlCarrito(producto)}
                          className="w-full text-left px-3 py-2 hover:bg-green-50 border-b last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-sm">{producto.nombre}</p>
                              <p className="text-xs text-slate-500">{producto.categoria}</p>
                            </div>
                            <p className="font-bold text-green-700">${producto.precio}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-slate-500">No se encontraron productos</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA 3: CARRITO */}
            <div className="col-span-1 space-y-4">
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    🛒 Carrito
                  </span>
                  <Badge className="bg-orange-500 text-white">{carrito.length}</Badge>
                </h3>

                {carrito.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Carrito vacío</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {carrito.map(item => (
                      <div key={item.id} className="bg-white border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-sm flex-1">{item.nombre}</p>
                          <button
                            onClick={() => modificarCantidad(item.id, 0)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0"
                              onClick={() => modificarCantidad(item.id, item.cantidad - 1)}
                            >
                              -
                            </Button>
                            <span className="font-bold text-lg w-8 text-center">{item.cantidad}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0"
                              onClick={() => modificarCantidad(item.id, item.cantidad + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <p className="font-bold text-green-700">
                            ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {carrito.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
                      <p className="text-sm font-medium mb-1">TOTAL</p>
                      <p className="text-3xl font-bold">
                        ${calcularTotal().toLocaleString('es-AR')}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setModalNuevoPedido(false);
                limpiarFormularioNuevoPedido();
              }}
              className="px-8"
            >
              Cancelar
            </Button>
            <Button
              onClick={crearPedido}
              className="px-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-lg"
            >
              <Check className="h-5 w-5 mr-2" />
              Crear Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar - Placeholder */}
      <Dialog open={modalEditar} onOpenChange={setModalEditar}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Editar Pedido {pedidoEditar?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-center text-slate-500">
              [Formulario de edición - Por implementar]
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEditar(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setModalEditar(false)}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
