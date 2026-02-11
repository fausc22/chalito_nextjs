# 🎨 FRONTEND: MÓDULO DE PEDIDOS

**Documento:** 04_FRONTEND_PEDIDOS.md  
**Relacionado con:** 01_OVERVIEW_GENERAL.md, 03_BACKEND_PEDIDOS.md, 05_AUTOMATIZACION_Y_WORKER.md

---

## 3. ANÁLISIS DEL FRONTEND

### 3.1 Arquitectura General

**Stack tecnológico:**
- Next.js (React)
- Tailwind CSS
- Socket.IO Client
- @dnd-kit (drag & drop)

**Estructura de archivos:**
```
chalito-frontend/
├── pages/
│   └── pedidos/
│       └── index.jsx              # Página principal de pedidos
├── components/
│   └── pedidos/
│       ├── OrderCard.jsx          # Card de pedido (vista cards)
│       ├── OrderRow.jsx           # Fila de pedido (vista tabla)
│       ├── PedidosColumn.jsx      # Columna de estado
│       ├── PedidosSidebar.jsx     # Sidebar con controles
│       └── modals/                # Modales varios
├── hooks/
│   └── pedidos/
│       ├── usePedidos.js          # Hook principal de pedidos
│       └── useNuevoPedido.js      # Hook para crear pedidos
├── services/
│   └── pedidosService.js         # Servicio API
├── lib/
│   └── pedidoTimeUtils.js        # Utilidades de tiempo
└── hooks/
    └── useSocket.js              # Hook WebSocket
```

### 3.2 Componentes Principales

#### 3.2.1 `pages/pedidos/index.jsx`

**Responsabilidades:**
- Layout principal de la página
- Gestión de modales
- Drag & drop entre columnas
- Integración de hooks

**Estructura:**
- Sidebar (desktop/mobile)
- Dos columnas: "RECIBIDOS" (40%) y "EN PREPARACIÓN" (60%)
- Modales: Nuevo pedido, Cobro, Cancelar, Imprimir, etc.

**Vista dual:**
- Vista cards (default)
- Vista tabla (toggle)

#### 3.2.2 `components/pedidos/OrderCard.jsx`

**Componente:** Card visual de pedido

**Muestra:**
- ID, origen, cliente
- Badge de tipo entrega (DELIVERY/RETIRO)
- Badge de estado de pago (PAGADO/DEBE)
- Badge de tiempo (calculado con `pedidoTimeUtils`)
- Items del pedido
- Botones de acción (LISTO, COBRAR, EDITAR, CANCELAR, IMPRIMIR)

**⚠️ NOTA:** Botón "MARCHAR" está oculto (`false &&`) - el sistema lo hace automáticamente

**Estados visuales:**
- Normal: fondo blanco
- Atrasado: borde rojo, fondo rojo claro, animación pulse
- Cerca del límite: borde amarillo, fondo amarillo claro
- Cerca de hora programada: borde rojo, fondo rojo claro

#### 3.2.3 `components/pedidos/OrderRow.jsx`

**Componente:** Fila de tabla visual de pedido

**Similar a OrderCard pero en formato tabla**

**Muestra la misma información pero en layout horizontal**

#### 3.2.4 `components/pedidos/PedidosColumn.jsx`

**Componente:** Columna de estado (RECIBIDOS / EN PREPARACIÓN)

**Responsabilidades:**
- Renderiza lista de pedidos según estado
- Soporta drag & drop
- Muestra indicador de capacidad (para EN PREPARACIÓN)
- Alterna entre vista cards y tabla

**Indicador de capacidad:**
- Muestra "X/Y pedidos" en header de columna EN PREPARACIÓN
- Se actualiza vía polling y WebSocket

### 3.3 Hooks

#### 3.3.1 `hooks/pedidos/usePedidos.js`

**Hook principal para gestión de pedidos**

**Estado:**
- `pedidos`: Lista completa de pedidos
- `pedidosEntregados`: Lista de pedidos entregados
- `busquedaPedidos`: Texto de búsqueda
- `loading`: Estado de carga
- `error`: Error si existe

**Funciones:**
- `cargarPedidos()`: Carga pedidos desde API
- `handleDragEnd()`: Maneja drag & drop (deshabilitado para RECIBIDO → EN_PREPARACION)
- `handleMarcharACocina()`: ⚠️ **DEPRECADO** - el sistema lo hace automáticamente
- `handleListo()`: Marca pedido como ENTREGADO
- `handleCancelar()`: Cancela pedido
- `agregarPedido()`: Agrega pedido a lista local
- `actualizarPedido()`: Actualiza pedido en lista local

