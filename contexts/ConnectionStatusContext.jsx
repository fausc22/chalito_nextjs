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

  // Función para verificar health del worker y métricas
  const checkSystemHealth = useCallback(async () => {
    try {
      // Verificar health del worker
      const healthResult = await systemService.obtenerHealthWorker();
      const isWorkerActive = healthResult.success && healthResult.data?.active === true;
      setWorkerActive(isWorkerActive);

      // Verificar métricas de pedidos atrasados
      const metricsResult = await systemService.obtenerMetricasPedidosAtrasados();
      const atrasadosCount = metricsResult.success ? (metricsResult.data?.count || 0) : 0;
      setPedidosAtrasadosCount(atrasadosCount);

      // Determinar estado del sistema basado en worker y métricas
      if (!isWorkerActive) {
        setStatus(CONNECTION_STATUS.INACTIVE);
      } else if (atrasadosCount > 0) {
        setStatus(CONNECTION_STATUS.WITH_DELAYS);
      } else {
        setStatus(CONNECTION_STATUS.ACTIVE);
      }

      setLastPollingError(null);
    } catch (error) {
      console.error('Error al verificar health del sistema:', error);
      // En caso de error, asumir worker inactivo
      setWorkerActive(false);
      setStatus(CONNECTION_STATUS.INACTIVE);
      setLastPollingError(error.message);
    }
  }, []);

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
    pedidosAtrasadosCount,
    websocketConnected,
    pollingActive,
    lastPollingError,
    updateWebsocketStatus,
    updatePollingStatus,
    getStatusTooltip,
    getStatusText,
    refreshHealth: checkSystemHealth,
  };

  return (
    <ConnectionStatusContext.Provider value={value}>
      {children}
    </ConnectionStatusContext.Provider>
  );
};

