import { useCallback, useMemo, useState } from 'react';
import { empleadosService } from '../../services/empleadosService';

const getFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

const toDate = (value) => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeEmpleado = (empleado) => {
  const nombre = getFirstDefined(empleado?.nombre, empleado?.name, empleado?.first_name, '');
  const apellido = getFirstDefined(empleado?.apellido, empleado?.last_name, empleado?.surname, '');
  const fullName = `${nombre} ${apellido}`.trim() || getFirstDefined(empleado?.nombre_completo, empleado?.full_name, 'Empleado');

  return {
    id: String(getFirstDefined(empleado?.id, empleado?.empleado_id, empleado?.id_empleado, '')),
    nombre: nombre || fullName,
    apellido: apellido || '',
    nombreCompleto: fullName,
    telefono: getFirstDefined(empleado?.telefono, empleado?.phone, empleado?.celular, ''),
    email: getFirstDefined(empleado?.email, empleado?.correo, ''),
    documento: getFirstDefined(empleado?.documento, empleado?.dni, empleado?.doc, ''),
    valorHora: toNumber(getFirstDefined(empleado?.valor_hora, empleado?.valorHora, empleado?.hourly_rate, empleado?.tarifa_hora)),
    fechaIngreso: toDate(getFirstDefined(empleado?.fecha_ingreso, empleado?.fechaIngreso, empleado?.ingreso, empleado?.created_at)),
    observaciones: getFirstDefined(empleado?.observaciones, empleado?.notas, ''),
    activo: getFirstDefined(empleado?.activo, empleado?.active, empleado?.estado === 'ACTIVO', true) !== false,
    raw: empleado,
  };
};

const formatDateYmd = (date) => {
  if (!date) return '';
  const normalized = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(normalized.getTime())) return '';
  const y = normalized.getFullYear();
  const m = String(normalized.getMonth() + 1).padStart(2, '0');
  const d = String(normalized.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const toPayload = (input) => {
  const payload = {
    nombre: input.nombre?.trim() || '',
    apellido: input.apellido?.trim() || '',
    telefono: input.telefono?.trim() || null,
    email: input.email?.trim() || null,
    documento: input.documento?.trim() || null,
    valor_hora: toNumber(input.valor_hora),
    fecha_ingreso: input.fecha_ingreso || null,
    observaciones: input.observaciones?.trim() || null,
  };

  return payload;
};

const sortByName = (list) => [...list].sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto, 'es'));

export const useEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMutating, setIsMutating] = useState(false);

  const cargarEmpleados = useCallback(async (estado = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const filtros = {};
      if (estado === 'activos') filtros.activo = true;
      if (estado === 'inactivos') filtros.activo = false;

      const response = await empleadosService.obtenerEmpleados(filtros);
      if (!response.success) {
        setError(response.error || 'No se pudo cargar empleados');
        setEmpleados([]);
        return;
      }

      const normalizados = sortByName((response.data || []).map(normalizeEmpleado).filter((item) => item.id));
      setEmpleados(normalizados);
    } catch (requestError) {
      console.error('Error al cargar empleados:', requestError);
      setError('No se pudo cargar empleados');
      setEmpleados([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const upsertEmpleadoLocal = (empleadoData) => {
    if (!empleadoData) return false;
    const normalized = normalizeEmpleado(empleadoData);
    if (!normalized.id) return false;

    setEmpleados((prev) => {
      const index = prev.findIndex((item) => item.id === normalized.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...normalized };
        return sortByName(updated);
      }
      return sortByName([normalized, ...prev]);
    });
    return true;
  };

  const crearEmpleado = async (formData) => {
    setIsMutating(true);
    try {
      const payload = toPayload(formData);
      const response = await empleadosService.crearEmpleado(payload);
      if (!response.success) {
        return { success: false, error: response.error || 'No se pudo crear empleado' };
      }

      const applied = upsertEmpleadoLocal(response.data);
      if (!applied) {
        await cargarEmpleados('all');
      }

      return { success: true, data: response.data };
    } catch (requestError) {
      console.error('Error al crear empleado:', requestError);
      return { success: false, error: 'No se pudo crear empleado' };
    } finally {
      setIsMutating(false);
    }
  };

  const actualizarEmpleado = async (id, formData) => {
    setIsMutating(true);
    try {
      const payload = toPayload(formData);
      const response = await empleadosService.actualizarEmpleado(id, payload);
      if (!response.success) {
        return { success: false, error: response.error || 'No se pudo actualizar empleado' };
      }

      const applied = upsertEmpleadoLocal(response.data);
      if (!applied) {
        setEmpleados((prev) =>
          sortByName(prev.map((empleado) => {
            if (empleado.id !== String(id)) return empleado;
            return {
              ...empleado,
              ...normalizeEmpleado({
                ...empleado.raw,
                ...payload,
                id: empleado.id,
              }),
            };
          }))
        );
      }

      return { success: true, data: response.data };
    } catch (requestError) {
      console.error('Error al actualizar empleado:', requestError);
      return { success: false, error: 'No se pudo actualizar empleado' };
    } finally {
      setIsMutating(false);
    }
  };

  const cambiarEstadoEmpleado = async (id, activo) => {
    setIsMutating(true);
    try {
      const response = activo
        ? await empleadosService.activarEmpleado(id)
        : await empleadosService.inactivarEmpleado(id);

      if (!response.success) {
        return { success: false, error: response.error || 'No se pudo actualizar el estado del empleado' };
      }

      const applied = upsertEmpleadoLocal(response.data);
      if (!applied) {
        setEmpleados((prev) =>
          sortByName(prev.map((empleado) => (
            empleado.id === String(id)
              ? { ...empleado, activo }
              : empleado
          )))
        );
      }

      return { success: true, data: response.data };
    } catch (requestError) {
      console.error('Error al cambiar estado del empleado:', requestError);
      return { success: false, error: 'No se pudo actualizar el estado del empleado' };
    } finally {
      setIsMutating(false);
    }
  };

  const empleadosActivos = useMemo(
    () => empleados.filter((empleado) => empleado.activo),
    [empleados]
  );

  return {
    empleados,
    empleadosActivos,
    loading,
    error,
    isMutating,
    cargarEmpleados,
    crearEmpleado,
    actualizarEmpleado,
    cambiarEstadoEmpleado,
    formatDateYmd,
  };
};
