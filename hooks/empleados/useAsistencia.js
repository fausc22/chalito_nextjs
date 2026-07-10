import { useCallback, useMemo, useState } from 'react';
import { normalizeActivo } from '@/lib/empleados/normalizeActivo';
import { empleadosService } from '../../services/empleadosService';

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

const normalizeEmpleado = (empleado) => {
  const id = getFirstDefined(
    empleado?.id,
    empleado?.empleado_id,
    empleado?.id_empleado,
    empleado?.employee_id
  );

  return {
    id: id != null ? String(id) : '',
    nombre: getFirstDefined(empleado?.nombre, empleado?.name, empleado?.full_name, empleado?.apellido_nombre) || 'Empleado sin nombre',
    valorHora: toNumber(
      getFirstDefined(
        empleado?.valor_hora,
        empleado?.valorHora,
        empleado?.hourly_rate,
        empleado?.tarifa_hora,
        empleado?.sueldo_hora
      )
    ),
    activo: normalizeActivo(getFirstDefined(empleado?.activo, empleado?.active)),
    raw: empleado,
  };
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

const resolveAsistenciaLiquidacionFlags = (asistencia) => {
  const estaLiquidado = toBoolOrNull(getFirstDefined(
    asistencia?.esta_liquidado,
    asistencia?.estaLiquidado,
    asistencia?.liquidado,
  ));
  const puedeAjustarIngreso = toBoolOrNull(getFirstDefined(
    asistencia?.puede_ajustar_ingreso,
    asistencia?.puedeAjustarIngreso,
  ));

  if (puedeAjustarIngreso !== null) {
    return {
      estaLiquidado: estaLiquidado === true,
      puedeAjustarIngreso,
    };
  }

  const tieneIngreso = Boolean(getFirstDefined(
    asistencia?.ingreso,
    asistencia?.hora_ingreso,
    asistencia?.fecha_ingreso,
  ));
  const tieneEgreso = Boolean(getFirstDefined(
    asistencia?.egreso,
    asistencia?.hora_egreso,
    asistencia?.fecha_egreso,
  ));
  const estado = getFirstDefined(asistencia?.estado, asistencia?.status);
  const turnoAbierto = estado === 'ABIERTO' && !tieneEgreso;

  return {
    estaLiquidado: estaLiquidado === true,
    puedeAjustarIngreso: tieneIngreso && turnoAbierto && estaLiquidado !== true,
  };
};

const normalizeAsistencia = (asistencia) => {
  const ingresoRaw = getFirstDefined(
    asistencia?.ingreso,
    asistencia?.hora_ingreso,
    asistencia?.fecha_ingreso,
    asistencia?.ingreso_at,
    asistencia?.entrada,
    asistencia?.check_in,
  );
  const egresoRaw = getFirstDefined(
    asistencia?.egreso,
    asistencia?.hora_egreso,
    asistencia?.fecha_egreso,
    asistencia?.egreso_at,
    asistencia?.salida,
    asistencia?.check_out
  );

  const empleadoId = getFirstDefined(
    asistencia?.empleado_id,
    asistencia?.id_empleado,
    asistencia?.empleadoId,
    asistencia?.employee_id
  );
  const empleadoNombrePlano = `${getFirstDefined(asistencia?.empleado_nombre, '') || ''} ${getFirstDefined(asistencia?.empleado_apellido, '') || ''}`.trim();
  const empleadoNombreCompuesto = `${getFirstDefined(asistencia?.empleado?.nombre, '') || ''} ${getFirstDefined(asistencia?.empleado?.apellido, '') || ''}`.trim();
  const liquidacionFlags = resolveAsistenciaLiquidacionFlags(asistencia);
  const fechaAsistenciaRaw = getFirstDefined(asistencia?.fecha, asistencia?.fecha_asistencia);

  return {
    id: String(getFirstDefined(asistencia?.id, asistencia?.asistencia_id, `${empleadoId || 'x'}-${ingresoRaw || 'sin-ingreso'}`)),
    empleadoId: empleadoId != null ? String(empleadoId) : '',
    empleadoNombre: getFirstDefined(
      empleadoNombrePlano,
      asistencia?.empleado_nombre,
      asistencia?.nombre_empleado,
      asistencia?.empleado?.nombre_completo,
      asistencia?.empleado?.full_name,
      empleadoNombreCompuesto,
      asistencia?.empleado?.nombre,
      asistencia?.empleado_name
    ) || 'Sin nombre',
    ingreso: toDate(ingresoRaw),
    egreso: toDate(egresoRaw),
    fechaAsistencia: toDate(fechaAsistenciaRaw) || toDate(ingresoRaw),
    minutosTrabajados: toNumber(getFirstDefined(asistencia?.minutos_trabajados, asistencia?.minutos)),
    accion: getFirstDefined(asistencia?.accion, asistencia?.tipo_movimiento, asistencia?.tipo, asistencia?.estado) || null,
    registradoPor: getFirstDefined(
      asistencia?.registrado_por_nombre,
      asistencia?.registrado_por,
      asistencia?.usuario_nombre,
      asistencia?.user_name,
      asistencia?.created_by
    ) || 'Sistema',
    estado: getFirstDefined(asistencia?.estado, asistencia?.status) || null,
    estaLiquidado: liquidacionFlags.estaLiquidado,
    puedeAjustarIngreso: liquidacionFlags.puedeAjustarIngreso,
    esFeriado: Boolean(getFirstDefined(asistencia?.es_feriado, asistencia?.esFeriado)),
    raw: asistencia,
  };
};

const isMissingEmployeeName = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return !normalized || normalized === 'sin nombre';
};

