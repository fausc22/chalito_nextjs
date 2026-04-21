import { useCallback, useMemo, useRef, useState } from 'react';
import { empleadosService } from '../../services/empleadosService';

const MOVIMIENTO_TYPE_LABELS = {
  BONO: 'Bono',
  DESCUENTO: 'Descuento',
  ADELANTO: 'Adelanto',
  CONSUMO: 'Consumo',
};

const getFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const firstNonEmptyText = (...values) => {
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return null;
};

const toBoolOrNull = (value) => {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;
  if (typeof value === 'string') {
    const t = value.trim().toLowerCase();
    if (t === 'true' || t === 's' || t === 'si' || t === 'yes') return true;
    if (t === 'false' || t === 'n' || t === 'no') return false;
  }
  return null;
};

const resolveLiquidacionFlags = (movimiento) => {
  const rawEstaLiquidado = toBoolOrNull(getFirstDefined(
    movimiento?.esta_liquidado,
    movimiento?.estaLiquidado,
    movimiento?.liquidado,
    movimiento?.incluido_en_liquidacion,
    movimiento?.incluidoEnLiquidacion,
  ));
  const rawPuedeEliminar = toBoolOrNull(getFirstDefined(
    movimiento?.puede_eliminarse,
    movimiento?.puedeEliminarse,
    movimiento?.eliminable,
  ));

  let puedeEliminarse = true;
  let estaLiquidado = false;

  if (rawPuedeEliminar === false) {
    puedeEliminarse = false;
    estaLiquidado = true;
  } else if (rawEstaLiquidado === true) {
    puedeEliminarse = false;
    estaLiquidado = true;
  } else if (rawPuedeEliminar === true) {
    puedeEliminarse = true;
    estaLiquidado = false;
  }

  return { estaLiquidado, puedeEliminarse };
};

const normalizeTipo = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  if (['BONO', 'BONOS', 'BONIFICACION', 'BONIFICACIONES'].includes(normalized)) return 'BONO';
  if (['DESCUENTO', 'DESCUENTOS'].includes(normalized)) return 'DESCUENTO';
  if (['ADELANTO', 'ADELANTOS'].includes(normalized)) return 'ADELANTO';
  if (['CONSUMO', 'CONSUMOS'].includes(normalized)) return 'CONSUMO';
  return normalized || 'BONO';
};

const normalizeEmpleado = (empleado) => {
  const id = getFirstDefined(empleado?.id, empleado?.empleado_id, empleado?.id_empleado, empleado?.employee_id);
  const nombre = getFirstDefined(empleado?.nombre, empleado?.name, empleado?.first_name, '');
  const apellido = getFirstDefined(empleado?.apellido, empleado?.last_name, empleado?.surname, '');
  const nombreCompleto = `${nombre} ${apellido}`.trim()
    || getFirstDefined(empleado?.nombre_completo, empleado?.full_name, 'Empleado');

  return {
    id: id != null ? String(id) : '',
    nombreCompleto,
  };
};

const normalizeMovimiento = (movimiento) => {
  const empleado = movimiento?.empleado || {};
  const empleadoId = getFirstDefined(
    movimiento?.empleado_id,
    movimiento?.id_empleado,
    movimiento?.empleadoId,
    empleado?.id,
    empleado?.empleado_id
  );
  const empleadoNombre = firstNonEmptyText(
    movimiento?.empleado_nombre,
    `${movimiento?.empleado_nombre || ''} ${movimiento?.empleado_apellido || ''}`.trim(),
    movimiento?.nombre_empleado,
    movimiento?.empleadoNombre,
    empleado?.nombre_completo,
    empleado?.full_name,
    `${empleado?.nombre || ''} ${empleado?.apellido || ''}`.trim()
  ) || 'Empleado';
  const tipo = normalizeTipo(getFirstDefined(movimiento?.tipo, movimiento?.tipo_movimiento, movimiento?.categoria));
  const fecha = toDate(getFirstDefined(movimiento?.fecha, movimiento?.created_at, movimiento?.updated_at));
  const monto = toNumber(getFirstDefined(movimiento?.monto, movimiento?.importe, movimiento?.amount));
  const descripcion = getFirstDefined(movimiento?.descripcion, movimiento?.detalle, movimiento?.concepto, '') || '';
  const { estaLiquidado, puedeEliminarse } = resolveLiquidacionFlags(movimiento);

  return {
    id: String(getFirstDefined(movimiento?.id, movimiento?.movimiento_id, movimiento?.registro_id, Date.now())),
    empleadoId: empleadoId != null ? String(empleadoId) : '',
    empleadoNombre,
    tipo,
    tipoLabel: MOVIMIENTO_TYPE_LABELS[tipo] || tipo,
    monto,
    fecha,
    descripcion,
    estaLiquidado,
    puedeEliminarse,
    observaciones: getFirstDefined(movimiento?.observaciones, movimiento?.notas, '') || '',
    registradoPor: firstNonEmptyText(
      movimiento?.registrado_por,
      movimiento?.registrado_por_nombre,
      movimiento?.usuario_nombre,
      movimiento?.created_by_name,
      movimiento?.created_by
    ) || (Number(movimiento?.registrado_por_usuario_id) === 1 ? 'ADMINISTRADOR SISTEMA' : 'Sistema'),
    raw: movimiento,
  };
};

