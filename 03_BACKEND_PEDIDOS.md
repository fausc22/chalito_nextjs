# 🔧 BACKEND: MÓDULO DE PEDIDOS

**Documento:** 03_BACKEND_PEDIDOS.md  
**Relacionado con:** 01_OVERVIEW_GENERAL.md, 02_MODELO_DE_DATOS.md, 05_AUTOMATIZACION_Y_WORKER.md

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

**Ver detalles completos en:** `05_AUTOMATIZACION_Y_WORKER.md`

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

## 3. VERIFICACIÓN DE CONSISTENCIA - BACKEND

### 3.1 Consistencia Backend-Frontend

#### 3.1.1 Mapeo de Estados

**✅ VERIFICADO:**
- Backend `RECIBIDO` ↔ Frontend `recibido` ✅
- Backend `EN_PREPARACION` ↔ Frontend `en_cocina` ✅
- Backend `ENTREGADO` ↔ Frontend `entregado` ✅
- Backend `CANCELADO` ↔ Frontend `cancelado` ✅

**⚠️ NOTA:**
- Backend tiene estado `LISTO` en ENUM pero no se usa
- Frontend no tiene estado `listo`, usa `entregado` directamente

#### 3.1.2 Mapeo de Campos

**✅ VERIFICADO:**
- `cliente_nombre` ↔ `clienteNombre` ✅
- `origen_pedido` ↔ `origen` (con conversión mayúsculas/minúsculas) ✅
- `modalidad` ↔ `tipoEntrega` (con conversión mayúsculas/minúsculas) ✅
- `estado_pago` ↔ `paymentStatus` (PAGADO ↔ paid) ✅
- `horario_entrega` ↔ `horaProgramada` (timestamp ↔ HH:MM) ✅

#### 3.1.3 Lógica de Tiempo

**✅ VERIFICADO:**
- Frontend calcula tiempos usando `pedidoTimeUtils.js`
- Backend calcula tiempos usando `TimeCalculationService.js`
- Ambos usan la misma lógica:
  - `hora_esperada_finalizacion = hora_inicio_preparacion + tiempo_estimado`
  - Detección de atrasos: `ahora > hora_esperada_finalizacion`

**⚠️ RIESGO POTENCIAL:**
- Si hay diferencia de zona horaria entre frontend y backend, los cálculos pueden diferir
- **Mitigación:** Ambos usan timestamps en UTC

### 3.2 Consistencia de Automatización

#### 3.2.1 Validación de Capacidad

**✅ VERIFICADO:**
- Backend valida capacidad antes de mover a `EN_PREPARACION` (manual)
- Worker valida capacidad antes de procesar cola
- Ambos usan `KitchenCapacityService.obtenerInfoCapacidad()`

#### 3.2.2 Creación de Comandas

**✅ VERIFICADO:**
- Comandas se crean automáticamente cuando pedido pasa a `EN_PREPARACION`
- Se verifica si ya existe antes de crear (evita duplicados)
- Tanto en `pedidosController` como en `OrderQueueEngine`

#### 3.2.3 Priorización

**✅ VERIFICADO:**
- Prioridad se determina correctamente al crear pedido
- Worker ordena por prioridad correctamente
- ALTA (cuanto antes) tiene prioridad sobre NORMAL (programado)

---

**Documento relacionado:** Ver `05_AUTOMATIZACION_Y_WORKER.md` para detalles del worker y automatización