const formatYmd = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getManualDateBounds = () => {
  const now = new Date();
  const maxDate = formatYmd(now);
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const hace30 = new Date(now);
  hace30.setDate(hace30.getDate() - 30);
  const minDate = formatYmd(inicioMes > hace30 ? inicioMes : hace30);
  return { minDate, maxDate };
};

const isSameDay = (date, now) =>
  date &&
  date.getDate() === now.getDate() &&
  date.getMonth() === now.getMonth() &&
  date.getFullYear() === now.getFullYear();

const isRecordToday = (record, now) =>
  isSameDay(record.fechaAsistencia, now) || isSameDay(record.ingreso, now);

const diffHours = (fromDate, toDateValue) => {
  if (!fromDate || !toDateValue) return 0;
  const ms = toDateValue.getTime() - fromDate.getTime();
  if (ms <= 0) return 0;
  return ms / (1000 * 60 * 60);
};

const isTurnoAbierto = (record) =>
  record?.estado === 'ABIERTO' && !record?.egreso;

const isTurnoCerrado = (record) =>
  record?.egreso && ['CERRADO', 'CORREGIDO'].includes(record.estado);

const getRecordSortTs = (record) => {
  const updated = toDate(getFirstDefined(
    record?.raw?.fecha_actualizacion,
    record?.raw?.updated_at,
  ));
  if (updated) return updated.getTime();
  const ingreso = record?.ingreso?.getTime?.() || 0;
  if (ingreso) return ingreso;
  const id = Number(record?.id);
  return Number.isFinite(id) ? id : 0;
};

const HORAS_MAX_TURNO_ACTIVO = 16;

const esTurnoNocturnoActivo = (record, now) => {
  if (!record?.ingreso) return false;
  const horas = (now.getTime() - record.ingreso.getTime()) / (1000 * 60 * 60);
  return horas > 0 && horas <= HORAS_MAX_TURNO_ACTIVO;
};

const isTurnoPendiente = (record, now) =>
  isTurnoAbierto(record) && !isRecordToday(record, now) && !esTurnoNocturnoActivo(record, now);

const mergeAsistencias = (items) => {
  const byId = new Map();
  items.forEach((item) => {
    if (!item?.id) return;
    byId.set(item.id, item);
  });
  return Array.from(byId.values());
};

const calcularHorasTurnos = (turnos, now) => {
  return turnos.reduce((acc, turno) => {
    if (isTurnoCerrado(turno)) {
      if (turno.minutosTrabajados > 0) {
        return acc + turno.minutosTrabajados / 60;
      }
      return acc + diffHours(turno.ingreso, turno.egreso);
    }
    if (isTurnoAbierto(turno)) {
      return acc + diffHours(turno.ingreso, now);
    }
    return acc;
  }, 0);
};

