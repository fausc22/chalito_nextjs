'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { playNewOrderSound } from '../lib/newOrderSound';

const WebOrderAlertsContext = createContext(null);

const STORAGE_KEY_SOUND = 'chalito_web_order_sound_enabled';
const NOOP = () => {};
const FALLBACK_CTX = {
  unreadNotifications: [],
  unreadCount: 0,
  soundEnabled: false,
  setSoundEnabled: NOOP,
  addUnreadNotification: NOOP,
  markNotificationRead: NOOP,
  markAllNotificationsRead: NOOP,
  playSoundThrottled: NOOP,
};

export function WebOrderAlertsProvider({ children }) {
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(STORAGE_KEY_SOUND) === 'true';
    } catch {
      return false;
    }
  });
  const lastSoundTimeRef = useRef(0);
  const SOUND_THROTTLE_MS = 2000;

  const setSoundEnabled = useCallback((enabled) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, String(enabled));
    } catch (e) {
      console.warn('No se pudo guardar preferencia de sonido:', e);
    }
  }, []);

  const addUnreadNotification = useCallback((pedido) => {
    setUnreadNotifications((prev) => {
      if (prev.some((n) => n.pedidoId === String(pedido.id))) return prev;
      return [
        ...prev,
        {
          id: `web-${pedido.id}-${Date.now()}`,
          pedidoId: String(pedido.id),
          pedido,
          timestamp: Date.now(),
        },
      ];
    });
  }, []);

  const markNotificationRead = useCallback((pedidoId) => {
    setUnreadNotifications((prev) => prev.filter((n) => n.pedidoId !== String(pedidoId)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setUnreadNotifications([]);
  }, []);

  const playSoundThrottled = useCallback(() => {
    const now = Date.now();
    if (now - lastSoundTimeRef.current < SOUND_THROTTLE_MS) return;
    lastSoundTimeRef.current = now;
    playNewOrderSound(soundEnabled);
  }, [soundEnabled]);

  const value = {
    unreadNotifications,
    unreadCount: unreadNotifications.length,
    soundEnabled,
    setSoundEnabled,
    addUnreadNotification,
    markNotificationRead,
    markAllNotificationsRead,
    playSoundThrottled,
  };

  return (
    <WebOrderAlertsContext.Provider value={value}>
      {children}
    </WebOrderAlertsContext.Provider>
  );
}

export function useWebOrderAlerts() {
  const ctx = useContext(WebOrderAlertsContext);
  if (!ctx) {
    return FALLBACK_CTX;
  }
  return ctx;
}
