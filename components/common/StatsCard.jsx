/**
 * Componente StatsCard
 * Tarjeta para mostrar estadísticas con icono y valor
 */
export const StatsCard = ({
  title,
  value,
  icon,
  color = 'blue',
  subtitle,
  trend,
  className = '',
}) => {
  const colors = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600',
    green: 'from-green-50 to-green-100 border-green-200 text-green-600',
    red: 'from-red-50 to-red-100 border-red-200 text-red-600',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
    orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-600',
    yellow: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-600',
  };

  const colorClass = colors[color] || colors.blue;

  return (
    <div className={`card bg-gradient-to-br ${colorClass} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {icon && <div className="text-3xl">{icon}</div>}
        {trend && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className={`text-4xl font-bold mb-2 ${colors[color]?.split(' ')[2] || 'text-blue-600'}`}>
        {value}
      </div>
      <div className="text-gray-700 font-medium">{title}</div>
      {subtitle && (
        <div className="text-sm text-gray-600 mt-1">{subtitle}</div>
      )}
    </div>
  );
};

/**
 * Stats Grid - Contenedor para múltiples StatsCards
 */
export const StatsGrid = ({ children, columns = 4, className = '' }) => {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const columnClass = columnClasses[columns] || columnClasses[4];

  return (
    <div className={`grid ${columnClass} gap-6 ${className}`}>
      {children}
    </div>
  );
};


