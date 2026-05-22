import { Card } from '../common/Card';

/**
 * Componente WelcomeCard
 * Tarjeta de bienvenida para el dashboard
 */
export const WelcomeCard = ({
  userName,
  userRole,
  roleIcon = '👤',
  roleDisplayName,
  greeting,
  subtitle = 'Has iniciado sesión correctamente en el sistema El Chalito',
}) => {
  // Función para obtener saludo según hora del día
  const getCurrentTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const displayGreeting = greeting || getCurrentTimeGreeting();

  return (
    <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg border-none mb-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {displayGreeting}, {userName}!
        </h1>
        
        {roleDisplayName && (
          <div className="flex items-center space-x-2 text-primary-100 mb-4">
            <span className="text-2xl">{roleIcon}</span>
            <span className="text-lg">{roleDisplayName}</span>
          </div>
        )}
        
        <p className="text-primary-50">{subtitle}</p>
      </div>
    </Card>
  );
};

/**
 * Info Card - Tarjeta de información del usuario
 */
export const UserInfoCard = ({ 
  user, 
  roleIcon = '👤', 
  roleDisplayName,
  roleColor = 'blue' 
}) => {
  const roleColors = {
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    green: 'bg-green-100 text-green-800',
    orange: 'bg-orange-100 text-orange-800',
  };

  const roleColorClass = roleColors[roleColor] || roleColors.blue;

  return (
    <Card>
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-3xl flex-shrink-0">
          {roleIcon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{user?.nombre}</h3>
          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          <p className="text-xs text-muted-foreground truncate">@{user?.usuario}</p>
          <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${roleColorClass}`}>
            {roleDisplayName}
          </span>
        </div>
      </div>
    </Card>
  );
};

/**
 * Status Card - Tarjeta de estado del sistema
 */
export const StatusCard = ({ 
  title, 
  subtitle, 
  icon, 
  color = 'green'
}) => {
  const colors = {
    green: 'bg-emerald-500/100/10 border-green-200',
    blue: 'bg-primary/10 border-blue-200',
    yellow: 'bg-amber-500/10 border-yellow-200',
    red: 'bg-destructive/10 border-red-200',
  };

  const colorClass = colors[color] || colors.green;

  return (
    <Card className={colorClass}>
      <div className="flex items-center space-x-4">
        <div className="text-4xl flex-shrink-0">{icon}</div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </Card>
  );
};


