import { useState, useEffect } from 'react';
import { Plus, Clock, Check, Edit, Phone, Globe, MessageCircle, Store, ChefHat, Package, Search, Trash2, ShoppingCart, ChevronRight, ChevronLeft, Home, Bike, GripVertical } from 'lucide-react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { NavBar } from '../../components/layout/NavBar';
import { Footer } from '../../components/layout/Footer';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import Head from 'next/head';

// DATOS MOCK
const CATEGORIAS_MOCK = [
  { id: 1, nombre: 'Hamburguesas', icono: '🍔', color: 'bg-orange-500' },
  { id: 2, nombre: 'Pizzas', icono: '🍕', color: 'bg-red-500' },
  { id: 3, nombre: 'Acompañamientos', icono: '🍟', color: 'bg-amber-600' },
  { id: 4, nombre: 'Bebidas', icono: '🥤', color: 'bg-blue-500' },
];

const PRODUCTOS_MOCK = [
  {
    id: 1,
    nombre: 'Burger Clásica',
    precio: 2500,
    categoria: 1,
    imagen: '🍔',
    extrasDisponibles: [
      { id: 'e1', nombre: 'Extra Queso', precio: 200 },
      { id: 'e2', nombre: 'Extra Panceta', precio: 300 },
    ]
  },
  {
    id: 2,
    nombre: 'Burger Completa',
    precio: 3200,
    categoria: 1,
    imagen: '🍔',
    extrasDisponibles: [
      { id: 'e1', nombre: 'Extra Queso', precio: 200 },
      { id: 'e2', nombre: 'Extra Panceta', precio: 300 },
      { id: 'e3', nombre: 'Huevo Frito', precio: 150 },
    ]
  },
  {
    id: 3,
    nombre: 'Burger BBQ',
    precio: 3500,
    categoria: 1,
    imagen: '🍔',
    extrasDisponibles: [
      { id: 'e1', nombre: 'Extra Queso', precio: 200 },
      { id: 'e4', nombre: 'Extra Salsa BBQ', precio: 100 },
    ]
  },
  {
    id: 4,
    nombre: 'Pizza Muzzarella',
    precio: 5800,
    categoria: 2,
    imagen: '🍕',
    extrasDisponibles: []
  },
  {
    id: 5,
    nombre: 'Pizza Napolitana',
    precio: 6200,
    categoria: 2,
    imagen: '🍕',
    extrasDisponibles: []
  },
  {
    id: 6,
    nombre: 'Papas Grandes',
    precio: 1500,
    categoria: 3,
    imagen: '🍟',
    extrasDisponibles: []
  },
  {
    id: 7,
    nombre: 'Papas Medianas',
    precio: 1000,
    categoria: 3,
    imagen: '🍟',
    extrasDisponibles: []
  },
  {
    id: 8,
    nombre: 'Nuggets x10',
    precio: 2800,
    categoria: 3,
    imagen: '🍗',
    extrasDisponibles: []
  },
  {
    id: 9,
    nombre: 'Coca-Cola 1.5L',
    precio: 1200,
    categoria: 4,
    imagen: '🥤',
    extrasDisponibles: []
  },
  {
    id: 10,
    nombre: 'Fanta 1.5L',
    precio: 1200,
    categoria: 4,
    imagen: '🥤',
    extrasDisponibles: []
  },
  {
    id: 11,
    nombre: 'Sprite 1.5L',
    precio: 1200,
    categoria: 4,
    imagen: '🥤',
    extrasDisponibles: []
  },
];

const CLIENTES_MOCK = [
  { id: 1, nombre: 'Juan Pérez', telefono: '3512345678', email: 'juan@email.com', direccion: 'Av. Colón 1234' },
  { id: 2, nombre: 'María González', telefono: '3518765432', email: 'maria@email.com', direccion: 'Calle Falsa 567' },
  { id: 3, nombre: 'Carlos Rodríguez', telefono: '3519876543', email: 'carlos@email.com', direccion: 'San Martín 890' },
  { id: 4, nombre: 'Ana López', telefono: '3511234567', email: 'ana@email.com', direccion: 'Belgrano 456' },
];

