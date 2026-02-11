# 📋 OVERVIEW GENERAL: MÓDULO DE PEDIDOS - EL CHALITO

**Fecha de análisis:** 2025-01-XX  
**Versión del sistema:** 1.0.0  
**Objetivo:** Documentación técnica completa del módulo de pedidos para evolución, optimización y auditoría

---

## 📊 ÍNDICE DE DOCUMENTOS

Este análisis está dividido en múltiples documentos para facilitar su lectura:

1. **01_OVERVIEW_GENERAL.md** (este documento) - Visión general del sistema
2. **02_MODELO_DE_DATOS.md** - Estructura de base de datos
3. **03_BACKEND_PEDIDOS.md** - Implementación del backend
4. **04_FRONTEND_PEDIDOS.md** - Implementación del frontend
5. **05_AUTOMATIZACION_Y_WORKER.md** - Sistema de automatización
6. **06_IMPRESION_Y_COMANDAS.md** - Sistema de impresión
7. **07_OBSERVACIONES_Y_MEJORAS.md** - Riesgos y recomendaciones

---

## 🎯 OBJETIVO DEL MÓDULO DE PEDIDOS

El módulo de pedidos de "El Chalito" gestiona el ciclo completo de vida de un pedido, desde su creación hasta su entrega y facturación, con automatización inteligente que:

- **Gestiona automáticamente** la transición de pedidos de RECIBIDO a EN_PREPARACION según capacidad y prioridad
- **Respeta pedidos programados** calculando automáticamente cuándo deben iniciar preparación
- **Detecta pedidos atrasados** y emite alertas
- **Sincroniza en tiempo real** mediante WebSockets y polling
- **Mantiene consistencia** entre base de datos, backend y frontend

---

## 🔄 FLUJO GENERAL DEL SISTEMA

### Flujo Completo de un Pedido

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

---

## 🏗️ COMPONENTES PRINCIPALES

### Backend

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

### Frontend

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

### Base de Datos

**Tablas principales:**
- `pedidos`: Información principal del pedido
- `pedidos_contenido`: Artículos del pedido
- `comandas`: Comanda física para cocina (1:1 con pedidos)
- `comandas_contenido`: Artículos de la comanda
- `ventas`: Facturación (relación indirecta con pedidos)
- `configuracion_sistema`: Configuración del sistema (capacidad, tiempos, etc.)

**Ver detalles completos en:** `02_MODELO_DE_DATOS.md`

---

## 🏛️ ARQUITECTURA GENERAL

### Capas del Sistema

```
┌─────────────────────────────────────┐
│         FRONTEND (Next.js)          │
│  - Componentes React                  │
│  - Hooks personalizados              │
│  - Servicios API                     │
│  - WebSocket Client                  │
└──────────────┬───────────────────────┘
               │
               │ HTTP REST + WebSocket
               │
┌──────────────▼───────────────────────┐
│         BACKEND (Express)            │
│  - Controllers                        │
│  - Services                          │
│  - Routes                            │
│  - Validators                        │
│  - Workers                           │
└──────────────┬───────────────────────┘
               │
               │ SQL Queries
               │
┌──────────────▼───────────────────────┐
│      BASE DE DATOS (MySQL)           │
│  - Tablas de pedidos                 │
│  - Tablas de comandas                │
│  - Configuración                     │
└──────────────────────────────────────┘
```

### Flujo de Sincronización

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

### Automatización

**Componentes de automatización:**
1. **OrderQueueWorker**: Ejecuta periódicamente (cada 30s por defecto)
2. **OrderQueueEngine**: Motor de reglas y decisiones
3. **KitchenCapacityService**: Gestión de capacidad
4. **TimeCalculationService**: Cálculos de tiempo

**Flujo de automatización:**
```
┌─────────────────────────────────────┐
│  OrderQueueWorker.execute()         │
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

---

## ✅ FORTALEZAS DEL SISTEMA

1. **Automatización completa:** El sistema decide cuándo mover pedidos a cocina
2. **Priorización inteligente:** Pedidos "cuanto antes" tienen prioridad
3. **Tiempo real:** WebSockets para actualización instantánea
4. **Robustez:** Transacciones, validaciones, manejo de errores
5. **Configurabilidad:** Parámetros ajustables sin cambiar código

---

## 📚 DOCUMENTOS RELACIONADOS

Para más detalles, consultar:
- **02_MODELO_DE_DATOS.md**: Estructura completa de base de datos
- **03_BACKEND_PEDIDOS.md**: Implementación detallada del backend
- **04_FRONTEND_PEDIDOS.md**: Implementación detallada del frontend
- **05_AUTOMATIZACION_Y_WORKER.md**: Sistema de automatización completo
- **06_IMPRESION_Y_COMANDAS.md**: Sistema de impresión
- **07_OBSERVACIONES_Y_MEJORAS.md**: Riesgos y recomendaciones

---

**Documento generado:** Análisis técnico integral del módulo de pedidos  
**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0