const calcularEstimadoTurnos = (turnos, now, valorHora) => {
  return turnos.reduce((acc, turno) => {
    let horas = 0;
    if (isTurnoCerrado(turno)) {
      horas = turno.minutosTrabajados > 0
        ? turno.minutosTrabajados / 60
        : diffHours(turno.ingreso, turno.egreso);
    } else if (isTurnoAbierto(turno)) {
      horas = diffHours(turno.ingreso, now);
    }
    const multiplicador = turno.esFeriado ? 2 : 1;
    return acc + horas * (valorHora || 0) * multiplicador;
  }, 0);
};

const resolverEstadoEmpleado = ({
  turnosHoy,
  turnoPendiente,
  turnoAbiertoHoy,
}) => {
  if (turnoPendiente) return 'turno_pendiente';
  if (turnoAbiertoHoy) return 'en_turno';
  if (turnosHoy.some(isTurnoCerrado)) return 'entre_turnos';
  return 'sin_ingreso';
};

const buildIngresoError = (response) => {
  const base = response.error || 'No se pudo registrar ingreso';
  if (response.code !== 'ASISTENCIA_ABIERTA_EXISTENTE' || !response.details) {
    return base;
  }
  const fecha = response.details.fecha || 'otro dia';
  return `${base}. Hay un turno abierto desde el ${fecha}. Registra el egreso del turno pendiente primero.`;
};

