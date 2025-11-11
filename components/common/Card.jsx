/**
 * Componente Card reutilizable
 * Contenedor con estilos consistentes para agrupar contenido
 */
export const Card = ({ 
  children, 
  className = '',
  padding = 'default',
  hover = false,
  ...props 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  const baseClasses = 'card bg-white rounded-xl border border-gray-200 shadow-sm';
  const paddingClass = paddingClasses[padding] || paddingClasses.default;
  const hoverClass = hover ? 'hover:shadow-md hover:border-primary-300 transition-all duration-200' : '';

  return (
    <div 
      className={`${baseClasses} ${paddingClass} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Header - Encabezado de tarjeta
 */
export const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b border-gray-200 pb-4 mb-6 ${className}`}>
    {children}
  </div>
);

/**
 * Card Title - Título de tarjeta
 */
export const CardTitle = ({ children, className = '' }) => (
  <h2 className={`text-2xl font-bold text-primary-700 ${className}`}>
    {children}
  </h2>
);

/**
 * Card Body - Cuerpo de tarjeta
 */
export const CardBody = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

/**
 * Card Footer - Pie de tarjeta
 */
export const CardFooter = ({ children, className = '' }) => (
  <div className={`border-t border-gray-200 pt-6 mt-6 ${className}`}>
    {children}
  </div>
);


