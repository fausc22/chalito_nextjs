import { useState } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_NAMES, ROLE_ICONS } from '../../config/api';
import { DateTimeCard, SalesCard, OrdersCard, UserInfoCard } from '../../components/dashboard/InfoCards';
import { ModuleCard, ModuleGrid } from '../../components/dashboard/ModuleCard';
import { ChevronDown, ChevronUp } from 'lucide-react';

function DashboardContent() {
  const { user, userRole } = useAuth();
  const [showStats, setShowStats] = useState(false);

  const getRoleDisplayName = (role) => ROLE_NAMES[role] || role;
  const getRoleIcon = (role) => ROLE_ICONS[role] || '👤';

  // Datos mock para las cards (reemplazar con datos reales del backend)
  const salesData = {
    total: 15750.50,
    count: 23,
  };

  const ordersData = {
    pending: 5,
    inProgress: 3,
  };

  // Definir los 8 módulos del sistema
  const modules = [
    {
      title: 'Ventas',
      description: 'Historial de ventas e ingresos del negocio',
      icon: '💳',
      href: '/ventas',
      color: 'green',
      disabled: false,
    },
    {
      title: 'Pedidos',
      description: 'Administración de pedidos y comandas',
      icon: '📋',
      href: '/pedidos',
      color: 'blue',
      disabled: false,
    },
    {
      title: 'Inventario',
      description: 'Control de artículos, ingredientes y categorías',
      icon: '📦',
      href: '/inventario',
      color: 'orange',
      disabled: false,
    },
    {
      title: 'Gastos',
      description: 'Registro y control de gastos operativos',
      icon: '💸',
      href: '/gastos',
      color: 'red',
      disabled: false,
    },
    {
      title: 'Fondos',
      description: 'Gestión de cuentas, movimientos y balances',
      icon: '💰',
      href: '/fondos',
      color: 'teal',
      disabled: false,
    },
    {
      title: 'Estadísticas',
      description: 'Métricas y análisis de rendimiento',
      icon: '📈',
      href: null,
      color: 'indigo',
      disabled: true,
    },
    {
      title: 'Empleados',
      description: 'Gestión de personal y recursos humanos',
      icon: '👥',
      href: null,
      color: 'purple',
      disabled: true,
    },
    {
      title: 'Proveedores',
      description: 'Administración de proveedores y compras',
      icon: '🚚',
      href: null,
      color: 'pink',
      disabled: true,
    },
  ];

  return (
    <Layout title="Dashboard">
      <div className="main-content max-w-7xl mx-auto">
        {/* Botón toggle para móviles - Solo visible en pantallas pequeñas */}
        <div className="sm:hidden mb-4">
          <button
            onClick={() => setShowStats(!showStats)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="font-medium text-gray-700">
              {showStats ? 'Ocultar estadísticas' : 'Ver estadísticas'}
            </span>
            {showStats ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Cards superiores - Responsive */}
        <div className={`
          grid gap-6 mb-8
          ${showStats ? 'grid-cols-1 sm:grid-cols-2' : 'hidden'}
          sm:grid sm:grid-cols-2
          lg:grid-cols-4
        `}>
          <DateTimeCard />
          <SalesCard salesData={salesData} />
          <OrdersCard ordersData={ordersData} />
          <UserInfoCard
            user={user}
            roleDisplayName={getRoleDisplayName(userRole)}
            roleIcon={getRoleIcon(userRole)}
          />
        </div>

        {/* Título de módulos */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Módulos del Sistema
          </h2>
          <p className="text-gray-600 mt-1">
            Accede a las diferentes funcionalidades del sistema
          </p>
        </div>

        {/* Grid de módulos */}
        <ModuleGrid>
          {modules.map((module, index) => (
            <ModuleCard
              key={index}
              title={module.title}
              description={module.description}
              icon={module.icon}
              href={module.href}
              color={module.color}
              disabled={module.disabled}
            />
          ))}
        </ModuleGrid>

        {/* Nota informativa */}
        {modules.some(m => m.disabled) && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-1">
                  Módulos en Desarrollo
                </h3>
                <p className="text-blue-700">
                  Los módulos marcados como &quot;Próximamente&quot; estarán disponibles en futuras actualizaciones.
                  Actualmente puedes acceder a <strong>Pedidos</strong>, <strong>Ventas</strong>, <strong>Inventario</strong> y <strong>Gastos</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
