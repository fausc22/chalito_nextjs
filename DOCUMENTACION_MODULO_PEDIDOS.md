# Documentación Completa del Módulo de Pedidos

## Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estructura de Base de Datos](#estructura-de-base-de-datos)
3. [Arquitectura del Módulo](#arquitectura-del-módulo)
4. [Componentes Principales](#componentes-principales)
5. [Hooks Personalizados](#hooks-personalizados)
6. [Servicios](#servicios)
7. [Flujos de Trabajo](#flujos-de-trabajo)
8. [Lógica de Negocio](#lógica-de-negocio)
9. [Mapeo de Datos](#mapeo-de-datos)
10. [Funcionalidades Implementadas](#funcionalidades-implementadas)
11. [Funcionalidades Pendientes](#funcionalidades-pendientes)

---

## Resumen Ejecutivo

El módulo de pedidos es el núcleo del sistema de gestión de El Chalito. Permite crear, gestionar y rastrear pedidos desde su recepción hasta su entrega y cobro. El sistema maneja dos entidades principales:

- **Pedidos**: Representan las órdenes de compra con información financiera completa
- **Comandas**: Representan las órdenes de cocina, vinculadas a los pedidos

### Características Principales
- ✅ Creación de pedidos con múltiples productos y extras
- ✅ Gestión de estados (Recibido → En Preparación → Entregado)
- ✅ Sistema de cobro integrado con registro de ventas
- ✅ Vista de cocina para seguimiento de preparación
- ✅ Drag & Drop para mover pedidos entre estados
- ✅ Búsqueda y filtrado de pedidos
- ✅ Soporte para pedidos programados
- ✅ Cálculo automático de IVA (21%) y totales
- ✅ Múltiples medios de pago
- ✅ Gestión de modalidades (Delivery/Retiro)

---

## Estructura de Base de Datos

### Tabla: `pedidos`

La tabla principal que almacena la información de los pedidos:

```sql
CREATE TABLE `pedidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cliente_nombre` varchar(150) DEFAULT NULL,
  `cliente_direccion` varchar(255) DEFAULT NULL,
  `cliente_telefono` varchar(50) DEFAULT NULL,
  `cliente_email` varchar(100) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `iva_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `medio_pago` varchar(50) DEFAULT NULL,
  `estado_pago` enum('DEBE','PAGADO') NOT NULL DEFAULT 'DEBE',
  `modalidad` enum('DELIVERY','RETIRO') NOT NULL,
  `origen_pedido` enum('MOSTRADOR','TELEFONO','WHATSAPP','WEB') NOT NULL DEFAULT 'MOSTRADOR',
  `horario_entrega` timestamp NULL DEFAULT NULL,
  `estado` enum('RECIBIDO','EN_PREPARACION','ENTREGADO','CANCELADO') NOT NULL DEFAULT 'RECIBIDO',
  `observaciones` varchar(255) DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `usuario_nombre` varchar(100) DEFAULT NULL,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  ...
)
```

**Campos Clave:**
- `estado`: Controla el flujo del pedido (RECIBIDO → EN_PREPARACION → ENTREGADO)
- `estado_pago`: Indica si el pedido está pagado (PAGADO) o pendiente (DEBE)
- `modalidad`: Tipo de entrega (DELIVERY o RETIRO)
- `origen_pedido`: Canal de origen (MOSTRADOR, TELEFONO, WHATSAPP, WEB)
- `horario_entrega`: Para pedidos programados

### Tabla: `pedidos_contenido`

Almacena los artículos de cada pedido:

```sql
CREATE TABLE `pedidos_contenido` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pedido_id` int NOT NULL,
  `articulo_id` int NOT NULL,
  `articulo_nombre` varchar(150) NOT NULL,
  `cantidad` int NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `personalizaciones` json DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  ...
)
```

**Campos Clave:**
- `personalizaciones`: JSON que almacena los extras/adicionales seleccionados
- `precio`: Precio unitario (incluye extras)
- `subtotal`: Precio unitario × cantidad

### Tabla: `comandas`

Representa las órdenes de cocina vinculadas a pedidos:

```sql
CREATE TABLE `comandas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pedido_id` int NOT NULL,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cliente_nombre` varchar(150) DEFAULT NULL,
  `cliente_direccion` varchar(255) DEFAULT NULL,
  `cliente_telefono` varchar(50) DEFAULT NULL,
  `cliente_email` varchar(100) DEFAULT NULL,
  `modalidad` enum('DELIVERY','RETIRO') NOT NULL,
  `horario_entrega` timestamp NULL DEFAULT NULL,
  `estado` enum('EN_PREPARACION','LISTA','CANCELADA') NOT NULL DEFAULT 'EN_PREPARACION',
  `observaciones` text,
  `usuario_id` int DEFAULT NULL,
  `usuario_nombre` varchar(100) DEFAULT NULL,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pedido_id_unique` (`pedido_id`),
  ...
)
```

**Relación:**
- Cada comanda está vinculada a UN pedido (`pedido_id` UNIQUE)
- Cuando se crea un pedido, se crea automáticamente una comanda asociada

### Tabla: `comandas_contenido`

Almacena los artículos de cada comanda:

```sql
CREATE TABLE `comandas_contenido` (
  `id` int NOT NULL AUTO_INCREMENT,
  `comanda_id` int NOT NULL,
  `articulo_id` int NOT NULL,
  `articulo_nombre` varchar(150) NOT NULL,
  `cantidad` int NOT NULL,
  `personalizaciones` json DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  ...
)
```

**Nota:** Las comandas NO almacenan precios, solo información de preparación.

---

## Arquitectura del Módulo

### Estructura de Archivos

```
pages/pedidos/
  └── index.jsx                    # Página principal del módulo

components/pedidos/
  ├── PedidosSidebar.jsx           # Barra lateral con controles
  ├── PedidosColumn.jsx            # Columna de pedidos (drag & drop)
  ├── OrderCard.jsx                # Tarjeta individual de pedido
  ├── ProductCard.jsx              # Tarjeta de producto (modal nuevo pedido)
  └── modals/
      ├── ModalNuevoPedido.jsx     # Modal para crear pedido
      ├── ModalCobro.jsx           # Modal para cobrar pedido
      ├── ModalExtras.jsx           # Modal para seleccionar extras
      ├── ModalCancelarPedido.jsx  # Modal de confirmación cancelación
      ├── ModalPedidosEntregados.jsx # Modal con lista de entregados
      └── ModalTimeline.jsx         # Timeline del pedido

hooks/pedidos/
  ├── usePedidos.js                # Hook principal de gestión
  └── useNuevoPedido.js            # Hook para crear pedidos

services/
  ├── pedidosService.js             # Servicio de pedidos
  └── comandasService.js            # Servicio de comandas
```

### Flujo de Datos

```
Usuario → Componente → Hook → Servicio → API → Base de Datos
                ↓
         Estado Local (React)
```

---

## Componentes Principales

### 1. `pages/pedidos/index.jsx` - Página Principal

**Responsabilidades:**
- Orquestar todos los componentes del módulo
- Gestionar el estado global de la página
- Manejar la comunicación entre componentes
- Configurar Drag & Drop con `@dnd-kit`

**Estados Locales:**
- `demoraCocina`: Tiempo estimado de preparación (minutos)
- `sidebarOpen`: Control de visibilidad del sidebar
- `pedidoCancelar`: Pedido seleccionado para cancelar
- `modalPedidosEntregados`: Control del modal de entregados
- `modalCobro`: Control del modal de cobro
- `pedidoACobrar`: Pedido seleccionado para cobrar
- `pedidoPendienteCrear`: Pedido en proceso de creación después del cobro
- `modoCocinaOpen`: Control del modal de modo cocina

**Hooks Utilizados:**
- `usePedidos()`: Gestión de pedidos
- `useNuevoPedido()`: Creación de nuevos pedidos

**Funciones Clave:**
- `handlePedidoCreado()`: Procesa el pedido creado, puede mostrar modal de cobro si es necesario
- `handleCobroExitosoYCrearPedido()`: Crea el pedido después de cobrarlo
- `handleCobroExitoso()`: Actualiza el pedido después del cobro
- `abrirModalCobro()`: Abre el modal de cobro para un pedido

**Layout:**
- Sidebar izquierdo (colapsable)
- Dos columnas principales:
  - **RECIBIDOS** (40% ancho)
  - **EN PREPARACIÓN** (60% ancho)

### 2. `PedidosSidebar.jsx` - Barra Lateral

**Responsabilidades:**
- Mostrar controles principales
- Búsqueda de pedidos
- Configuración de demora de cocina
- Indicador de estado del sistema (online/offline)

**Props:**
- `demoraCocina`, `setDemoraCocina`: Control de tiempo de cocina
- `onNuevoPedido`: Callback para crear nuevo pedido
- `onModoCocina`: Callback para abrir modo cocina
- `onVerPedidosEntregados`: Callback para ver entregados
- `onNotificaciones`: Callback para notificaciones
- `busquedaPedidos`, `setBusquedaPedidos`: Control de búsqueda
- `isOpen`, `setIsOpen`: Control de visibilidad
- `isMobile`: Modo móvil/desktop
- `isOnline`: Estado de conexión

**Funcionalidades:**
- Botón "NUEVO PEDIDO" (atajo F1)
- Botón "MODO COCINA"
- Botón "NOTIFICACIONES" (con contador)
- Campo de búsqueda (ID o nombre de cliente)
- Input numérico para demora de cocina
- Botón "Pedidos Entregados"
- Colapsable/expandible

### 3. `PedidosColumn.jsx` - Columna de Pedidos

**Responsabilidades:**
- Mostrar lista de pedidos en un estado específico
- Implementar zona de drop para Drag & Drop
- Paginación de pedidos (6 por página)
- Visualización de cantidad de pedidos

**Props:**
- `titulo`: Título de la columna
- `pedidos`: Array de pedidos a mostrar
- `estado`: Estado de la columna ('recibido' o 'en_cocina')
- `onMarcharACocina`: Callback para mover a cocina
- `onListo`: Callback para marcar como listo
- `onEditar`: Callback para editar
- `onCancelar`: Callback para cancelar
- `onCobrar`: Callback para cobrar
- `compacto`: Modo compacto

**Funcionalidades:**
- Drag & Drop con `@dnd-kit`
- Paginación inteligente (máximo 5 páginas visibles)
- Grid de 2 columnas
- Badge con contador de pedidos
- Mensaje cuando no hay pedidos

### 4. `OrderCard.jsx` - Tarjeta de Pedido

**Responsabilidades:**
- Mostrar información resumida del pedido
- Permitir acciones sobre el pedido
- Indicar tiempo transcurrido o hora programada
- Alerta visual cuando falta poco para pedidos programados

**Props:**
- `pedido`: Objeto con datos del pedido
- `onMarcharACocina`: Callback
- `onListo`: Callback
- `onEditar`: Callback
- `onCancelar`: Callback
- `onCobrar`: Callback

**Información Mostrada:**
- ID del pedido
- Icono de origen (mostrador, teléfono, WhatsApp, web)
- Nombre del cliente
- Badge de modalidad (DELIVERY/RETIRO)
- Tiempo transcurrido o hora programada
- Primeros 2 items del pedido
- Badge de estado de pago (PAGADO/DEBE)
- Botones de acción según estado

**Estados Visuales:**
- **Recibido**: Botón "MARCHAR"
- **En Cocina**: Botón "LISTO"
- **Entregado + Pendiente**: Botón "COBRAR"
- **Programado**: Alerta visual cuando faltan 10-15 minutos

**Funcionalidades Especiales:**
- Drag & Drop habilitado (grip vertical)
- Cálculo de tiempo transcurrido
- Alerta visual para pedidos programados próximos
- Botón de impresión (TODO: implementar)

### 5. `ModalNuevoPedido.jsx` - Modal de Creación

**Responsabilidades:**
- Guiar al usuario en la creación de un pedido
- Mostrar productos por categoría
- Gestionar carrito de compras
- Capturar datos del cliente
- Mostrar resumen y confirmación

**Estructura (3 Pasos):**

**Paso 1: Armar Pedido**
- Tabs de categorías
- Grid de productos con imágenes
- Búsqueda de productos
- Carrito lateral con resumen
- Botones para agregar/editar/eliminar items

**Paso 2: Datos del Cliente**
- Información del cliente (nombre, teléfono, email)
- Tipo de entrega (Delivery/Retiro)
- Dirección (si es delivery)
- Origen del pedido (Mostrador, Teléfono, WhatsApp, Web)
- Tipo de pedido (Ya/Programado)
- Hora programada (si aplica)
- Medio de pago
- Estado de pago (Pagado/Pendiente)
- Descuento (porcentaje)

**Paso 3: Resumen**
- Resumen completo del pedido
- Desglose de precios
- Confirmación final

**Cálculos Automáticos:**
- Subtotal: Suma de (precio + extras) × cantidad
- Descuento: Porcentaje sobre subtotal
- IVA: 21% sobre (subtotal - descuento)
- Envío: $300 si es delivery y tiene dirección
- Total: Subtotal - Descuento + IVA + Envío

**Flujo de Cobro:**
- Si `estadoPago === 'paid'`, primero muestra modal de cobro
- Después del cobro exitoso, crea el pedido
- Si `estadoPago === 'pending'`, crea el pedido directamente

### 6. `ModalCobro.jsx` - Modal de Cobro

**Responsabilidades:**
- Registrar el pago de un pedido
- Seleccionar medio de pago
- Seleccionar tipo de factura
- Crear registro de venta
- Actualizar estado de pago del pedido

**Props:**
- `pedido`: Pedido a cobrar
- `isOpen`: Control de visibilidad
- `onClose`: Callback de cierre
- `onCobroExitoso`: Callback cuando el cobro es exitoso

**Medios de Pago:**
- Efectivo
- Débito
- Crédito
- Transferencia
- MercadoPago

**Tipos de Factura:**
- A (Consumidor Final)
- B (Responsable Inscripto)
- C (Exento)

**Proceso:**
1. Obtener pedido completo del backend
2. Preparar datos de venta
3. Llamar a `ventasService.crearVenta()`
4. Si es pedido existente, actualizar `estado_pago` a PAGADO
5. Si es pedido nuevo, retornar medio de pago para crear el pedido

**Manejo de Errores:**
- Rate limit: Muestra mensaje específico con tiempo de espera
- Errores de validación: Muestra mensaje descriptivo
- Errores de red: Muestra mensaje genérico

### 7. `ModoCocina.jsx` - Vista de Cocina

**Responsabilidades:**
- Mostrar comandas en preparación
- Permitir marcar comandas como listas
- Actualización automática (polling)
- Vista optimizada para pantallas de cocina

**Props:**
- `isOpen`: Control de visibilidad
- `onClose`: Callback de cierre
- `modoCocina`: true = vista cocina (sin controles), false = vista encargado
- `onPedidoActualizado`: Callback cuando se actualiza un pedido

**Funcionalidades:**
- Polling automático cada 30 segundos (configurable)
- Filtrado: Solo comandas cuyo pedido está en `EN_PREPARACION`
- Manejo de timeouts (5 segundos por pedido)
- Manejo de rate limits (ralentiza polling)
- Botón para marcar como lista
- Botón para cancelar comanda
- Vista compacta para pantallas de cocina
- Vista detallada para encargados (con info financiera)

**Estados de Comanda:**
- `EN_PREPARACION`: En proceso
- `LISTA`: Lista para entregar
- `CANCELADA`: Cancelada

---

## Hooks Personalizados

### 1. `usePedidos.js`

**Responsabilidades:**
- Gestionar el estado de los pedidos
- Cargar pedidos desde el backend
- Filtrar y organizar pedidos por estado
- Manejar transiciones de estado
- Implementar búsqueda

**Estados:**
- `pedidos`: Array completo de pedidos
- `pedidosEntregados`: Array de pedidos entregados
- `busquedaPedidos`: Texto de búsqueda
- `loading`: Estado de carga
- `error`: Mensaje de error

**Funciones Retornadas:**
- `pedidosRecibidos`: Pedidos con estado 'recibido'
- `pedidosEnCocina`: Pedidos con estado 'en_cocina' o entregados sin pagar
- `handleDragEnd`: Maneja el drop de drag & drop
- `handleMarcharACocina`: Mueve pedido a cocina
- `handleListo`: Marca pedido como entregado
- `handleCancelar`: Elimina pedido
- `agregarPedido`: Agrega pedido al estado local
- `actualizarPedido`: Actualiza pedido en estado local
- `recargarPedidos`: Recarga pedidos desde el backend

**Lógica de Filtrado:**
- `pedidosRecibidos`: Filtra por `estado === 'recibido'`
- `pedidosEnCocina`: Filtra por `estado === 'en_cocina'` O (`estado === 'entregado'` Y `paymentStatus === 'pending'`)

**Actualización Automática:**
- Recarga pedidos cada 120 segundos (2 minutos)
- Evita rate limiting con intervalo largo

**Búsqueda:**
- Normaliza texto (elimina tildes)
- Busca en ID y nombre de cliente
- Case-insensitive

**Actualización Optimista:**
- En `handleListo()`, actualiza UI inmediatamente
- Si falla en backend, revierte el cambio
- Maneja rate limits manteniendo actualización optimista

### 2. `useNuevoPedido.js`

**Responsabilidades:**
- Gestionar el estado del modal de nuevo pedido
- Cargar categorías y productos
- Gestionar carrito de compras
- Calcular totales
- Validar datos antes de crear pedido

**Estados del Modal:**
- `isOpen`: Visibilidad del modal
- `pasoModal`: Paso actual (1, 2, o 3)

**Estados del Paso 1 (Armar Pedido):**
- `categoriaSeleccionada`: ID de categoría seleccionada
- `busquedaProducto`: Texto de búsqueda
- `carrito`: Array de items en el carrito
- `categorias`: Array de categorías
- `productos`: Array de productos con extras
- `loadingCategorias`, `loadingProductos`: Estados de carga

**Estados del Modal de Extras:**
- `modalExtras`: Visibilidad
- `productoParaExtras`: Producto seleccionado
- `cantidadProducto`: Cantidad a agregar
- `extrasSeleccionados`: Extras seleccionados
- `observacionItem`: Observación del item
- `editandoItemCarrito`: ID del item en edición
- `unidadActual`, `totalUnidades`: Control de múltiples unidades
- `unidadesConfiguradas`: Configuraciones de cada unidad

**Estados del Paso 2 (Datos Cliente):**
- `tipoEntrega`: 'delivery' o 'retiro'
- `cliente`: Objeto con datos del cliente
- `origen`: 'mostrador', 'telefono', 'whatsapp', 'web'
- `tipoPedido`: 'ya' o 'programado'
- `horaProgramada`: Hora en formato string
- `medioPago`: Medio de pago seleccionado
- `estadoPago`: 'paid' o 'pending'
- `descuento`: Porcentaje (0-100)

**Funciones de Cálculo:**
- `calcularSubtotal()`: Suma de (precio + extras) × cantidad
- `calcularEnvio()`: $300 si es delivery con dirección
- `calcularDescuento()`: Porcentaje sobre subtotal
- `calcularIVA()`: 21% sobre (subtotal - descuento)
- `calcularTotal()`: Subtotal - Descuento + IVA + Envío

**Funciones de Carrito:**
- `agregarProductoConExtras()`: Abre modal de extras si tiene, o agrega directamente
- `modificarCantidad()`: Actualiza cantidad de un item
- `eliminarDelCarrito()`: Elimina item del carrito
- `editarExtrasItem()`: Abre modal de extras para editar item
- `confirmarExtras()`: Confirma extras y agrega/actualiza en carrito

**Validación:**
- Usa `zod` para validar datos
- Valida cliente (nombre, teléfono, email opcional)
- Valida carrito (mínimo 1 item)
- Valida tipo de entrega
- Valida origen
- Muestra errores descriptivos

**Creación de Pedido:**
- `crearPedido()`: Valida, prepara datos y llama a `pedidosService.crearPedido()`
- Transforma datos del frontend al formato del backend
- Maneja errores y muestra toasts
- Llama callback `onSuccess` con el pedido creado

**Carga de Datos:**
- Carga categorías al montar
- Carga productos disponibles
- Para cada producto, carga adicionales asignados
- Selecciona primera categoría por defecto

---

## Servicios

### 1. `pedidosService.js`

**Responsabilidades:**
- Comunicación con API de pedidos
- Transformación de datos frontend ↔ backend
- Mapeo de estados, modalidades, medios de pago

**Funciones Principales:**

#### `obtenerPedidos(filtros = {})`
- Obtiene lista de pedidos
- Por defecto filtra solo pedidos del día actual
- Filtros: `fecha_desde`, `fecha_hasta`, `estado`, `modalidad`
- Transforma cada pedido y obtiene sus artículos
- Retorna: `{ success: boolean, data: [], error: string }`

#### `obtenerPedidoPorId(id)`
- Obtiene un pedido específico con sus artículos
- Retorna: `{ success: boolean, data: pedido, error: string }`

#### `crearPedido(pedidoData)`
- Crea un nuevo pedido
- Transforma datos del frontend al backend
- Calcula subtotal, IVA y total
- Mapea origen, modalidad, medio de pago
- Retorna: `{ success: boolean, data: pedido, error: string, errores: [] }`

#### `actualizarEstadoPedido(id, nuevoEstado)`
- Actualiza el estado de un pedido
- Mapea estado del frontend al backend
- Retorna: `{ success: boolean, mensaje: string, error: string }`

#### `actualizarEstadoPagoPedido(id, estadoPago, medioPago)`
- Actualiza estado de pago y medio de pago
- Retorna: `{ success: boolean, data: pedido, error: string }`

#### `eliminarPedido(id)`
- Elimina un pedido (soft delete)
- Retorna: `{ success: boolean, mensaje: string, error: string }`

**Mapeos:**

**Estados:**
- Frontend → Backend:
  - `'recibido'` → `'RECIBIDO'`
  - `'en_cocina'` → `'EN_PREPARACION'`
  - `'listo'` → `'EN_PREPARACION'` (no existe LISTO en BD)
  - `'entregado'` → `'ENTREGADO'`
  - `'cancelado'` → `'CANCELADO'`

- Backend → Frontend:
  - `'RECIBIDO'` → `'recibido'`
  - `'EN_PREPARACION'` → `'en_cocina'`
  - `'ENTREGADO'` → `'entregado'`
  - `'CANCELADO'` → `'cancelado'`

**Modalidades:**
- Frontend → Backend: `'delivery'` → `'DELIVERY'`, `'retiro'` → `'RETIRO'`
- Backend → Frontend: `'DELIVERY'` → `'delivery'`, `'RETIRO'` → `'retiro'`

**Orígenes:**
- Frontend → Backend: `'mostrador'` → `'MOSTRADOR'`, etc.
- Backend → Frontend: `'MOSTRADOR'` → `'mostrador'`, etc.

**Medios de Pago:**
- Frontend → Backend: `'efectivo'` → `'EFECTIVO'`, etc.
- Normaliza a mayúsculas

**Transformación de Pedidos:**

**Backend → Frontend:**
```javascript
{
  id: String,
  clienteNombre: string,
  origen: string (lowercase),
  tipo: 'ya' | 'programado',
  horaProgramada: string | null,
  timestamp: number,
  items: [{
    id: number,
    articulo_id: number,
    nombre: string,
    cantidad: number,
    precio: number,
    subtotal: number,
    extras: object | null,
    observaciones: string | null
  }],
  total: number,
  paymentStatus: 'paid' | 'pending',
  estado: string,
  tipoEntrega: string,
  subtotal: number,
  ivaTotal: number
}
```

**Frontend → Backend:**
```javascript
{
  cliente_nombre: string,
  cliente_direccion: string,
  cliente_telefono: string,
  cliente_email: string | null,
  origen_pedido: string (uppercase),
  subtotal: number,
  iva_total: number,
  total: number,
  medio_pago: string (uppercase) | null,
  estado_pago: 'PAGADO' | 'DEBE',
  modalidad: 'DELIVERY' | 'RETIRO',
  horario_entrega: ISO string | null,
  estado: string (uppercase),
  observaciones: string,
  articulos: [{
    articulo_id: number,
    articulo_nombre: string,
    cantidad: number,
    precio: number,
    subtotal: number,
    personalizaciones: object,
    observaciones: string | null
  }]
}
```

### 2. `comandasService.js`

**Responsabilidades:**
- Comunicación con API de comandas
- Transformación de datos frontend ↔ backend
- Gestión de estados de comandas

**Funciones Principales:**

#### `obtenerComandas(filtros = {})`
- Obtiene lista de comandas
- Por defecto filtra solo comandas del día actual
- Maneja timeouts (10s para lista, 3s por comanda)
- Usa `Promise.allSettled` para continuar si alguna falla
- Retorna: `{ success: boolean, data: [], error: string }`

#### `obtenerComandaPorId(id)`
- Obtiene una comanda específica con sus artículos
- Retorna: `{ success: boolean, data: comanda, error: string }`

#### `crearComanda(comandaData)`
- Crea una nueva comanda
- Retorna: `{ success: boolean, data: comanda, error: string }`

#### `actualizarEstadoComanda(id, nuevoEstado)`
- Actualiza el estado de una comanda
- Maneja rate limits
- Retorna: `{ success: boolean, mensaje: string, error: string, rateLimit: boolean }`

**Mapeos de Estados:**
- Frontend → Backend:
  - `'recibido'` → `'RECIBIDO'`
  - `'en_preparacion'` → `'EN_PREPARACION'`
  - `'listo'` → `'LISTA'`
  - `'entregado'` → `'LISTA'`
  - `'cancelado'` → `'CANCELADA'`

- Backend → Frontend:
  - `'RECIBIDO'` → `'recibido'`
  - `'EN_PREPARACION'` → `'en_preparacion'`
  - `'LISTA'` → `'listo'`
  - `'CANCELADA'` → `'cancelado'`

---

## Flujos de Trabajo

### 1. Crear Pedido Nuevo

```
1. Usuario hace clic en "NUEVO PEDIDO" (o presiona F1)
   ↓
2. Se abre ModalNuevoPedido (Paso 1)
   ↓
3. Usuario selecciona categoría y productos
   ↓
4. Si producto tiene extras → ModalExtras
   ↓
5. Productos se agregan al carrito
   ↓
6. Usuario hace clic en "Siguiente" → Paso 2
   ↓
7. Usuario completa datos del cliente
   ↓
8. Usuario selecciona tipo de entrega, origen, etc.
   ↓
9. Usuario hace clic en "Siguiente" → Paso 3
   ↓
10. Usuario revisa resumen
    ↓
11. Usuario hace clic en "Crear Pedido"
    ↓
12. Si estadoPago === 'paid':
    → Abre ModalCobro
    → Usuario selecciona medio de pago
    → Se registra venta
    → Se crea pedido con estado_pago = PAGADO
    ↓
    Si estadoPago === 'pending':
    → Se crea pedido directamente
    ↓
13. Pedido aparece en columna "RECIBIDOS"
```

### 2. Mover Pedido a Cocina

```
1. Usuario hace clic en "MARCHAR" o arrastra pedido
   ↓
2. Se llama a pedidosService.actualizarEstadoPedido(id, 'en_cocina')
   ↓
3. Backend actualiza estado a 'EN_PREPARACION'
   ↓
4. Frontend actualiza estado local
   ↓
5. Pedido aparece en columna "EN PREPARACIÓN"
   ↓
6. Comanda asociada se muestra en ModoCocina
```

### 3. Marcar Pedido como Listo

```
1. Usuario hace clic en "LISTO" o arrastra pedido
   ↓
2. Actualización optimista: UI se actualiza inmediatamente
   ↓
3. Se llama a pedidosService.actualizarEstadoPedido(id, 'entregado')
   ↓
4. Backend actualiza estado a 'ENTREGADO'
   ↓
5. Si falla (y no es rate limit):
   → Se revierte actualización optimista
   ↓
6. Si paymentStatus === 'paid':
   → Pedido se mueve a lista de entregados
   ↓
   Si paymentStatus === 'pending':
   → Pedido permanece en "EN PREPARACIÓN" hasta cobrarlo
```

### 4. Cobrar Pedido

```
1. Usuario hace clic en "COBRAR"
   ↓
2. Se abre ModalCobro
   ↓
3. Se obtiene pedido completo del backend
   ↓
4. Usuario selecciona medio de pago y tipo de factura
   ↓
5. Usuario hace clic en "Cobrar"
   ↓
6. Se llama a ventasService.crearVenta()
   ↓
7. Se actualiza pedido: estado_pago = 'PAGADO', medio_pago = seleccionado
   ↓
8. Si pedido estaba entregado:
   → Se mueve a lista de entregados
   ↓
9. Modal se cierra
```

### 5. Modo Cocina

```
1. Usuario hace clic en "MODO COCINA"
   ↓
2. Se abre ModoCocina
   ↓
3. Se cargan comandas con estado 'EN_PREPARACION'
   ↓
4. Se filtra: solo comandas cuyo pedido está en 'EN_PREPARACION'
   ↓
5. Polling automático cada 30 segundos
   ↓
6. Cocina marca comanda como "LISTA"
   ↓
7. Se actualiza comanda: estado = 'LISTA'
   ↓
8. Se actualiza pedido asociado: estado = 'ENTREGADO'
   ↓
9. Pedido aparece en columna "EN PREPARACIÓN" (si no está pagado)
```

---

## Lógica de Negocio

### Cálculo de Precios

**Subtotal:**
```
subtotal = Σ((precio_base + Σ(precio_extra)) × cantidad)
```

**Descuento:**
```
descuento = subtotal × (porcentaje_descuento / 100)
```

**IVA:**
```
iva = (subtotal - descuento) × 0.21
```

**Envío:**
```
envio = tipoEntrega === 'delivery' && tieneDireccion ? 300 : 0
```

**Total:**
```
total = (subtotal - descuento) + iva + envio
```

### Estados del Pedido

**Flujo Normal:**
```
RECIBIDO → EN_PREPARACION → ENTREGADO
```

**Estados Especiales:**
- `CANCELADO`: Pedido cancelado (no se puede restaurar)
- `ENTREGADO + PAGADO`: Pedido completado
- `ENTREGADO + PENDIENTE`: Pedido entregado pero sin cobrar

**Lógica de Visualización:**
- **Columna RECIBIDOS**: Solo pedidos con `estado === 'recibido'`
- **Columna EN PREPARACIÓN**: Pedidos con `estado === 'en_cocina'` O (`estado === 'entregado'` Y `paymentStatus === 'pending'`)

### Gestión de Extras/Adicionales

**Estructura en BD:**
```json
{
  "extras": [
    {
      "id": 1,
      "nombre": "Queso Extra",
      "precio": 500
    }
  ]
}
```

**Almacenamiento:**
- Se guarda en campo `personalizaciones` (JSON) de `pedidos_contenido`
- Se calcula el precio unitario: `precio_base + Σ(precio_extra)`
- Se guarda en `precio` de `pedidos_contenido`

**Múltiples Unidades:**
- Si se agregan 3 unidades de un producto con extras:
  - Cada unidad puede tener extras diferentes
  - Se crean 3 items separados en el carrito
  - Cada item tiene `cantidad: 1`

### Pedidos Programados

**Características:**
- Tienen `horario_entrega` definido
- Se muestran con hora programada en lugar de tiempo transcurrido
- Alerta visual cuando faltan 10-15 minutos

**Cálculo de Alerta:**
```javascript
diferencia = (horaProgramada - ahora) / 60000 // minutos
faltaPoco = diferencia <= 15 && diferencia >= 10
```

### Rate Limiting

**Manejo:**
- Se detecta cuando `status === 429` o mensaje contiene "Rate limit"
- En actualizaciones optimistas, se mantiene el cambio
- En polling, se ralentiza o detiene temporalmente
- Se muestra mensaje al usuario con tiempo de espera

**Estrategias:**
- `usePedidos`: Intervalo largo (120s) para evitar rate limits
- `ModoCocina`: Maneja rate limits ralentizando polling
- Actualizaciones optimistas: Se mantienen aunque falle por rate limit

---

## Mapeo de Datos

### Frontend → Backend

**Pedido:**
```javascript
// Frontend
{
  clienteNombre: "Juan Pérez",
  cliente: {
    nombre: "Juan Pérez",
    telefono: "1234567890",
    email: "juan@example.com",
    direccion: "Calle 123, 456"
  },
  origen: "mostrador",
  tipoEntrega: "delivery",
  items: [{
    id: 1,
    nombre: "Hamburguesa",
    cantidad: 2,
    precio: 1000,
    extrasSeleccionados: [{ id: 1, nombre: "Queso", precio: 200 }],
    observacion: "Sin cebolla"
  }],
  subtotal: 2400,
  ivaTotal: 504,
  total: 2904,
  medioPago: "efectivo",
  paymentStatus: "paid",
  estado: "recibido"
}

// Backend
{
  cliente_nombre: "Juan Pérez",
  cliente_direccion: "Calle 123, 456",
  cliente_telefono: "1234567890",
  cliente_email: "juan@example.com",
  origen_pedido: "MOSTRADOR",
  modalidad: "DELIVERY",
  subtotal: 2400.00,
  iva_total: 504.00,
  total: 2904.00,
  medio_pago: "EFECTIVO",
  estado_pago: "PAGADO",
  estado: "RECIBIDO",
  articulos: [{
    articulo_id: 1,
    articulo_nombre: "Hamburguesa",
    cantidad: 2,
    precio: 1200.00, // (1000 + 200) × 1
    subtotal: 2400.00,
    personalizaciones: {
      extras: [{ id: 1, nombre: "Queso", precio: 200 }]
    },
    observaciones: "Sin cebolla"
  }]
}
```

### Backend → Frontend

**Pedido:**
```javascript
// Backend
{
  id: 1,
  fecha: "2025-12-15T10:00:00Z",
  cliente_nombre: "Juan Pérez",
  cliente_direccion: "Calle 123, 456",
  cliente_telefono: "1234567890",
  cliente_email: "juan@example.com",
  subtotal: 2400.00,
  iva_total: 504.00,
  total: 2904.00,
  medio_pago: "EFECTIVO",
  estado_pago: "PAGADO",
  modalidad: "DELIVERY",
  origen_pedido: "MOSTRADOR",
  horario_entrega: null,
  estado: "RECIBIDO"
}

// Frontend
{
  id: "1",
  clienteNombre: "Juan Pérez",
  origen: "mostrador",
  tipo: "ya",
  horaProgramada: null,
  timestamp: 1734264000000,
  items: [{
    id: 1,
    articulo_id: 1,
    nombre: "Hamburguesa",
    cantidad: 2,
    precio: 1200,
    subtotal: 2400,
    extras: [{ id: 1, nombre: "Queso", precio: 200 }],
    observaciones: "Sin cebolla"
  }],
  total: 2904,
  paymentStatus: "paid",
  estado: "recibido",
  tipoEntrega: "delivery",
  subtotal: 2400,
  ivaTotal: 504
}
```

---

## Funcionalidades Implementadas

### ✅ Gestión de Pedidos
- [x] Crear pedido nuevo
- [x] Ver lista de pedidos
- [x] Filtrar por estado
- [x] Buscar por ID o nombre de cliente
- [x] Mover pedido entre estados (drag & drop)
- [x] Marcar como "En Cocina"
- [x] Marcar como "Listo/Entregado"
- [x] Cancelar pedido
- [x] Ver pedidos entregados

### ✅ Gestión de Productos
- [x] Seleccionar productos por categoría
- [x] Buscar productos
- [x] Agregar productos al carrito
- [x] Seleccionar extras/adicionales
- [x] Agregar observaciones por item
- [x] Modificar cantidad
- [x] Eliminar items del carrito
- [x] Editar items del carrito

### ✅ Gestión de Clientes
- [x] Capturar datos del cliente
- [x] Validar datos (nombre, teléfono, email opcional)
- [x] Capturar dirección (si es delivery)
- [x] Seleccionar tipo de entrega

### ✅ Cálculos Financieros
- [x] Calcular subtotal
- [x] Calcular descuento (porcentaje)
- [x] Calcular IVA (21%)
- [x] Calcular envío ($300 si es delivery)
- [x] Calcular total

### ✅ Cobro
- [x] Modal de cobro
- [x] Seleccionar medio de pago
- [x] Seleccionar tipo de factura
- [x] Registrar venta
- [x] Actualizar estado de pago del pedido
- [x] Cobrar pedido nuevo antes de crearlo

### ✅ Modo Cocina
- [x] Ver comandas en preparación
- [x] Marcar comanda como lista
- [x] Cancelar comanda
- [x] Polling automático
- [x] Vista optimizada para cocina
- [x] Vista detallada para encargados

### ✅ Pedidos Programados
- [x] Seleccionar hora programada
- [x] Mostrar hora programada en tarjeta
- [x] Alerta visual cuando falta poco (10-15 min)

### ✅ UI/UX
- [x] Drag & Drop
- [x] Paginación de pedidos
- [x] Búsqueda en tiempo real
- [x] Sidebar colapsable
- [x] Responsive design
- [x] Indicadores visuales (estado, pago, origen)
- [x] Atajos de teclado (F1 para nuevo pedido)

### ✅ Manejo de Errores
- [x] Manejo de rate limits
- [x] Manejo de timeouts
- [x] Actualización optimista con reversión
- [x] Mensajes de error descriptivos
- [x] Manejo de errores de red

---

## Funcionalidades Pendientes

### 🔲 Edición de Pedidos
- [ ] Editar pedido existente
- [ ] Agregar items a pedido existente
- [ ] Modificar items de pedido existente
- [ ] Modificar datos del cliente

### 🔲 Impresión
- [ ] Imprimir factura/ticket
- [ ] Imprimir comanda
- [ ] Imprimir resumen de pedido

### 🔲 Notificaciones
- [ ] Sistema de notificaciones
- [ ] Notificaciones de pedidos nuevos desde web
- [ ] Notificaciones de pedidos programados próximos

### 🔲 Reportes
- [ ] Reporte de pedidos del día
- [ ] Reporte de pedidos por período
- [ ] Estadísticas de ventas

### 🔲 Mejoras de UI/UX
- [ ] Animaciones de transición
- [ ] Sonidos de notificación
- [ ] Modo oscuro
- [ ] Personalización de columnas

### 🔲 Funcionalidades Avanzadas
- [ ] Historial de cambios de estado
- [ ] Timeline detallado del pedido
- [ ] Comentarios/observaciones por estado
- [ ] Asignación de pedidos a usuarios
- [ ] Priorización de pedidos

---

## Notas Técnicas

### Dependencias Principales
- `@dnd-kit/core`: Drag & Drop
- `@dnd-kit/utilities`: Utilidades de Drag & Drop
- `zod`: Validación de esquemas
- `next`: Framework React
- `axios`: Cliente HTTP

### Consideraciones de Performance
- Polling con intervalos largos para evitar rate limits
- Actualización optimista para mejor UX
- Uso de `useMemo` y `useCallback` para optimizar renders
- Paginación para listas grandes
- Timeouts en llamadas a API

### Seguridad
- Validación de datos con Zod
- Sanitización de inputs
- Manejo seguro de errores
- Tokens de autenticación en headers

### Compatibilidad
- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Responsive (móvil, tablet, desktop)
- Soporte para touch (drag & drop en móvil)

---

## Conclusión

El módulo de pedidos es un sistema completo y robusto que gestiona todo el ciclo de vida de un pedido, desde su creación hasta su cobro. Está diseñado para ser escalable, mantenible y fácil de usar, con una arquitectura clara que separa responsabilidades entre componentes, hooks y servicios.

La integración con la base de datos es sólida, con mapeos claros entre el frontend y el backend, y manejo robusto de errores y casos edge como rate limits y timeouts.

El sistema está preparado para crecer con nuevas funcionalidades como edición de pedidos, impresión, notificaciones y reportes, manteniendo la estructura y los patrones establecidos.

