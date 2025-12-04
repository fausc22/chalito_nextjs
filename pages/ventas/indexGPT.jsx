import { useState, useEffect } from 'react';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Send, X, Eye, Check, Edit2, Trash2, Printer } from 'lucide-react';

// Datos iniciales
const MOZOS = ['Juan', 'María', 'Pedro', 'Ana'];
const PRODUCTOS = [
  { id: 1, nombre: 'Hamburguesa', precio: 3500 },
  { id: 2, nombre: 'Pizza Muzzarella', precio: 4200 },
  { id: 3, nombre: 'Lomito Completo', precio: 3800 },
  { id: 4, nombre: 'Coca-Cola', precio: 1200 },
  { id: 5, nombre: 'Agua Mineral', precio: 800 },
  { id: 6, nombre: 'Papas Fritas', precio: 1500 },
];

const PEDIDOS_INICIAL = [
  {
    id: 1,
    mesa: '5',
    mozo: 'Juan',
    hora: '20:15',
    items: [
      { nombre: 'Hamburguesa', precio: 3500, cantidad: 1 },
      { nombre: 'Coca-Cola', precio: 1200, cantidad: 2 }
    ],
    total: 5900,
    estado: 'recibido',
    timestamp: Date.now() - 600000 // 10 minutos atrás
  },
  {
    id: 2,
    mesa: '3',
    mozo: 'María',
    hora: '20:25',
    items: [
      { nombre: 'Pizza Muzzarella', precio: 4200, cantidad: 1 },
      { nombre: 'Agua Mineral', precio: 800, cantidad: 1 }
    ],
    total: 5000,
    estado: 'en_preparacion',
    timestamp: Date.now() - 300000 // 5 minutos atrás
  }
];

