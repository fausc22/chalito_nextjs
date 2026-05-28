/**
 * Arma parámetros de fecha para listados (ventas/gastos).
 * Si hay rango manual, no envía month/year para no pisar el backend.
 */
export function hasCustomDateRange(filters = {}) {
  return Boolean(filters.fecha_desde || filters.fecha_hasta);
}

export function applyDateOrMonthYearParams(target, filters = {}) {
  if (hasCustomDateRange(filters)) {
    if (filters.fecha_desde) {
      target.fecha_desde = filters.fecha_desde;
    }
    if (filters.fecha_hasta) {
      target.fecha_hasta = filters.fecha_hasta;
    }
    return target;
  }

  if (filters.month !== null && filters.month !== undefined && filters.month !== '') {
    target.month = filters.month === 'all' ? 'all' : filters.month;
  }

  if (filters.year !== null && filters.year !== undefined && filters.year !== '') {
    target.year = filters.year;
  }

  return target;
}
