import { createContext, useContext } from 'react';
import {
  showErrorToast,
  showInfoToast,
  showLoadingToast,
  showSuccessToast,
  showWarningToast,
  toast,
} from '@/hooks/use-toast';

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
    showSuccessToast(message, options);

  const showError = (message, options = {}) =>
    showErrorToast(message, options);

  const showInfo = (message, options = {}) =>
    showInfoToast(message, options);

  const showWarning = (message, options = {}) =>
    showWarningToast(message, options);

  const showLoading = (message, options = {}) =>
    showLoadingToast(message, options);

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
