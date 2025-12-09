import { useState } from 'react';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Plus,
  X,
  Search,
  ShoppingCart,
  Trash2,
  Edit2,
  Home,
  Bike,
  DollarSign,
  CreditCard,
  Smartphone,
  Banknote
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
  { id: 1, nombre: 'Lomito Completo', precio: 2500, categoria: 1, imagen: '🍔', elaborado: true },
  { id: 2, nombre: 'Hamburguesa Completa', precio: 1800, categoria: 1, imagen: '🍔', elaborado: true },
  { id: 3, nombre: 'Hamburguesa Simple', precio: 1500, categoria: 1, imagen: '🍔', elaborado: true },
  { id: 4, nombre: 'Pizza Muzzarella', precio: 3000, categoria: 2, imagen: '🍕', elaborado: true },
  { id: 5, nombre: 'Pizza Napolitana', precio: 3200, categoria: 2, imagen: '🍕', elaborado: true },
  { id: 6, nombre: 'Sandwich de Bondiola', precio: 1200, categoria: 3, imagen: '🥪', elaborado: true },
  { id: 7, nombre: 'Sandwich de Vacío', precio: 1600, categoria: 3, imagen: '🥪', elaborado: true },
  { id: 8, nombre: 'Coca Cola 500ml', precio: 600, categoria: 4, imagen: '🥤', elaborado: false },
  { id: 9, nombre: 'Coca Cola 1.5L', precio: 1200, categoria: 4, imagen: '🥤', elaborado: false },
  { id: 10, nombre: 'Agua Mineral', precio: 500, categoria: 4, imagen: '💧', elaborado: false },
  { id: 11, nombre: 'Flan con Dulce de Leche', precio: 800, categoria: 5, imagen: '🍮', elaborado: true },
  { id: 12, nombre: 'Helado', precio: 1000, categoria: 5, imagen: '🍦', elaborado: false },
  { id: 13, nombre: 'Papas Fritas', precio: 800, categoria: 6, imagen: '🍟', elaborado: true },
  { id: 14, nombre: 'Empanadas (x6)', precio: 2400, categoria: 6, imagen: '🥟', elaborado: true },
];

