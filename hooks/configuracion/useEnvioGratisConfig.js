import { useCallback, useEffect, useState } from 'react';
import { tiendaOnlineService } from '@/services/tiendaOnlineService';

export function useEnvioGratisConfig(notification) {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [settings, setSettings] = useState({
    activo: false,
    montoMinimo: 0,
  });

  const cargar = useCallback(async () => {
    setLoading(true);
    const result = await tiendaOnlineService.getEnvioGratis();
    if (!result.success) {
      notification?.showError(result.message);
      setLoading(false);
      return;
    }
    setSettings(result.data);
    setLoading(false);
  }, [notification]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = useCallback(async () => {
    setGuardando(true);
    const result = await tiendaOnlineService.updateEnvioGratis(settings);
    setGuardando(false);

    if (!result.success) {
      notification?.showError(result.message);
      return false;
    }

    setSettings(result.data);
    notification?.showSuccess(result.message || 'Envío gratis guardado');
    return true;
  }, [notification, settings]);

  return {
    loading,
    guardando,
    settings,
    setSettings,
    cargar,
    guardar,
  };
}
