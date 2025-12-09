import { useState, useEffect } from 'react';
import { Clock, TrendingUp, ShoppingBag, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Card 1: Fecha y Hora Actual
 */
export const DateTimeCard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Card className="bg-white border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <p className="text-gray-600 text-sm font-medium">Fecha y Hora</p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {formatTime(currentTime)}
            </h3>
            <p className="text-gray-500 text-sm capitalize">
              {formatDate(currentTime)}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <Clock className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Card 2: Ventas del Día
 */
export const SalesCard = ({ salesData = { total: 0, count: 0 } }) => {
  return (
    <Card className="bg-white border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <p className="text-gray-600 text-sm font-medium">Ventas del Día</p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ${salesData.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-gray-500 text-sm">
              {salesData.count} {salesData.count === 1 ? 'venta' : 'ventas'} realizadas
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Card 3: Pedidos Pendientes y En Curso
 */
export const OrdersCard = ({ ordersData = { pending: 0, inProgress: 0 } }) => {
  const total = ordersData.pending + ordersData.inProgress;

  return (
    <Card className="bg-white border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="h-5 w-5 text-orange-500" />
              <p className="text-gray-600 text-sm font-medium">Pedidos Activos</p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {total}
            </h3>
            <div className="flex gap-4 text-gray-500 text-sm">
              <span>{ordersData.pending} pendientes</span>
              <span>•</span>
              <span>{ordersData.inProgress} en curso</span>
            </div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <ShoppingBag className="h-6 w-6 text-orange-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Card 4: Información del Usuario
 */
export const UserInfoCard = ({ user, roleDisplayName, roleIcon }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const formatLastConnection = (date) => {
    if (!date) return 'Ahora';
    return new Date(date).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="bg-white border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-red-500" />
              <p className="text-gray-600 text-sm font-medium">{getGreeting()}</p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {user?.nombre || user?.usuario || 'Usuario'}
            </h3>
            <div className="flex flex-col gap-1 text-gray-500 text-sm">
              <span className="flex items-center gap-1">
                <span>{roleIcon}</span>
                <span>{roleDisplayName}</span>
              </span>
              <span className="text-xs">
                Última conexión: {formatLastConnection(user?.ultima_conexion)}
              </span>
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <User className="h-6 w-6 text-red-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