**Polling:**
- Carga inicial al montar
- Polling cada 45 segundos (`setInterval`)

**WebSockets:**
- `handlePedidoCreado`: Recarga pedidos cuando se crea uno nuevo
- `handlePedidoEstadoCambiado`: Actualiza pedido localmente cuando cambia estado
- `handleCapacidadActualizada`: Actualiza capacidad (se maneja en PedidosColumn)
- `handlePedidosAtrasados`: Log de pedidos atrasados

**Filtrado:**
- `pedidosRecibidos`: Filtra por `estado === 'recibido'`
- `pedidosEnCocina`: Filtra por `estado === 'en_cocina'` O (`estado === 'entregado'` AND `paymentStatus === 'pending'`)

**⚠️ NOTA IMPORTANTE:** 
- Los pedidos entregados pero no pagados aparecen en "EN PREPARACIÓN" para poder cobrarlos
- Esto es intencional para el flujo de trabajo

#### 3.3.2 `hooks/useSocket.js`

**Hook para conexión WebSocket**

**Configuración:**
- Conecta a `API_CONFIG.BASE_URL`
- Transports: `['websocket', 'polling']`
- Reconnection: 5 intentos, delay 1s

**Eventos suscritos:**
- `pedido:creado`
- `pedido:estado-cambiado`
- `capacidad:actualizada`
- `pedidos:atrasados`

**Emit:**
- `subscribe:pedidos`: Suscripción a eventos de pedidos
- `subscribe:capacidad`: Suscripción a eventos de capacidad

### 3.4 Services

#### 3.4.1 `services/pedidosService.js`

**Servicio de API para pedidos**

**Funciones principales:**

**Mapeo de estados:**
- Frontend → Backend:
  - `recibido` → `RECIBIDO`
  - `en_cocina` → `EN_PREPARACION`
  - `entregado` → `ENTREGADO`
  - `cancelado` → `CANCELADO`
- Backend → Frontend:
  - `RECIBIDO` → `recibido`
  - `EN_PREPARACION` → `en_cocina`
  - `ENTREGADO` → `entregado`
  - `CANCELADO` → `cancelado`

**Transformación de datos:**
- `transformarPedidoBackendAFrontend()`: Convierte estructura de BD a formato frontend
- `transformarPedidoFrontendABackend()`: Convierte formato frontend a estructura de BD

**Mapeo de campos:**
- `cliente_nombre` ↔ `clienteNombre`
- `origen_pedido` ↔ `origen` (MOSTRADOR ↔ mostrador)
- `modalidad` ↔ `tipoEntrega` (DELIVERY ↔ delivery)
- `estado_pago` ↔ `paymentStatus` (PAGADO ↔ paid)
- `horario_entrega` ↔ `horaProgramada` (timestamp ↔ HH:MM)

**Métodos:**
- `obtenerPedidos(filtros)`: Obtiene lista de pedidos
- `obtenerPedidoPorId(id)`: Obtiene pedido específico
- `crearPedido(pedidoData)`: Crea nuevo pedido
- `actualizarEstadoPedido(id, nuevoEstado)`: Actualiza estado
- `eliminarPedido(id)`: Elimina pedido
- `obtenerCapacidadCocina()`: Obtiene información de capacidad

### 3.5 Utilidades

#### 3.5.1 `lib/pedidoTimeUtils.js`

**Funciones de cálculo de tiempo**

**`calcularEstadoTemporalPedido(pedido, currentTime)`**

**Lógica:**
1. Si `estado === 'en_cocina'`:
   - Si tiene `horaInicioPreparacion` y `tiempoEstimadoPreparacion`:
     - Calcula minutos transcurridos
     - Calcula si está atrasado (`ahora > horaEsperadaFinalizacion`)
     - Calcula si está cerca del límite (80% del tiempo)
     - Retorna: `{ label: "En prep. Xm" o "Atrasado Xm", isLate, isNearLimit }`
   - Si no tiene datos, usa `timestamp` de creación
2. Si es pedido "cuanto antes" (`tipo === 'ya'` o sin `horaProgramada`):
   - Muestra tiempo desde creación: `"Creado Xm"`
3. Si es pedido programado:
   - Calcula diferencia hasta `horaProgramada`
   - Si ya pasó: `"Atrasado Xm"` (isLate = true)
   - Si está cerca (10-15 min): `isNearScheduled = true`
   - Si no: muestra hora programada `"HH:MM"`

