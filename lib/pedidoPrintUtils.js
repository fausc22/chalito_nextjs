/**
 * Helpers de UI para estado de impresión de comanda de cocina.
 */

export function getComandaImpresiones(pedido) {
  const raw =
    pedido?.comandaImpresiones ??
    pedido?.comanda_impresiones ??
    0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function isComandaImpresa(pedido) {
  return getComandaImpresiones(pedido) > 0;
}

export function getComandaImpresaLabel(pedido) {
  const count = getComandaImpresiones(pedido);
  if (count <= 0) return null;
  return count > 1 ? `IMPRESA x${count}` : 'IMPRESA';
}
