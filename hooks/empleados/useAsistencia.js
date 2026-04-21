import { useCallback, useMemo, useState } from 'react';
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
    activo: getFirstDefined(empleado?.activo, empleado?.active, true) !== false,
    raw: empleado,
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
    asistencia?.created_at
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
    accion: getFirstDefined(asistencia?.accion, asistencia?.tipo_movimiento, asistencia?.tipo, asistencia?.estado) || null,
    registradoPor: getFirstDefined(
      asistencia?.registrado_por_nombre,
      asistencia?.registrado_por,
      asistencia?.usuario_nombre,
      asistencia?.user_name,
      asistencia?.created_by
    ) || 'Sistema',
    estado: getFirstDefined(asistencia?.estado, asistencia?.status) || null,
    raw: asistencia,
  };
};

const isMissingEmployeeName = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return !normalized || normalized === 'sin nombre';
};

const isSameDay = (date, now) =>
  date &&
  date.getDate() === now.getDate() &&
  date.getMonth() === now.getMonth() &&
  date.getFullYear() === now.getFullYear();

const diffHours = (fromDate, toDateValue) => {
  if (!fromDate || !toDateValue) return 0;
  const ms = toDateValue.getTime() - fromDate.getTime();
  if (ms <= 0) return 0;
  return ms / (1000 * 60 * 60);
};

