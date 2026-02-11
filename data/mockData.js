// Datos mock para desarrollo
export const CATEGORIAS_MOCK = [
  { id: 1, nombre: 'Hamburguesas', icono: '🍔', color: 'bg-orange-500' },
  { id: 2, nombre: 'Pizzas', icono: '🍕', color: 'bg-red-500' },
  { id: 3, nombre: 'Acompañamientos', icono: '🍟', color: 'bg-amber-600' },
  { id: 4, nombre: 'Bebidas', icono: '🥤', color: 'bg-blue-500' },
];

export const PRODUCTOS_MOCK = [
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

export const CLIENTES_MOCK = [
  { id: 1, nombre: 'Juan Pérez', telefono: '3512345678', email: 'juan@email.com', direccion: 'Av. Colón 1234' },
  { id: 2, nombre: 'María González', telefono: '3518765432', email: 'maria@email.com', direccion: 'Calle Falsa 567' },
  { id: 3, nombre: 'Carlos Rodríguez', telefono: '3519876543', email: 'carlos@email.com', direccion: 'San Martín 890' },
  { id: 4, nombre: 'Ana López', telefono: '3511234567', email: 'ana@email.com', direccion: 'Belgrano 456' },
];

export const PEDIDOS_MOCK = [
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





