**`formatearHora24(hora)`**
- Convierte cualquier formato de hora a `HH:MM` (24 horas)

**`formatearMinutos(minutos)`**
- Convierte minutos a formato legible: `"Xm"` o `"Xh Xm"`

### 3.6 Sincronización Frontend-Backend

**Mecanismos:**
1. **Polling:** Cada 45 segundos (`usePedidos.js`)
2. **WebSockets:** Eventos en tiempo real (`useSocket.js`)
3. **Actualización optimista:** En `handleListo()`, actualiza UI antes de confirmar con backend

**Mapeo de estados:**
- Frontend usa `en_cocina`, backend usa `EN_PREPARACION`
- El servicio `pedidosService.js` hace la traducción

**Consistencia:**
- Los pedidos entregados pero no pagados aparecen en "EN PREPARACIÓN" en frontend
- Esto permite cobrarlos sin cambiar su estado real en BD

---

## 5. TIEMPO REAL Y SINCRONIZACIÓN

### 5.1 Mecanismos de Sincronización

#### 5.1.1 Polling

**Configuración:**
- Frecuencia: **45 segundos**
- Ubicación: `hooks/pedidos/usePedidos.js`
- Endpoint: `GET /pedidos`

**Ventajas:**
- Funciona sin WebSockets
- Simple de implementar
- Confiable

**Desventajas:**
- Latencia máxima: 45 segundos
- Carga del servidor (requests constantes)
- No es tiempo real verdadero

#### 5.1.2 WebSockets (Socket.IO)

**Configuración:**
- Backend: `server.js` inicializa Socket.IO
- Frontend: `hooks/useSocket.js` conecta al servidor
- Eventos: `pedido:creado`, `pedido:estado-cambiado`, `capacidad:actualizada`, `pedidos:atrasados`

**Ventajas:**
- Tiempo real verdadero
- Menor carga del servidor
- Actualización instantánea

**Desventajas:**
- Requiere conexión persistente
- Más complejo de manejar
- Puede desconectarse

**Eventos emitidos desde backend:**
1. **`pedido:creado`**: Al crear pedido (`pedidosController.crearPedido`)
2. **`pedido:estado-cambiado`**: Al cambiar estado (`pedidosController.actualizarEstadoPedido`, `OrderQueueEngine.evaluarColaPedidos`)
3. **`capacidad:actualizada`**: Al cambiar capacidad (cuando entra/sale pedido de EN_PREPARACION)
4. **`pedidos:atrasados`**: Cuando se detectan pedidos atrasados (`OrderQueueEngine.detectarPedidosAtrasados`)

**Suscripciones en frontend:**
- `subscribe:pedidos`: Suscripción a eventos de pedidos
- `subscribe:capacidad`: Suscripción a eventos de capacidad

### 5.2 Estrategia Híbrida

**Implementación actual:**
- **Polling principal:** 45 segundos (backup)
- **WebSockets:** Actualización en tiempo real (cuando disponible)

**Comportamiento:**
- Si WebSocket está conectado: Actualización instantánea + polling como backup
- Si WebSocket está desconectado: Solo polling

### 5.3 Información Actualizada en Tiempo Real

**Vía WebSocket:**
- Creación de pedidos
- Cambios de estado
- Cambios de capacidad
- Pedidos atrasados

**Vía Polling:**
- Lista completa de pedidos
- Información de capacidad (si WebSocket falla)

### 5.4 Manejo de Desconexiones

**Frontend:**
- `useSocket.js` maneja `disconnect` y `connect_error`
- Reintentos automáticos (5 intentos, delay 1s)
- El polling continúa funcionando si WebSocket falla

**Backend:**
- Socket.IO maneja reconexiones automáticamente
- Los eventos se emiten a todos los clientes conectados

---

## 7. VERIFICACIÓN DE CONSISTENCIA - FRONTEND

### 7.2 Consistencia Backend-Frontend

#### 7.2.3 Pedidos Entregados No Pagados en "EN PREPARACIÓN"

**Problema:**
- Los pedidos entregados pero no pagados aparecen en la columna "EN PREPARACIÓN" en frontend
- Esto es intencional para poder cobrarlos, pero puede ser confuso

**Impacto:** Medio (confusión visual)

**Recomendación:** Considerar una columna separada "PENDIENTE DE COBRO" o mejorar el indicador visual

---

**Documento relacionado:** Ver `05_AUTOMATIZACION_Y_WORKER.md` para detalles de sincronización con automatización




