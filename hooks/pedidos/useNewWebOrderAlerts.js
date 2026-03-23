'use client';

import { useEffect, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { formatCurrency } from '@/lib/formatters';
import { useWebOrderAlerts } from '@/contexts/WebOrderAlertsContext';

const AGGREGATION_WINDOW_MS = 2000;

/**
 * Hook para detectar pedidos nuevos WEB y disparar alertas (toast, sonido, badge).
 * Solo alerta cuando origen === 'web' (carta online).
 */
export function useNewWebOrderAlerts(pedidos, onScrollToPedido, onHighlightPedido) {
  const seenOrderIdsRef = useRef(new Set());
  const hasInitializedRef = useRef(false);
  const pendingWebOrdersRef = useRef([]);
  const aggregationTimeoutRef = useRef(null);

  const {
    addUnreadNotification,
    markNotificationRead,
  } = useWebOrderAlerts();

  const flushPendingAlerts = useCallback(() => {
    const pending = pendingWebOrdersRef.current;
    pendingWebOrdersRef.current = [];
    if (aggregationTimeoutRef.current) {
      clearTimeout(aggregationTimeoutRef.current);
      aggregationTimeoutRef.current = null;
    }

    if (pending.length === 0) return;

    // Sonido ya se disparó en usePedidos (antes de setState). Solo toast aquí.

    // Un solo toast
    if (pending.length === 1) {
      const p = pending[0];
      const tipoEntrega = (p.tipoEntrega || p.modalidad || 'delivery').toUpperCase();
      const total = p.total != null ? formatCurrency(p.total) : '$0';

      toast.info('Nuevo pedido web', {
        description: `Pedido #${p.id} · ${tipoEntrega} · ${total}`,
        duration: 6000,
        action: (
          <ToastAction
            altText="Ver pedido"
            onClick={() => {
              if (onScrollToPedido) onScrollToPedido(p.id);
              if (onHighlightPedido) onHighlightPedido(p.id);
              markNotificationRead(p.id);
            }}
          >
            Ver pedido
          </ToastAction>
        ),
      });
    } else {
      toast.info('Nuevos pedidos web', {
        description: `Llegaron ${pending.length} nuevos pedidos web`,
        duration: 6000,
        action: pending[0] && (
          <ToastAction
            altText="Ver pedidos"
            onClick={() => {
              if (onScrollToPedido && pending[0]) onScrollToPedido(pending[0].id);
              if (onHighlightPedido) pending.forEach((p) => onHighlightPedido(p.id));
              pending.forEach((p) => markNotificationRead(p.id));
            }}
          >
            Ver pedidos
          </ToastAction>
        ),
      });
    }

    // Agregar a notificaciones no leídas y aplicar highlight
    pending.forEach((p) => {
      addUnreadNotification(p);
      if (onHighlightPedido) onHighlightPedido(p.id);
    });
  }, [addUnreadNotification, markNotificationRead, onScrollToPedido, onHighlightPedido]);

  const scheduleFlush = useCallback(() => {
    if (aggregationTimeoutRef.current) return;
    aggregationTimeoutRef.current = setTimeout(flushPendingAlerts, AGGREGATION_WINDOW_MS);
  }, [flushPendingAlerts]);

  useEffect(() => {
    if (!Array.isArray(pedidos) || pedidos.length === 0) return;

    const seen = seenOrderIdsRef.current;

    // Primera carga: solo poblar seenOrderIds, sin alertas
    if (!hasInitializedRef.current) {
      pedidos.forEach((p) => seen.add(String(p.id)));
      hasInitializedRef.current = true;
      return;
    }

    // Detectar pedidos nuevos
    const newWebOrders = pedidos.filter((p) => {
      const id = String(p.id);
      if (seen.has(id)) return false;
      seen.add(id);
      const origen = (p.origen || p.origen_pedido || '').toString().toLowerCase();
      return origen === 'web';
    });

    if (newWebOrders.length === 0) return;

    pendingWebOrdersRef.current.push(...newWebOrders);
    scheduleFlush();
  }, [pedidos, scheduleFlush]);

  return { seenOrderIds: seenOrderIdsRef.current };
}