const PEDIDOS_MOCK = [
  {
    id: 'P001',
    clienteNombre: 'Juan Pérez',
    origen: 'whatsapp',
    tipo: 'ya',
    horaProgramada: null,
    timestamp: Date.now() - 300000,
    items: [
      { nombre: 'Burger Clásica', cantidad: 2 },
      { nombre: 'Papas Grandes', cantidad: 1 }
    ],
    total: 4500,
    paymentStatus: 'paid',
    estado: 'recibido',
    tipoEntrega: 'delivery'
  },
  {
    id: 'P002',
    clienteNombre: 'María González',
    origen: 'web',
    tipo: 'programado',
    horaProgramada: '20:30',
    timestamp: Date.now() - 600000,
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
    timestamp: Date.now() - 900000,
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
    timestamp: Date.now() - 420000,
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
    timestamp: Date.now() - 180000,
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

function TopBar({ demoraCocina, setDemoraCocina, onNuevoPedido, onModoCocina }) {
  return (
    <div className="bg-slate-800 rounded-lg shadow border border-slate-700 p-3 mb-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-slate-400" />
          <div>
            <h2 className="text-base font-bold text-white">El Chalito</h2>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-500 font-medium">Abierto</span>
            </div>
          </div>
        </div>
        <div className="bg-slate-700 px-3 py-1.5 rounded border border-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Demora</p>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={demoraCocina}
                  onChange={(e) => setDemoraCocina(parseInt(e.target.value) || 0)}
                  className="w-12 bg-slate-800 text-white px-1.5 py-0.5 rounded text-sm font-bold border border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-slate-300">min</span>
              </div>
            </div>
          </div>
        </div>
        <Button
          onClick={onModoCocina}
          className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 text-xs font-semibold border border-slate-600"
          size="sm"
        >
          <ChefHat className="h-3.5 w-3.5 mr-1.5" />
          MODO COCINA
        </Button>
        <Button
          onClick={onNuevoPedido}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-bold shadow-sm"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          NUEVO PEDIDO <span className="ml-1.5 text-xs opacity-80">(F1)</span>
        </Button>
      </div>
    </div>
  );
}

function OrderCard({ pedido, onMarcharACocina, onListo, onEditar, onCancelar }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pedido-${pedido.id}`,
    data: {
      pedido: pedido,
      estado: pedido.estado
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  const tiempoTranscurrido = () => {
    const minutos = Math.floor((Date.now() - pedido.timestamp) / 60000);
    if (minutos < 60) return `${minutos}m`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  const faltaPoco = () => {
    if (pedido.tipo !== 'programado' || !pedido.horaProgramada) return false;
    const [hora, minuto] = pedido.horaProgramada.split(':');
    const horaObjetivo = new Date();
    horaObjetivo.setHours(parseInt(hora), parseInt(minuto), 0);
    const diferencia = (horaObjetivo - Date.now()) / 60000;
    return diferencia <= 15 && diferencia > 0;
  };

  const IconoOrigen = () => {
    switch (pedido.origen) {
      case 'whatsapp': return <MessageCircle className="h-3.5 w-3.5 text-slate-500" />;
      case 'web': return <Globe className="h-3.5 w-3.5 text-slate-500" />;
      case 'telefono': return <Phone className="h-3.5 w-3.5 text-slate-500" />;
      case 'mostrador': return <Store className="h-3.5 w-3.5 text-slate-500" />;
      default: return <Package className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-2 shadow-sm hover:shadow-md transition-all border border-slate-300"
    >
      <CardHeader className="pb-2 pt-2.5 px-3 bg-slate-50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
              <GripVertical className="h-4 w-4 text-slate-400 hover:text-slate-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-bold text-slate-800">#{pedido.id}</span>
                <IconoOrigen />
              {pedido.tipoEntrega === 'delivery' && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs px-1.5 py-0 font-semibold">
                  DELIVERY
                </Badge>
              )}
              {pedido.tipoEntrega === 'retiro' && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs px-1.5 py-0 font-semibold">
                  RETIRO
                </Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-700">{pedido.clienteNombre}</p>
            </div>
          </div>

          <div className={`text-right ${faltaPoco() ? 'bg-red-50 border border-red-300' : 'bg-slate-100 border border-slate-300'} px-2 py-1 rounded`}>
            {pedido.tipo === 'ya' ? (
              <div>
                <p className="text-xs text-slate-600">Hace</p>
                <p className="text-sm font-bold text-slate-800">{tiempoTranscurrido()}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-600">Para</p>
                <p className={`text-sm font-bold ${faltaPoco() ? 'text-red-700 animate-pulse' : 'text-slate-800'}`}>
                  {pedido.horaProgramada}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2.5 px-3 pb-3">
        <div className="mb-2 bg-white rounded p-2 border border-slate-200">
          <ul className="space-y-0.5">
            {pedido.items.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-700">
                <span className="font-bold text-slate-900">{item.cantidad}x</span> {item.nombre}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-2">
          {pedido.paymentStatus === 'paid' ? (
            <Badge className="bg-green-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none">
              ✓ PAGADO
            </Badge>
          ) : (
            <Badge className="bg-red-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none">
              DEBE: ${pedido.total.toLocaleString('es-AR')}
            </Badge>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex gap-1.5">
            {pedido.estado === 'recibido' && (
              <Button
                onClick={() => onMarcharACocina(pedido.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 text-xs"
                size="sm"
              >
                <ChefHat className="h-3.5 w-3.5 mr-1" />
                MARCHAR
              </Button>
            )}
            {pedido.estado === 'en_cocina' && (
              <Button
                onClick={() => onListo(pedido.id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 text-xs"
                size="sm"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                LISTO
              </Button>
            )}
            <Button
              onClick={() => onEditar(pedido)}
              variant="outline"
              className="border border-slate-300 hover:bg-slate-100 px-2"
              size="sm"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              onClick={() => onCancelar(pedido)}
              variant="outline"
              className="border border-red-300 hover:bg-red-50 text-red-600 px-2"
              size="sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Botón COBRAR si el pedido está pendiente de pago */}
          {pedido.paymentStatus === 'pending' && pedido.onCobrar && (
            <Button
              onClick={() => pedido.onCobrar(pedido)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 text-xs"
              size="sm"
            >
              <Package className="h-3.5 w-3.5 mr-1" />
              COBRAR
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Column({ titulo, color, pedidos, onMarcharACocina, onListo, onEditar, onCobrar, onCancelar, dosColumnas = false, estado }) {
  const { setNodeRef, isOver } = useDroppable({
    id: estado,
    data: {
      estado: estado
    }
  });

  return (
    <div className="h-full rounded-lg border-2 border-slate-300 bg-slate-50 overflow-hidden flex flex-col shadow">
      <div className="bg-slate-700 text-white px-3 py-2 flex-shrink-0">
        <h2 className="text-sm font-bold flex items-center justify-between">
          {titulo}
          <Badge className="bg-slate-600 text-white text-xs px-2 py-0.5 font-semibold">
            {pedidos.length}
          </Badge>
        </h2>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-2 min-h-0 transition-colors ${
          isOver ? 'bg-blue-50 border-2 border-blue-400' : ''
        }`}
      >
        {pedidos.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No hay pedidos</p>
          </div>
        ) : dosColumnas ? (
          <div className="grid grid-cols-2 gap-2">
            {pedidos.map(pedido => (
              <OrderCard
                key={pedido.id}
                pedido={{ ...pedido, onCobrar }}
                onMarcharACocina={onMarcharACocina}
                onListo={onListo}
                onEditar={onEditar}
                onCancelar={onCancelar}
              />
            ))}
          </div>
        ) : (
          pedidos.map(pedido => (
            <OrderCard
              key={pedido.id}
              pedido={{ ...pedido, onCobrar }}
              onMarcharACocina={onMarcharACocina}
              onListo={onListo}
              onEditar={onEditar}
              onCancelar={onCancelar}
            />
          ))
        )}
      </div>

      <div className="border-t border-slate-300 p-2 bg-white flex-shrink-0">
        <Pagination>
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious href="#" className="text-xs h-7 px-2" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive className="text-xs h-7 w-7">
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" className="text-xs h-7 w-7">
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" className="text-xs h-7 w-7">
                3
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" className="text-xs h-7 px-2" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

// Componente ProductCard con controles de cantidad
function ProductCard({ producto, onAgregar }) {
  const [cantidad, setCantidad] = useState(1);

  const incrementar = () => setCantidad(prev => prev + 1);
  const decrementar = () => {
    if (cantidad > 1) setCantidad(prev => prev - 1);
  };

  const handleAgregar = () => {
    onAgregar(producto, cantidad);
    setCantidad(1); // Resetear cantidad después de agregar
  };

  return (
    <Card className="hover:shadow-lg transition-all p-3 text-center border-2 hover:border-green-400 flex flex-col">
      <div className="text-4xl mb-2">{producto.imagen}</div>
      <h4 className="font-semibold text-xs text-slate-700 mb-1 line-clamp-2 min-h-[32px]">
        {producto.nombre}
      </h4>
      <p className="text-sm font-bold text-green-700 mb-3">
        ${producto.precio}
      </p>

      {/* Mostrar badge si tiene extras */}
      {producto.extrasDisponibles && producto.extrasDisponibles.length > 0 && (
        <Badge variant="outline" className="text-xs mb-2 bg-yellow-50 text-yellow-700 border-yellow-300">
          ⭐ Tiene extras
        </Badge>
      )}

      {/* Controles de cantidad */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 w-7 p-0 border-2 border-green-300"
          onClick={decrementar}
        >
          -
        </Button>
        <span className="font-bold text-lg w-8 text-center">{cantidad}</span>
        <Button
          size="sm"
          variant="outline"
          className="h-7 w-7 p-0 border-2 border-green-300"
          onClick={incrementar}
        >
          +
        </Button>
      </div>

      {/* Botón Agregar */}
      <Button
        size="sm"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
        onClick={handleAgregar}
      >
        <Plus className="h-3 w-3 mr-1" />
        Agregar
      </Button>
    </Card>
  );
}

function VentasContent() {
  const [pedidos, setPedidos] = useState(PEDIDOS_MOCK);
  const [pedidosEntregados, setPedidosEntregados] = useState([]);
  const [demoraCocina, setDemoraCocina] = useState(20);

  // Estados del modal Nuevo Pedido
  const [modalNuevoPedido, setModalNuevoPedido] = useState(false);
  const [pasoModal, setPasoModal] = useState(1); // 1: Armar Pedido, 2: Datos Cliente

  // Paso 1: Armar Pedido
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(1);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [carrito, setCarrito] = useState([]);

  // Modal de extras
  const [modalExtras, setModalExtras] = useState(false);
  const [productoParaExtras, setProductoParaExtras] = useState(null);
  const [cantidadProducto, setCantidadProducto] = useState(1);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState([]);
  const [editandoItemCarrito, setEditandoItemCarrito] = useState(null); // null o carritoId

  // Control de unidades múltiples para extras
  const [unidadActual, setUnidadActual] = useState(1); // Qué unidad estamos configurando ahora
  const [totalUnidades, setTotalUnidades] = useState(1); // Cuántas unidades en total
  const [unidadesConfiguradas, setUnidadesConfiguradas] = useState([]); // Array de unidades ya configuradas

  // Paso 2: Datos Cliente
  const [tipoEntrega, setTipoEntrega] = useState('retiro'); // 'retiro' o 'delivery'
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

  // Otros campos del pedido
  const [origen, setOrigen] = useState('mostrador');
  const [tipoPedido, setTipoPedido] = useState('ya');
  const [horaProgramada, setHoraProgramada] = useState('');
  const [medioPago, setMedioPago] = useState('efectivo');
  const [estadoPago, setEstadoPago] = useState('pending');

  // Modal de cobro
  const [modalCobro, setModalCobro] = useState(false);

  // Modal de pedidos entregados
  const [modalPedidosEntregados, setModalPedidosEntregados] = useState(false);

  // Modal de cancelación de pedido
  const [pedidoCancelar, setPedidoCancelar] = useState(null);
  const [pedidoACobrar, setPedidoACobrar] = useState(null);
  const [datosCobro, setDatosCobro] = useState({
    medioPago: 'efectivo',
    montoRecibido: 0,
    generarComprobante: false,
    pagosMultiples: [] // [{ medio: 'efectivo', monto: 1000 }]
  });

  // Configuración de sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requiere mover 8px antes de activar el drag
      },
    })
  );

  // Función para manejar el drop
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const pedidoId = active.data.current.pedido.id;
    const estadoActual = active.data.current.estado;
    const estadoDestino = over.id;

    // Solo actualizar si el estado cambió
    if (estadoActual !== estadoDestino) {
      setPedidos(prev =>
        prev.map(p =>
          p.id === pedidoId ? { ...p, estado: estadoDestino } : p
        )
      );
    }
  };

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

  const handleMarcharACocina = (pedidoId) => {
    setPedidos(prev =>
      prev.map(p =>
        p.id === pedidoId ? { ...p, estado: 'en_cocina' } : p
      )
    );
  };

  const handleListo = (pedidoId) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (pedido) {
      setPedidosEntregados(prev => [...prev, { ...pedido, horaEntrega: new Date() }]);
      setPedidos(prev => prev.filter(p => p.id !== pedidoId));
      alert(`Pedido ${pedidoId} marcado como LISTO/ENTREGADO`);
    }
  };

  const handleEditar = (pedido) => {
    alert(`Editar pedido ${pedido.id} (Modal por implementar)`);
  };

  const handleCancelar = (pedido) => {
    setPedidoCancelar(pedido);
  };

  const confirmarCancelacion = () => {
    if (pedidoCancelar) {
      setPedidos(prev => prev.filter(p => p.id !== pedidoCancelar.id));
      setPedidoCancelar(null);
    }
  };

  const handleNuevoPedido = () => {
    setModalNuevoPedido(true);
  };

  const handleModoCocina = () => {
    alert('Modo Cocina (Modal por implementar)');
  };

  // Funciones del modal Nuevo Pedido

  // Abrir modal de extras (para agregar o editar)
  const abrirModalExtras = (producto, cantidad, itemCarrito = null) => {
    setProductoParaExtras(producto);
    setCantidadProducto(cantidad);
    setExtrasSeleccionados(itemCarrito ? [...itemCarrito.extrasSeleccionados] : []);
    setEditandoItemCarrito(itemCarrito ? itemCarrito.carritoId : null);
    setModalExtras(true);
  };

  // Agregar producto al carrito (con o sin extras)
  const agregarProductoConExtras = (producto, cantidad) => {
    // Si el producto tiene extras disponibles, abrir modal para configurar cada unidad
    if (producto.extrasDisponibles && producto.extrasDisponibles.length > 0) {
      // Iniciar flujo de configuración múltiple
      setProductoParaExtras(producto);
      setCantidadProducto(cantidad);
      setTotalUnidades(cantidad);
      setUnidadActual(1);
      setUnidadesConfiguradas([]);
      setExtrasSeleccionados([]);
      setEditandoItemCarrito(null);
      setModalExtras(true);
    } else {
      // Agregar directamente sin extras
      setCarrito([...carrito, {
        ...producto,
        cantidad: cantidad,
        extrasSeleccionados: [],
        carritoId: Date.now() + Math.random()
      }]);
    }
  };

  // Confirmar extras y agregar/actualizar en carrito
  const confirmarExtras = () => {
    if (editandoItemCarrito) {
      // Estamos editando un item existente
      setCarrito(carrito.map(item =>
        item.carritoId === editandoItemCarrito
          ? { ...item, extrasSeleccionados: [...extrasSeleccionados] }
          : item
      ));
      cerrarModalExtras();
    } else {
      // Agregando nuevos productos
      // Guardar la configuración de esta unidad
      const nuevaUnidad = {
        producto: productoParaExtras,
        extras: [...extrasSeleccionados]
      };
      const unidadesActualizadas = [...unidadesConfiguradas, nuevaUnidad];

      // Verificar si hay más unidades por configurar
      if (unidadActual < totalUnidades) {
        // Hay más unidades, preparar para la siguiente
        setUnidadesConfiguradas(unidadesActualizadas);
        setUnidadActual(unidadActual + 1);
        setExtrasSeleccionados([]); // Limpiar selección para la siguiente unidad
        // El modal sigue abierto para la siguiente unidad
      } else {
        // Esta era la última unidad, agregar todas al carrito
        const nuevosItems = unidadesActualizadas.map(unidad => ({
          ...unidad.producto,
          cantidad: 1, // Cada unidad es un item separado
          extrasSeleccionados: unidad.extras,
          carritoId: Date.now() + Math.random()
        }));
        setCarrito([...carrito, ...nuevosItems]);
        cerrarModalExtras();
      }
    }
  };

  // Cerrar modal de extras
  const cerrarModalExtras = () => {
    setModalExtras(false);
    setProductoParaExtras(null);
    setCantidadProducto(1);
    setExtrasSeleccionados([]);
    setEditandoItemCarrito(null);
    // Resetear control de unidades múltiples
    setUnidadActual(1);
    setTotalUnidades(1);
    setUnidadesConfiguradas([]);
  };

  // Toggle extra (agregar o quitar de la lista)
  const toggleExtra = (extra) => {
    const existe = extrasSeleccionados.find(e => e.id === extra.id);
    if (existe) {
      setExtrasSeleccionados(extrasSeleccionados.filter(e => e.id !== extra.id));
    } else {
      setExtrasSeleccionados([...extrasSeleccionados, extra]);
    }
  };

  // Editar extras de un item del carrito
  const editarExtrasItem = (item) => {
    abrirModalExtras(item, item.cantidad, item);
  };

  // Modificar cantidad en carrito
  const modificarCantidad = (carritoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setCarrito(carrito.filter(item => item.carritoId !== carritoId));
    } else {
      setCarrito(carrito.map(item =>
        item.carritoId === carritoId
          ? { ...item, cantidad: nuevaCantidad }
          : item
      ));
    }
  };

  // Eliminar del carrito
  const eliminarDelCarrito = (carritoId) => {
    setCarrito(carrito.filter(item => item.carritoId !== carritoId));
  };

  // Calcular subtotal
  const calcularSubtotal = () => {
    return carrito.reduce((sum, item) => {
      const precioBase = item.precio * item.cantidad;
      const precioExtras = item.extrasSeleccionados.reduce((s, e) => s + e.precio, 0) * item.cantidad;
      return sum + precioBase + precioExtras;
    }, 0);
  };

  // Calcular envío
  const calcularEnvio = () => {
    return tipoEntrega === 'delivery' && cliente.direccion.calle.trim() !== '' ? 300 : 0;
  };

  // Calcular total
  const calcularTotal = () => {
    return calcularSubtotal() + calcularEnvio();
  };

  // Resetear modal
  const resetearModal = () => {
    setPasoModal(1);
    setCategoriaSeleccionada(1);
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
  };

  // Crear pedido
  const crearPedido = () => {
    if (!cliente.nombre || !cliente.telefono) {
      alert('Nombre y teléfono son obligatorios');
      return;
    }
    if (carrito.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    const nuevoPedido = {
      id: `P${String(pedidos.length + 1).padStart(3, '0')}`,
      clienteNombre: cliente.nombre,
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
      tipoEntrega: tipoEntrega,
      medioPago: medioPago
    };

    // Si el pedido ya está pagado, abrir modal de cobro
    if (estadoPago === 'paid') {
      setPedidoACobrar(nuevoPedido);
      setDatosCobro({
        medioPago: medioPago,
        montoRecibido: nuevoPedido.total,
        generarComprobante: false,
        pagosMultiples: []
      });
      setModalCobro(true);
    } else {
      // Solo crear el pedido sin cobrar
      setPedidos([...pedidos, nuevoPedido]);
      setModalNuevoPedido(false);
      resetearModal();
      alert(`Pedido ${nuevoPedido.id} creado exitosamente!`);
    }
  };

  // Abrir modal de cobro para pedido existente
  const abrirModalCobro = (pedido) => {
    setPedidoACobrar(pedido);
    setDatosCobro({
      medioPago: pedido.medioPago || 'efectivo',
      montoRecibido: pedido.total,
      generarComprobante: false,
      pagosMultiples: []
    });
    setModalCobro(true);
  };

  // Confirmar cobro
  const confirmarCobro = () => {
    // Calcular total de pagos múltiples
    const totalPagosMultiples = datosCobro.pagosMultiples.reduce((sum, p) => sum + p.monto, 0);
    const totalCobrado = totalPagosMultiples > 0 ? totalPagosMultiples : datosCobro.montoRecibido;

    if (totalCobrado < pedidoACobrar.total) {
      alert(`Falta cobrar $${(pedidoACobrar.total - totalCobrado).toLocaleString('es-AR')}`);
      return;
    }

    // Si es un pedido nuevo (viene del modal de nuevo pedido)
    if (!pedidos.find(p => p.id === pedidoACobrar.id)) {
      const pedidoCobrado = {
        ...pedidoACobrar,
        paymentStatus: 'paid',
        medioPago: datosCobro.pagosMultiples.length > 0 ? 'múltiple' : datosCobro.medioPago
      };
      setPedidos([...pedidos, pedidoCobrado]);
      setModalNuevoPedido(false);
      resetearModal();
    } else {
      // Actualizar pedido existente a pagado
      setPedidos(prev =>
        prev.map(p =>
          p.id === pedidoACobrar.id
            ? {
              ...p,
              paymentStatus: 'paid',
              medioPago: datosCobro.pagosMultiples.length > 0 ? 'múltiple' : datosCobro.medioPago
            }
            : p
        )
      );
    }

    // TODO: Registrar venta en la base de datos
    // TODO: Generar comprobante si datosCobro.generarComprobante === true

    setModalCobro(false);
    setPedidoACobrar(null);
    setDatosCobro({
      medioPago: 'efectivo',
      montoRecibido: 0,
      generarComprobante: false,
      pagosMultiples: []
    });

    const vuelto = totalCobrado - pedidoACobrar.total;
    if (vuelto > 0 && datosCobro.medioPago === 'efectivo') {
      alert(`Cobro exitoso! Vuelto: $${vuelto.toLocaleString('es-AR')}`);
    } else {
      alert('Cobro exitoso! Venta registrada.');
    }
  };

  // Agregar pago múltiple
  const agregarPagoMultiple = () => {
    if (!datosCobro.medioPago || datosCobro.montoRecibido <= 0) return;

    setDatosCobro({
      ...datosCobro,
      pagosMultiples: [...datosCobro.pagosMultiples, {
        medio: datosCobro.medioPago,
        monto: datosCobro.montoRecibido
      }],
      montoRecibido: 0
    });
  };

  // Eliminar pago múltiple
  const eliminarPagoMultiple = (index) => {
    setDatosCobro({
      ...datosCobro,
      pagosMultiples: datosCobro.pagosMultiples.filter((_, i) => i !== index)
    });
  };

  // Filtrar productos
  const productosFiltrados = PRODUCTOS_MOCK.filter(p => {
    const matchCategoria = p.categoria === categoriaSeleccionada;
    const matchBusqueda = p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  const pedidosRecibidos = pedidos.filter(p => p.estado === 'recibido');
  const pedidosEnCocina = pedidos.filter(p => p.estado === 'en_cocina');

  return (
    <>
      <Head>
        <title>Pedidos - El Chalito</title>
      </Head>

      <div className="min-h-screen flex flex-col">
        <NavBar />

        <main className="flex-1 bg-gray-50 flex flex-col min-h-0">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <TopBar
              demoraCocina={demoraCocina}
              setDemoraCocina={setDemoraCocina}
              onNuevoPedido={handleNuevoPedido}
              onModoCocina={handleModoCocina}
            />
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 min-h-0">
              <div className="grid grid-cols-12 gap-4 h-full">
                <div className="col-span-4 min-h-0">
                  <Column
                    titulo="RECIBIDOS"
                    color="amarillo"
                    pedidos={pedidosRecibidos}
                    onMarcharACocina={handleMarcharACocina}
                    onListo={handleListo}
                    onEditar={handleEditar}
                    onCancelar={handleCancelar}
                    onCobrar={abrirModalCobro}
                    estado="recibido"
                  />
                </div>

                <div className="col-span-8 min-h-0">
                  <Column
                    titulo="EN PREPARACIÓN"
                    color="azul"
                    pedidos={pedidosEnCocina}
                    onMarcharACocina={handleMarcharACocina}
                    onListo={handleListo}
                    onEditar={handleEditar}
                    onCancelar={handleCancelar}
                    onCobrar={abrirModalCobro}
                    dosColumnas={true}
                    estado="en_cocina"
                  />
                </div>
              </div>
            </div>
          </DndContext>
        </main>

        <Footer />
      </div>

      {/* Modal: Nuevo Pedido */}
      <Dialog open={modalNuevoPedido} onOpenChange={(open) => {
        setModalNuevoPedido(open);
        if (!open) resetearModal();
      }}>
        <DialogContent className="max-w-7xl h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-3xl font-bold text-blue-700 flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              {pasoModal === 1 ? 'Nuevo Pedido - Armar Pedido' : 'Nuevo Pedido - Datos del Cliente'}
            </DialogTitle>
          </DialogHeader>

          {pasoModal === 1 ? (
            // PASO 1: Armar Pedido - Estilo IndexGEM
            <div className="grid grid-cols-12 gap-4 py-4 flex-1 min-h-0">
              {/* COLUMNA 1: CATEGORÍAS */}
              <div className="col-span-2">
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 h-full">
                  <h3 className="text-lg font-bold text-purple-800 mb-3">📂 Categorías</h3>
                  <div className="space-y-2">
                    {CATEGORIAS_MOCK.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoriaSeleccionada(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm font-medium ${categoriaSeleccionada === cat.id
                            ? `${cat.color} text-white shadow-md`
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cat.icono}</span>
                          <span className="text-xs font-semibold">{cat.nombre}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* COLUMNA 2: PRODUCTOS */}
              <div className="col-span-6 flex flex-col min-h-0">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex flex-col h-full">
                  <h3 className="text-lg font-bold text-green-800 mb-3 flex-shrink-0">🍔 Productos</h3>

                  {/* Buscador de productos */}
                  <div className="relative mb-3 flex-shrink-0">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Buscar producto por nombre..."
                      value={busquedaProducto}
                      onChange={(e) => setBusquedaProducto(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Grid de productos con scroll */}
                  <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                    <div className="grid grid-cols-4 gap-3">
                      {productosFiltrados.map(producto => (
                        <ProductCard
                          key={producto.id}
                          producto={producto}
                          onAgregar={agregarProductoConExtras}
                        />
                      ))}
                    </div>

                    {productosFiltrados.length === 0 && (
                      <div className="text-center py-12 text-slate-400">
                        <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No se encontraron productos</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* COLUMNA 3: CARRITO */}
              <div className="col-span-4 flex flex-col min-h-0">
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 flex flex-col h-full">
                  <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center justify-between flex-shrink-0">
                    <span className="flex items-center gap-2">
                      🛒 Carrito
                    </span>
                    <Badge className="bg-orange-500 text-white">{carrito.length}</Badge>
                  </h3>

                  {carrito.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                      <div className="text-center">
                        <ShoppingCart className="h-16 w-16 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Carrito vacío</p>
                        <p className="text-xs mt-1">Selecciona productos para agregar</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-0 pr-2">
                        {carrito.map(item => (
                          <div key={item.carritoId} className="bg-white border-2 border-orange-200 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{item.nombre}</p>
                                {/* Badge de extras */}
                                {item.extrasDisponibles && item.extrasDisponibles.length > 0 && (
                                  <Badge variant="outline" className="text-xs mt-1 bg-yellow-50 text-yellow-700 border-yellow-300">
                                    ⭐ {item.extrasSeleccionados.length}/{item.extrasDisponibles.length} extras
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-1 ml-2">
                                {/* Botón Editar (solo si tiene extras disponibles) */}
                                {item.extrasDisponibles && item.extrasDisponibles.length > 0 && (
                                  <button
                                    onClick={() => editarExtrasItem(item)}
                                    className="text-blue-500 hover:text-blue-700"
                                    title="Editar extras"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => eliminarDelCarrito(item.carritoId)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 w-7 p-0 border-2 border-orange-300 hover:bg-orange-100"
                                  onClick={() => modificarCantidad(item.carritoId, item.cantidad - 1)}
                                >
                                  -
                                </Button>
                                <span className="font-bold text-lg w-8 text-center">{item.cantidad}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 w-7 p-0 border-2 border-orange-300 hover:bg-orange-100"
                                  onClick={() => modificarCantidad(item.carritoId, item.cantidad + 1)}
                                >
                                  +
                                </Button>
                              </div>
                              <p className="font-bold text-green-700">
                                ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                              </p>
                            </div>

                            {/* Mostrar extras si los hay */}
                            {item.extrasSeleccionados.length > 0 && (
                              <div className="mt-2 pt-2 border-t text-xs text-slate-600">
                                <p className="font-medium">Extras:</p>
                                {item.extrasSeleccionados.map((extra, idx) => (
                                  <p key={idx}>+ {extra.nombre} (${extra.precio})</p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <Separator className="my-3 flex-shrink-0" />
                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4 flex-shrink-0">
                        <p className="text-sm font-medium mb-1">SUBTOTAL</p>
                        <p className="text-3xl font-bold">
                          ${calcularSubtotal().toLocaleString('es-AR')}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // PASO 2: Datos del Cliente
            <div className="py-4 space-y-6 overflow-y-auto flex-1 min-h-0">
              {/* Datos Básicos del Cliente */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-800 mb-4">👤 Datos del Cliente</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Nombre del Cliente *</Label>
                    <Input
                      value={cliente.nombre}
                      onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                      placeholder="Ej: Juan Pérez"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Teléfono *</Label>
                    <Input
                      value={cliente.telefono}
                      onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                      placeholder="Ej: 3815-123456"
                      className="mt-1"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-sm font-semibold">Email (opcional)</Label>
                    <Input
                      type="email"
                      value={cliente.email}
                      onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                      placeholder="Ej: cliente@email.com"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Tipo de Entrega */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-purple-800 mb-4">🚚 Tipo de Entrega</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={tipoEntrega === 'retiro' ? 'default' : 'outline'}
                    className={`h-20 text-lg font-bold ${tipoEntrega === 'retiro' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                    onClick={() => setTipoEntrega('retiro')}
                  >
                    <Home className="h-6 w-6 mr-2" />
                    RETIRO
                  </Button>
                  <Button
                    variant={tipoEntrega === 'delivery' ? 'default' : 'outline'}
                    className={`h-20 text-lg font-bold ${tipoEntrega === 'delivery' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={() => setTipoEntrega('delivery')}
                  >
                    <Bike className="h-6 w-6 mr-2" />
                    DELIVERY
                  </Button>
                </div>
              </div>

              {/* Campos de Dirección (solo si es Delivery) */}
              {tipoEntrega === 'delivery' && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-green-800 mb-4">📍 Dirección de Entrega</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">Calle *</Label>
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
                      <Label className="text-sm font-semibold">Número/Altura *</Label>
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
                      <Label className="text-sm font-semibold">Edificio/Casa</Label>
                      <Input
                        value={cliente.direccion.edificio}
                        onChange={(e) => setCliente({
                          ...cliente,
                          direccion: { ...cliente.direccion, edificio: e.target.value }
                        })}
                        placeholder="Ej: Torre A"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Piso/Depto</Label>
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
                      <Label className="text-sm font-semibold">Observaciones</Label>
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
              )}

              {/* Configuración Adicional */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-slate-800 mb-4">⚙️ Configuración del Pedido</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Origen del Pedido</Label>
                    <Select value={origen} onValueChange={setOrigen}>
                      <SelectTrigger className="mt-1">
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
                    <Label className="text-sm font-semibold">¿Cuándo?</Label>
                    <Select value={tipoPedido} onValueChange={setTipoPedido}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ya">⚡ Lo antes posible</SelectItem>
                        <SelectItem value="programado">🕐 Programado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {tipoPedido === 'programado' && (
                    <div>
                      <Label className="text-sm font-semibold">Hora Programada</Label>
                      <Input
                        type="time"
                        value={horaProgramada}
                        onChange={(e) => setHoraProgramada(e.target.value)}
                        className="mt-1 font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-semibold">Medio de Pago</Label>
                    <Select value={medioPago} onValueChange={setMedioPago}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                        <SelectItem value="debito">💳 Débito</SelectItem>
                        <SelectItem value="credito">💳 Crédito</SelectItem>
                        <SelectItem value="transferencia">🏦 Transferencia</SelectItem>
                        <SelectItem value="mercadopago">📱 MercadoPago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Estado de Pago</Label>
                    <Select value={estadoPago} onValueChange={setEstadoPago}>
                      <SelectTrigger className="mt-1">
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

              {/* Resumen Total */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">💰 Resumen Total</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal:</span>
                    <span className="font-bold">${calcularSubtotal().toLocaleString('es-AR')}</span>
                  </div>
                  {calcularEnvio() > 0 && (
                    <div className="flex justify-between text-lg border-t border-blue-400 pt-2">
                      <span>Envío:</span>
                      <span className="font-bold">${calcularEnvio().toLocaleString('es-AR')}</span>
                    </div>
                  )}
                  <Separator className="bg-blue-400" />
                  <div className="flex justify-between text-2xl font-bold border-t-2 border-white pt-3">
                    <span>TOTAL:</span>
                    <span>${calcularTotal().toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <DialogFooter className="flex justify-between gap-3 pt-4 border-t flex-shrink-0">
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
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
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
                  onClick={crearPedido}
                  disabled={!cliente.nombre || !cliente.telefono || (tipoEntrega === 'delivery' && !cliente.direccion.calle)}
                  className="bg-green-600 hover:bg-green-700 gap-2"
                >
                  <Check className="h-5 w-5" />
                  Crear Pedido
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Extras */}
      <Dialog open={modalExtras} onOpenChange={(open) => {
        if (!open) cerrarModalExtras();
      }}>
        <DialogContent className="max-w-2xl h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-purple-700 flex items-center gap-2">
              ⭐ {editandoItemCarrito
                ? 'Editar Extras'
                : totalUnidades > 1
                  ? `Agregar Extras - Unidad ${unidadActual} de ${totalUnidades}`
                  : 'Agregar Extras'
              }
            </DialogTitle>
          </DialogHeader>

          {productoParaExtras && (
            <div className="py-4 overflow-y-auto flex-1 min-h-0">
              {/* Mensaje informativo para múltiples unidades */}
              {!editandoItemCarrito && totalUnidades > 1 && (
                <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 font-medium">
                    ℹ️ Estás agregando {totalUnidades} unidades. Configura los extras para cada una individualmente.
                    {unidadesConfiguradas.length > 0 && (
                      <span className="block mt-1 text-xs text-blue-600">
                        Unidades ya configuradas: {unidadesConfiguradas.length}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Info del producto */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{productoParaExtras.imagen}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800">{productoParaExtras.nombre}</h3>
                    <p className="text-sm text-slate-600">Precio base: ${productoParaExtras.precio}</p>
                    <p className="text-sm text-slate-600">
                      {editandoItemCarrito
                        ? `Cantidad: ${cantidadProducto} ${cantidadProducto > 1 ? 'unidades' : 'unidad'}`
                        : totalUnidades > 1
                          ? `Configurando: 1 unidad (de ${totalUnidades} totales)`
                          : 'Cantidad: 1 unidad'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de extras disponibles */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <h4 className="font-bold text-yellow-800 mb-3">Selecciona los extras que deseas agregar:</h4>
                <div className="space-y-3">
                  {productoParaExtras.extrasDisponibles.map(extra => {
                    const isSelected = extrasSeleccionados.find(e => e.id === extra.id);
                    return (
                      <div
                        key={extra.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                            ? 'bg-yellow-100 border-yellow-400'
                            : 'bg-white border-yellow-200 hover:border-yellow-300'
                          }`}
                        onClick={() => toggleExtra(extra)}
                      >
                        <Checkbox
                          checked={!!isSelected}
                          onCheckedChange={() => toggleExtra(extra)}
                          className="border-2"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{extra.nombre}</p>
                          <p className="text-sm text-slate-600">+${extra.precio}</p>
                        </div>
                        {isSelected && (
                          <Badge className="bg-green-500">Seleccionado</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen de precio */}
              <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-800 mb-2">Resumen:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Precio base {editandoItemCarrito ? `x ${cantidadProducto}` : 'x 1'}:</span>
                    <span className="font-semibold">
                      ${editandoItemCarrito
                        ? (productoParaExtras.precio * cantidadProducto).toLocaleString('es-AR')
                        : productoParaExtras.precio.toLocaleString('es-AR')
                      }
                    </span>
                  </div>
                  {extrasSeleccionados.length > 0 && (
                    <>
                      <div className="border-t pt-1 mt-1">
                        <p className="font-medium text-blue-700 mb-1">Extras seleccionados:</p>
                        {extrasSeleccionados.map(extra => (
                          <div key={extra.id} className="flex justify-between text-xs ml-2">
                            <span>+ {extra.nombre} {editandoItemCarrito ? `x ${cantidadProducto}` : 'x 1'}:</span>
                            <span>
                              ${editandoItemCarrito
                                ? (extra.precio * cantidadProducto).toLocaleString('es-AR')
                                : extra.precio.toLocaleString('es-AR')
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg font-bold text-blue-700">
                    <span>TOTAL {totalUnidades > 1 && !editandoItemCarrito ? '(esta unidad)' : ''}:</span>
                    <span>
                      ${editandoItemCarrito
                        ? (
                          (productoParaExtras.precio * cantidadProducto) +
                          (extrasSeleccionados.reduce((sum, e) => sum + e.precio, 0) * cantidadProducto)
                        ).toLocaleString('es-AR')
                        : (
                          productoParaExtras.precio +
                          extrasSeleccionados.reduce((sum, e) => sum + e.precio, 0)
                        ).toLocaleString('es-AR')
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={cerrarModalExtras}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarExtras}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              {editandoItemCarrito
                ? 'Guardar Cambios'
                : totalUnidades > 1 && unidadActual < totalUnidades
                  ? `Continuar a Unidad ${unidadActual + 1}`
                  : totalUnidades > 1 && unidadActual === totalUnidades
                    ? 'Finalizar y Agregar al Carrito'
                    : 'Agregar al Carrito'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Cobro */}
      <Dialog open={modalCobro} onOpenChange={(open) => {
        if (!open) {
          setModalCobro(false);
          setPedidoACobrar(null);
        }
      }}>
        <DialogContent className="max-w-3xl h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-3xl font-bold text-green-700 flex items-center gap-2">
              💰 Cobrar Pedido
            </DialogTitle>
          </DialogHeader>

          {pedidoACobrar && (
            <div className="py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
              {/* Resumen del pedido */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-slate-800 mb-3">📋 Resumen del Pedido</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Pedido:</span>
                    <span>#{pedidoACobrar.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Cliente:</span>
                    <span>{pedidoACobrar.clienteNombre}</span>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-slate-600">Items:</p>
                    {pedidoACobrar.items.map((item, idx) => (
                      <p key={idx} className="text-sm ml-2">
                        {item.cantidad}x {item.nombre}
                      </p>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-green-700">
                    <span>TOTAL A COBRAR:</span>
                    <span>${pedidoACobrar.total.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>

              {/* Medio de pago */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-800 mb-3">💳 Medio de Pago</h3>
                <Select
                  value={datosCobro.medioPago}
                  onValueChange={(value) => setDatosCobro({ ...datosCobro, medioPago: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                    <SelectItem value="debito">💳 Débito</SelectItem>
                    <SelectItem value="credito">💳 Crédito</SelectItem>
                    <SelectItem value="transferencia">🏦 Transferencia</SelectItem>
                    <SelectItem value="mercadopago">📱 MercadoPago</SelectItem>
                  </SelectContent>
                </Select>

                {/* Monto recibido (si es efectivo) */}
                {datosCobro.medioPago === 'efectivo' && datosCobro.pagosMultiples.length === 0 && (
                  <div className="mt-4">
                    <Label>Monto Recibido</Label>
                    <Input
                      type="number"
                      value={datosCobro.montoRecibido || ''}
                      onChange={(e) => setDatosCobro({ ...datosCobro, montoRecibido: parseFloat(e.target.value) || 0 })}
                      placeholder="Ej: 5000"
                      className="mt-1"
                    />
                    {datosCobro.montoRecibido > pedidoACobrar.total && (
                      <div className="mt-2 bg-green-100 border border-green-300 rounded p-2">
                        <p className="text-sm font-semibold text-green-800">
                          Vuelto: ${(datosCobro.montoRecibido - pedidoACobrar.total).toLocaleString('es-AR')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pagos múltiples */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-purple-800 mb-3">💵💳 Pagos Múltiples (Opcional)</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Si el cliente paga con múltiples medios (ej: efectivo + tarjeta), agrega cada pago aquí:
                </p>

                {datosCobro.pagosMultiples.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {datosCobro.pagosMultiples.map((pago, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                        <span className="text-sm">
                          <strong>{pago.medio}</strong>: ${pago.monto.toLocaleString('es-AR')}
                        </span>
                        <button
                          onClick={() => eliminarPagoMultiple(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total cobrado:</span>
                      <span className="text-green-700">
                        ${datosCobro.pagosMultiples.reduce((sum, p) => sum + p.monto, 0).toLocaleString('es-AR')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Falta:</span>
                      <span className={datosCobro.pagosMultiples.reduce((sum, p) => sum + p.monto, 0) >= pedidoACobrar.total ? 'text-green-700' : 'text-red-700'}>
                        ${Math.max(0, pedidoACobrar.total - datosCobro.pagosMultiples.reduce((sum, p) => sum + p.monto, 0)).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={datosCobro.montoRecibido || ''}
                    onChange={(e) => setDatosCobro({ ...datosCobro, montoRecibido: parseFloat(e.target.value) || 0 })}
                    placeholder="Monto"
                    className="flex-1"
                  />
                  <Button
                    onClick={agregarPagoMultiple}
                    disabled={!datosCobro.montoRecibido || datosCobro.montoRecibido <= 0}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>

              {/* Generar comprobante */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={datosCobro.generarComprobante}
                    onCheckedChange={(checked) => setDatosCobro({ ...datosCobro, generarComprobante: checked })}
                  />
                  <Label className="text-sm font-semibold cursor-pointer">
                    📄 Generar comprobante/ticket
                  </Label>
                </div>
                <p className="text-xs text-slate-600 ml-6 mt-1">
                  Se imprimirá un comprobante del pago para el cliente
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setModalCobro(false);
                setPedidoACobrar(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarCobro}
              className="bg-green-600 hover:bg-green-700"
              disabled={!pedidoACobrar}
            >
              <Check className="h-5 w-5 mr-2" />
              Confirmar Cobro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Pedidos Entregados */}
      <Dialog open={modalPedidosEntregados} onOpenChange={setModalPedidosEntregados}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-green-600" />
              Pedidos Entregados
              <Badge className="bg-green-600 text-white ml-2 text-xs">
                {pedidosEntregados.length}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="py-3 overflow-y-auto flex-1 min-h-0">
            {pedidosEntregados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No hay pedidos entregados
                </h3>
                <p className="text-slate-500">
                  Los pedidos que marques como listos y cobrados aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {pedidosEntregados.map((pedido) => (
                  <Card key={pedido.id} className="border border-green-300 bg-green-50/40">
                    <CardContent className="p-2.5">
                      {/* Header compacto */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-slate-800">#{pedido.id}</span>
                          {pedido.tipoEntrega === 'delivery' && (
                            <Bike className="h-3 w-3 text-blue-600" />
                          )}
                        </div>
                        <Badge className="bg-green-600 text-white text-xs px-1.5 py-0">
                          ✓
                        </Badge>
                      </div>

                      {/* Cliente */}
                      <div className="mb-2">
                        <p className="text-sm font-semibold text-slate-700 truncate">{pedido.clienteNombre}</p>
                        <p className="text-xs text-slate-500">
                          {pedido.horaEntrega && new Date(pedido.horaEntrega).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Items - Lista compacta */}
                      <div className="space-y-0.5 mb-2">
                        {pedido.items.map((item, idx) => (
                          <div key={idx} className="text-xs text-slate-700">
                            <span className="font-bold text-green-600">{item.cantidad}x</span> {item.nombre}
                          </div>
                        ))}
                      </div>

                      {/* Total y método de pago */}
                      <div className="pt-2 border-t border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-green-700">
                            ${pedido.total.toLocaleString('es-AR')}
                          </span>
                          <span className="text-xs text-slate-500">
                            {pedido.paymentMethod === 'efectivo' && '💵'}
                            {pedido.paymentMethod === 'debito' && '💳'}
                            {pedido.paymentMethod === 'credito' && '💳'}
                            {pedido.paymentMethod === 'transferencia' && '📱'}
                            {!pedido.paymentMethod && '💵'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 pt-3 border-t">
            <Button
              variant="outline"
              onClick={() => setModalPedidosEntregados(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Cancelación */}
      <AlertDialog open={pedidoCancelar !== null} onOpenChange={(open) => !open && setPedidoCancelar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              {pedidoCancelar && (
                <>
                  Estás por cancelar el pedido <strong>#{pedidoCancelar.id}</strong> de <strong>{pedidoCancelar.cliente}</strong>.
                  <br /><br />
                  Esta acción eliminará el pedido del sistema. ¿Deseas continuar?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener pedido</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarCancelacion}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, cancelar pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setModalPedidosEntregados(true)}
          variant="outline"
          className="border-2 border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700 font-bold shadow-xl bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
          size="lg"
        >
          <Package className="h-5 w-5 mr-2" />
          Ver Pedidos Entregados ({pedidosEntregados.length})
        </Button>
      </div>
    </>
  );
}

export default function VentasPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <VentasContent />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
