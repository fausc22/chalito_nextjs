import { createContext, useContext } from 'react';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      duration: options.duration || 3000,
      ...options
    });
  };

  const showError = (message, options = {}) => {
    toast.error(message, {
      duration: options.duration || 4000,
      ...options
    });
  };

  const showInfo = (message, options = {}) => {
    toast(message, {
      icon: 'ℹ️',
      duration: options.duration || 3000,
      ...options
    });
  };

  const showWarning = (message, options = {}) => {
    toast(message, {
      icon: '⚠️',
      duration: options.duration || 3000,
      ...options
    });
  };

  const showLoading = (message) => {
    return toast.loading(message);
  };

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
