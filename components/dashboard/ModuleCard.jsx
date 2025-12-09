import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Componente ModuleCard
 * Tarjeta clickeable para los módulos del sistema - Estilo limpio con borde izquierdo
 */
export const ModuleCard = ({
  title,
  description,
  icon,
  href,
  onClick,
  color = 'blue',
  disabled = false,
}) => {
  const colorClasses = {
    blue: {
      border: 'border-l-blue-500',
      icon: 'text-blue-500',
      iconBg: 'bg-blue-50',
      hover: 'hover:border-l-blue-600',
    },
    green: {
      border: 'border-l-green-500',
      icon: 'text-green-500',
      iconBg: 'bg-green-50',
      hover: 'hover:border-l-green-600',
    },
    orange: {
      border: 'border-l-orange-500',
      icon: 'text-orange-500',
      iconBg: 'bg-orange-50',
      hover: 'hover:border-l-orange-600',
    },
    red: {
      border: 'border-l-red-500',
      icon: 'text-red-500',
      iconBg: 'bg-red-50',
      hover: 'hover:border-l-red-600',
    },
    purple: {
      border: 'border-l-purple-500',
      icon: 'text-purple-500',
      iconBg: 'bg-purple-50',
      hover: 'hover:border-l-purple-600',
    },
    teal: {
      border: 'border-l-teal-500',
      icon: 'text-teal-500',
      iconBg: 'bg-teal-50',
      hover: 'hover:border-l-teal-600',
    },
    indigo: {
      border: 'border-l-indigo-500',
      icon: 'text-indigo-500',
      iconBg: 'bg-indigo-50',
      hover: 'hover:border-l-indigo-600',
    },
    pink: {
      border: 'border-l-pink-500',
      icon: 'text-pink-500',
      iconBg: 'bg-pink-50',
      hover: 'hover:border-l-pink-600',
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  const Content = () => (
    <div className="flex flex-col items-center text-center p-4 sm:p-6 h-full">
      {/* Icono */}
      <div className={`w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-xl ${colors.iconBg} flex items-center justify-center text-3xl sm:text-4xl transform transition-transform ${disabled ? '' : 'group-hover:scale-110'}`}>
        <span className={disabled ? 'opacity-50' : ''}>{icon}</span>
      </div>

      {/* Título */}
      <h3 className={`text-base sm:text-lg font-bold mb-1 sm:mb-2 ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>
        {title}
      </h3>

      {/* Descripción */}
      <p className={`text-xs sm:text-sm line-clamp-2 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
        {description}
      </p>

      {/* Badge de estado */}
      {disabled && (
        <span className="mt-auto pt-2 sm:pt-3 text-xs text-gray-400 font-medium">
          Próximamente
        </span>
      )}
    </div>
  );

  const baseClasses = `bg-white border-l-4 ${colors.border} shadow-md transition-all duration-200`;

  if (disabled) {
    return (
      <Card className={`${baseClasses} opacity-70 cursor-not-allowed`}>
        <CardContent className="p-0">
          <Content />
        </CardContent>
      </Card>
    );
  }

  const activeClasses = `${baseClasses} ${colors.hover} hover:shadow-lg hover:-translate-y-1 cursor-pointer group`;

  if (href) {
    return (
      <Link href={href} className="block">
        <Card className={activeClasses}>
          <CardContent className="p-0">
            <Content />
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card className={activeClasses} onClick={onClick}>
      <CardContent className="p-0">
        <Content />
      </CardContent>
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
