export function parseOptionalNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function formatStockValue(value) {
  const n = parseOptionalNumber(value);
  if (n === null) return '—';
  return Number.isInteger(n) ? String(n) : n.toLocaleString('es-AR', { maximumFractionDigits: 4 });
}

export function formatDateShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getDetalleId(detalle) {
  return detalle?.id ?? detalle?.detalle_id ?? detalle?.linea_id ?? null;
}

export function getNombreInsumoDetalle(detalle) {
  if (!detalle) return '—';
  return (
    detalle.insumo?.nombre ||
    detalle.nombre_insumo ||
    detalle.insumo_nombre ||
    (detalle.insumo_id != null ? `Insumo #${detalle.insumo_id}` : '—')
  );
}

export function getStockInicialDetalle(detalle) {
  if (!detalle) return null;
  return parseOptionalNumber(
    detalle.stock_inicial ?? detalle.stock_inicio ?? detalle.stockInicial
  );
}

export function getStockFinalDetalle(detalle) {
  if (!detalle) return null;
  return parseOptionalNumber(detalle.stock_final ?? detalle.stockFinal);
}

/**
 * Prioriza valores de consumo enviados por el backend.
 * Solo deriva stock_inicial - stock_final si no hay consumo persistido.
 */
export function getConsumoMostrado(detalle) {
  if (!detalle) return null;

  const backendKeys = ['consumo_calculado', 'consumo_calculado_semana', 'consumo', 'consumo_total'];
  for (const k of backendKeys) {
    if (detalle[k] != null && detalle[k] !== '') {
      const n = parseOptionalNumber(detalle[k]);
      if (n !== null) return n;
    }
  }

  const si = getStockInicialDetalle(detalle);
  const sf = getStockFinalDetalle(detalle);
  if (si !== null && sf !== null) {
    return si - sf;
  }
  return null;
}

export function formatEstadoSemana(estado) {
  if (estado == null || estado === '') return '—';
  const s = String(estado).toLowerCase();
  const map = {
    abierta: 'Abierta',
    cerrada: 'Cerrada',
    borrador: 'Borrador',
  };
  return map[s] || String(estado);
}

/** Coincide con el backend (`ABIERTA`). */
export function isSemanaAbierta(estado) {
  return String(estado ?? '').toUpperCase() === 'ABIERTA';
}