export default function VentasV2() {
  const [activeTab, setActiveTab] = useState('nuevo-1');
  const [tabs, setTabs] = useState([{ id: 'nuevo-1', nombre: 'Nuevo Pedido', items: 0 }]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(1);
  const [busqueda, setBusqueda] = useState('');

  // Estados del pedido actual
  const [pedidos, setPedidos] = useState({
    'nuevo-1': {
      cliente: { nombre: '', telefono: '', direccion: '', email: '' },
      modalidad: 'retiro', // 'retiro' | 'delivery'
      carrito: [],
      observaciones: ''
    }
  });

  // Modales
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [modalCobro, setModalCobro] = useState(false);
  const [modalPersonalizar, setModalPersonalizar] = useState(false);
  const [itemPersonalizar, setItemPersonalizar] = useState(null);
  const [personalizaciones, setPersonalizaciones] = useState('');

  const pedidoActual = pedidos[activeTab] || pedidos['nuevo-1'];

  // Agregar producto al carrito
  const agregarProducto = (producto) => {
    setPedidos(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        carrito: [...prev[activeTab].carrito, {
          ...producto,
          cantidadCarrito: 1,
          personalizaciones: '',
          carritoId: Date.now() + Math.random()
        }]
      }
    }));

    // Actualizar contador del tab
    setTabs(prev => prev.map(tab =>
      tab.id === activeTab
        ? { ...tab, items: (pedidoActual.carrito.length + 1) }
        : tab
    ));
  };

  // Eliminar producto del carrito
  const eliminarProducto = (carritoId) => {
    setPedidos(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        carrito: prev[activeTab].carrito.filter(item => item.carritoId !== carritoId)
      }
    }));

    setTabs(prev => prev.map(tab =>
      tab.id === activeTab
        ? { ...tab, items: Math.max(0, (pedidoActual.carrito.length - 1)) }
        : tab
    ));
  };

  // Actualizar personalizaciones
  const guardarPersonalizaciones = () => {
    setPedidos(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        carrito: prev[activeTab].carrito.map(item =>
          item.carritoId === itemPersonalizar.carritoId
            ? { ...item, personalizaciones }
            : item
        )
      }
    }));
    setModalPersonalizar(false);
    setItemPersonalizar(null);
    setPersonalizaciones('');
  };

  // Abrir modal personalizar
  const abrirPersonalizar = (item) => {
    setItemPersonalizar(item);
    setPersonalizaciones(item.personalizaciones || '');
    setModalPersonalizar(true);
  };

  // Calcular totales
  const calcularSubtotal = () => {
    return pedidoActual.carrito.reduce((sum, item) => sum + (item.precio * item.cantidadCarrito), 0);
  };

  const calcularEnvio = () => {
    return pedidoActual.modalidad === 'delivery' ? 300 : 0;
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularEnvio();
  };

  // Confirmar pedido
  const confirmarPedido = () => {
    if (pedidoActual.carrito.length === 0) {
      alert('Agregue al menos un producto');
      return;
    }
    if (!pedidoActual.cliente.nombre.trim()) {
      alert('Ingrese el nombre del cliente');
      return;
    }
    setModalConfirmacion(true);
  };

  // Limpiar pedido
  const limpiarPedido = () => {
    setPedidos(prev => ({
      ...prev,
      [activeTab]: {
        cliente: { nombre: '', telefono: '', direccion: '', email: '' },
        modalidad: 'retiro',
        carrito: [],
        observaciones: ''
      }
    }));
    setTabs(prev => prev.map(tab =>
      tab.id === activeTab ? { ...tab, items: 0 } : tab
    ));
  };

  // Agregar nuevo tab
  const agregarTab = () => {
    const nuevoId = `nuevo-${tabs.length + 1}`;
    setTabs([...tabs, { id: nuevoId, nombre: `Pedido ${tabs.length + 1}`, items: 0 }]);
    setPedidos(prev => ({
      ...prev,
      [nuevoId]: {
        cliente: { nombre: '', telefono: '', direccion: '', email: '' },
        modalidad: 'retiro',
        carrito: [],
        observaciones: ''
      }
    }));
    setActiveTab(nuevoId);
  };

  // Cerrar tab
  const cerrarTab = (tabId) => {
    if (tabs.length === 1) return; // No cerrar el último tab

    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }

    setPedidos(prev => {
      const newPedidos = { ...prev };
      delete newPedidos[tabId];
      return newPedidos;
    });
  };

  // Filtrar productos
  const productosFiltrados = PRODUCTOS.filter(p => {
    const matchCategoria = p.categoria === categoriaSeleccionada;
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      <NavBar />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">💳 Punto de Ventas</h1>
          <p className="text-slate-600">Toma de pedidos y facturación</p>
        </div>

        {/* Tabs de pedidos */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <TabsList className="bg-white border border-slate-200 p-1 inline-flex">
              {tabs.map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="relative data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4 py-2"
                >
                  <span className="flex items-center gap-2">
                    {tab.nombre}
                    {tab.items > 0 && (
                      <Badge variant="secondary" className="bg-orange-500 text-white text-xs">
                        {tab.items}
                      </Badge>
                    )}
                  </span>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        cerrarTab(tab.id);
                      }}
                      className="ml-2 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button onClick={agregarTab} size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Pedido
            </Button>
          </div>

          {/* Contenido de cada tab */}
          {tabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <div className="grid grid-cols-12 gap-4 h-[calc(100vh-280px)]">
                {/* Columna 1: Categorías */}
                <div className="col-span-2 bg-white rounded-lg shadow-sm p-4 overflow-y-auto">
                  <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
                    Categorías
                  </h3>
                  <div className="space-y-2">
                    {CATEGORIAS.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoriaSeleccionada(cat.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                          categoriaSeleccionada === cat.id
                            ? `${cat.color} text-white shadow-md`
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cat.icono}</span>
                          <span className="text-sm font-medium">{cat.nombre}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Columna 2: Productos */}
                <div className="col-span-6 bg-white rounded-lg shadow-sm p-4 overflow-y-auto">
                  {/* Búsqueda */}
                  <div className="mb-4">
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

                  {/* Grid de productos */}
                  <div className="grid grid-cols-3 gap-3">
                    {productosFiltrados.map(producto => (
                      <Card
                        key={producto.id}
                        onClick={() => agregarProducto(producto)}
                        className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all p-4 text-center"
                      >
                        <div className="text-4xl mb-2">{producto.imagen}</div>
                        <h4 className="font-semibold text-sm text-slate-700 mb-1 line-clamp-2">
                          {producto.nombre}
                        </h4>
                        <p className="text-lg font-bold text-blue-600">
                          ${producto.precio}
                        </p>
                        {producto.elaborado && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Elaborado
                          </Badge>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Columna 3: Pedido actual */}
                <div className="col-span-4 bg-white rounded-lg shadow-sm p-4 overflow-y-auto">
                  <h3 className="font-semibold text-slate-700 mb-4 text-lg">
                    📝 Datos del Cliente
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div>
                      <Label className="text-xs text-slate-600">Nombre *</Label>
                      <Input
                        value={pedidoActual.cliente.nombre}
                        onChange={(e) => setPedidos(prev => ({
                          ...prev,
                          [activeTab]: {
                            ...prev[activeTab],
                            cliente: { ...prev[activeTab].cliente, nombre: e.target.value }
                          }
                        }))}
                        placeholder="Nombre del cliente"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-slate-600">Teléfono</Label>
                      <Input
                        value={pedidoActual.cliente.telefono}
                        onChange={(e) => setPedidos(prev => ({
                          ...prev,
                          [activeTab]: {
                            ...prev[activeTab],
                            cliente: { ...prev[activeTab].cliente, telefono: e.target.value }
                          }
                        }))}
                        placeholder="Ej: 3815123456"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-slate-600">Dirección</Label>
                      <Input
                        value={pedidoActual.cliente.direccion}
                        onChange={(e) => setPedidos(prev => ({
                          ...prev,
                          [activeTab]: {
                            ...prev[activeTab],
                            cliente: { ...prev[activeTab].cliente, direccion: e.target.value }
                          }
                        }))}
                        placeholder="Dirección de entrega"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Modalidad */}
                  <div className="mb-6">
                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                      📦 Modalidad
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={pedidoActual.modalidad === 'retiro' ? 'default' : 'outline'}
                        onClick={() => setPedidos(prev => ({
                          ...prev,
                          [activeTab]: { ...prev[activeTab], modalidad: 'retiro' }
                        }))}
                        className="gap-2"
                      >
                        <Home className="h-4 w-4" />
                        Retiro
                      </Button>
                      <Button
                        type="button"
                        variant={pedidoActual.modalidad === 'delivery' ? 'default' : 'outline'}
                        onClick={() => setPedidos(prev => ({
                          ...prev,
                          [activeTab]: { ...prev[activeTab], modalidad: 'delivery' }
                        }))}
                        className="gap-2"
                      >
                        <Bike className="h-4 w-4" />
                        Delivery
                      </Button>
                    </div>
                  </div>

                  {/* Carrito */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Carrito ({pedidoActual.carrito.length})
                      </h3>
                    </div>

                    <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
                      {pedidoActual.carrito.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">
                          No hay productos en el carrito
                        </p>
                      ) : (
                        pedidoActual.carrito.map(item => (
                          <div key={item.carritoId} className="bg-slate-50 p-3 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm text-slate-700">
                                  {item.cantidadCarrito}x {item.nombre}
                                </p>
                                <p className="text-sm font-bold text-blue-600">
                                  ${item.precio * item.cantidadCarrito}
                                </p>
                                {item.personalizaciones && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    └ {item.personalizaciones}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                {item.elaborado && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => abrirPersonalizar(item)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => eliminarProducto(item.carritoId)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Totales */}
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal:</span>
                        <span className="font-semibold">${calcularSubtotal()}</span>
                      </div>
                      {pedidoActual.modalidad === 'delivery' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Envío:</span>
                          <span className="font-semibold">${calcularEnvio()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>TOTAL:</span>
                        <span className="text-blue-600">${calcularTotal()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="mb-6">
                    <Label className="text-xs text-slate-600 mb-1 block">
                      💬 Observaciones
                    </Label>
                    <Textarea
                      value={pedidoActual.observaciones}
                      onChange={(e) => setPedidos(prev => ({
                        ...prev,
                        [activeTab]: { ...prev[activeTab], observaciones: e.target.value }
                      }))}
                      placeholder="Ej: Sin cebolla, punto de la carne a término medio..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-2">
                    <Button
                      onClick={limpiarPedido}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Limpiar Pedido
                    </Button>
                    <Button
                      onClick={confirmarPedido}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold gap-2 h-12 text-lg"
                    >
                      ✅ Confirmar Pedido
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Modal: Personalizar item */}
      <Dialog open={modalPersonalizar} onOpenChange={setModalPersonalizar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personalizar Producto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {itemPersonalizar && (
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="font-semibold">{itemPersonalizar.nombre}</p>
                <p className="text-sm text-slate-600">${itemPersonalizar.precio}</p>
              </div>
            )}
            <div>
              <Label>Personalizaciones</Label>
              <Textarea
                value={personalizaciones}
                onChange={(e) => setPersonalizaciones(e.target.value)}
                placeholder="Ej: Extra queso, sin cebolla, punto de la carne..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalPersonalizar(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarPersonalizaciones}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmación de pedido */}
      <Dialog open={modalConfirmacion} onOpenChange={setModalConfirmacion}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Pedido Confirmado ✅</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-slate-700 mb-6">
              El pedido ha sido registrado exitosamente.
              <br />
              <strong>¿El cliente paga ahora?</strong>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                onClick={() => {
                  setModalConfirmacion(false);
                  setModalCobro(true);
                }}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                <DollarSign className="h-5 w-5" />
                Sí, Cobrar Ahora
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setModalConfirmacion(false);
                  limpiarPedido();
                  alert('Pedido registrado. Se cobrará después.');
                }}
              >
                No, Paga Después
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Cobro */}
      <Dialog open={modalCobro} onOpenChange={setModalCobro}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">💳 Cobrar y Facturar</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {/* Resumen del pedido */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Resumen del Pedido</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <span className="font-medium">{pedidoActual.cliente.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span className="font-medium">{pedidoActual.carrito.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Modalidad:</span>
                  <span className="font-medium capitalize">{pedidoActual.modalidad}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>TOTAL:</span>
                  <span className="text-blue-600">${calcularTotal()}</span>
                </div>
              </div>
            </div>

            {/* Método de pago */}
            <div>
              <Label className="mb-3 block font-semibold">Método de Pago</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Banknote className="h-6 w-6" />
                  <span>Efectivo</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Smartphone className="h-6 w-6" />
                  <span>Transferencia</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <CreditCard className="h-6 w-6" />
                  <span>Tarjeta Débito</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <CreditCard className="h-6 w-6" />
                  <span>Tarjeta Crédito</span>
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCobro(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 gap-2"
              onClick={() => {
                setModalCobro(false);
                limpiarPedido();
                alert('¡Venta registrada exitosamente!');
              }}
            >
              <DollarSign className="h-4 w-4" />
              Facturar ${calcularTotal()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
