# 🖨️ IMPRESIÓN Y COMANDAS: MÓDULO DE PEDIDOS

**Documento:** 06_IMPRESION_Y_COMANDAS.md  
**Relacionado con:** 01_OVERVIEW_GENERAL.md, 02_MODELO_DE_DATOS.md, 03_BACKEND_PEDIDOS.md

---

## IMPRESIÓN Y COMANDAS

### Creación Automática de Comandas

**Cuándo se crea:**
- Automáticamente cuando un pedido pasa a `EN_PREPARACION`
- Se crea tanto desde `pedidosController.actualizarEstadoPedido()` como desde `OrderQueueEngine.moverPedidoAPreparacion()`

**Proceso:**
1. Se verifica si ya existe una comanda para el pedido
2. Si no existe, se crea:
   - Registro en tabla `comandas` (1:1 con pedido)
   - Registros en `comandas_contenido` (artículos del pedido)
3. Se copian datos del pedido a la comanda:
   - Cliente, dirección, teléfono, email
   - Modalidad (DELIVERY/RETIRO)
   - Horario de entrega
   - Observaciones
   - Artículos con personalizaciones

**⚠️ NOTA IMPORTANTE:** 
- La tabla `comandas` tiene su propio campo `estado`, pero **NO se usa para lógica de negocio**
- El estado real del pedido está en `pedidos.estado`
- Las comandas se crean automáticamente cuando un pedido pasa a `EN_PREPARACION`
- La comanda es solo para impresión/física, no para control de flujo

### Estructura de Comandas

**Tabla `comandas`:**
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

**Tabla `comandas_contenido`:**
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

**Relación:** 1:1 con `pedidos` (UNIQUE KEY en `pedido_id`)

### Endpoints de Impresión

**Backend (`pedidosController.js`):**

**`imprimirComanda(req, res)`**
- Endpoint: `GET /pedidos/:id/comanda-print`
- Usa `PrintService.obtenerDatosComanda(id)`
- Retorna datos formateados para impresión de comanda

**`imprimirTicket(req, res)`**
- Endpoint: `GET /pedidos/:id/ticket-print`
- Usa `PrintService.obtenerDatosTicket(id)`
- Retorna datos formateados para impresión de ticket/factura
- Valida que el pedido esté pagado antes de permitir impresión

**Frontend:**
- `ModalImprimir`: Componente que muestra opciones de impresión
- Permite imprimir comanda o ticket según el estado del pedido

### PrintService

**Servicio:** `services/PrintService.js`

**Funciones:**
- `obtenerDatosComanda(pedidoId)`: Obtiene datos formateados de comanda
- `obtenerDatosTicket(pedidoId)`: Obtiene datos formateados de ticket/factura

**Validaciones:**
- Para ticket: Verifica que el pedido esté pagado
- Para comanda: Verifica que exista comanda asociada

### Diferencias: Comanda vs Ticket

**Comanda:**
- Se crea automáticamente al pasar a `EN_PREPARACION`
- Contiene información para cocina
- Incluye personalizaciones y observaciones
- No incluye información de pago

**Ticket/Factura:**
- Se genera cuando se cobra el pedido
- Contiene información de facturación
- Incluye subtotales, IVA, total
- Requiere que el pedido esté pagado

### Flujo de Impresión

```
┌─────────────────────────────────────┐
│  Usuario hace clic en "IMPRIMIR"   │
│  (botón en OrderCard/OrderRow)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  ModalImprimir se abre              │
│  - Muestra opciones                 │
│  - Comanda o Ticket                 │
└──────────────┬──────────────────────┘
               │
               ├─ Comanda ──> GET /pedidos/:id/comanda-print
               │
               ▼ Ticket
┌─────────────────────────────────────┐
│  GET /pedidos/:id/ticket-print      │
│  - Valida que esté pagado           │
│  - Obtiene datos de venta           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  PrintService formatea datos        │
│  - Estructura para impresora        │
│  - Layout específico                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Frontend recibe datos               │
│  - Abre ventana de impresión        │
│  - Usa window.print()                │
└─────────────────────────────────────┘
```

### Reglas de Negocio

**Comanda:**
- Se crea automáticamente (no requiere acción manual)
- Una comanda por pedido (1:1)
- Se puede imprimir múltiples veces
- No se actualiza después de creada (es snapshot del momento)

**Ticket:**
- Solo se puede imprimir si el pedido está pagado
- Puede requerir facturación previa (crear registro en `ventas`)
- Se puede imprimir múltiples veces

### Inconsistencias Identificadas

#### Duplicación de Estado en Comandas

**Problema:**
- `comandas.estado` existe pero no se usa para lógica
- El estado real está en `pedidos.estado`
- Puede haber inconsistencia si se actualiza uno y no el otro

**Impacto:** Bajo (comandas solo para impresión)

**Recomendación:** Considerar eliminar `comandas.estado` o sincronizarlo automáticamente

---

**Documento relacionado:** Ver `02_MODELO_DE_DATOS.md` para estructura de tablas de comandas