const formatYmd = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
      const [empleadosResponse, asistenciasResponse] = await Promise.all([
        empleadosService.obtenerEmpleados({ activo: true }),
        empleadosService.obtenerAsistencias({
          fecha_desde: fecha,
          fecha_hasta: fecha,
        }),
      ]);

      if (!empleadosResponse.success) {
        setError(empleadosResponse.error || 'No se pudo cargar empleados');
      }
      if (!asistenciasResponse.success) {
        setError((previous) => previous || asistenciasResponse.error || 'No se pudo cargar asistencias');
      }

      const normalizedEmpleados = empleadosResponse.success
        ? (empleadosResponse.data || []).map(normalizeEmpleado).filter((emp) => emp.id)
        : [];

      if (empleadosResponse.success) {
        setEmpleados(normalizedEmpleados);
      } else {
        setEmpleados([]);
      }

      if (asistenciasResponse.success) {
        const empleadosById = new Map(normalizedEmpleados.map((item) => [item.id, item]));
        const asistenciasNormalizadas = (asistenciasResponse.data || [])
          .map(normalizeAsistencia)
          .filter((item) => item.empleadoId)
          .map((item) => {
            const empleado = empleadosById.get(item.empleadoId);
            if (!empleado) return item;
            if (!isMissingEmployeeName(item.empleadoNombre)) return item;
            return { ...item, empleadoNombre: empleado.nombre };
          });

        setAsistencias(asistenciasNormalizadas);
      } else {
        setAsistencias([]);
      }
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
      .filter((item) => isSameDay(item.ingreso, now))
      .sort((a, b) => {
        const aTs = a.ingreso ? a.ingreso.getTime() : 0;
        const bTs = b.ingreso ? b.ingreso.getTime() : 0;
        return bTs - aTs;
      });
  }, [asistencias]);

  const estadoPorEmpleado = useMemo(() => {
    const map = new Map();

    asistenciaHoy.forEach((record) => {
      if (!record.empleadoId || map.has(record.empleadoId)) return;
      map.set(record.empleadoId, record);
    });

    return map;
  }, [asistenciaHoy]);

  const empleadosConEstado = useMemo(() => {
    const now = new Date();

    return empleados
      .filter((empleado) => empleado.activo)
      .map((empleado) => {
        const asistenciaActual = estadoPorEmpleado.get(empleado.id) || null;
        const tieneIngreso = Boolean(asistenciaActual?.ingreso);
        const tieneEgreso = Boolean(asistenciaActual?.egreso);
        const estado = !tieneIngreso
          ? 'sin_ingreso'
          : tieneEgreso
            ? 'turno_cerrado'
            : 'en_turno';
        const horasTurno = tieneIngreso
          ? diffHours(asistenciaActual.ingreso, asistenciaActual.egreso || now)
          : 0;

        return {
          ...empleado,
          estado,
          asistenciaActual,
          horasTurno,
          estimadoTurno: horasTurno * (empleado.valorHora || 0),
          loadingAccion: Boolean(accionesCargando[empleado.id]),
        };
      });
  }, [accionesCargando, empleados, estadoPorEmpleado]);

  const metricas = useMemo(() => {
    const activosHoy = empleadosConEstado.filter((item) => item.estado !== 'sin_ingreso').length;
    const enTurnoAhora = empleadosConEstado.filter((item) => item.estado === 'en_turno').length;
    const horasAcumuladasHoy = empleadosConEstado.reduce((acc, item) => acc + item.horasTurno, 0);
    const totalEstimadoHoy = empleadosConEstado.reduce((acc, item) => acc + item.estimadoTurno, 0);

    return {
      activosHoy,
      enTurnoAhora,
      horasAcumuladasHoy,
      totalEstimadoHoy,
    };
  }, [empleadosConEstado]);

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

  const registrarIngreso = useCallback(async (empleadoId) => {
    aplicarCargaAccion(empleadoId, true);
    const now = new Date();

    try {
      const response = await empleadosService.registrarIngreso(empleadoId);
      if (!response.success) {
        return { success: false, error: response.error || 'No se pudo registrar ingreso' };
      }

      const backendRecord = response.data ? normalizeAsistencia(response.data) : null;
      const record = backendRecord && backendRecord.empleadoId
        ? backendRecord
        : {
            id: `${empleadoId}-${Date.now()}`,
            empleadoId: String(empleadoId),
            empleadoNombre: empleados.find((item) => item.id === String(empleadoId))?.nombre || 'Empleado',
            ingreso: now,
            egreso: null,
            accion: 'Ingreso',
            registradoPor: 'Mostrador',
            estado: 'En turno',
            raw: {},
          };

      setAsistencias((prev) => {
        const withoutOpenShift = prev.filter((item) =>
          !(item.empleadoId === String(empleadoId) && item.ingreso && !item.egreso)
        );
        return [record, ...withoutOpenShift];
      });

      return { success: true, data: record };
    } catch (errorRequest) {
      console.error('Error al registrar ingreso:', errorRequest);
      return { success: false, error: 'No se pudo registrar ingreso' };
    } finally {
      aplicarCargaAccion(empleadoId, false);
    }
  }, [empleados]);

  const registrarEgreso = useCallback(async (empleadoId) => {
    aplicarCargaAccion(empleadoId, true);
    const now = new Date();

    try {
      const response = await empleadosService.registrarEgreso(empleadoId);
      if (!response.success) {
        return { success: false, error: response.error || 'No se pudo registrar egreso' };
      }

      const backendRecord = response.data ? normalizeAsistencia(response.data) : null;

      setAsistencias((prev) => {
        if (backendRecord?.empleadoId) {
          const filtered = prev.filter((item) => {
            if (item.id === backendRecord.id) return false;
            if (item.empleadoId !== backendRecord.empleadoId) return true;
            if (item.ingreso && !item.egreso) return false;
            return true;
          });
          return [backendRecord, ...filtered];
        }

        const updated = [...prev];
        const targetIndex = updated.findIndex((item) => item.empleadoId === String(empleadoId) && item.ingreso && !item.egreso);

        if (targetIndex >= 0) {
          updated[targetIndex] = {
            ...updated[targetIndex],
            egreso: now,
            estado: 'Turno cerrado',
          };
        } else {
          updated.unshift({
            id: `${empleadoId}-${Date.now()}`,
            empleadoId: String(empleadoId),
            empleadoNombre: empleados.find((item) => item.id === String(empleadoId))?.nombre || 'Empleado',
            ingreso: null,
            egreso: now,
            accion: 'Egreso',
            registradoPor: 'Mostrador',
            estado: 'Turno cerrado',
            raw: {},
          });
        }

        return updated;
      });

      return { success: true, data: backendRecord };
    } catch (errorRequest) {
      console.error('Error al registrar egreso:', errorRequest);
      return { success: false, error: 'No se pudo registrar egreso' };
    } finally {
      aplicarCargaAccion(empleadoId, false);
    }
  }, [empleados]);

  return {
    empleadosConEstado,
    actividadReciente,
    metricas,
    loadingInicial,
    loadingRefresh,
    error,
    cargarAsistencia,
    registrarIngreso,
    registrarEgreso,
  };
};
