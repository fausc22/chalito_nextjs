import { useCallback, useState } from 'react';
import { tiendaOnlineService, DIAS_SEMANA } from '@/services/tiendaOnlineService';

export function useTiendaOnlineConfig(notification) {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [horarios, setHorarios] = useState([]);
  const [settings, setSettings] = useState({
    tiendaOnlineActiva: true,
    validarHorarios: true,
    toleranceMinutes: 5,
  });
  const [estadoPreview, setEstadoPreview] = useState(null);

  const refrescarEstado = useCallback(async () => {
    const result = await tiendaOnlineService.getEstadoPreview();
    if (result.success) {
      setEstadoPreview(result.data);
    }
  }, []);

  const cargarTodo = useCallback(async () => {
    setLoading(true);
    const [horariosRes, settingsRes] = await Promise.all([
      tiendaOnlineService.getHorarios(),
      tiendaOnlineService.getSettings(),
    ]);

    if (!horariosRes.success) {
      notification?.showError(horariosRes.message);
    } else {
      setHorarios(horariosRes.horarios);
    }

    if (!settingsRes.success) {
      notification?.showError(settingsRes.message);
    } else {
      setSettings(settingsRes.data);
    }

    await refrescarEstado();
    setLoading(false);
  }, [notification, refrescarEstado]);

  const actualizarHorarioDia = useCallback(
    async (diaSemana, franjas) => {
      setGuardando(true);
      const result = await tiendaOnlineService.updateHorarioDia(diaSemana, franjas);
      setGuardando(false);

      if (!result.success) {
        notification?.showError(result.message);
        return false;
      }

      setHorarios(result.horarios);
      notification?.showSuccess(result.message || 'Horarios guardados');
      await refrescarEstado();
      return true;
    },
    [notification, refrescarEstado]
  );

  const guardarSettings = useCallback(
    async (partial) => {
      setGuardando(true);
      const result = await tiendaOnlineService.updateSettings(partial);
      setGuardando(false);

      if (!result.success) {
        notification?.showError(result.message);
        return false;
      }

      setSettings(result.data);
      notification?.showSuccess(result.message || 'Configuración guardada');
      await refrescarEstado();
      return true;
    },
    [notification, refrescarEstado]
  );

  const obtenerHorariosDia = useCallback(
    (diaSemana) => tiendaOnlineService.getHorariosDia(horarios, diaSemana),
    [horarios]
  );

  return {
    DIAS_SEMANA,
    loading,
    guardando,
    horarios,
    settings,
    estadoPreview,
    cargarTodo,
    actualizarHorarioDia,
    guardarSettings,
    obtenerHorariosDia,
    refrescarEstado,
  };
}
