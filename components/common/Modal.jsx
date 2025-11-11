/**
 * Componente Modal reutilizable
 * Modal base para crear diferentes tipos de diálogos
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className="overlay">
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <div className={`card ${sizeClass} w-full animate-bounce-in relative z-10 ${className}`}>
            {title && (
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-primary-700">{title}</h2>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal Header
 */
export const ModalHeader = ({ children, onClose, className = '' }) => (
  <div className={`border-b border-gray-200 pb-4 mb-6 flex items-center justify-between ${className}`}>
    {children}
    {onClose && (
      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);

/**
 * Modal Body
 */
export const ModalBody = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {children}
  </div>
);

/**
 * Modal Footer
 */
export const ModalFooter = ({ children, className = '' }) => (
  <div className={`flex gap-4 mt-8 pt-6 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

/**
 * Confirmation Modal - Modal de confirmación reutilizable
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  icon,
  loading = false,
}) => {
  const iconColors = {
    danger: 'text-danger-500',
    warning: 'text-warning-500',
    success: 'text-success-500',
    info: 'text-primary-500',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className={`text-2xl font-bold ${iconColors[variant]}`}>{title}</h2>
      </div>

      <div className="text-center py-6">
        {icon && (
          <div className={`mx-auto mb-4 ${iconColors[variant]}`}>
            {icon}
          </div>
        )}
        <div className="text-gray-600 whitespace-pre-line">
          {message}
        </div>
      </div>

      <div className="flex gap-4 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          disabled={loading}
          className="btn-ghost flex-1"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`btn-${variant} flex-1`}
        >
          {loading ? 'Cargando...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};


