import { useCallback, useEffect, useState } from 'react';
import { tiendaOnlineService } from '@/services/tiendaOnlineService';

const EMPTY = {
  colorPrimario: '#1D4ED8',
  colorSecundario: '#88E1F2',
  nombreNegocio: '',
  logoUrl: null,
};

export function useTiendaAparienciaConfig(notification) {
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [apariencia, setApariencia] = useState(EMPTY);

  const cargar = useCallback(async () => {
    setLoading(true);
    const result = await tiendaOnlineService.getApariencia();
    setLoading(false);
    if (!result.success) {
      notification?.showError?.(result.message);
      return;
    }
    setApariencia(result.data);
  }, [notification]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = async () => {
    setGuardando(true);
    const result = await tiendaOnlineService.updateApariencia({
      colorPrimario: apariencia.colorPrimario,
      colorSecundario: apariencia.colorSecundario,
    });
    setGuardando(false);
    if (!result.success) {
      notification?.showError?.(result.message);
      return false;
    }
    notification?.showSuccess?.(result.message || 'Apariencia guardada');
    setApariencia(result.data);
    return true;
  };

  return {
    loading,
    guardando,
    apariencia,
    setApariencia,
    cargar,
    guardar,
  };
}