const sortMovimientos = (list) => [...list].sort((a, b) => {
  const aTime = a.fecha ? a.fecha.getTime() : 0;
  const bTime = b.fecha ? b.fecha.getTime() : 0;
  return bTime - aTime;
});

const toPayload = (formData) => {
  const empleadoId = Number(formData.empleado_id);
  return {
    empleado_id: empleadoId,
    tipo: normalizeTipo(formData.tipo),
    monto: toNumber(formData.monto),
    fecha: formData.fecha,
    descripcion: formData.descripcion?.trim() || '',
    observaciones: formData.observaciones?.trim() || null,
  };
};

const extractMovimientoFromResponse = (data) => {
  if (!data) return null;
  if (data.movimiento) return data.movimiento;
  if (data.data) return data.data;
  return data;
};

export const useMovimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMutating, setIsMutating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const filtrosRef = useRef({});

  const cargarMovimientos = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    filtrosRef.current = filtros;

    try {
      const [movimientosResponse, empleadosResponse] = await Promise.all([
        empleadosService.obtenerMovimientos(filtros),
        empleadosService.obtenerEmpleados({ activo: true }),
      ]);

      if (!movimientosResponse.success) {
        setError(movimientosResponse.error || 'No se pudo cargar movimientos');
        setMovimientos([]);
      } else {
        const normalized = (movimientosResponse.data || [])
          .map(normalizeMovimiento)
          .filter((item) => item.id);
        setMovimientos(sortMovimientos(normalized));
      }

      if (empleadosResponse.success) {
        const normalizedEmpleados = (empleadosResponse.data || [])
          .map(normalizeEmpleado)
          .filter((item) => item.id)
          .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto, 'es'));
        setEmpleados(normalizedEmpleados);
      } else if (!movimientosResponse.success) {
        setEmpleados([]);
      }
    } catch (requestError) {
      console.error('Error al cargar movimientos:', requestError);
      setError('No se pudo cargar la pantalla de movimientos');
      setMovimientos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const recargar = useCallback(async () => {
    await cargarMovimientos(filtrosRef.current || {});
  }, [cargarMovimientos]);

  const crearMovimiento = useCallback(async (formData) => {
    setIsMutating(true);
    try {
      const payload = toPayload(formData);
      const response = await empleadosService.crearMovimiento(payload);
      if (!response.success) {
        return { success: false, error: response.error || 'No se pudo crear el movimiento' };
      }

      const movimientoData = extractMovimientoFromResponse(response.data);
      if (movimientoData) {
        const normalized = normalizeMovimiento(movimientoData);
        setMovimientos((prev) => sortMovimientos([normalized, ...prev]));
      } else {
        await recargar();
      }

      return { success: true, data: response.data };
    } catch (requestError) {
      console.error('Error al crear movimiento:', requestError);
      return { success: false, error: 'No se pudo crear el movimiento' };
    } finally {
      setIsMutating(false);
    }
  }, [recargar]);

  const actualizarMovimiento = useCallback(async (id, formData) => {
    setIsMutating(true);
    try {
      const payload = toPayload(formData);
      const response = await empleadosService.actualizarMovimiento(id, payload);
      if (!response.success) {
        return { success: false, error: response.error || 'No se pudo actualizar el movimiento' };
      }

      const movimientoData = extractMovimientoFromResponse(response.data);
      if (movimientoData) {
        const normalized = normalizeMovimiento(movimientoData);
        setMovimientos((prev) => sortMovimientos(prev.map((item) => (
          item.id === String(id) ? { ...item, ...normalized } : item
        ))));
      } else {
        await recargar();
      }

      return { success: true, data: response.data };
    } catch (requestError) {
      console.error('Error al actualizar movimiento:', requestError);
      return { success: false, error: 'No se pudo actualizar el movimiento' };
    } finally {
      setIsMutating(false);
    }
  }, [recargar]);

  const eliminarMovimiento = useCallback(async (id) => {
    setIsDeleting(true);
    try {
      const response = await empleadosService.eliminarMovimiento(id);
      if (!response.success) {
        return {
          success: false,
          error: response.error || 'No se pudo eliminar el movimiento',
          status: response.status ?? null,
          enLiquidacion: Boolean(response.enLiquidacion),
        };
      }

      const idStr = String(id);
      setMovimientos((prev) => prev.filter((item) => item.id !== idStr));

      return { success: true, data: response.data };
    } catch (requestError) {
      console.error('Error al eliminar movimiento:', requestError);
      return { success: false, error: 'No se pudo eliminar el movimiento' };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const resumen = useMemo(() => {
    const totals = {
      BONO: 0,
      DESCUENTO: 0,
      ADELANTO: 0,
      CONSUMO: 0,
    };

    movimientos.forEach((movimiento) => {
      if (!totals[movimiento.tipo] && totals[movimiento.tipo] !== 0) return;
      totals[movimiento.tipo] += Math.abs(movimiento.monto || 0);
    });

    return totals;
  }, [movimientos]);

  return {
    movimientos,
    empleados,
    resumen,
    loading,
    error,
    isMutating,
    isDeleting,
    cargarMovimientos,
    recargar,
    crearMovimiento,
    actualizarMovimiento,
    eliminarMovimiento,
  };
};
