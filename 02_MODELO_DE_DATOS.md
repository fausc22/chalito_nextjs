# 📊 MODELO DE DATOS: MÓDULO DE PEDIDOS

**Documento:** 02_MODELO_DE_DATOS.md  
**Relacionado con:** 01_OVERVIEW_GENERAL.md, 03_BACKEND_PEDIDOS.md, 05_AUTOMATIZACION_Y_WORKER.md

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

## 2. VERIFICACIÓN DE CONSISTENCIA - BASE DE DATOS

### 2.1 Campos Utilizados vs Campos Existentes

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

### 2.2 Relaciones

**✅ VERIFICADO:**
- Foreign keys están correctamente definidas
- Cascadas funcionan correctamente:
  - Eliminar pedido → elimina contenido y comanda
  - Eliminar comanda → elimina contenido de comanda

### 2.3 Índices

**✅ VERIFICADO:**
- Índices críticos existen:
  - `idx_estado_hora_inicio`: Para queries de automatización
  - `idx_estado_prioridad`: Para ordenar cola
  - `idx_hora_inicio_preparacion`: Para detectar atrasos

### 2.4 Inconsistencias Identificadas

#### 2.4.1 Estado LISTO No Utilizado

**Problema:**
- El ENUM de `pedidos.estado` incluye `LISTO`
- Este estado nunca se usa en el código
- Los pedidos van directamente de `EN_PREPARACION` a `ENTREGADO`

**Impacto:** Bajo (solo confusión)

**Recomendación:** Considerar eliminar `LISTO` del ENUM o implementarlo si se necesita

#### 2.4.2 Duplicación de Estado en Comandas

**Problema:**
- `comandas.estado` existe pero no se usa para lógica
- El estado real está en `pedidos.estado`
- Puede haber inconsistencia si se actualiza uno y no el otro

**Impacto:** Bajo (comandas solo para impresión)

**Recomendación:** Considerar eliminar `comandas.estado` o sincronizarlo automáticamente

---

**Documento relacionado:** Ver `03_BACKEND_PEDIDOS.md` para uso de estas tablas en el código