export default function PedidosGPT() {
  const [pedidos, setPedidos] = useState(PEDIDOS_INICIAL);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  // Estados del formulario
  const [mesa, setMesa] = useState('');
  const [mozo, setMozo] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [itemsNuevoPedido, setItemsNuevoPedido] = useState([]);

  // Timer para actualizar tiempo transcurrido
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  // Calcular total del nuevo pedido
  const calcularTotalNuevo = () => {
    return itemsNuevoPedido.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  };

  // Agregar producto al nuevo pedido
  const agregarProducto = () => {
    if (!productoSeleccionado) return;

    const producto = PRODUCTOS.find(p => p.nombre === productoSeleccionado);
    const existe = itemsNuevoPedido.find(i => i.nombre === producto.nombre);

    if (existe) {
      setItemsNuevoPedido(itemsNuevoPedido.map(i =>
        i.nombre === producto.nombre
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
      ));
    } else {
      setItemsNuevoPedido([...itemsNuevoPedido, { ...producto, cantidad: 1 }]);
    }
    setProductoSeleccionado('');
  };

  // Eliminar producto del nuevo pedido
  const eliminarProductoNuevo = (nombre) => {
    setItemsNuevoPedido(itemsNuevoPedido.filter(i => i.nombre !== nombre));
  };

  // Guardar nuevo pedido
  const guardarPedido = () => {
    if (!mesa || !mozo || itemsNuevoPedido.length === 0) {
      alert('Complete todos los campos');
      return;
    }

    const now = new Date();
    const nuevoPedido = {
      id: Math.max(...pedidos.map(p => p.id), 0) + 1,
      mesa,
      mozo,
      hora: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      items: itemsNuevoPedido,
      total: calcularTotalNuevo(),
      estado: 'recibido',
      timestamp: Date.now()
    };

    setPedidos([nuevoPedido, ...pedidos]);
    limpiarFormulario();
  };

  // Enviar a cocina
  const enviarACocina = () => {
    guardarPedido();
    // El pedido ya se crea como 'recibido', se puede pasar a 'en_preparacion' después
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    setMesa('');
    setMozo('');
    setProductoSeleccionado('');
    setItemsNuevoPedido([]);
  };

  // Pasar a preparación
  const pasarAPreparacion = (id) => {
    setPedidos(pedidos.map(p =>
      p.id === id ? { ...p, estado: 'en_preparacion', timestamp: Date.now() } : p
    ));
  };

  // Marcar como listo
  const marcarComoListo = (id) => {
    setPedidos(pedidos.map(p =>
      p.id === id ? { ...p, estado: 'listo' } : p
    ));
  };

  // Ver detalles
  const verDetalles = (pedido) => {
    setPedidoSeleccionado(pedido);
  };

  // Eliminar pedido
  const eliminarPedido = (id) => {
    if (confirm('¿Eliminar este pedido?')) {
      setPedidos(pedidos.filter(p => p.id !== id));
      if (pedidoSeleccionado?.id === id) {
        setPedidoSeleccionado(null);
      }
    }
  };

  // Calcular tiempo transcurrido
  const tiempoTranscurrido = (timestamp) => {
    const minutos = Math.floor((Date.now() - timestamp) / 60000);
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  const pedidosRecibidos = pedidos.filter(p => p.estado === 'recibido');
  const pedidosEnPreparacion = pedidos.filter(p => p.estado === 'en_preparacion');

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col font-['Inter',sans-serif]">
      <NavBar />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Pedidos</h1>

        {/* FORMULARIO DE CREAR PEDIDO */}
        <Card className="mb-6 shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-2xl">Crear Nuevo Pedido</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda: Datos del pedido */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-2 block">Número de Mesa *</Label>
                  <Input
                    type="number"
                    value={mesa}
                    onChange={(e) => setMesa(e.target.value)}
                    placeholder="Ej: 5"
                    className="h-12 text-lg"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">Mozo *</Label>
                  <Select value={mozo} onValueChange={setMozo}>
                    <SelectTrigger className="h-12 text-lg">
                      <SelectValue placeholder="Seleccionar mozo" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOZOS.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">Agregar Producto</Label>
                  <div className="flex gap-2">
                    <Select value={productoSeleccionado} onValueChange={setProductoSeleccionado}>
                      <SelectTrigger className="h-12 text-lg">
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCTOS.map(p => (
                          <SelectItem key={p.id} value={p.nombre}>
                            {p.nombre} - ${p.precio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={agregarProducto}
                      size="lg"
                      className="h-12 px-6 bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Columna derecha: Items del pedido */}
              <div>
                <Label className="text-base font-semibold mb-2 block">Productos Agregados</Label>
                <div className="border rounded-lg bg-gray-50 p-4 min-h-[200px]">
                  {itemsNuevoPedido.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No hay productos agregados</p>
                  ) : (
                    <div className="space-y-2">
                      {itemsNuevoPedido.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border">
                          <div>
                            <p className="font-semibold">{item.cantidad}x {item.nombre}</p>
                            <p className="text-sm text-gray-600">${item.precio * item.cantidad}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => eliminarProductoNuevo(item.nombre)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {itemsNuevoPedido.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>TOTAL:</span>
                        <span className="text-blue-600">${calcularTotalNuevo()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button
                onClick={guardarPedido}
                size="lg"
                className="flex-1 h-12 text-lg bg-blue-600 hover:bg-blue-700"
              >
                Guardar Pedido
              </Button>
              <Button
                onClick={enviarACocina}
                size="lg"
                className="flex-1 h-12 text-lg bg-orange-600 hover:bg-orange-700"
              >
                <Send className="h-5 w-5 mr-2" />
                Enviar a Cocina
              </Button>
              <Button
                onClick={limpiarFormulario}
                variant="outline"
                size="lg"
                className="h-12 text-lg"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TABLAS DE PEDIDOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* TABLA: Pedidos Recibidos */}
          <Card className="shadow-lg border-t-4 border-t-blue-400">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-xl">
                📦 Pedidos Recibidos ({pedidosRecibidos.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-100">
                      <TableHead className="font-bold">N° Pedido</TableHead>
                      <TableHead className="font-bold">Mesa</TableHead>
                      <TableHead className="font-bold">Mozo</TableHead>
                      <TableHead className="font-bold">Hora</TableHead>
                      <TableHead className="font-bold">Total</TableHead>
                      <TableHead className="font-bold text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidosRecibidos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                          No hay pedidos recibidos
                        </TableCell>
                      </TableRow>
                    ) : (
                      pedidosRecibidos.map(pedido => (
                        <TableRow key={pedido.id} className="hover:bg-blue-50">
                          <TableCell className="font-semibold">#{pedido.id}</TableCell>
                          <TableCell>{pedido.mesa}</TableCell>
                          <TableCell>{pedido.mozo}</TableCell>
                          <TableCell>{pedido.hora}</TableCell>
                          <TableCell className="font-bold text-green-600">${pedido.total}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => verDetalles(pedido)}
                                className="h-8"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => pasarAPreparacion(pedido.id)}
                                className="h-8 bg-orange-500 hover:bg-orange-600"
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Cocina
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* TABLA: Pedidos en Preparación */}
          <Card className="shadow-lg border-t-4 border-t-orange-400">
            <CardHeader className="bg-orange-50">
              <CardTitle className="text-xl">
                🔥 Pedidos en Preparación ({pedidosEnPreparacion.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-orange-100">
                      <TableHead className="font-bold">N° Pedido</TableHead>
                      <TableHead className="font-bold">Mesa</TableHead>
                      <TableHead className="font-bold">Items</TableHead>
                      <TableHead className="font-bold">Tiempo</TableHead>
                      <TableHead className="font-bold text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidosEnPreparacion.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                          No hay pedidos en preparación
                        </TableCell>
                      </TableRow>
                    ) : (
                      pedidosEnPreparacion.map(pedido => (
                        <TableRow key={pedido.id} className="hover:bg-orange-50">
                          <TableCell className="font-semibold">#{pedido.id}</TableCell>
                          <TableCell>{pedido.mesa}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {pedido.items.map((item, idx) => (
                                <div key={idx}>{item.cantidad}x {item.nombre}</div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-orange-600">
                            {tiempoTranscurrido(pedido.timestamp)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => verDetalles(pedido)}
                                className="h-8"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => marcarComoListo(pedido.id)}
                                className="h-8 bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Listo
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PANEL DE DETALLES */}
        {pedidoSeleccionado && (
          <Card className="shadow-xl border-2 border-blue-300 animate-in slide-in-from-bottom">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="text-2xl flex items-center justify-between">
                <span>Detalles del Pedido #{pedidoSeleccionado.id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPedidoSeleccionado(null)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">N° Pedido</Label>
                    <p className="text-lg font-bold">#{pedidoSeleccionado.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Mesa</Label>
                    <p className="text-lg font-bold">{pedidoSeleccionado.mesa}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Mozo</Label>
                    <p className="text-lg font-bold">{pedidoSeleccionado.mozo}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Hora</Label>
                    <p className="text-lg font-bold">{pedidoSeleccionado.hora}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Estado</Label>
                    <p className="text-lg font-bold capitalize">
                      {pedidoSeleccionado.estado === 'recibido' && '📦 Recibido'}
                      {pedidoSeleccionado.estado === 'en_preparacion' && '🔥 En Preparación'}
                      {pedidoSeleccionado.estado === 'listo' && '✅ Listo'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <Label className="text-lg font-bold mb-3 block">Items del Pedido</Label>
                <div className="bg-gray-50 rounded-lg p-4">
                  {pedidoSeleccionado.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                      <span className="font-medium">
                        {item.cantidad}x {item.nombre}
                      </span>
                      <span className="font-bold text-blue-600">
                        ${item.precio * item.cantidad}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${pedidoSeleccionado.total}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>IVA (21%):</span>
                    <span className="font-semibold">${Math.round(pedidoSeleccionado.total * 0.21)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold border-t pt-2">
                    <span>TOTAL:</span>
                    <span className="text-blue-600">${Math.round(pedidoSeleccionado.total * 1.21)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="lg" variant="outline" className="flex-1 h-12">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Modificar
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  className="flex-1 h-12"
                  onClick={() => eliminarPedido(pedidoSeleccionado.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
                <Button size="lg" className="flex-1 h-12 bg-green-600 hover:bg-green-700">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
