import Link from 'next/link';
import { Card } from '../common/Card';

/**
 * Componente ModuleCard
 * Tarjeta clickeable para los módulos del sistema
 */
export const ModuleCard = ({
  title,
  description,
  icon,
  href,
  onClick,
  color = 'primary',
  disabled = false,
}) => {
  const colors = {
    primary: 'hover:border-primary-500 hover:shadow-primary-100',
    success: 'hover:border-success-500 hover:shadow-success-100',
    danger: 'hover:border-danger-500 hover:shadow-danger-100',
    warning: 'hover:border-warning-500 hover:shadow-warning-100',
    info: 'hover:border-info-500 hover:shadow-info-100',
  };

  const colorClass = colors[color] || colors.primary;

  const CardContent = () => (
    <div className="text-center">
      {/* Icono */}
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-4xl transform transition-transform group-hover:scale-110">
        {icon}
      </div>

      {/* Título */}
      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
        {title}
      </h3>

      {/* Descripción */}
      <p className="text-gray-600 text-sm">
        {description}
      </p>
    </div>
  );

  if (disabled) {
    return (
      <Card 
        className="opacity-50 cursor-not-allowed"
        padding="lg"
      >
        <CardContent />
      </Card>
    );
  }

  const cardClasses = `group cursor-pointer transform transition-all duration-200 hover:-translate-y-1 ${colorClass}`;

  if (href) {
    return (
      <Link href={href}>
        <Card className={cardClasses} padding="lg" hover>
          <CardContent />
        </Card>
      </Link>
    );
  }

  return (
    <Card 
      className={cardClasses} 
      padding="lg" 
      hover
      onClick={onClick}
    >
      <CardContent />
    </Card>
  );
};

/**
 * Module Grid - Contenedor para múltiples ModuleCards
 */
export const ModuleGrid = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {children}
    </div>
  );
};


