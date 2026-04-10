const ESTADOS_PAGO_PAGADO = new Set(['PAGADO', 'PAID']);

const normalizarValor = (value) => (value ?? '').toString().trim().toUpperCase();

export function getPedidoMedioPago(pedido) {
  return normalizarValor(pedido?.medio_pago || pedido?.medioPago);
}

export function getPedidoEstadoPago(pedido) {
  return normalizarValor(pedido?.estado_pago || pedido?.estadoPago);
}

export function isPedidoPaid(pedido) {
  if (!pedido) return false;

  const estadoPago = getPedidoEstadoPago(pedido);
  if (estadoPago) {
    return ESTADOS_PAGO_PAGADO.has(estadoPago);
  }

  return normalizarValor(pedido?.paymentStatus) === 'PAID';
}

export function isPedidoMercadoPagoPendiente(pedido) {
  if (!pedido) return false;
  return getPedidoMedioPago(pedido) === 'MERCADOPAGO' && !isPedidoPaid(pedido);
}
