# 📋 ANÁLISIS TÉCNICO INTEGRAL: MÓDULO DE PEDIDOS - EL CHALITO

**Fecha de análisis:** 2025-01-XX  
**Versión del sistema:** 1.0.0  
**Objetivo:** Documentación técnica completa del módulo de pedidos para evolución, optimización y auditoría

---

## 📊 ÍNDICE

1. [Análisis de Base de Datos](#1-análisis-de-base-de-datos)
2. [Análisis del Backend](#2-análisis-del-backend)
3. [Análisis del Frontend](#3-análisis-del-frontend)
4. [Automatización de Pedidos](#4-automatización-de-pedidos)
5. [Tiempo Real y Sincronización](#5-tiempo-real-y-sincronización)
6. [Diagramas de Flujo](#6-diagramas-de-flujo)
7. [Verificación de Consistencia](#7-verificación-de-consistencia)
8. [Riesgos y Recomendaciones](#8-riesgos-y-recomendaciones)

---

## 1. ANÁLISIS DE BASE DE DATOS

### 1.1 Tablas Relacionadas al Módulo de Pedidos

#### 1.1.1 Tabla `pedidos`

**Estructura completa:**
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
  `estado` enum('RECIBIDO','EN_PREPARACION','LISTO','ENTREGADO','CANCELADO') NOT NULL DEFAULT 'RECIBIDO',
  `observaciones` varchar(255) DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `usuario_nombre` varchar(100) DEFAULT NULL,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `hora_inicio_preparacion` timestamp NULL DEFAULT NULL COMMENT 'Timestamp cuando el pedido entra a EN_PREPARACION',
  `tiempo_estimado_preparacion` int NOT NULL DEFAULT '15' COMMENT 'Minutos estimados de preparación (default 15)',
  `hora_esperada_finalizacion` timestamp NULL DEFAULT NULL COMMENT 'Calculado: hora_inicio_preparacion + tiempo_estimado_preparacion',
  `prioridad` enum('NORMAL','ALTA') NOT NULL DEFAULT 'NORMAL' COMMENT 'ALTA para pedidos "cuanto antes", NORMAL para programados',
  `transicion_automatica` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Si FALSE, requiere intervención manual',
  PRIMARY KEY (`id`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_estado` (`estado`),
  KEY `idx_modalidad` (`modalidad`),
  KEY `idx_usuario_id` (`usuario_id`),
  KEY `idx_horario_entrega` (`horario_entrega`),
  KEY `idx_estado_pago` (`estado_pago`),
  KEY `idx_hora_inicio_preparacion` (`hora_inicio_preparacion`),
  KEY `idx_prioridad` (`prioridad`),
  KEY `idx_estado_hora_inicio` (`estado`,`hora_inicio_preparacion`),
  KEY `idx_estado_prioridad` (`estado`,`prioridad`,`fecha`),
  CONSTRAINT `pedidos_usuario_fk` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Campos críticos para automatización:**
- `estado`: Controla el flujo del pedido (RECIBIDO → EN_PREPARACION → LISTO → ENTREGADO)
- `hora_inicio_preparacion`: Timestamp cuando entra a EN_PREPARACION (usado para calcular tiempos)
- `tiempo_estimado_preparacion`: Minutos estimados (default 15, configurable)
- `hora_esperada_finalizacion`: Pre-calculado para detectar atrasos
- `prioridad`: ALTA (cuanto antes) vs NORMAL (programado)
- `transicion_automatica`: Flag para permitir bypass manual
- `horario_entrega`: Para pedidos programados (NULL = cuanto antes)

**Campos de tiempo:**
- `fecha`: Creación del pedido
- `fecha_modificacion`: Última modificación (auto-actualizado)
- `horario_entrega`: Hora programada de entrega (puede ser NULL)
- `hora_inicio_preparacion`: Inicio de preparación (se registra al pasar a EN_PREPARACION)
- `hora_esperada_finalizacion`: Hora calculada de finalización

**Estados posibles:**
- `RECIBIDO`: Pedido creado, esperando entrar a cocina
- `EN_PREPARACION`: En cocina, siendo preparado
- `LISTO`: Preparado, listo para entregar (NOTA: Este estado existe en el ENUM pero no se usa activamente)
- `ENTREGADO`: Entregado al cliente
- `CANCELADO`: Cancelado (restaura stock)

#### 1.1.2 Tabla `pedidos_contenido`

**Estructura:**
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
  KEY `idx_pedido_id` (`pedido_id`),
  KEY `idx_articulo_id` (`articulo_id`),
  CONSTRAINT `pedidos_contenido_pedido_fk` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pedidos_contenido_articulo_fk` FOREIGN KEY (`articulo_id`) REFERENCES `articulos` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Relación:** 1:N (un pedido tiene múltiples artículos)

**Campos importantes:**
- `personalizaciones`: JSON con extras/adicionales seleccionados
- `precio`: Precio unitario (incluye extras)
- `subtotal`: Precio × cantidad

#### 1.1.3 Tabla `comandas`

**Estructura:**
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
  CONSTRAINT `comandas_pedido_fk` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Relación:** 1:1 con `pedidos` (UNIQUE KEY en `pedido_id`)

**Propósito:** Comanda física para cocina (impresión)

**⚠️ NOTA IMPORTANTE:** 
- La tabla `comandas` tiene su propio campo `estado`, pero **NO se usa para lógica de negocio**
- El estado real del pedido está en `pedidos.estado`
- Las comandas se crean automáticamente cuando un pedido pasa a `EN_PREPARACION`
- La comanda es solo para impresión/física, no para control de flujo

#### 1.1.4 Tabla `comandas_contenido`

**Estructura:**
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
  KEY `idx_comanda_id` (`comanda_id`),
  CONSTRAINT `comandas_contenido_comanda_fk` FOREIGN KEY (`comanda_id`) REFERENCES `comandas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Relación:** 1:N con `comandas` (una comanda tiene múltiples artículos)

#### 1.1.5 Tabla `ventas`

**Estructura relevante:**
```sql
CREATE TABLE `ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cliente_nombre` varchar(150) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `iva_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `medio_pago` varchar(50) DEFAULT 'EFECTIVO',
  `estado` enum('FACTURADA','ANULADA') NOT NULL DEFAULT 'FACTURADA',
  `usuario_id` int DEFAULT NULL,
  `usuario_nombre` varchar(100) DEFAULT NULL,
  ...
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Relación con pedidos:**
- **NO hay relación directa** entre `pedidos` y `ventas` en la BD
- La facturación se hace manualmente desde el frontend
- Un pedido puede convertirse en una venta cuando se cobra

#### 1.1.6 Tabla `configuracion_sistema`

**Estructura:**
```sql
CREATE TABLE `configuracion_sistema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) NOT NULL,
  `valor` varchar(255) NOT NULL,
  `tipo` enum('INT','STRING','BOOLEAN','JSON') NOT NULL DEFAULT 'STRING',
  `descripcion` text,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Configuraciones relacionadas a pedidos:**
- `MAX_PEDIDOS_EN_PREPARACION`: Capacidad máxima de cocina (default: 8)
- `TIEMPO_BASE_PEDIDO_MINUTOS`: Tiempo estimado base (default: 15)
- `DEMORA_COCINA_MANUAL_MINUTOS`: Demora actual de cocina (ajustable manualmente)
- `INTERVALO_WORKER_SEGUNDOS`: Frecuencia del worker (default: 30)

### 1.2 Relaciones entre Tablas

```
pedidos (1) ──< (N) pedidos_contenido
pedidos (1) ──< (1) comandas
comandas (1) ──< (N) comandas_contenido
pedidos ──> usuarios (usuario_id)
comandas ──> usuarios (usuario_id)
```

**Cascadas:**
- Eliminar `pedido` → elimina `pedidos_contenido` y `comandas` (CASCADE)
- Eliminar `comanda` → elimina `comandas_contenido` (CASCADE)
- Eliminar `usuario` → `usuario_id` se pone NULL en pedidos/comandas (SET NULL)

### 1.3 Índices Críticos

**Para performance de automatización:**
- `idx_estado_hora_inicio`: Para queries de pedidos en preparación con tiempo
- `idx_estado_prioridad`: Para ordenar cola (prioridad + fecha)
- `idx_hora_inicio_preparacion`: Para detectar pedidos atrasados
- `idx_estado`: Para filtrar por estado rápidamente

---

## 2. ANÁLISIS DEL BACKEND

### 2.1 Arquitectura General

**Stack tecnológico:**
- Node.js + Express
- MySQL (con pool de conexiones)
- Socket.IO (WebSockets)
- Middleware de autenticación/autorización
- Middleware de auditoría

**Estructura de archivos:**
```
chalito-backend/
├── controllers/
│   └── pedidosController.js      # Lógica de negocio de pedidos
├── routes/
│   └── pedidosRoutes.js          # Definición de endpoints
├── services/
│   ├── OrderQueueEngine.js       # Motor de automatización
│   ├── KitchenCapacityService.js # Gestión de capacidad
│   ├── TimeCalculationService.js # Cálculos de tiempo
│   ├── SocketService.js          # Eventos WebSocket
│   └── PrintService.js           # Impresión de comandas/tickets
├── workers/
│   └── OrderQueueWorker.js      # Worker periódico
├── validators/
│   └── pedidosValidators.js     # Validación de datos
└── server.js                     # Inicialización del servidor
```

### 2.2 Controllers

#### 2.2.1 `pedidosController.js`

**Responsabilidades:**
- Creación de pedidos
- Obtención de pedidos (con filtros)
- Actualización de estado
- Gestión de capacidad
- Creación automática de comandas
- Integración con WebSockets

**Funciones principales:**

**`crearPedido(req, res)`**
- Crea pedido en transacción
- Determina prioridad (ALTA si no tiene horario_entrega, NORMAL si es programado)
- Calcula `hora_inicio_preparacion` para pedidos programados
- Actualiza stock de artículos
- Evalúa cola inmediatamente si es pedido "cuanto antes" (optimización)
- Emite evento WebSocket `pedido:creado`

**`obtenerPedidos(req, res)`**
- Filtra por estado, modalidad, fechas
- **IMPORTANTE:** Para `EN_PREPARACION`, solo muestra del día actual (`DATE(fecha) = CURDATE()`)
- Por defecto, muestra pedidos activos del día o entregados/cancelados de últimos 7 días

**`actualizarEstadoPedido(req, res)`**
- Valida capacidad si se intenta mover a `EN_PREPARACION` manualmente
- Respeta flag `transicion_automatica` (permite bypass si es FALSE)
- Registra `hora_inicio_preparacion` y calcula `hora_esperada_finalizacion`
- Crea comanda automáticamente si no existe
- Restaura stock si se cancela
- Emite eventos WebSocket

**`forzarEstadoPedido(req, res)`**
- Bypass manual (solo ADMIN/GERENTE)
- Permite cambiar estado sin validar capacidad
- Útil para excepciones

**`obtenerCapacidadCocina(req, res)`**
- Endpoint para consultar capacidad actual
- Usado por frontend para mostrar indicadores

### 2.3 Services

#### 2.3.1 `OrderQueueEngine.js`

**Clase:** `OrderQueueEngine` (métodos estáticos)

**Método principal: `evaluarColaPedidos()`**

**Flujo:**
1. Obtiene información de capacidad (`KitchenCapacityService`)
2. Si hay capacidad disponible:
   - Obtiene pedidos `RECIBIDO` del día actual
   - Filtra por `transicion_automatica = TRUE`
   - Ordena por prioridad (ALTA primero) y fecha (más antiguos primero)
   - Limita a `espaciosDisponibles`
3. Para cada pedido:
   - Si es programado, verifica si ya es hora (`TimeCalculationService.verificarSiDebeIniciarPreparacion`)
   - Si es hora o es "cuanto antes", mueve a `EN_PREPARACION`
   - Crea comanda automáticamente
4. Emite eventos WebSocket para pedidos procesados

**Método: `moverPedidoAPreparacion(connection, pedidoId, tiempoEstimado)`**
- Actualiza estado a `EN_PREPARACION`
- Registra `hora_inicio_preparacion` (ahora)
- Calcula `hora_esperada_finalizacion`
- Crea comanda si no existe

**Método: `detectarPedidosAtrasados()`**
- Busca pedidos `EN_PREPARACION` donde `hora_esperada_finalizacion < ahora`
- Solo del día actual
- Emite evento WebSocket `pedidos:atrasados`

#### 2.3.2 `KitchenCapacityService.js`

**Métodos estáticos:**

**`obtenerCapacidadMaxima()`**
- Lee desde `configuracion_sistema` (clave `MAX_PEDIDOS_EN_PREPARACION`)
- Default: 8 si no existe configuración
- Compatibilidad con nombre antiguo `max_pedidos_en_preparacion`

**`contarPedidosEnPreparacion()`**
- Cuenta pedidos con `estado = 'EN_PREPARACION'`
- **Solo del día actual** (`DATE(fecha) = CURDATE()`)
- Evita contar pedidos antiguos que quedaron en este estado

**`hayCapacidadDisponible()`**
- Retorna `true` si `pedidosEnPreparacion < capacidadMaxima`

**`obtenerInfoCapacidad()`**
- Retorna objeto con:
  - `capacidadMaxima`
  - `pedidosEnPreparacion`
  - `espaciosDisponibles`
  - `porcentajeUso`
  - `estaLlena`

#### 2.3.3 `TimeCalculationService.js`

**Métodos estáticos:**

**`obtenerTiempoEstimado(pedidoId)`**
- Si tiene `pedidoId`, intenta obtener `tiempo_estimado_preparacion` del pedido
- Si no, lee desde configuración (`tiempo_base_preparacion_minutos`)
- Default: 15 minutos

**`calcularHoraInicioPreparacion(horarioEntrega, tiempoEstimadoMinutos)`**
- Para pedidos programados
- `hora_inicio = horario_entrega - tiempo_estimado`

**`calcularHoraEsperadaFinalizacion(horaInicioPreparacion, tiempoEstimadoMinutos)`**
- `hora_finalizacion = hora_inicio + tiempo_estimado`

**`verificarSiDebeIniciarPreparacion(pedidoId)`**
- Si no tiene `horario_entrega`, retorna `true` (cuanto antes)
- Si tiene `horario_entrega`, calcula `hora_inicio_preparacion` y verifica si `ahora >= hora_inicio`

**`obtenerPedidosAtrasados()`**
- Query: `estado = 'EN_PREPARACION' AND hora_esperada_finalizacion < ahora AND DATE(fecha) = CURDATE()`
- Solo del día actual

#### 2.3.4 `SocketService.js`

**Clase singleton para eventos WebSocket**

**Eventos emitidos:**
- `pedido:creado`: Cuando se crea un nuevo pedido
- `pedido:estado-cambiado`: Cuando cambia el estado de un pedido
- `capacidad:actualizada`: Cuando cambia la capacidad de cocina
- `pedidos:atrasados`: Cuando hay pedidos atrasados

**Métodos:**
- `emitPedidoCreado(pedidoData)`
- `emitPedidoEstadoCambiado(pedidoId, estadoAnterior, estadoNuevo, pedidoData)`
- `emitCapacidadActualizada(infoCapacidad)`
- `emitPedidosAtrasados(pedidosAtrasados)`

### 2.4 Workers

#### 2.4.1 `OrderQueueWorker.js`

**Clase:** `OrderQueueWorker` (singleton)

**Inicialización:**
- Se inicia en `server.js` después de 3 segundos del arranque
- Recibe instancia de `io` (Socket.IO) para eventos

**Configuración:**
- Intervalo por defecto: 30 segundos
- Se puede configurar desde `configuracion_sistema` (clave `INTERVALO_WORKER_SEGUNDOS`)
- Usa `setInterval` (no `node-cron` porque necesita segundos)

**Método `execute()`:**
1. Ejecuta `OrderQueueEngine.evaluarColaPedidos()`
2. Ejecuta `OrderQueueEngine.detectarPedidosAtrasados()`
3. Cada 10 ciclos (5 minutos): Actualiza demora automática
4. Cada 120 ciclos (1 hora): Recalcula tiempo base y analiza capacidad

**Métodos:**
- `start(customInterval, io)`: Inicia el worker
- `stop()`: Detiene el worker
- `getStatus()`: Retorna estado del worker
- `updateInterval(newIntervalSeconds)`: Actualiza intervalo (requiere reiniciar)

### 2.5 Routes

#### 2.5.1 `pedidosRoutes.js`

**Endpoints:**

```
POST   /pedidos                    # Crear pedido
GET    /pedidos                    # Obtener pedidos (con filtros)
GET    /pedidos/:id                # Obtener pedido por ID
PUT    /pedidos/:id                # Actualizar pedido (estado_pago, medio_pago)
PUT    /pedidos/:id/estado         # Actualizar estado
POST   /pedidos/:id/forzar-estado  # Forzar estado (bypass, solo ADMIN/GERENTE)
PUT    /pedidos/:id/observaciones  # Actualizar observaciones
DELETE /pedidos/:id                # Eliminar pedido
POST   /pedidos/:id/articulos       # Agregar artículo a pedido
GET    /pedidos/capacidad          # Obtener capacidad de cocina
GET    /pedidos/:id/comanda-print   # Datos para imprimir comanda
GET    /pedidos/:id/ticket-print   # Datos para imprimir ticket
```

**Middleware aplicado:**
- `authenticateToken`: Autenticación requerida
- `apiRateLimiter`: Rate limiting
- Validadores según endpoint

### 2.6 Validators

#### 2.6.1 `pedidosValidators.js`

**Schemas de validación:**
- `crearPedidoSchema`: Valida datos al crear pedido
- `actualizarEstadoPedidoSchema`: Valida estado al actualizar
- `actualizarObservacionesSchema`: Valida observaciones
- `agregarArticuloSchema`: Valida artículo al agregar

### 2.7 Inicialización del Servidor

**Archivo:** `server.js`

**Flujo de inicio:**
1. Crea servidor HTTP
2. Configura Socket.IO
3. Inicializa `SocketService`
4. Registra rutas
5. Configura manejo de errores
6. Configura eventos Socket.IO
7. Inicia servidor en puerto configurado
8. **Después de 3 segundos:** Inicia `OrderQueueWorker`

**Manejo de cierre graceful:**
- `SIGTERM` / `SIGINT`: Detiene worker y cierra servidor

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

## 4. AUTOMATIZACIÓN DE PEDIDOS

### 4.1 Arquitectura de Automatización

**Componentes:**
1. **OrderQueueWorker**: Ejecuta periódicamente (cada 30s por defecto)
2. **OrderQueueEngine**: Motor de reglas y decisiones
3. **KitchenCapacityService**: Gestión de capacidad
4. **TimeCalculationService**: Cálculos de tiempo

### 4.2 Flujo de Automatización

#### 4.2.1 Flujo Principal (Worker)

```
┌─────────────────────────────────────┐
│  OrderQueueWorker.execute()        │
│  (cada 30 segundos)                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  OrderQueueEngine.evaluarColaPedidos() │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  1. Obtener capacidad disponible    │
│     (KitchenCapacityService)        │
└──────────────┬──────────────────────┘
               │
               ├─ ¿Hay capacidad? ──NO──> Fin
               │
               ▼ SÍ
┌─────────────────────────────────────┐
│  2. Obtener pedidos RECIBIDO        │
│     - Del día actual                │
│     - transicion_automatica = TRUE   │
│     - Ordenados por:                 │
│       * Prioridad (ALTA primero)     │
│       * Fecha (más antiguos primero) │
│     - Limite: espaciosDisponibles   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. Para cada pedido:               │
│     - ¿Es programado?               │
│       SÍ → ¿Ya es hora?              │
│         NO → Saltar                  │
│         SÍ → Continuar              │
│       NO → Continuar                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. Mover a EN_PREPARACION          │
│     - Actualizar estado              │
│     - Registrar hora_inicio_preparacion │
│     - Calcular hora_esperada_finalizacion │
│     - Crear comanda automáticamente  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. Emitir eventos WebSocket        │
│     - pedido:estado-cambiado         │
│     - capacidad:actualizada          │
└─────────────────────────────────────┘
```

#### 4.2.2 Flujo de Creación de Pedido (Evento Inmediato)

```
┌─────────────────────────────────────┐
│  POST /pedidos (crearPedido)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Crear pedido en BD                  │
│  - Determinar prioridad              │
│  - Calcular hora_inicio_preparacion  │
│    (si es programado)                │
└──────────────┬──────────────────────┘
               │
               ├─ ¿Es "cuanto antes"? ──NO──> Fin
               │
               ▼ SÍ
┌─────────────────────────────────────┐
│  Evaluar cola inmediatamente        │
│  (OrderQueueEngine.evaluarColaPedidos) │
│  (en background, no bloquea respuesta) │
└─────────────────────────────────────┘
```

**Ventaja:** Los pedidos "cuanto antes" entran a cocina inmediatamente si hay capacidad, sin esperar al próximo ciclo del worker (30s).

### 4.3 Reglas de Automatización

#### 4.3.1 Priorización

**Orden de procesamiento:**
1. **Prioridad ALTA** (pedidos "cuanto antes")
2. **Prioridad NORMAL** (pedidos programados)
3. Dentro de cada prioridad: más antiguos primero

**Determinación de prioridad:**
- Si `horario_entrega IS NULL` → `prioridad = 'ALTA'`
- Si `horario_entrega IS NOT NULL` → `prioridad = 'NORMAL'`

#### 4.3.2 Validación de Capacidad

**Regla:**
- Solo se mueven pedidos a `EN_PREPARACION` si `pedidosEnPreparacion < capacidadMaxima`
- La capacidad se cuenta solo del día actual

**Excepciones:**
- Si `transicion_automatica = FALSE`, se puede forzar manualmente (solo ADMIN/GERENTE)

#### 4.3.3 Pedidos Programados

**Regla:**
- Un pedido programado solo entra a cocina cuando `ahora >= hora_inicio_preparacion`
- `hora_inicio_preparacion = horario_entrega - tiempo_estimado_preparacion`

**Ejemplo:**
- Pedido programado para las 15:00
- Tiempo estimado: 15 minutos
- `hora_inicio_preparacion = 14:45`
- El pedido entra a cocina a las 14:45 (si hay capacidad)

#### 4.3.4 Detección de Atrasos

**Regla:**
- Un pedido está atrasado si `ahora > hora_esperada_finalizacion`
- Solo se detectan pedidos del día actual
- Se emite evento WebSocket `pedidos:atrasados`

### 4.4 Prevención de Doble Procesamiento

**Mecanismos:**
1. **Transacciones:** `OrderQueueEngine` usa transacciones para atomicidad
2. **Filtro por estado:** Solo procesa pedidos con `estado = 'RECIBIDO'`
3. **Filtro por día:** Solo procesa pedidos del día actual
4. **Filtro por flag:** Solo procesa `transicion_automatica = TRUE`

**⚠️ RIESGO POTENCIAL:**
- Si el worker se ejecuta mientras se crea un pedido, podría procesarlo dos veces
- **Mitigación:** El worker usa transacciones y el pedido se crea con `estado = 'RECIBIDO'`, así que el worker no lo procesará hasta el próximo ciclo

### 4.5 Idempotencia

**Garantías:**
- Cambiar estado a `EN_PREPARACION` es idempotente (si ya está en ese estado, no hace nada)
- Crear comanda verifica si ya existe antes de crear
- Actualizar timestamps solo si son NULL

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

## 6. DIAGRAMAS DE FLUJO

### 6.1 Flujo Completo de un Pedido

```
┌─────────────────────────────────────────────────────────────┐
│                    CREACIÓN DE PEDIDO                      │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Frontend: ModalNuevoPedido    │
        │  - Selecciona productos        │
        │  - Configura cliente           │
        │  - Define tipo (ya/programado) │
        └───────────────┬─────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  POST /pedidos                 │
        │  (pedidosController.crearPedido) │
        └───────────────┬─────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Transacción BD:               │
        │  - INSERT pedidos              │
        │  - INSERT pedidos_contenido    │
        │  - UPDATE stock (restar)       │
        │  - Calcular prioridad          │
        │  - Calcular hora_inicio_preparacion │
        └───────────────┬─────────────────┘
                        │
                        ├─ ¿Es "cuanto antes"? ──SÍ──> Evaluar cola inmediatamente
                        │
                        ▼ NO
        ┌───────────────────────────────┐
        │  Estado: RECIBIDO              │
        │  Prioridad: NORMAL             │
        │  Esperando hora programada     │
        └───────────────┬─────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Worker (cada 30s)            │
        │  - Verifica si es hora        │
        │  - Verifica capacidad         │
        └───────────────┬─────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Mover a EN_PREPARACION        │
        │  - Actualizar estado           │
        │  - Registrar hora_inicio       │
        │  - Calcular hora_esperada      │
        │  - Crear comanda               │
        └───────────────┬─────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Estado: EN_PREPARACION        │
        │  En cocina siendo preparado   │
        └───────────────┬─────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Usuario marca como LISTO     │
        │  (botón en frontend)          │
        └───────────────┬─────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  PUT /pedidos/:id/estado       │
        │  estado: ENTREGADO             │
        └───────────────┬─────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Estado: ENTREGADO             │
        │  ¿Está pagado?                 │
        └───────────────┬─────────────────┘
                        │
                        ├─ NO ──> Aparece en "EN PREPARACIÓN" para cobrar
                        │
                        ▼ SÍ
        ┌───────────────────────────────┐
        │  Pedido completado             │
        │  (se puede facturar)           │
        └───────────────────────────────┘
```

### 6.2 Flujo de Automatización (Worker)

```
┌─────────────────────────────────────┐
│  OrderQueueWorker.execute()         │
│  (cada 30 segundos)                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  evaluarColaPedidos()               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  ¿Hay capacidad disponible?         │
└──────────────┬──────────────────────┘
               │
               ├─ NO ──> Fin (esperar próximo ciclo)
               │
               ▼ SÍ
┌─────────────────────────────────────┐
│  Obtener pedidos RECIBIDO            │
│  - Del día actual                    │
│  - transicion_automatica = TRUE       │
│  - Ordenados por prioridad + fecha   │
│  - Limite: espaciosDisponibles      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Para cada pedido:                  │
│  - ¿Es programado?                   │
│    SÍ → ¿Ya es hora?                │
│      NO → Saltar                     │
│      SÍ → Continuar                  │
│    NO → Continuar                    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  moverPedidoAPreparacion()           │
│  - UPDATE estado = 'EN_PREPARACION' │
│  - UPDATE hora_inicio_preparacion    │
│  - UPDATE hora_esperada_finalizacion │
│  - INSERT comanda (si no existe)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Emitir eventos WebSocket:          │
│  - pedido:estado-cambiado           │
│  - capacidad:actualizada            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  detectarPedidosAtrasados()          │
│  - Buscar pedidos atrasados          │
│  - Emitir evento si hay              │
└─────────────────────────────────────┘
```

### 6.3 Flujo de Sincronización Frontend-Backend

```
┌─────────────────────────────────────┐
│  Frontend: usePedidos               │
└──────────────┬──────────────────────┘
               │
               ├─────────────────────────┐
               │                         │
               ▼                         ▼
┌──────────────────────┐    ┌──────────────────────┐
│  Polling (45s)       │    │  WebSocket           │
│  - GET /pedidos      │    │  - pedido:creado     │
│  - Actualiza lista   │    │  - pedido:estado-    │
│                      │    │    cambiado          │
└──────────┬───────────┘    │  - capacidad:        │
           │                │    actualizada       │
           │                └──────────┬───────────┘
           │                           │
           └───────────┬───────────────┘
                       │
                       ▼
        ┌───────────────────────────────┐
        │  Actualizar estado local      │
        │  - setPedidos()                │
        │  - setPedidosEnCocina()        │
        │  - setPedidosRecibidos()       │
        └──────────────┬─────────────────┘
                       │
                       ▼
        ┌───────────────────────────────┐
        │  Re-renderizar componentes    │
        │  - OrderCard                  │
        │  - OrderRow                   │
        │  - PedidosColumn              │
        └───────────────────────────────┘
```

---

## 7. VERIFICACIÓN DE CONSISTENCIA

### 7.1 Consistencia Base de Datos

#### 7.1.1 Campos Utilizados vs Campos Existentes

**✅ VERIFICADO:**
- Todos los campos referenciados en queries existen en la BD
- Los nombres de columnas coinciden entre código y BD
- Los tipos de datos son consistentes

**Campos críticos verificados:**
- `pedidos.estado`: Existe, tipo ENUM correcto
- `pedidos.hora_inicio_preparacion`: Existe, tipo TIMESTAMP
- `pedidos.tiempo_estimado_preparacion`: Existe, tipo INT
- `pedidos.hora_esperada_finalizacion`: Existe, tipo TIMESTAMP
- `pedidos.prioridad`: Existe, tipo ENUM correcto
- `pedidos.transicion_automatica`: Existe, tipo TINYINT(1)

#### 7.1.2 Relaciones

**✅ VERIFICADO:**
- Foreign keys están correctamente definidas
- Cascadas funcionan correctamente:
  - Eliminar pedido → elimina contenido y comanda
  - Eliminar comanda → elimina contenido de comanda

#### 7.1.3 Índices

**✅ VERIFICADO:**
- Índices críticos existen:
  - `idx_estado_hora_inicio`: Para queries de automatización
  - `idx_estado_prioridad`: Para ordenar cola
  - `idx_hora_inicio_preparacion`: Para detectar atrasos

### 7.2 Consistencia Backend-Frontend

#### 7.2.1 Mapeo de Estados

**✅ VERIFICADO:**
- Backend `RECIBIDO` ↔ Frontend `recibido` ✅
- Backend `EN_PREPARACION` ↔ Frontend `en_cocina` ✅
- Backend `ENTREGADO` ↔ Frontend `entregado` ✅
- Backend `CANCELADO` ↔ Frontend `cancelado` ✅

**⚠️ NOTA:**
- Backend tiene estado `LISTO` en ENUM pero no se usa
- Frontend no tiene estado `listo`, usa `entregado` directamente

#### 7.2.2 Mapeo de Campos

**✅ VERIFICADO:**
- `cliente_nombre` ↔ `clienteNombre` ✅
- `origen_pedido` ↔ `origen` (con conversión mayúsculas/minúsculas) ✅
- `modalidad` ↔ `tipoEntrega` (con conversión mayúsculas/minúsculas) ✅
- `estado_pago` ↔ `paymentStatus` (PAGADO ↔ paid) ✅
- `horario_entrega` ↔ `horaProgramada` (timestamp ↔ HH:MM) ✅

#### 7.2.3 Lógica de Tiempo

**✅ VERIFICADO:**
- Frontend calcula tiempos usando `pedidoTimeUtils.js`
- Backend calcula tiempos usando `TimeCalculationService.js`
- Ambos usan la misma lógica:
  - `hora_esperada_finalizacion = hora_inicio_preparacion + tiempo_estimado`
  - Detección de atrasos: `ahora > hora_esperada_finalizacion`

**⚠️ RIESGO POTENCIAL:**
- Si hay diferencia de zona horaria entre frontend y backend, los cálculos pueden diferir
- **Mitigación:** Ambos usan timestamps en UTC

### 7.3 Consistencia de Automatización

#### 7.3.1 Validación de Capacidad

**✅ VERIFICADO:**
- Backend valida capacidad antes de mover a `EN_PREPARACION` (manual)
- Worker valida capacidad antes de procesar cola
- Ambos usan `KitchenCapacityService.obtenerInfoCapacidad()`

#### 7.3.2 Creación de Comandas

**✅ VERIFICADO:**
- Comandas se crean automáticamente cuando pedido pasa a `EN_PREPARACION`
- Se verifica si ya existe antes de crear (evita duplicados)
- Tanto en `pedidosController` como en `OrderQueueEngine`

#### 7.3.3 Priorización

**✅ VERIFICADO:**
- Prioridad se determina correctamente al crear pedido
- Worker ordena por prioridad correctamente
- ALTA (cuanto antes) tiene prioridad sobre NORMAL (programado)

### 7.4 Inconsistencias Identificadas

#### 7.4.1 Estado LISTO No Utilizado

**Problema:**
- El ENUM de `pedidos.estado` incluye `LISTO`
- Este estado nunca se usa en el código
- Los pedidos van directamente de `EN_PREPARACION` a `ENTREGADO`

**Impacto:** Bajo (solo confusión)

**Recomendación:** Considerar eliminar `LISTO` del ENUM o implementarlo si se necesita

#### 7.4.2 Duplicación de Estado en Comandas

**Problema:**
- `comandas.estado` existe pero no se usa para lógica
- El estado real está en `pedidos.estado`
- Puede haber inconsistencia si se actualiza uno y no el otro

**Impacto:** Bajo (comandas solo para impresión)

**Recomendación:** Considerar eliminar `comandas.estado` o sincronizarlo automáticamente

#### 7.4.3 Pedidos Entregados No Pagados en "EN PREPARACIÓN"

**Problema:**
- Los pedidos entregados pero no pagados aparecen en la columna "EN PREPARACIÓN" en frontend
- Esto es intencional para poder cobrarlos, pero puede ser confuso

**Impacto:** Medio (confusión visual)

**Recomendación:** Considerar una columna separada "PENDIENTE DE COBRO" o mejorar el indicador visual

---

## 8. RIESGOS Y RECOMENDACIONES

### 8.1 Riesgos Identificados

#### 8.1.1 Race Conditions

**Riesgo:**
- Múltiples workers ejecutándose simultáneamente
- Worker y creación de pedido ejecutándose al mismo tiempo

**Mitigación actual:**
- Transacciones en BD
- Filtro por estado (solo procesa RECIBIDO)
- Verificación de capacidad antes de mover

**Recomendación:**
- Considerar locks por pedido (`SELECT FOR UPDATE`)
- Monitorear logs para detectar procesamiento duplicado

#### 8.1.2 Dependencia del Worker

**Riesgo:**
- Si el worker falla, no hay transiciones automáticas
- Pedidos "cuanto antes" pueden quedar esperando

**Mitigación actual:**
- Evaluación inmediata al crear pedido "cuanto antes"
- Worker con auto-restart (si se usa PM2/systemd)

**Recomendación:**
- Monitoreo del worker (alertas si no ejecuta)
- Health check del worker en endpoint `/health`

#### 8.1.3 Capacidad Incorrecta

**Riesgo:**
- Capacidad máxima mal configurada
- No considera variaciones (hora del día, personal)

**Mitigación actual:**
- Configuración editable desde `configuracion_sistema`
- Default razonable (8 pedidos)

**Recomendación:**
- Validación de rangos (1-20)
- Considerar capacidad dinámica según hora del día

#### 8.1.4 Pedidos Atrasados No Detectados

**Riesgo:**
- Si el worker no detecta atrasos, no hay alertas

**Mitigación actual:**
- Worker detecta atrasos cada 30 segundos
- Emite evento WebSocket

**Recomendación:**
- Notificaciones push/email para atrasos críticos
- Dashboard de métricas de tiempo

#### 8.1.5 Desconexión de WebSocket

**Riesgo:**
- Si WebSocket se desconecta, frontend depende solo de polling
- Latencia de 45 segundos puede ser alta

**Mitigación actual:**
- Polling como backup
- Reintentos automáticos de WebSocket

**Recomendación:**
- Reducir intervalo de polling si WebSocket falla
- Indicador visual de estado de conexión (ya implementado)

### 8.2 Recomendaciones de Optimización

#### 8.2.1 Performance

**Recomendaciones:**
1. **Índices adicionales:**
   - `idx_fecha_estado`: Para queries de pedidos del día por estado
   - `idx_horario_entrega`: Para queries de pedidos programados

2. **Optimización de queries:**
   - Usar `SELECT ... FOR UPDATE` en worker para evitar race conditions
   - Limitar resultados con `LIMIT` siempre que sea posible

3. **Caché:**
   - Cachear configuración del sistema (TTL corto, 1 minuto)
   - Cachear capacidad actual (invalidar en cambios)

#### 8.2.2 Escalabilidad

**Recomendaciones:**
1. **Worker distribuido:**
   - Si hay múltiples instancias, usar locks distribuidos (Redis)
   - O designar una instancia como "leader" para el worker

2. **WebSockets:**
   - Usar Redis adapter para Socket.IO si hay múltiples servidores
   - Balancear conexiones WebSocket

#### 8.2.3 Monitoreo

**Recomendaciones:**
1. **Métricas:**
   - Tiempo promedio de preparación
   - Tasa de pedidos atrasados
   - Uso de capacidad
   - Latencia del worker

2. **Alertas:**
   - Worker no ejecuta por X minutos
   - Capacidad al 90%+
   - Pedidos atrasados > 10 minutos

#### 8.2.4 UX

**Recomendaciones:**
1. **Indicadores visuales:**
   - Mostrar posición en cola para pedidos RECIBIDO
   - Mostrar tiempo estimado de entrada a cocina
   - Mejorar indicador de pedidos atrasados

2. **Notificaciones:**
   - Notificar cuando pedido entra a cocina
   - Notificar cuando pedido está listo
   - Notificar pedidos atrasados

### 8.3 Mejoras Futuras

#### 8.3.1 Fase 4: Servicios Avanzados

**Ya implementados (parcialmente):**
- `TimeLearningService`: Aprende tiempos reales de preparación
- `AdaptiveCapacityService`: Ajusta capacidad según carga
- `DelayPredictionService`: Predice demoras automáticamente

**Recomendación:** Activar y monitorear estos servicios

#### 8.3.2 Capacidad Dinámica

**Idea:**
- Capacidad variable según hora del día
- Capacidad variable según día de la semana
- Capacidad variable según personal disponible

**Implementación:**
- Tabla `capacidad_horarios` con reglas
- Worker ajusta capacidad según hora actual

#### 8.3.3 Predicción de Tiempos

**Idea:**
- Calcular tiempo estimado según:
  - Tipo de productos
  - Cantidad de items
  - Carga actual de cocina
  - Historial de tiempos

**Implementación:**
- Usar `TimeLearningService` para aprender
- Ajustar `tiempo_estimado_preparacion` dinámicamente

---

## 9. CONCLUSIÓN

### 9.1 Resumen Ejecutivo

El módulo de pedidos de "El Chalito" implementa un sistema automatizado robusto que:

✅ **Gestiona automáticamente** la transición de pedidos de RECIBIDO a EN_PREPARACION según capacidad y prioridad  
✅ **Respeta pedidos programados** calculando automáticamente cuándo deben iniciar preparación  
✅ **Detecta pedidos atrasados** y emite alertas  
✅ **Sincroniza en tiempo real** mediante WebSockets y polling  
✅ **Mantiene consistencia** entre base de datos, backend y frontend  

### 9.2 Fortalezas

1. **Automatización completa:** El sistema decide cuándo mover pedidos a cocina
2. **Priorización inteligente:** Pedidos "cuanto antes" tienen prioridad
3. **Tiempo real:** WebSockets para actualización instantánea
4. **Robustez:** Transacciones, validaciones, manejo de errores
5. **Configurabilidad:** Parámetros ajustables sin cambiar código

### 9.3 Áreas de Mejora

1. **Monitoreo:** Agregar métricas y alertas
2. **Capacidad dinámica:** Ajustar según hora/día
3. **Predicción:** Mejorar estimación de tiempos
4. **UX:** Mejorar indicadores visuales y notificaciones

### 9.4 Estado Actual

**✅ IMPLEMENTADO:**
- Automatización completa de cola
- Worker periódico (30s)
- WebSockets
- Detección de atrasos
- Creación automática de comandas
- Validación de capacidad

**⚠️ PARCIALMENTE IMPLEMENTADO:**
- Servicios avanzados (Fase 4) - implementados pero no activos

**❌ NO IMPLEMENTADO:**
- Capacidad dinámica
- Notificaciones push/email
- Dashboard de métricas

---

**Documento generado:** Análisis técnico integral del módulo de pedidos  
**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0
