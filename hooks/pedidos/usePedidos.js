import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { pedidosService } from '../../services/pedidosService';
import { useSocket } from '../useSocket';
import { useConnectionStatus } from '../../contexts/ConnectionStatusContext';
import { useWebOrderAlerts } from '../../contexts/WebOrderAlertsContext';
import { getPollingRemainingMs, isPollingBlocked } from '../../services/rateLimitManager';
import { isPedidoPaid } from '../../lib/pedidoPaymentUtils';
import { toast } from '@/hooks/use-toast';

// Función para normalizar texto eliminando tildes y convirtiendo a minúsculas
const normalizarTexto = (texto) => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos (tildes)
    .trim();
};

/** Pedido de carrito web (origen WEB en backend o 'web' en frontend). */
const isPedidoOrigenWeb = (p) => {
  const raw = (p?.origen_pedido || p?.origen || '').toString().toUpperCase();
  return raw === 'WEB';
};

const WEB_ORDER_FLASH_MS = 8000;
const STATE_STALE_GUARD_MS = 30000;
const isPedidosDebugEnabled = () => {
  if (typeof window === 'undefined') return false;
  return window.__PEDIDOS_DEBUG__ === true || window.localStorage?.getItem('pedidos_debug') === '1';
};
const debugPedidos = (event, payload = {}) => {
  if (!isPedidosDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.debug(`[PedidosDebug][usePedidos] ${event}`, payload);
};
const TERMINAL_STATES = new Set(['entregado', 'cancelado']);
const SOURCE_PRIORITY = {
  initial: 1,
  polling: 1,
  websocketRefresh: 1,
  websocket: 2,
  manual: 3,
  local: 4,
};
const ESTADO_RANK = {
  recibido: 1,
  en_cocina: 2,
  listo: 3,
  entregado: 4,
  cancelado: 5,
};

const normalizePedidoId = (id) => String(id ?? '');
const getEstadoRank = (estado) => ESTADO_RANK[(estado || '').toLowerCase()] || 0;
const isPaidSnapshot = (pedido) => isPedidoPaid(pedido);
const parseVersionValue = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const parseUpdatedAtMs = (pedido) => {
  const raw = pedido?.updated_at || pedido?.updatedAt || pedido?.fecha_modificacion || null;
  if (!raw) return null;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : null;
};
const comparePedidoFreshness = (currentPedido, incomingPedido) => {
  if (!currentPedido || !incomingPedido) return 0;
  const currentVersion = parseVersionValue(currentPedido.version);
  const incomingVersion = parseVersionValue(incomingPedido.version);

  if (currentVersion != null && incomingVersion != null) {
    if (incomingVersion > currentVersion) return 1;
    if (incomingVersion < currentVersion) return -1;
  }

  const currentUpdatedAtMs = parseUpdatedAtMs(currentPedido);
  const incomingUpdatedAtMs = parseUpdatedAtMs(incomingPedido);
  if (currentUpdatedAtMs != null && incomingUpdatedAtMs != null) {
    if (incomingUpdatedAtMs > currentUpdatedAtMs) return 1;
    if (incomingUpdatedAtMs < currentUpdatedAtMs) return -1;
  }

  return 0;
};
const buildPedidoFingerprint = (pedido) => {
  if (!pedido) return '';
  const itemsFingerprint = (pedido.items || [])
    .map((item) => `${item.id ?? item.articulo_id ?? item.nombre}:${item.cantidad}:${item.subtotal ?? item.precio}`)
    .join('|');

  return [
    pedido.id,
    pedido.estado,
    pedido.version,
    pedido.updated_at || pedido.updatedAt,
    pedido.paymentStatus,
    pedido.estado_pago,
    pedido.total,
    pedido.timestamp,
    pedido.horaInicioPreparacion,
    pedido.horaListo,
    pedido.horaEntrega ? new Date(pedido.horaEntrega).getTime() : '',
    pedido.transicionAutomatica,
    itemsFingerprint,
  ].join('::');
};

export const usePedidos = () => {
  const [pedidosById, setPedidosById] = useState({});
  const [busquedaPedidos, setBusquedaPedidos] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  /** IDs de pedidos WEB a resaltar / animar entrada (mapa estable para React state). */
  const [webOrderFlashMap, setWebOrderFlashMap] = useState({});
  const pedidosByIdRef = useRef({});
  const websocketRefreshTimeoutRef = useRef(null);
  /** Tras la primera carga exitosa, el diff lista anterior vs nueva es confiable. */
  const hasOrdersBaselineRef = useRef(false);
  const webOrderFlashTimeoutsRef = useRef(new Map());
  const orderMissingSinceRef = useRef(new Map());
  const latestFetchRequestIdRef = useRef(0);
  const nextFetchRequestIdRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);
  const clearUpdateTimeoutsRef = useRef(new Map());
  const { updatePollingStatus, updateWebsocketStatus, markWorkerHeartbeat } = useConnectionStatus();
  const { playSoundThrottled } = useWebOrderAlerts();

  // Sincronizar ref para lecturas sin stale closure
  useEffect(() => {
    pedidosByIdRef.current = pedidosById;
  }, [pedidosById]);

  const pedidos = useMemo(() => {
    return Object.values(pedidosById).sort((a, b) => {
      const aTs = Number(a?.timestamp) || 0;
      const bTs = Number(b?.timestamp) || 0;
      if (aTs !== bTs) return bTs - aTs;
      return normalizePedidoId(b.id).localeCompare(normalizePedidoId(a.id), undefined, {
        numeric: true,
      });
    });
  }, [pedidosById]);

  useEffect(() => {
    return () => {
      webOrderFlashTimeoutsRef.current.forEach((t) => clearTimeout(t));
      webOrderFlashTimeoutsRef.current.clear();
      clearUpdateTimeoutsRef.current.forEach((t) => clearTimeout(t));
      clearUpdateTimeoutsRef.current.clear();
    };
  }, []);

  const scheduleWebOrderFlash = useCallback((ids) => {
    if (!ids.length) return;
    setWebOrderFlashMap((prev) => {
      const next = { ...prev };
      ids.forEach((sid) => {
        next[sid] = true;
        const prevT = webOrderFlashTimeoutsRef.current.get(sid);
        if (prevT) clearTimeout(prevT);
        const t = setTimeout(() => {
          webOrderFlashTimeoutsRef.current.delete(sid);
          setWebOrderFlashMap((m) => {
            if (!m[sid]) return m;
            const { [sid]: _, ...rest } = m;
            return rest;
          });
        }, WEB_ORDER_FLASH_MS);
        webOrderFlashTimeoutsRef.current.set(sid, t);
      });
      return next;
    });
  }, []);

  const buildMergedPedido = useCallback((currentPedido, incomingPedido, source, observedAt) => {
    if (!incomingPedido?.id) return currentPedido;

    const sourcePriority = SOURCE_PRIORITY[source] ?? 0;
    const currentSourcePriority = SOURCE_PRIORITY[currentPedido?.__lastSource || 'initial'] ?? 0;
    const incomingEstado = incomingPedido.estado ?? currentPedido?.estado;
    const currentEstado = currentPedido?.estado;
    const incomingRank = getEstadoRank(incomingEstado);
    const currentRank = getEstadoRank(currentEstado);
    const hasRecentLocalMutation =
      currentPedido?.__lastLocalMutationAt &&
      observedAt - currentPedido.__lastLocalMutationAt < STATE_STALE_GUARD_MS;
    const freshness = comparePedidoFreshness(currentPedido, incomingPedido);
    const shouldDiscardStaleIncomingByVersion =
      sourcePriority < SOURCE_PRIORITY.local && freshness < 0;
    if (shouldDiscardStaleIncomingByVersion) {
      debugPedidos('stale_discarded', {
        pedidoId: incomingPedido.id,
        source,
        incomingVersion: incomingPedido.version,
        currentVersion: currentPedido?.version,
        incomingUpdatedAt: incomingPedido.updated_at || incomingPedido.updatedAt,
        currentUpdatedAt: currentPedido?.updated_at || currentPedido?.updatedAt,
      });
      return currentPedido;
    }

    const shouldProtectEstadoFromStaleRemote =
      sourcePriority < SOURCE_PRIORITY.local &&
      hasRecentLocalMutation &&
      currentRank > 0 &&
      incomingRank > 0 &&
      incomingRank < currentRank;

    const shouldProtectPaidFromStaleRemote =
      sourcePriority < SOURCE_PRIORITY.local &&
      hasRecentLocalMutation &&
      isPaidSnapshot(currentPedido) &&
      !isPaidSnapshot({ ...currentPedido, ...incomingPedido });

    const nextPedido = {
      ...(currentPedido || {}),
      ...incomingPedido,
      id: normalizePedidoId(incomingPedido.id),
      horaEntrega: incomingPedido.horaEntrega ?? currentPedido?.horaEntrega ?? null,
      __lastSource:
        sourcePriority > currentSourcePriority ? source : currentPedido?.__lastSource || source,
      __lastMergeAt: observedAt,
      __lastSourcePriority: Math.max(sourcePriority, currentSourcePriority),
      __pendingSync:
        sourcePriority >= SOURCE_PRIORITY.websocket
          ? false
          : currentPedido?.__pendingSync || false,
    };

    if (shouldProtectEstadoFromStaleRemote) {
      nextPedido.estado = currentEstado;
    }
    if (shouldProtectPaidFromStaleRemote) {
      nextPedido.paymentStatus = currentPedido.paymentStatus;
      nextPedido.estado_pago = currentPedido.estado_pago;
      nextPedido.medio_pago = currentPedido.medio_pago;
      nextPedido.medioPago = currentPedido.medioPago;
    }
    nextPedido.version = parseVersionValue(nextPedido.version);
    nextPedido.updated_at =
      nextPedido.updated_at || nextPedido.updatedAt || currentPedido?.updated_at || null;
    nextPedido.updatedAt = nextPedido.updated_at;
    nextPedido.__fingerprint = buildPedidoFingerprint(nextPedido);

    return nextPedido;
  }, []);

  const upsertPedidos = useCallback((incomingPedidos, options = {}) => {
    const {
      source = 'manual',
      isSnapshot = false,
      removeMissingTerminals = false,
      markAsLocalMutation = false,
    } = options;
    const observedAt = Date.now();

    setPedidosById((prev) => {
      const snapshotSeen = new Set();
      let changed = false;
      const next = { ...prev };

      for (const pedidoRaw of incomingPedidos || []) {
        if (!pedidoRaw?.id) continue;
        const pedidoId = normalizePedidoId(pedidoRaw.id);
        snapshotSeen.add(pedidoId);

        const incoming = { ...pedidoRaw, id: pedidoId };
        const current = next[pedidoId];
        const merged = buildMergedPedido(current, incoming, source, observedAt);
        if (!merged) continue;

        if (markAsLocalMutation) {
          merged.__lastLocalMutationAt = observedAt;
          merged.__pendingSync = true;
        }

        const shouldReplace =
          !current ||
          current.__fingerprint !== merged.__fingerprint ||
          current.uiPendingStateUpdate !== merged.uiPendingStateUpdate ||
          current.actualizadoRecientemente !== merged.actualizadoRecientemente ||
          current.__pendingSync !== merged.__pendingSync ||
          current.__lastLocalMutationAt !== merged.__lastLocalMutationAt;

        if (shouldReplace) {
          next[pedidoId] = merged;
          changed = true;
          debugPedidos('update_applied', {
            pedidoId,
            source,
            version: merged.version,
            updatedAt: merged.updated_at || merged.updatedAt,
            estado: merged.estado,
          });
        }

        orderMissingSinceRef.current.delete(pedidoId);
      }

      if (isSnapshot) {
        for (const pedidoId of Object.keys(next)) {
          if (snapshotSeen.has(pedidoId)) continue;

          const existing = next[pedidoId];
          const existingState = (existing?.estado || '').toLowerCase();
          const nowMissingSince = orderMissingSinceRef.current.get(pedidoId) || observedAt;
          orderMissingSinceRef.current.set(pedidoId, nowMissingSince);

          // Nunca remover temporalmente pedidos activos por snapshots intermedios.
          // Solo limpiar terminales ausentes por un tiempo prudente.
          if (
            removeMissingTerminals &&
            TERMINAL_STATES.has(existingState) &&
            observedAt - nowMissingSince > 10000
          ) {
            delete next[pedidoId];
            orderMissingSinceRef.current.delete(pedidoId);
            changed = true;
          }
        }
      }

      return changed ? next : prev;
    });
  }, [buildMergedPedido]);

  const patchPedido = useCallback((pedidoId, patch, source = 'local', options = {}) => {
    const { markAsLocalMutation = source === 'local' } = options;
    const normalizedId = normalizePedidoId(pedidoId);
    const currentPedido = pedidosByIdRef.current[normalizedId];
    if (!currentPedido && !patch?.id) return null;

    const mergedPatch = { ...(patch || {}), id: normalizedId };
    upsertPedidos([mergedPatch], {
      source,
      markAsLocalMutation,
    });

    return currentPedido;
  }, [upsertPedidos]);

  const markPedidoRecientementeActualizado = useCallback((pedidoId) => {
    const normalizedId = normalizePedidoId(pedidoId);
    patchPedido(normalizedId, { actualizadoRecientemente: true }, 'websocket');

    const existingTimeout = clearUpdateTimeoutsRef.current.get(normalizedId);
    if (existingTimeout) clearTimeout(existingTimeout);

    const timeout = setTimeout(() => {
      patchPedido(normalizedId, { actualizadoRecientemente: false }, 'websocket');
      clearUpdateTimeoutsRef.current.delete(normalizedId);
    }, 2000);
    clearUpdateTimeoutsRef.current.set(normalizedId, timeout);
  }, [patchPedido]);

  // Función para cargar pedidos
  const cargarPedidos = useCallback(async ({ source = 'manual' } = {}) => {
    const normalizedSource = source === 'websocket' ? 'websocketRefresh' : source;
    const isBackgroundSource =
      normalizedSource === 'polling' ||
      normalizedSource === 'websocketRefresh' ||
      normalizedSource === 'initial';
    if (isBackgroundSource && isPollingBlocked()) {
      const remainingSeconds = Math.max(1, Math.ceil(getPollingRemainingMs() / 1000));
      updatePollingStatus(false, `Rate limit activo. Polling pausado ${remainingSeconds} segundos.`);
      return;
    }

    if (!hasLoadedOnceRef.current && normalizedSource === 'initial') {
      setLoading(true);
    }
    setError(null);

    const requestId = ++nextFetchRequestIdRef.current;
    debugPedidos('fetch_start', {
      source: normalizedSource,
      requestId,
      hasLoadedOnce: hasLoadedOnceRef.current,
      ordersInMemory: Object.keys(pedidosByIdRef.current || {}).length,
    });

    try {
      const response = await pedidosService.obtenerPedidos();
      if (requestId < latestFetchRequestIdRef.current) {
        debugPedidos('fetch_ignored_outdated_request', {
          source: normalizedSource,
          requestId,
          latestAppliedRequestId: latestFetchRequestIdRef.current,
        });
        return;
      }

      if (response.success) {
        const newList = response.data || [];
        const prevList = Object.values(pedidosByIdRef.current || {});

        // 1) Nuevos pedidos WEB: sonido + resaltado temporal (solo websocket/polling; no initial/manual)
        const allowNewWebAlerts =
          (normalizedSource === 'websocketRefresh' || normalizedSource === 'polling') &&
          hasOrdersBaselineRef.current;
        if (allowNewWebAlerts) {
          const prevIds = new Set(prevList.map((p) => String(p.id)));
          const newWebOrders = newList.filter((p) => {
            const id = String(p.id);
            if (prevIds.has(id)) return false;
            return isPedidoOrigenWeb(p);
          });
          if (newWebOrders.length > 0) {
            playSoundThrottled();
            scheduleWebOrderFlash(newWebOrders.map((p) => String(p.id)));
          }
        }

        // 2) MERGE incremental por id, sin reemplazar ciegamente la lista completa.
        upsertPedidos(
          newList
            .map((pedido) => pedidosService.normalizarPedidoRealtime(pedido))
            .filter(Boolean)
            .map((pedido) => ({ ...pedido, id: normalizePedidoId(pedido.id) })),
          {
            source: normalizedSource,
            isSnapshot: true,
            removeMissingTerminals: true,
          }
        );

        // Actualizar estado de conexión: polling exitoso
        updatePollingStatus(true, null);
        hasOrdersBaselineRef.current = true;
        hasLoadedOnceRef.current = true;
        latestFetchRequestIdRef.current = requestId;
        debugPedidos('fetch_success', {
          source: normalizedSource,
          requestId,
          rowsReceived: newList.length,
        });
      } else {
        const errorMsg = response.error || 'Error al cargar pedidos';
        setError(errorMsg);
        console.error('Error al cargar pedidos:', errorMsg);
        // Actualizar estado de conexión: error en polling
        updatePollingStatus(true, errorMsg);
        debugPedidos('fetch_error_response', {
          source: normalizedSource,
          requestId,
          error: errorMsg,
        });
      }
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar pedidos';
      setError(errorMsg);
      console.error('Error al cargar pedidos:', err);
      // Actualizar estado de conexión: error en polling
      updatePollingStatus(true, errorMsg);
      debugPedidos('fetch_exception', {
        source: normalizedSource,
        requestId,
        error: errorMsg,
      });
    } finally {
      if (!hasLoadedOnceRef.current || normalizedSource === 'initial') {
        setLoading(false);
      }
      debugPedidos('fetch_end', {
        source: normalizedSource,
        requestId,
        loadingAfter: hasLoadedOnceRef.current ? false : true,
      });
    }
  }, [updatePollingStatus, playSoundThrottled, scheduleWebOrderFlash, upsertPedidos]);

  const scheduleWebsocketRefresh = useCallback((delayMs = 800) => {
    if (websocketRefreshTimeoutRef.current) return;
    websocketRefreshTimeoutRef.current = setTimeout(() => {
      websocketRefreshTimeoutRef.current = null;
      cargarPedidos({ source: 'websocket' });
    }, delayMs);
  }, [cargarPedidos]);

  // Cargar pedidos desde el backend al montar el componente
  useEffect(() => {
    cargarPedidos({ source: 'initial' });
    
    // Polling optimizado: cada 45 segundos (balance entre latencia y carga)
    // Se puede optimizar más con If-Modified-Since en el backend
    const interval = setInterval(() => cargarPedidos({ source: 'polling' }), 45000);
    return () => clearInterval(interval);
  }, [cargarPedidos]);

  useEffect(() => {
    return () => {
      if (websocketRefreshTimeoutRef.current) {
        clearTimeout(websocketRefreshTimeoutRef.current);
      }
    };
  }, []);

  // Integrar WebSockets (Fase 3)
  const handlePedidoCreado = useCallback((data) => {
    debugPedidos('socket_pedido_creado', {
      pedidoId: data?.pedido?.id ?? null,
    });
    console.log('📦 [usePedidos] Pedido creado recibido via WebSocket:', data);
    const incomingPedido = pedidosService.normalizarPedidoRealtime(data?.pedido);
    if (incomingPedido?.id) {
      const pedidoId = normalizePedidoId(incomingPedido.id);
      const alreadyExists = Boolean(pedidosByIdRef.current[pedidoId]);
      upsertPedidos([{ ...incomingPedido, id: pedidoId }], {
        source: 'websocket',
        isSnapshot: false,
      });
      if (!alreadyExists && hasOrdersBaselineRef.current && isPedidoOrigenWeb(incomingPedido)) {
        playSoundThrottled();
        scheduleWebOrderFlash([pedidoId]);
      }
    }
    // Coalesce de eventos websocket para evitar ráfagas de requests
    scheduleWebsocketRefresh();
  }, [playSoundThrottled, scheduleWebOrderFlash, scheduleWebsocketRefresh, upsertPedidos]);

  const handlePedidoEstadoCambiado = useCallback((data) => {
    debugPedidos('socket_estado_cambiado', {
      pedidoId: data?.pedidoId ?? null,
      estadoAnterior: data?.estadoAnterior ?? null,
      estadoNuevo: data?.estadoNuevo ?? null,
      hasPedidoSnapshot: Boolean(data?.pedido),
    });
    console.log('🔄 [usePedidos] Estado cambiado recibido via WebSocket:', data);
    
    // Mapear estado del backend al frontend
    const mapearEstado = (estadoBackend) => {
      if (!estadoBackend) return null;
      const estado = estadoBackend.toLowerCase();
      if (estado === 'en_preparacion') return 'en_cocina';
      if (estado === 'listo') return 'listo';
      if (estado === 'recibido') return 'recibido';
      if (estado === 'entregado') return 'entregado';
      if (estado === 'cancelado') return 'cancelado';
      return estado;
    };
    
    const nuevoEstado = mapearEstado(data.estadoNuevo) || 'recibido';
    
    const incomingPedido = pedidosService.normalizarPedidoRealtime(data?.pedido);
    if (incomingPedido?.id) {
      patchPedido(
        data.pedidoId,
        {
          ...incomingPedido,
          estado: incomingPedido.estado || nuevoEstado,
        },
        'websocket'
      );
    } else {
      const fallbackVersion = parseVersionValue(data?.version);
      const fallbackUpdatedAt = data?.updated_at || data?.updatedAt || data?.timestamp || null;
      patchPedido(
        data.pedidoId,
        {
          estado: nuevoEstado,
          ...(fallbackVersion ? { version: fallbackVersion } : {}),
          ...(fallbackUpdatedAt ? { updated_at: fallbackUpdatedAt, updatedAt: fallbackUpdatedAt } : {}),
        },
        'websocket'
      );
    }
    markPedidoRecientementeActualizado(data.pedidoId);
    // Reconciliación suave para traer campos nuevos sin bloquear UI
    scheduleWebsocketRefresh(500);
  }, [markPedidoRecientementeActualizado, patchPedido, scheduleWebsocketRefresh]);

  const handlePedidoCobrado = useCallback((data) => {
    debugPedidos('socket_pedido_cobrado', {
      pedidoId: data?.pedidoId ?? null,
      ventaId: data?.ventaId ?? null,
      hasPedidoSnapshot: Boolean(data?.pedido),
    });
    console.log('💰 [usePedidos] Pedido cobrado recibido via WebSocket:', data);
    if (data?.pedidoId == null) return;

    const incomingPedido = pedidosService.normalizarPedidoRealtime(data?.pedido);
    patchPedido(
      data.pedidoId,
      {
        ...(incomingPedido || {}),
        paymentStatus: 'paid',
        estado_pago: 'PAGADO',
      },
      'websocket'
    );
    markPedidoRecientementeActualizado(data.pedidoId);
  }, [markPedidoRecientementeActualizado, patchPedido]);

  const handleCapacidadActualizada = useCallback((data) => {
    console.log('📊 [usePedidos] Capacidad actualizada via WebSocket:', data);
    // La capacidad se maneja en PedidosColumn, que recarga automáticamente
    // Los eventos WebSocket ayudan a actualizar en tiempo real
  }, []);

  const handlePedidosAtrasados = useCallback((data) => {
    console.log('⚠️ [usePedidos] Pedidos atrasados via WebSocket:', data);
    // Se pueden mostrar notificaciones o actualizar visualmente
    // Por ahora solo logueamos
  }, []);

  const handlePedidoActualizado = useCallback((data) => {
    debugPedidos('socket_pedido_actualizado', {
      pedidoId: data?.pedidoId ?? null,
      hasPedidoSnapshot: Boolean(data?.pedido),
      keys: data ? Object.keys(data) : [],
    });
    console.log('🔄 [usePedidos] Pedido actualizado recibido via WebSocket:', data);
    if (data.pedidoId == null) return;
    if (data.pedido) {
      const incomingPedido = pedidosService.normalizarPedidoRealtime(data.pedido);
      if (incomingPedido) {
        patchPedido(data.pedidoId, incomingPedido, 'websocket');
      }
    } else {
      const estadoPagoActualizado = data.estado_pago || data.estadoPago;
      const paymentStatusActualizado = data.paymentStatus;
      const fallbackVersion = parseVersionValue(data?.version);
      const fallbackUpdatedAt = data?.updated_at || data?.updatedAt || data?.timestamp || null;
      if (estadoPagoActualizado || paymentStatusActualizado) {
        patchPedido(
          data.pedidoId,
          {
            ...(estadoPagoActualizado ? { estado_pago: estadoPagoActualizado } : {}),
            ...(paymentStatusActualizado ? { paymentStatus: paymentStatusActualizado } : {}),
            ...(fallbackVersion ? { version: fallbackVersion } : {}),
            ...(fallbackUpdatedAt ? { updated_at: fallbackUpdatedAt, updatedAt: fallbackUpdatedAt } : {}),
          },
          'websocket'
        );
      }
    }
    markPedidoRecientementeActualizado(data.pedidoId);
  }, [markPedidoRecientementeActualizado, patchPedido]);

  // Conectar WebSocket
  const { isConnected: socketConnected } = useSocket(
    handlePedidoCreado,
    handlePedidoEstadoCambiado,
    handlePedidoCobrado,
    handleCapacidadActualizada,
    handlePedidosAtrasados,
    handlePedidoActualizado,
    markWorkerHeartbeat
  );

  // Actualizar estado de conexión cuando cambia el WebSocket
  useEffect(() => {
    updateWebsocketStatus(socketConnected);
  }, [socketConnected, updateWebsocketStatus]);

  // Filtrar pedidos por búsqueda (sin necesidad de tildes)
  const pedidosFiltrados = useMemo(() => {
    if (!busquedaPedidos.trim()) return pedidos;
    
    const busquedaNormalizada = normalizarTexto(busquedaPedidos);
    return pedidos.filter(p => {
      const idNormalizado = normalizarTexto(String(p.id));
      const nombreNormalizado = normalizarTexto(p.clienteNombre);
      
      return idNormalizado.includes(busquedaNormalizada) ||
             nombreNormalizado.includes(busquedaNormalizada);
    });
  }, [pedidos, busquedaPedidos]);

  const pedidosRecibidos = useMemo(() => 
    pedidosFiltrados.filter(p => p.estado === 'recibido'),
    [pedidosFiltrados]
  );

  // EN PREPARACIÓN: en_cocina y listo (listo no oculta; solo salen al entregar; cobrar no los saca de la columna)
  const pedidosEnCocina = useMemo(
    () => pedidosFiltrados.filter((p) => p.estado === 'en_cocina' || p.estado === 'listo'),
    [pedidosFiltrados]
  );

  const pedidosEntregados = useMemo(
    () => pedidos.filter((p) => p.estado === 'entregado' && isPedidoPaid(p)),
    [pedidos]
  );

  const setPedidoPendingState = useCallback((pedidoId, isPending) => {
    patchPedido(
      pedidoId,
      {
        uiPendingStateUpdate: Boolean(isPending),
      },
      'local',
      { markAsLocalMutation: false }
    );
  }, [patchPedido]);

  const handleMarcharACocina = useCallback(
    async (pedidoId) => {
      const normalizedId = normalizePedidoId(pedidoId);
      const pedidoPrevio = pedidosByIdRef.current[normalizedId];
      if (!pedidoPrevio) {
        return { success: false, reason: 'not-found', error: 'Pedido no encontrado' };
      }

      const ahoraMs = Date.now();
      const ahoraIso = new Date(ahoraMs).toISOString();
      setPedidoPendingState(normalizedId, true);
      patchPedido(
        normalizedId,
        {
          estado: 'en_cocina',
          transicionAutomatica: false,
          horaInicioPreparacion: ahoraMs,
          version: ahoraMs,
          updated_at: ahoraIso,
          updatedAt: ahoraIso,
        },
        'local'
      );

      debugPedidos('action_marchar_cocina_start', { pedidoId: normalizedId });
      let response;
      try {
        response = await pedidosService.actualizarEstadoPedido(normalizedId, 'en_cocina', {
          // Flujo manual (drag/boton): excluir del motor automatico
          transicionAutomatica: false
        });
      } catch (err) {
        response = {
          success: false,
          error: err?.message || 'Error inesperado al marchar a cocina',
        };
      }

      if (response.success) {
        setPedidoPendingState(normalizedId, false);
        debugPedidos('action_marchar_cocina_success', { pedidoId: normalizedId });
        return { success: true };
      }

      console.error('Error al marcar pedido a cocina:', response.error);

      const rawMessage = (response.error || '').toString();
      const msg = rawMessage.toLowerCase();

      // Caso 1: capacidad máxima de cocina alcanzada
      if (
        msg.includes('capacidad') ||
        msg.includes('llena') ||
        msg.includes('lleno') ||
        msg.includes('maxima') ||
        msg.includes('máxima')
      ) {
        patchPedido(
          normalizedId,
          {
            estado: pedidoPrevio.estado,
            transicionAutomatica: pedidoPrevio.transicionAutomatica,
            horaInicioPreparacion: pedidoPrevio.horaInicioPreparacion,
            version: pedidoPrevio.version ?? null,
            updated_at: pedidoPrevio.updated_at ?? pedidoPrevio.updatedAt ?? null,
            updatedAt: pedidoPrevio.updated_at ?? pedidoPrevio.updatedAt ?? null,
          },
          'local'
        );
        setPedidoPendingState(normalizedId, false);
        toast.error('No se puede adelantar el pedido. La cocina ya alcanzó la capacidad máxima.');
        debugPedidos('action_marchar_cocina_blocked_capacity', { pedidoId: normalizedId });
        return { success: false, reason: 'capacity', error: rawMessage };
      }

      // Caso 2: pedido ya fue procesado / ya no está en RECIBIDO
      if (
        msg.includes('ya fue actualizado') ||
        msg.includes('ya fue procesado') ||
        msg.includes('ya no se encuentra en estado') ||
        msg.includes('no está en estado') ||
        msg.includes('ya está en preparación') ||
        msg.includes('ya esta en preparacion')
      ) {
        setPedidoPendingState(normalizedId, false);
        toast.error('El pedido ya fue actualizado.');
        debugPedidos('action_marchar_cocina_already_updated', { pedidoId: normalizedId });
        return { success: false, reason: 'already-updated', error: rawMessage };
      }

      // Caso genérico: error inesperado
      toast.error('No se pudo adelantar el pedido', {
        description: 'Ocurrió un error inesperado al intentar mover el pedido a preparación.',
      });

      patchPedido(
        normalizedId,
        {
          estado: pedidoPrevio.estado,
          transicionAutomatica: pedidoPrevio.transicionAutomatica,
          horaInicioPreparacion: pedidoPrevio.horaInicioPreparacion,
          version: pedidoPrevio.version ?? null,
          updated_at: pedidoPrevio.updated_at ?? pedidoPrevio.updatedAt ?? null,
          updatedAt: pedidoPrevio.updated_at ?? pedidoPrevio.updatedAt ?? null,
        },
        'local'
      );
      setPedidoPendingState(normalizedId, false);
      debugPedidos('action_marchar_cocina_failed', {
        pedidoId: normalizedId,
        reason: 'unknown',
        error: rawMessage,
      });
      return { success: false, reason: 'unknown', error: rawMessage };
    },
    [patchPedido, setPedidoPendingState]
  );

  const handleListo = useCallback(async (pedidoId) => {
    // Encontrar el pedido antes de actualizar
    const normalizedId = normalizePedidoId(pedidoId);
    const pedido = pedidosByIdRef.current[normalizedId];
    if (!pedido) {
      console.error('Pedido no encontrado:', pedidoId);
      return;
    }

    setPedidoPendingState(normalizedId, true);
    // Actualización optimista: actualizar la UI inmediatamente a LISTO (no ENTREGADO)
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    patchPedido(
      normalizedId,
      { estado: 'listo', horaListo: nowMs, version: nowMs, updated_at: nowIso, updatedAt: nowIso },
      'local'
    );

    // Intentar actualizar en el backend (en segundo plano)
    try {
      const response = await pedidosService.actualizarEstadoPedido(normalizedId, 'listo');
      
      if (!response.success) {
        // Si falla, verificar si es rate limit
        const isRateLimit = response.error?.includes('Rate limit') || 
                           response.error?.includes('rate limit') ||
                           response.error?.toLowerCase().includes('rate limit') ||
                           response.rateLimit === true ||
                           response.status === 429;
        
        if (isRateLimit) {
          // Si es rate limit, mantener la actualización optimista
          // El pedido se sincronizará cuando se pueda
          console.warn('⚠️ Rate limit al actualizar estado. Manteniendo actualización optimista.');
          setPedidoPendingState(normalizedId, false);
          return;
        }
        
        // Si no es rate limit, revertir la actualización optimista
        console.error('Error al marcar pedido como listo:', response.error);
        patchPedido(
          normalizedId,
          {
            estado: pedido.estado,
            horaListo: pedido.horaListo,
            version: pedido.version ?? null,
            updated_at: pedido.updated_at ?? pedido.updatedAt ?? null,
            updatedAt: pedido.updated_at ?? pedido.updatedAt ?? null,
          },
          'local'
        );
      }
    } catch (error) {
      // Si hay un error de red u otro error, verificar si es rate limit
      const isRateLimit = error.message?.includes('Rate limit') || 
                         error.message?.includes('rate limit') ||
                         error.response?.status === 429;
      
      if (isRateLimit) {
        // Si es rate limit, mantener la actualización optimista
        console.warn('⚠️ Rate limit al actualizar estado. Manteniendo actualización optimista.');
        setPedidoPendingState(normalizedId, false);
        return;
      }
      
      // Si no es rate limit, revertir la actualización optimista
      console.error('Error al marcar pedido como listo:', error);
      patchPedido(
        normalizedId,
        {
          estado: pedido.estado,
          horaListo: pedido.horaListo,
          version: pedido.version ?? null,
          updated_at: pedido.updated_at ?? pedido.updatedAt ?? null,
          updatedAt: pedido.updated_at ?? pedido.updatedAt ?? null,
        },
        'local'
      );
    } finally {
      setPedidoPendingState(normalizedId, false);
    }
  }, [patchPedido, setPedidoPendingState]);

  const handleEntregar = useCallback(async (pedidoId) => {
    // Encontrar el pedido antes de actualizar
    const normalizedId = normalizePedidoId(pedidoId);
    const pedido = pedidosByIdRef.current[normalizedId];
    if (!pedido) {
      console.error('Pedido no encontrado:', pedidoId);
      return;
    }

    setPedidoPendingState(normalizedId, true);
    // Actualización optimista: actualizar la UI inmediatamente a ENTREGADO
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    patchPedido(
      normalizedId,
      { estado: 'entregado', horaEntrega: new Date(), version: nowMs, updated_at: nowIso, updatedAt: nowIso },
      'local'
    );

    // Intentar actualizar en el backend (en segundo plano)
    try {
      const response = await pedidosService.actualizarEstadoPedido(normalizedId, 'entregado');
      
      if (!response.success) {
        // Si falla, verificar si es rate limit
        const isRateLimit = response.error?.includes('Rate limit') || 
                           response.error?.includes('rate limit') ||
                           response.error?.toLowerCase().includes('rate limit') ||
                           response.rateLimit === true ||
                           response.status === 429;
        
        if (isRateLimit) {
          // Si es rate limit, mantener la actualización optimista
          console.warn('⚠️ Rate limit al actualizar estado. Manteniendo actualización optimista.');
          setPedidoPendingState(normalizedId, false);
          return;
        }
        
        // Si no es rate limit, revertir la actualización optimista
        console.error('Error al marcar pedido como entregado:', response.error);
        patchPedido(
          normalizedId,
          {
            estado: pedido.estado,
            horaEntrega: pedido.horaEntrega,
            version: pedido.version ?? null,
            updated_at: pedido.updated_at ?? pedido.updatedAt ?? null,
            updatedAt: pedido.updated_at ?? pedido.updatedAt ?? null,
          },
          'local'
        );
      }
    } catch (error) {
      // Si hay un error de red u otro error, verificar si es rate limit
      const isRateLimit = error.message?.includes('Rate limit') || 
                         error.message?.includes('rate limit') ||
                         error.response?.status === 429;
      
      if (isRateLimit) {
        // Si es rate limit, mantener la actualización optimista
        console.warn('⚠️ Rate limit al actualizar estado. Manteniendo actualización optimista.');
        setPedidoPendingState(normalizedId, false);
        return;
      }
      
      // Si no es rate limit, revertir la actualización optimista
      console.error('Error al marcar pedido como entregado:', error);
      patchPedido(
        normalizedId,
        {
          estado: pedido.estado,
          horaEntrega: pedido.horaEntrega,
          version: pedido.version ?? null,
          updated_at: pedido.updated_at ?? pedido.updatedAt ?? null,
          updatedAt: pedido.updated_at ?? pedido.updatedAt ?? null,
        },
        'local'
      );
    } finally {
      setPedidoPendingState(normalizedId, false);
    }
  }, [patchPedido, setPedidoPendingState]);

  const handleCancelar = useCallback(async (pedidoId) => {
    const normalizedId = normalizePedidoId(pedidoId);
    const response = await pedidosService.eliminarPedido(normalizedId);
    
    if (response.success) {
      setPedidosById((prev) => {
        if (!prev[normalizedId]) return prev;
        const next = { ...prev };
        delete next[normalizedId];
        return next;
      });
    } else {
      console.error('Error al cancelar pedido:', response.error);
      // Podrías mostrar un toast de error aquí
    }
  }, []);

  const agregarPedido = useCallback((nuevoPedido) => {
    if (!nuevoPedido?.id) return;
    upsertPedidos([{ ...nuevoPedido, id: normalizePedidoId(nuevoPedido.id) }], {
      source: 'manual',
      isSnapshot: false,
    });
  }, [upsertPedidos]);

  const actualizarPedido = useCallback((pedidoId, actualizaciones) => {
    patchPedido(pedidoId, actualizaciones, 'manual');
  }, [patchPedido]);

  const highlightedWebOrderIds = useMemo(
    () => new Set(Object.keys(webOrderFlashMap)),
    [webOrderFlashMap]
  );

  return {
    pedidos,
    pedidosEntregados,
    pedidosRecibidos,
    pedidosEnCocina,
    busquedaPedidos,
    setBusquedaPedidos,
    handleMarcharACocina,
    handleListo,
    handleEntregar,
    handleCancelar,
    agregarPedido,
    actualizarPedido,
    loading,
    error,
    recargarPedidos: cargarPedidos,
    socketConnected, // Exponer estado de conexión WebSocket
    highlightedWebOrderIds,
  };
};

