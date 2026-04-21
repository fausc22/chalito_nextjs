import { useCallback, useMemo, useState } from 'react';
import { empleadosService } from '../../services/empleadosService';

const getFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const toDateOnly = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const match = trimmed.match(DATE_ONLY_PATTERN);
    if (match) {
      const [, y, m, d] = match;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildFullName = (nombre, apellido) => `${nombre || ''} ${apellido || ''}`.trim();
const firstNonEmptyText = (...values) => {
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return null;
};

const normalizeTipoMovimiento = (value) => {
  const tipo = String(value || '').trim().toUpperCase();
  if (['BONO', 'BONOS', 'BONIFICACION', 'BONIFICACIONES'].includes(tipo)) return 'BONO';
  if (['ADELANTO', 'ADELANTOS'].includes(tipo)) return 'ADELANTO';
  if (['DESCUENTO', 'DESCUENTOS'].includes(tipo)) return 'DESCUENTO';
  if (['CONSUMO', 'CONSUMOS'].includes(tipo)) return 'CONSUMO';
  return tipo || 'OTRO';
};

const normalizeEmpleado = (item) => {
  const id = getFirstDefined(item?.id, item?.empleado_id, item?.id_empleado, item?.employee_id);
  const nombre = getFirstDefined(item?.nombre, item?.name, item?.first_name, '');
  const apellido = getFirstDefined(item?.apellido, item?.last_name, item?.surname, '');
  const nombreCompleto = `${nombre} ${apellido}`.trim()
    || getFirstDefined(item?.nombre_completo, item?.full_name, 'Empleado');

  return {
    id: id != null ? String(id) : '',
    nombreCompleto,
    valorHora: toNumber(getFirstDefined(item?.valor_hora, item?.valorHora, item?.hourly_rate)),
  };
};

const normalizeAsistencia = (item) => {
  const ingreso = toDate(getFirstDefined(item?.ingreso, item?.hora_ingreso, item?.check_in, item?.entrada));
  const egreso = toDate(getFirstDefined(item?.egreso, item?.hora_egreso, item?.check_out, item?.salida));
  const minutos = toNumber(getFirstDefined(item?.minutos, item?.minutos_trabajados, item?.total_minutos));
  const horasCalculadas = minutos > 0 ? minutos / 60 : 0;
  const horas = toNumber(getFirstDefined(item?.horas, item?.horas_trabajadas, item?.total_horas, horasCalculadas));

  return {
    id: String(getFirstDefined(item?.id, item?.asistencia_id, `${item?.fecha || 'fecha'}-${ingreso?.getTime() || Math.random()}`)),
    fecha: toDate(getFirstDefined(item?.fecha, item?.dia, ingreso, item?.created_at)),
    ingreso,
    egreso,
    minutos: minutos > 0 ? minutos : Math.round(horas * 60),
    horas,
    estado: getFirstDefined(item?.estado, item?.status, item?.accion, 'Registrado'),
  };
};

const normalizeMovimiento = (item) => {
  const tipo = normalizeTipoMovimiento(getFirstDefined(item?.tipo, item?.tipo_movimiento, item?.categoria));
  return {
    id: String(getFirstDefined(item?.id, item?.movimiento_id, `${tipo}-${item?.fecha || Math.random()}`)),
    fecha: toDate(getFirstDefined(item?.fecha, item?.created_at)),
    tipo,
    monto: Math.abs(toNumber(getFirstDefined(item?.monto, item?.importe, item?.amount))),
    descripcion: getFirstDefined(item?.descripcion, item?.detalle, item?.concepto, '') || '',
  };
};

const normalizeHistoryItem = (item) => ({
  // Backend liquidaciones currently returns e.nombre / e.apellido
  // (not empleado_nombre), so we normalize both shapes.
  id: String(getFirstDefined(item?.id, item?.liquidacion_id, item?.registro_id, '')),
  empleadoNombre: firstNonEmptyText(
    item?.empleado_nombre,
    item?.nombre_empleado,
    item?.empleado?.nombre_completo,
    item?.empleado?.full_name,
    buildFullName(item?.empleado?.nombre, item?.empleado?.apellido),
    buildFullName(item?.nombre, item?.apellido)
  ) || 'Empleado',
  empleadoId: String(getFirstDefined(item?.empleado_id, item?.id_empleado, item?.empleado?.id, '')),
  fechaDesde: toDateOnly(getFirstDefined(item?.fecha_desde, item?.periodo_desde, item?.desde)),
  fechaHasta: toDateOnly(getFirstDefined(item?.fecha_hasta, item?.periodo_hasta, item?.hasta)),
  totalFinal: toNumber(getFirstDefined(item?.total_final, item?.total, item?.monto_total, item?.importe_total)),
  createdAt: toDate(getFirstDefined(item?.created_at, item?.fecha_creacion, item?.registrado_en)),
  estado: getFirstDefined(item?.estado, item?.status, 'Guardada'),
  raw: item,
});

const getCollection = (data, keys) => {
  for (let index = 0; index < keys.length; index += 1) {
    const value = data?.[keys[index]];
    if (Array.isArray(value)) return value;
  }
  return [];
};

const isLikelyNoDataError = (message) => {
  const normalized = String(message || '').trim().toLowerCase();
  if (!normalized) return false;
  return [
    'no hay',
    'sin datos',
    'sin asistencias',
    'sin registros',
    'no se encontraron',
    'no existe informacion',
  ].some((needle) => normalized.includes(needle));
};

const normalizeLiquidacionResult = (payload, defaultFilters = null) => {
  const root = payload?.liquidacion || payload?.resumen ? payload : payload?.data || payload || {};
  const liquidacionId = getFirstDefined(root?.id, root?.liquidacion_id, root?.registro_id, null);
  const resumenRaw = root?.resumen || root;
  const asistenciasRaw = getCollection(root, ['asistencias', 'detalle_asistencias', 'asistencias_detalle']);
  const movimientosRaw = getCollection(root, ['movimientos', 'detalle_movimientos', 'movimientos_detalle']);

  const asistencias = asistenciasRaw.map(normalizeAsistencia).filter((item) => item.id);
  const movimientos = movimientosRaw.map(normalizeMovimiento).filter((item) => item.id);
  const ultimaAsistenciaDesdeDetalle = asistencias.reduce((latest, item) => {
    const nextDate = toDateOnly(item?.fecha);
    if (!nextDate) return latest;
    if (!latest || nextDate.getTime() > latest.getTime()) return nextDate;
    return latest;
  }, null);
  const totalMinutosAsistencia = asistencias.reduce((acc, item) => acc + (item.minutos || 0), 0);
  const totalHorasAsistencia = totalMinutosAsistencia / 60;

  const bonosMov = movimientos.filter((item) => item.tipo === 'BONO').reduce((acc, item) => acc + item.monto, 0);
  const adelantosMov = movimientos.filter((item) => item.tipo === 'ADELANTO').reduce((acc, item) => acc + item.monto, 0);
  const descuentosMov = movimientos.filter((item) => item.tipo === 'DESCUENTO').reduce((acc, item) => acc + item.monto, 0);
  const consumosMov = movimientos.filter((item) => item.tipo === 'CONSUMO').reduce((acc, item) => acc + item.monto, 0);

  const valorHora = toNumber(getFirstDefined(resumenRaw?.valor_hora, resumenRaw?.valorHora, root?.empleado?.valor_hora));
  const totalAsistencias = toNumber(getFirstDefined(resumenRaw?.total_asistencias, resumenRaw?.asistencias, asistencias.length));
  const totalMinutos = toNumber(getFirstDefined(resumenRaw?.total_minutos, resumenRaw?.minutos_totales, totalMinutosAsistencia));
  const totalHoras = toNumber(getFirstDefined(resumenRaw?.total_horas, resumenRaw?.horas_totales, totalHorasAsistencia));
  const totalBase = toNumber(getFirstDefined(resumenRaw?.total_base, resumenRaw?.base, valorHora * totalHoras));
  const bonos = toNumber(getFirstDefined(resumenRaw?.bonos, resumenRaw?.total_bonos, bonosMov));
  const adelantos = toNumber(getFirstDefined(resumenRaw?.adelantos, resumenRaw?.total_adelantos, adelantosMov));
  const descuentos = toNumber(getFirstDefined(resumenRaw?.descuentos, resumenRaw?.total_descuentos, descuentosMov));
  const consumos = toNumber(getFirstDefined(resumenRaw?.consumos, resumenRaw?.total_consumos, consumosMov));
  const totalFinal = toNumber(getFirstDefined(
    resumenRaw?.total_final,
    resumenRaw?.totalFinal,
    totalBase + bonos - adelantos - descuentos - consumos
  ));
  const isEmpty = asistencias.length === 0
    && movimientos.length === 0
    && totalAsistencias === 0
    && totalBase === 0
    && totalFinal === 0;

  return {
    id: liquidacionId != null ? String(liquidacionId) : '',
    empleadoId: String(getFirstDefined(root?.empleado_id, root?.id_empleado, root?.empleado?.id, defaultFilters?.empleado_id, '')),
    empleadoNombre: firstNonEmptyText(
      root?.empleado_nombre,
      root?.nombre_empleado,
      root?.empleado?.nombre_completo,
      root?.empleado?.full_name,
      buildFullName(root?.empleado?.nombre, root?.empleado?.apellido),
      buildFullName(root?.nombre, root?.apellido)
    ) || 'Empleado',
    fechaDesde: toDateOnly(getFirstDefined(root?.fecha_desde, root?.periodo_desde, defaultFilters?.fecha_desde)),
    fechaHasta: toDateOnly(getFirstDefined(root?.fecha_hasta, root?.periodo_hasta, defaultFilters?.fecha_hasta)),
    ultimaAsistenciaFecha: toDateOnly(getFirstDefined(
      root?.ultima_asistencia_fecha,
      root?.ultimaAsistenciaFecha,
      resumenRaw?.ultima_asistencia_fecha,
      resumenRaw?.ultimaAsistenciaFecha,
      ultimaAsistenciaDesdeDetalle
    )),
    valorHora,
    totalAsistencias,
    totalMinutos,
    totalHoras,
    totalBase,
    bonos,
    adelantos,
    descuentos,
    consumos,
    totalFinal,
    asistencias,
    movimientos,
    isEmpty,
    isGuardada: liquidacionId != null,
    raw: root,
  };
};

const toYmd = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (DATE_ONLY_PATTERN.test(trimmed)) return trimmed;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const useLiquidaciones = () => {
  const [empleados, setEmpleados] = useState([]);
  const [liquidacion, setLiquidacion] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loadingInicial, setLoadingInicial] = useState(false);
  const [calculando, setCalculando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [error, setError] = useState(null);
  const [historialError, setHistorialError] = useState(null);
  const [lastFilters, setLastFilters] = useState(null);

  const cargarInicial = useCallback(async () => {
    setLoadingInicial(true);
    setError(null);
    setHistorialError(null);

    try {
      const [empleadosResponse, historialResponse] = await Promise.all([
        empleadosService.obtenerEmpleados({ activo: true }),
        empleadosService.obtenerLiquidaciones(),
      ]);

      if (!empleadosResponse.success) {
        setError(empleadosResponse.error || 'No se pudieron cargar empleados');
        setEmpleados([]);
      } else {
        setEmpleados((empleadosResponse.data || [])
          .map(normalizeEmpleado)
          .filter((item) => item.id)
          .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto, 'es')));
      }

      if (!historialResponse.success) {
        setHistorial([]);
        setHistorialError(historialResponse.error || null);
      } else {
        setHistorial((historialResponse.data || []).map(normalizeHistoryItem).filter((item) => item.id));
      }
    } catch (requestError) {
      console.error('Error al cargar liquidaciones:', requestError);
      setError('No se pudo cargar la pantalla de liquidaciones');
      setEmpleados([]);
      setHistorial([]);
    } finally {
      setLoadingInicial(false);
    }
  }, []);

  const calcularLiquidacion = useCallback(async (filters) => {
    setCalculando(true);
    setError(null);

    try {
      const payload = {
        empleado_id: Number(filters.empleado_id),
        fecha_desde: filters.fecha_desde,
        fecha_hasta: filters.fecha_hasta,
        incluir_detalle: true,
      };

      const response = await empleadosService.calcularLiquidacion(payload);
      if (!response.success) {
        if (isLikelyNoDataError(response.error)) {
          const emptyResult = normalizeLiquidacionResult({
            empleado_id: payload.empleado_id,
            fecha_desde: payload.fecha_desde,
            fecha_hasta: payload.fecha_hasta,
            asistencias: [],
            movimientos: [],
            total_asistencias: 0,
            total_minutos: 0,
            total_horas: 0,
            total_base: 0,
            bonos: 0,
            adelantos: 0,
            descuentos: 0,
            consumos: 0,
            total_final: 0,
          }, filters);
          setLiquidacion(emptyResult);
          setLastFilters(filters);
          return { success: true, data: emptyResult, empty: true };
        }
        return { success: false, error: response.error || 'No se pudo calcular la liquidacion' };
      }

      const normalized = normalizeLiquidacionResult(response.data, filters);
      setLiquidacion(normalized);
      setLastFilters(filters);
      return { success: true, data: normalized };
    } catch (requestError) {
      console.error('Error al calcular liquidacion:', requestError);
      return { success: false, error: 'No se pudo calcular la liquidacion' };
    } finally {
      setCalculando(false);
    }
  }, []);

  const guardarLiquidacion = useCallback(async (extraPayload = {}) => {
    if (!liquidacion) {
      return { success: false, error: 'No hay una liquidacion calculada para guardar' };
    }
    if (liquidacion.isEmpty) {
      return { success: false, error: 'El periodo seleccionado no tiene datos para guardar' };
    }

    setGuardando(true);
    try {
      const payload = {
        empleado_id: Number(liquidacion.empleadoId),
        fecha_desde: toYmd(liquidacion.fechaDesde),
        fecha_hasta: toYmd(liquidacion.fechaHasta),
        ...extraPayload,
        // Totales en snake_case: deben coincidir con el resumen mostrado y con el backend.
        total_base: toNumber(liquidacion.totalBase),
        total_bonos: toNumber(liquidacion.bonos),
        total_descuentos: toNumber(liquidacion.descuentos),
        total_adelantos: toNumber(liquidacion.adelantos),
        total_consumos: toNumber(liquidacion.consumos),
        total_final: toNumber(liquidacion.totalFinal),
      };

      const response = await empleadosService.guardarLiquidacion(payload);
      if (!response.success) {
        return { success: false, error: response.error || 'No se pudo guardar la liquidacion' };
      }

      const saved = response.data ? normalizeHistoryItem(response.data) : null;
      if (saved?.id) {
        setHistorial((prev) => {
          const withoutDuplicate = prev.filter((item) => item.id !== saved.id);
          return [saved, ...withoutDuplicate];
        });
      } else {
        const historialResponse = await empleadosService.obtenerLiquidaciones();
        if (historialResponse.success) {
          setHistorial((historialResponse.data || []).map(normalizeHistoryItem).filter((item) => item.id));
        }
      }
      setLiquidacion((prev) => (prev ? { ...prev, id: saved?.id || prev.id, isGuardada: true } : prev));

      return { success: true, data: response.data };
    } catch (requestError) {
      console.error('Error al guardar liquidacion:', requestError);
      return { success: false, error: 'No se pudo guardar la liquidacion' };
    } finally {
      setGuardando(false);
    }
  }, [liquidacion]);

  const cargarHistorial = useCallback(async (filters = {}) => {
    setLoadingHistorial(true);
    setHistorialError(null);
    try {
      const response = await empleadosService.obtenerLiquidaciones(filters);
      if (!response.success) {
        setHistorialError(response.error || 'No se pudo cargar historial');
        setHistorial([]);
        return { success: false, error: response.error };
      }
      setHistorial((response.data || []).map(normalizeHistoryItem).filter((item) => item.id));
      return { success: true };
    } catch (requestError) {
      console.error('Error al cargar historial de liquidaciones:', requestError);
      setHistorialError('No se pudo cargar historial');
      setHistorial([]);
      return { success: false, error: 'No se pudo cargar historial' };
    } finally {
      setLoadingHistorial(false);
    }
  }, []);

  const cargarDetalleLiquidacion = useCallback(async (id) => {
    setCalculando(true);
    try {
      const response = await empleadosService.obtenerLiquidacionPorId(id);
      if (!response.success) {
        return { success: false, error: response.error || 'No se pudo obtener el detalle de la liquidacion' };
      }

      const normalized = normalizeLiquidacionResult(response.data);
      setLiquidacion(normalized);
      setLastFilters({
        empleado_id: normalized.empleadoId,
        fecha_desde: toYmd(normalized.fechaDesde),
        fecha_hasta: toYmd(normalized.fechaHasta),
      });
      return { success: true, data: normalized };
    } catch (requestError) {
      console.error('Error al obtener detalle de liquidacion:', requestError);
      return { success: false, error: 'No se pudo obtener el detalle de la liquidacion' };
    } finally {
      setCalculando(false);
    }
  }, []);

  const hasCalculatedData = useMemo(() => Boolean(liquidacion), [liquidacion]);

  return {
    empleados,
    liquidacion,
    historial,
    loadingInicial,
    calculando,
    guardando,
    loadingHistorial,
    error,
    historialError,
    lastFilters,
    hasCalculatedData,
    setLiquidacion,
    cargarInicial,
    calcularLiquidacion,
    guardarLiquidacion,
    cargarHistorial,
    cargarDetalleLiquidacion,
  };
};
