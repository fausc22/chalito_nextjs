# ⚙️ AUTOMATIZACIÓN Y WORKER: MÓDULO DE PEDIDOS

**Documento:** 05_AUTOMATIZACION_Y_WORKER.md  
**Relacionado con:** 01_OVERVIEW_GENERAL.md, 02_MODELO_DE_DATOS.md, 03_BACKEND_PEDIDOS.md

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

## 6. DIAGRAMAS DE FLUJO - AUTOMATIZACIÓN

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

---

## 8. RIESGOS Y RECOMENDACIONES - AUTOMATIZACIÓN

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

**Documento relacionado:** Ver `03_BACKEND_PEDIDOS.md` para implementación detallada de servicios y worker




