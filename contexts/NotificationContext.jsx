import { createContext, useContext } from 'react';
import { toast } from '@/hooks/use-toast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const showSuccess = (message, options = {}) =>
    toast.success(message, { icon: options.icon ?? '✅', ...options });

  const showError = (message, options = {}) =>
    toast.error(message, { icon: options.icon ?? '⚠️', ...options });

  const showInfo = (message, options = {}) =>
    toast.info(message, { icon: options.icon ?? 'ℹ️', ...options });

  const showWarning = (message, options = {}) =>
    toast.warning(message, { icon: options.icon ?? '⚠️', ...options });

  const showLoading = (message, options = {}) =>
    toast.loading(message, options);

  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  const value = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    dismiss
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