export const useAsistencia = () => {
  const [empleados, setEmpleados] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [loadingInicial, setLoadingInicial] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [error, setError] = useState(null);
  const [accionesCargando, setAccionesCargando] = useState({});

  const cargarAsistencia = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setLoadingRefresh(true);
    } else {
      setLoadingInicial(true);
    }
    setError(null);

    const today = new Date();
    const fecha = formatYmd(today);

    try {
      const [empleadosResponse, asistenciasHoyResponse, asistenciasAbiertasResponse] = await Promise.all([
        empleadosService.obtenerEmpleados({ activo: true }),
        empleadosService.obtenerAsistencias({
          fecha_desde: fecha,
          fecha_hasta: fecha,
        }),
        empleadosService.obtenerAsistencias({ estado: 'ABIERTO' }),
      ]);

      if (!empleadosResponse.success) {
        setError(empleadosResponse.error || 'No se pudo cargar empleados');
      }
      if (!asistenciasHoyResponse.success) {
        setError((previous) => previous || asistenciasHoyResponse.error || 'No se pudo cargar asistencias');
      }

      const normalizedEmpleados = empleadosResponse.success
        ? (empleadosResponse.data || []).map(normalizeEmpleado).filter((emp) => emp.id)
        : [];

      if (empleadosResponse.success) {
        setEmpleados(normalizedEmpleados);
      } else {
        setEmpleados([]);
      }

      const empleadosById = new Map(normalizedEmpleados.map((item) => [item.id, item]));
      const rawAsistencias = [
        ...(asistenciasHoyResponse.success ? asistenciasHoyResponse.data || [] : []),
        ...(asistenciasAbiertasResponse.success ? asistenciasAbiertasResponse.data || [] : []),
      ];

      const asistenciasNormalizadas = mergeAsistencias(
        rawAsistencias
          .map(normalizeAsistencia)
          .filter((item) => item.empleadoId)
          .map((item) => {
            const empleado = empleadosById.get(item.empleadoId);
            if (!empleado) return item;
            if (!isMissingEmployeeName(item.empleadoNombre)) return item;
            return { ...item, empleadoNombre: empleado.nombre };
          })
      );

      setAsistencias(asistenciasNormalizadas);
    } catch (requestError) {
      setError('No se pudo cargar la pantalla de asistencia');
      console.error('Error al cargar asistencia:', requestError);
      setEmpleados([]);
      setAsistencias([]);
    } finally {
      setLoadingInicial(false);
      setLoadingRefresh(false);
    }
  }, []);

  const asistenciaHoy = useMemo(() => {
    const now = new Date();
    return asistencias
      .filter((item) => isRecordToday(item, now))
      .sort((a, b) => getRecordSortTs(a) - getRecordSortTs(b));
  }, [asistencias]);

  const turnosPendientes = useMemo(() => {
    const now = new Date();
    return asistencias
      .filter((item) => isTurnoPendiente(item, now))
      .sort((a, b) => getRecordSortTs(a) - getRecordSortTs(b));
  }, [asistencias]);

  const turnosHoyPorEmpleado = useMemo(() => {
    const now = new Date();
    const map = new Map();
    asistencias.forEach((record) => {
      if (!record.empleadoId || !isRecordToday(record, now)) return;
      const lista = map.get(record.empleadoId) || [];
      lista.push(record);
      map.set(record.empleadoId, lista);
    });
    map.forEach((lista, empleadoId) => {
      map.set(empleadoId, [...lista].sort((a, b) => getRecordSortTs(a) - getRecordSortTs(b)));
    });
    return map;
  }, [asistencias]);

  const empleadosConEstado = useMemo(() => {
    const now = new Date();

    return empleados
      .filter((empleado) => empleado.activo)
      .map((empleado) => {
        const turnosHoy = turnosHoyPorEmpleado.get(empleado.id) || [];
        const turnoPendiente = turnosPendientes.find((item) => item.empleadoId === empleado.id) || null;
        const turnoAbiertoHoy = turnosHoy.find(isTurnoAbierto) || null;
        const turnoNocturnoActivo = asistencias.find(
          (record) => record.empleadoId === empleado.id
            && isTurnoAbierto(record)
            && !isRecordToday(record, now)
            && esTurnoNocturnoActivo(record, now)
        ) || null;
        const turnoAbiertoActual = turnoAbiertoHoy || turnoNocturnoActivo || null;
        const asistenciaActual = turnoAbiertoActual || turnoPendiente || null;
        const estado = resolverEstadoEmpleado({
          turnosHoy,
          turnoPendiente,
          turnoAbiertoHoy: turnoAbiertoActual,
        });
        const turnosParaHoras = turnoNocturnoActivo
          && !turnosHoy.some((turno) => turno.id === turnoNocturnoActivo.id)
          ? [...turnosHoy, turnoNocturnoActivo]
          : turnosHoy;
        const horasTurno = calcularHorasTurnos(turnosParaHoras, now);

        return {
          ...empleado,
          estado,
          asistenciaActual,
          turnosHoy: turnosParaHoras,
          turnoPendiente,
          turnoNocturnoActivo,
          horasTurno,
          estimadoTurno: calcularEstimadoTurnos(turnosParaHoras, now, empleado.valorHora),
          puedeAjustarIngreso: Boolean(asistenciaActual?.puedeAjustarIngreso),
          estaLiquidado: Boolean(asistenciaActual?.estaLiquidado),
          loadingAccion: Boolean(accionesCargando[empleado.id]),
        };
      });
  }, [accionesCargando, asistencias, empleados, turnosHoyPorEmpleado, turnosPendientes]);

  const metricas = useMemo(() => {
    const activosHoy = empleadosConEstado.filter((item) => (item.turnosHoy?.length || 0) > 0).length;
    const enTurnoAhora = empleadosConEstado.filter((item) => item.estado === 'en_turno').length;
    const pendientes = turnosPendientes.length;
    const horasAcumuladasHoy = empleadosConEstado.reduce((acc, item) => acc + item.horasTurno, 0);
    const totalEstimadoHoy = empleadosConEstado.reduce((acc, item) => acc + item.estimadoTurno, 0);

    return {
      activosHoy,
      enTurnoAhora,
      pendientes,
      horasAcumuladasHoy,
      totalEstimadoHoy,
    };
  }, [empleadosConEstado, turnosPendientes]);

  const actividadReciente = useMemo(() => {
    return asistenciaHoy.flatMap((item) => {
      const entries = [];
      if (item.ingreso) {
        entries.push({
          id: `${item.id}-ingreso`,
          fecha: item.ingreso,
          empleadoNombre: item.empleadoNombre,
          accion: 'Ingreso',
          registradoPor: item.registradoPor,
          estado: item.egreso ? 'Turno cerrado' : 'En turno',
        });
      }
      if (item.egreso) {
        entries.push({
          id: `${item.id}-egreso`,
          fecha: item.egreso,
          empleadoNombre: item.empleadoNombre,
          accion: 'Egreso',
          registradoPor: item.registradoPor,
          estado: 'Turno cerrado',
        });
      }
      return entries;
    }).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  }, [asistenciaHoy]);

  const aplicarCargaAccion = (empleadoId, isLoading) => {
    const key = String(empleadoId);
    setAccionesCargando((prev) => ({ ...prev, [key]: isLoading }));
  };

  const registrarIngreso = useCallback(async (empleadoId, { esFeriado = false } = {}) => {
    aplicarCargaAccion(empleadoId, true);

    try {
      const response = await empleadosService.registrarIngreso(empleadoId, { es_feriado: esFeriado });
      if (!response.success) {
        return {
          success: false,
          error: buildIngresoError(response),
          details: response.details,
        };
      }

      const backendRecord = response.data ? normalizeAsistencia(response.data) : null;
      if (backendRecord?.empleadoId) {
        setAsistencias((prev) => mergeAsistencias([backendRecord, ...prev]));
      }

      return { success: true, data: backendRecord };
    } catch (errorRequest) {
      console.error('Error al registrar ingreso:', errorRequest);
      return { success: false, error: 'No se pudo registrar ingreso' };
    } finally {
      aplicarCargaAccion(empleadoId, false);
    }
  }, []);

  const registrarEgreso = useCallback(async (empleadoId, extraPayload = {}) => {
    aplicarCargaAccion(empleadoId, true);

    try {
      const response = await empleadosService.registrarEgreso(empleadoId, extraPayload);
      if (!response.success) {
        return { success: false, error: response.error || 'No se pudo registrar egreso' };
      }

      const backendRecord = response.data ? normalizeAsistencia(response.data) : null;
      if (backendRecord?.empleadoId) {
        setAsistencias((prev) => mergeAsistencias([backendRecord, ...prev]));
      }

      return { success: true, data: backendRecord };
    } catch (errorRequest) {
      console.error('Error al registrar egreso:', errorRequest);
      return { success: false, error: 'No se pudo registrar egreso' };
    } finally {
      aplicarCargaAccion(empleadoId, false);
    }
  }, []);

  const ajustarIngreso = useCallback(async (asistenciaId, payload) => {
    const key = `ajuste-${asistenciaId}`;
    setAccionesCargando((prev) => ({ ...prev, [key]: true }));

    try {
      const response = await empleadosService.ajustarIngresoAsistencia(asistenciaId, payload);
      if (!response.success) {
        return {
          success: false,
          error: response.error || 'No se pudo ajustar la hora de ingreso',
        };
      }

      const backendRecord = response.data ? normalizeAsistencia(response.data) : null;
      if (backendRecord?.empleadoId) {
        setAsistencias((prev) => mergeAsistencias([backendRecord, ...prev]));
      }

      return { success: true, data: backendRecord };
    } catch (errorRequest) {
      console.error('Error al ajustar ingreso:', errorRequest);
      return { success: false, error: 'No se pudo ajustar la hora de ingreso' };
    } finally {
      setAccionesCargando((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  const registrarManual = useCallback(async (payload) => {
    const key = `manual-${payload?.empleado_id || 'x'}`;
    setAccionesCargando((prev) => ({ ...prev, [key]: true }));

    try {
      const response = await empleadosService.registrarAsistenciaManual(payload);
      if (!response.success) {
        return {
          success: false,
          error: response.error || 'No se pudo registrar la asistencia manual',
        };
      }

      const backendRecord = response.data ? normalizeAsistencia(response.data) : null;
      if (backendRecord?.empleadoId) {
        setAsistencias((prev) => mergeAsistencias([backendRecord, ...prev]));
      }

      return { success: true, data: backendRecord };
    } catch (errorRequest) {
      console.error('Error al registrar asistencia manual:', errorRequest);
      return { success: false, error: 'No se pudo registrar la asistencia manual' };
    } finally {
      setAccionesCargando((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  return {
    empleadosConEstado,
    turnosPendientes,
    actividadReciente,
    metricas,
    loadingInicial,
    loadingRefresh,
    error,
    cargarAsistencia,
    registrarIngreso,
    registrarEgreso,
    ajustarIngreso,
    registrarManual,
    accionesCargando,
    manualDateBounds: getManualDateBounds(),
  };
};
