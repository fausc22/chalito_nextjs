import { useCallback, useEffect, useMemo, useState } from 'react';
import { whatsappService } from '@/services/whatsappService';
import {
  deriveModoPedidosWeb,
  getPlantillasDefaultForModo,
  getPlantillasMapForModo,
  hasValidationErrors,
  modoToFlags,
  TEMPLATE_KEYS,
  validateAllPlantillas,
} from '@/lib/whatsappTemplateUtils';
import { validateClienteAlLocalTemplate } from '@/lib/whatsappClienteAlLocalUtils';

const EMPTY_SETTINGS = {
  notificacionesActivas: true,
  aliasTransferencia: '',
  nombreNegocio: '',
  plantillas: {},
  plantillasDefault: {},
  plantillasClienteLocal: {},
  plantillasClienteLocalDefault: {},
  clienteEnviaAlLocal: false,
  numeroContacto: '',
  templateClienteAlLocal: '',
  templateClienteAlLocalDefault: '',
  modoPedidosWeb: 'desactivado',
  numeroContactoResuelto: null,
  numeroContactoFuente: null,
};

const validateClienteLocalPlantillas = (plantillas = {}) => {
  const errors = {};
  for (const key of TEMPLATE_KEYS) {
    const keyErrors = validateClienteAlLocalTemplate(plantillas[key]);
    if (keyErrors.length > 0) {
      errors[key] = keyErrors;
    }
  }
  return errors;
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

  const modoPedidosWeb = useMemo(
    () =>
      deriveModoPedidosWeb({
        notificacionesActivas: settingsLocal.notificacionesActivas,
        clienteEnviaAlLocal: settingsLocal.clienteEnviaAlLocal,
      }),
    [settingsLocal.notificacionesActivas, settingsLocal.clienteEnviaAlLocal]
  );

  const plantillasActivas = useMemo(
    () => getPlantillasMapForModo(settingsLocal, modoPedidosWeb),
    [settingsLocal, modoPedidosWeb]
  );

  const validationErrors = useMemo(() => {
    if (modoPedidosWeb === 'local_a_cliente') {
      return validateAllPlantillas(settingsLocal.plantillas);
    }
    if (modoPedidosWeb === 'cliente_a_local') {
      return validateClienteLocalPlantillas(settingsLocal.plantillasClienteLocal);
    }
    return {};
  }, [modoPedidosWeb, settingsLocal.plantillas, settingsLocal.plantillasClienteLocal]);

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
        await cargarSettings();
        return;
      }

      if (result.qr) {
        setWaQr(result.qr);
      }
    };

    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [polling, refrescarEstado, cargarSettings, notification]);

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
    await cargarSettings();
  };

  const setModoPedidosWeb = useCallback((modo) => {
    const flags = modoToFlags(modo);
    setSettingsLocal((prev) => ({
      ...prev,
      ...flags,
    }));
    setPlantillaErrors({});
  }, []);

  const setPlantilla = useCallback(
    (templateKey, value) => {
      if (modoPedidosWeb === 'cliente_a_local') {
        setSettingsLocal((prev) => ({
          ...prev,
          plantillasClienteLocal: {
            ...(prev.plantillasClienteLocal || {}),
            [templateKey]: value,
          },
        }));
      } else {
        setSettingsLocal((prev) => ({
          ...prev,
          plantillas: {
            ...(prev.plantillas || {}),
            [templateKey]: value,
          },
        }));
      }
      setPlantillaErrors((prev) => {
        if (!prev[templateKey]) return prev;
        const next = { ...prev };
        delete next[templateKey];
        return next;
      });
    },
    [modoPedidosWeb]
  );

  const restaurarPlantilla = useCallback(
    (templateKey) => {
      const defaults = getPlantillasDefaultForModo(settingsLocal, modoPedidosWeb);
      setPlantilla(templateKey, defaults[templateKey] || '');
    },
    [modoPedidosWeb, settingsLocal, setPlantilla]
  );

  const restaurarTodasPlantillas = useCallback(() => {
    const defaults = getPlantillasDefaultForModo(settingsLocal, modoPedidosWeb);
    if (modoPedidosWeb === 'cliente_a_local') {
      setSettingsLocal((prev) => ({
        ...prev,
        plantillasClienteLocal: { ...defaults },
      }));
    } else {
      setSettingsLocal((prev) => ({
        ...prev,
        plantillas: { ...defaults },
      }));
    }
    setPlantillaErrors({});
  }, [modoPedidosWeb, settingsLocal]);

  const guardarSettings = async () => {
    const localErrors =
      modoPedidosWeb === 'local_a_cliente'
        ? validateAllPlantillas(settingsLocal.plantillas)
        : modoPedidosWeb === 'cliente_a_local'
          ? validateClienteLocalPlantillas(settingsLocal.plantillasClienteLocal)
          : {};

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
      plantillasClienteLocal: settingsLocal.plantillasClienteLocal,
      clienteEnviaAlLocal: settingsLocal.clienteEnviaAlLocal,
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
    modoPedidosWeb,
    plantillasActivas,
    setSettingsLocal,
    setModoPedidosWeb,
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
