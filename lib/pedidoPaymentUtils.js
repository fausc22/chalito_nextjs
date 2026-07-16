/**
 * Helpers de estado de pago / bloqueos operativos de cocina.
 * Alineado con backend/services/pedidoOperativoHelper.js:
 * solo bloquea pagos digitales WEB pendientes.
 */

const ESTADOS_PAGO_PAGADO = new Set(['PAGADO', 'PAID']);

const normalizarValor = (value) => (value ?? '').toString().trim().toUpperCase();

export function getPedidoMedioPago(pedido) {
  return normalizarValor(pedido?.medio_pago || pedido?.medioPago);
}

export function getPedidoEstadoPago(pedido) {
  return normalizarValor(pedido?.estado_pago || pedido?.estadoPago);
}

export function getPedidoOrigen(pedido) {
  return normalizarValor(pedido?.origen_pedido || pedido?.origen);
}

export function isPedidoPaid(pedido) {
  if (!pedido) return false;

  const estadoPago = getPedidoEstadoPago(pedido);
  if (estadoPago) {
    return ESTADOS_PAGO_PAGADO.has(estadoPago);
  }

  return normalizarValor(pedido?.paymentStatus) === 'PAID';
}

/** True si es WEB + MercadoPago pendiente (bloquea cocina). */
export function isPedidoMercadoPagoPendiente(pedido) {
  if (!pedido) return false;
  return (
    getPedidoOrigen(pedido) === 'WEB' &&
    getPedidoMedioPago(pedido) === 'MERCADOPAGO' &&
    !isPedidoPaid(pedido)
  );
}

/** True si es WEB + transferencia pendiente (bloquea cocina). */
export function isPedidoTransferenciaWebPendiente(pedido) {
  if (!pedido) return false;
  return (
    getPedidoOrigen(pedido) === 'WEB' &&
    getPedidoMedioPago(pedido) === 'TRANSFERENCIA' &&
    !isPedidoPaid(pedido)
  );
}

/** Bloqueo operativo de avance a cocina (alineado con backend). */
export function isPedidoBloqueadoPorPagoOperativo(pedido) {
  return isPedidoMercadoPagoPendiente(pedido) || isPedidoTransferenciaWebPendiente(pedido);
}

export function isPedidoProgramado(pedido) {
  if (!pedido) return false;
  return (
    pedido.tipo === 'programado' ||
    Boolean(pedido.horaProgramada || pedido.horario_entrega || pedido.horarioEntrega)
  );
}

export function shouldShowPrepararYa(pedido) {
  if (!pedido || pedido.estado !== 'recibido') return false;
  if (isPedidoBloqueadoPorPagoOperativo(pedido)) return false;
  return isPedidoProgramado(pedido);
}

export function shouldShowCambiarHorario(pedido) {
  if (!pedido || pedido.estado !== 'recibido') return false;
  if (isPedidoBloqueadoPorPagoOperativo(pedido)) return false;
  return isPedidoProgramado(pedido);
}
