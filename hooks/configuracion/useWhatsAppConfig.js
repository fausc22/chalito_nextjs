import { useCallback, useEffect, useMemo, useState } from 'react';
import { whatsappService } from '@/services/whatsappService';
import { hasValidationErrors, validateAllPlantillas } from '@/lib/whatsappTemplateUtils';

const EMPTY_SETTINGS = {
  notificacionesActivas: true,
  aliasTransferencia: '',
  nombreNegocio: '',
  plantillas: {},
  plantillasDefault: {},
};

export function useWhatsAppConfig(notification) {
  const [waEstado, setWaEstado] = useState({ connected: false, hasQR: false, phone: null });
  const [waQr, setWaQr] = useState(null);
  const [polling, setPolling] = useState(false);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [settingsLocal, setSettingsLocal] = useState(EMPTY_SETTINGS);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [plantillaErrors, setPlantillaErrors] = useState({});

  const validationErrors = useMemo(
    () => validateAllPlantillas(settingsLocal.plantillas),
    [settingsLocal.plantillas]
  );

  const hasPlantillaErrors = hasValidationErrors(validationErrors);

  const refrescarEstado = useCallback(async () => {
    const result = await whatsappService.obtenerEstado();
    if (result.success) {
      setWaEstado({
        connected: result.connected,
        hasQR: result.hasQR,
        phone: result.phone,
      });
    }
  }, []);

  const cargarSettings = useCallback(async () => {
    const result = await whatsappService.getSettings();
    if (!result.success) {
      notification?.showError?.(result.message);
      return;
    }
    setSettings(result.data);
    setSettingsLocal(result.data);
    setPlantillaErrors({});
  }, [notification]);

  const cargarPreviews = useCallback(async () => {
    const result = await whatsappService.getPreviews();
    if (result.success) {
      setPreviews(result.data || []);
    }
  }, []);

  const cargarTodo = useCallback(async () => {
    setLoading(true);
    await Promise.all([refrescarEstado(), cargarSettings(), cargarPreviews()]);
    setLoading(false);
  }, [refrescarEstado, cargarSettings, cargarPreviews]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  useEffect(() => {
    if (!polling) return undefined;

    const poll = async () => {
      const result = await whatsappService.obtenerQr();
      if (!result.success) return;

      if (result.connected) {
        setPolling(false);
        setWaQr(null);
        notification?.showSuccess?.('WhatsApp conectado');
        await refrescarEstado();
        return;
      }

      if (result.qr) {
        setWaQr(result.qr);
      }
    };

    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [polling, refrescarEstado, notification]);

  const conectar = async () => {
    const result = await whatsappService.conectar();
    if (!result.success) {
      notification?.showError?.(result.message);
      return;
    }
    setPolling(true);
    setWaQr(null);
    notification?.showSuccess?.(result.message || 'Escaneá el QR con WhatsApp');
    await refrescarEstado();
  };

  const desconectar = async () => {
    setPolling(false);
    setWaQr(null);
    const result = await whatsappService.desconectar();
    if (!result.success) {
      notification?.showError?.(result.message);
      return;
    }
    notification?.showSuccess?.(result.message || 'WhatsApp desconectado');
    await refrescarEstado();
  };

  const setPlantilla = useCallback((templateKey, value) => {
    setSettingsLocal((prev) => ({
      ...prev,
      plantillas: {
        ...(prev.plantillas || {}),
        [templateKey]: value,
      },
    }));
    setPlantillaErrors((prev) => {
      if (!prev[templateKey]) return prev;
      const next = { ...prev };
      delete next[templateKey];
      return next;
    });
  }, []);

  const restaurarPlantilla = useCallback((templateKey) => {
    setSettingsLocal((prev) => ({
      ...prev,
      plantillas: {
        ...(prev.plantillas || {}),
        [templateKey]: prev.plantillasDefault?.[templateKey] || '',
      },
    }));
    setPlantillaErrors((prev) => {
      if (!prev[templateKey]) return prev;
      const next = { ...prev };
      delete next[templateKey];
      return next;
    });
  }, []);

  const restaurarTodasPlantillas = useCallback(() => {
    setSettingsLocal((prev) => ({
      ...prev,
      plantillas: { ...(prev.plantillasDefault || {}) },
    }));
    setPlantillaErrors({});
  }, []);

  const guardarSettings = async () => {
    const localErrors = validateAllPlantillas(settingsLocal.plantillas);
    if (hasValidationErrors(localErrors)) {
      setPlantillaErrors(localErrors);
      notification?.showError?.('Revisá las plantillas: faltan placeholders obligatorios');
      return false;
    }

    setGuardando(true);
    const result = await whatsappService.updateSettings({
      notificacionesActivas: settingsLocal.notificacionesActivas,
      aliasTransferencia: settingsLocal.aliasTransferencia,
      plantillas: settingsLocal.plantillas,
    });
    setGuardando(false);

    if (!result.success) {
      if (result.errors) {
        setPlantillaErrors(result.errors);
      }
      notification?.showError?.(result.message);
      return false;
    }

    notification?.showSuccess?.(result.message || 'Configuración guardada');
    setSettings(result.data);
    setSettingsLocal(result.data);
    setPlantillaErrors({});
    await cargarPreviews();
    return true;
  };

  return {
    loading,
    guardando,
    waEstado,
    waQr,
    polling,
    settings,
    settingsLocal,
    previews,
    plantillaErrors,
    validationErrors,
    hasPlantillaErrors,
    setSettingsLocal,
    setPlantilla,
    restaurarPlantilla,
    restaurarTodasPlantillas,
    refrescarEstado,
    cargarTodo,
    conectar,
    desconectar,
    guardarSettings,
  };
}
