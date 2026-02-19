import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { systemService } from '../services/systemService';

const ConnectionStatusContext = createContext();

/**
 * Estados del sistema (UX profesional, sin términos técnicos):
 * - 'active': Sistema activo - worker funcionando, sin retrasos (verde)
 * - 'with_delays': Con retrasos - worker activo pero hay pedidos atrasados (amarillo)
 * - 'inactive': Worker inactivo - el sistema de automatización no está funcionando (rojo)
 */
export const CONNECTION_STATUS = {
  ACTIVE: 'active',
  WITH_DELAYS: 'with_delays',
  INACTIVE: 'inactive',
};

export const useConnectionStatus = () => {
  const context = useContext(ConnectionStatusContext);
  if (!context) {
    throw new Error('useConnectionStatus debe ser usado dentro de ConnectionStatusProvider');
  }
  return context;
};

export const ConnectionStatusProvider = ({ children }) => {
  const [status, setStatus] = useState(CONNECTION_STATUS.ACTIVE);
  const [workerActive, setWorkerActive] = useState(true);
  const [pedidosAtrasadosCount, setPedidosAtrasadosCount] = useState(0);
  const [lastPollingError, setLastPollingError] = useState(null);
  const [pollingActive, setPollingActive] = useState(true);
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const [lastWorkerHeartbeatAt, setLastWorkerHeartbeatAt] = useState(Date.now());
  const WORKER_HEARTBEAT_TIMEOUT_MS = 15000;

  const parseWorkerActive = useCallback((payload) => {
    if (typeof payload === 'boolean') return payload;
    if (!payload || typeof payload !== 'object') return false;
    if (typeof payload.active === 'boolean') return payload.active;
    if (typeof payload.isActive === 'boolean') return payload.isActive;
    if (typeof payload.connected === 'boolean') return payload.connected;
    if (typeof payload.running === 'boolean') return payload.running;
    if (typeof payload.status === 'string') {
      const normalized = payload.status.toLowerCase();
      if (['active', 'running', 'ok', 'healthy', 'connected'].includes(normalized)) {
        return true;
      }
      if (['inactive', 'stopped', 'down', 'disconnected', 'error'].includes(normalized)) {
        return false;
      }
    }
    if (payload.worker && typeof payload.worker.active === 'boolean') {
      return payload.worker.active;
    }
    return false;
  }, []);

  const resolveSystemStatus = useCallback((isWorkerRunningNow, atrasadosCount) => {
    if (!isWorkerRunningNow) {
      setStatus(CONNECTION_STATUS.INACTIVE);
      return;
    }
    if (atrasadosCount > 0) {
      setStatus(CONNECTION_STATUS.WITH_DELAYS);
      return;
    }
    setStatus(CONNECTION_STATUS.ACTIVE);
  }, []);

  const markWorkerHeartbeat = useCallback((payload = {}) => {
    const active = parseWorkerActive(payload);
    if (!active) {
      setWorkerActive(false);
      resolveSystemStatus(false, pedidosAtrasadosCount);
      return;
    }

    const rawTimestamp = payload.timestamp ?? payload.ts ?? payload.lastHeartbeat;
    const parsedTimestamp = Number(rawTimestamp);
    const heartbeatAt = Number.isFinite(parsedTimestamp) ? parsedTimestamp : Date.now();
    setLastWorkerHeartbeatAt(heartbeatAt);
    setWorkerActive(true);
    resolveSystemStatus(true, pedidosAtrasadosCount);
  }, [parseWorkerActive, pedidosAtrasadosCount, resolveSystemStatus]);

  // Función para verificar health del worker y métricas
  const checkSystemHealth = useCallback(async () => {
    try {
      const [healthSettled, metricsSettled] = await Promise.allSettled([
        systemService.obtenerHealthWorker(),
        systemService.obtenerMetricasPedidosAtrasados()
      ]);
      const healthResult = healthSettled.status === 'fulfilled'
        ? healthSettled.value
        : { success: false, data: { active: false }, error: healthSettled.reason?.message || 'Error al obtener health' };
      const metricsResult = metricsSettled.status === 'fulfilled'
        ? metricsSettled.value
        : { success: false, data: { count: 0, pedidos: [] }, error: metricsSettled.reason?.message || 'Error al obtener métricas' };

      // Worker activo por health endpoint o por heartbeat reciente (fallback robusto)
      const heartbeatIsFresh = (Date.now() - lastWorkerHeartbeatAt) <= WORKER_HEARTBEAT_TIMEOUT_MS;
      const workerActiveFromHealth = healthResult.success && parseWorkerActive(healthResult.data);
      const isWorkerRunningNow = workerActiveFromHealth || heartbeatIsFresh;
      setWorkerActive(isWorkerRunningNow);
      if (isWorkerRunningNow) {
        setLastWorkerHeartbeatAt(Date.now());
      }

      // Verificar métricas de pedidos atrasados
      const atrasadosCount = metricsResult.success ? (metricsResult.data?.count || 0) : 0;
      setPedidosAtrasadosCount(atrasadosCount);

      resolveSystemStatus(isWorkerRunningNow, atrasadosCount);

      setLastPollingError(null);
    } catch (error) {
      console.error('Error al verificar health del sistema:', error);
      // No degradar inmediatamente a inactivo por error transitorio;
      // usar timeout de heartbeat para decidir el estado real.
      const heartbeatIsFresh = (Date.now() - lastWorkerHeartbeatAt) <= WORKER_HEARTBEAT_TIMEOUT_MS;
      setWorkerActive(heartbeatIsFresh);
      resolveSystemStatus(heartbeatIsFresh, pedidosAtrasadosCount);
      setLastPollingError(error.message);
    }
  }, [lastWorkerHeartbeatAt, parseWorkerActive, pedidosAtrasadosCount, resolveSystemStatus]);

  // Polling de health y métricas cada 30 segundos
  useEffect(() => {
    // Verificar inmediatamente al montar
    checkSystemHealth();

    // Configurar polling cada 30 segundos
    const interval = setInterval(() => {
      checkSystemHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [checkSystemHealth]);

  // Heartbeat watchdog: si no llega señal en 15s, marcar inactivo
  useEffect(() => {
    const interval = setInterval(() => {
      const heartbeatIsFresh = (Date.now() - lastWorkerHeartbeatAt) <= WORKER_HEARTBEAT_TIMEOUT_MS;
      setWorkerActive(heartbeatIsFresh);
      resolveSystemStatus(heartbeatIsFresh, pedidosAtrasadosCount);
    }, 5000);

    return () => clearInterval(interval);
  }, [lastWorkerHeartbeatAt, pedidosAtrasadosCount, resolveSystemStatus]);

  // Mantener compatibilidad con código existente que usa updateWebsocketStatus y updatePollingStatus
  // Estos métodos ya no afectan el estado principal, pero se mantienen para no romper código existente
  const updateWebsocketStatus = useCallback((connected) => {
    setWebsocketConnected(connected);
    // El estado principal ahora se basa en health y métricas, no en WebSocket
  }, []);

  const updatePollingStatus = useCallback((active, error = null) => {
    setPollingActive(active);
    if (error) {
      setLastPollingError(error);
      // Limpiar el error después de 10 segundos para permitir reintentos
      setTimeout(() => {
        setLastPollingError(null);
      }, 10000);
    } else {
      setLastPollingError(null);
    }
  }, []);

  // Textos amigables para tooltips (sin términos técnicos)
  const getStatusTooltip = () => {
    switch (status) {
      case CONNECTION_STATUS.ACTIVE:
        return 'Sistema activo';
      case CONNECTION_STATUS.WITH_DELAYS:
        return `Con retrasos (${pedidosAtrasadosCount} pedido${pedidosAtrasadosCount !== 1 ? 's' : ''})`;
      case CONNECTION_STATUS.INACTIVE:
        return 'Worker inactivo';
      default:
        return 'Verificando estado...';
    }
  };

  // Texto amigable para mostrar al usuario (sin términos técnicos)
  const getStatusText = () => {
    switch (status) {
      case CONNECTION_STATUS.ACTIVE:
        return 'Sistema activo';
      case CONNECTION_STATUS.WITH_DELAYS:
        return 'Con retrasos';
      case CONNECTION_STATUS.INACTIVE:
        return 'Worker inactivo';
      default:
        return 'Verificando...';
    }
  };

  const value = {
    status,
    workerActive,
    lastWorkerHeartbeatAt,
    pedidosAtrasadosCount,
    websocketConnected,
    pollingActive,
    lastPollingError,
    updateWebsocketStatus,
    updatePollingStatus,
    getStatusTooltip,
    getStatusText,
    markWorkerHeartbeat,
    refreshHealth: checkSystemHealth,
  };

  return (
    <ConnectionStatusContext.Provider value={value}>
      {children}
    </ConnectionStatusContext.Provider>
  );
};

