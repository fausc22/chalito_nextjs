import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_NAMES, ROLE_ICONS } from '../config/api';
import { WelcomeCard, UserInfoCard, StatusCard } from '../components/dashboard/WelcomeCard';
import { ModuleCard, ModuleGrid } from '../components/dashboard/ModuleCard';
import { StatsCard, StatsGrid } from '../components/common/StatsCard';

function DashboardContent() {
  const { user, userRole, userName } = useAuth();

  const getRoleDisplayName = (role) => ROLE_NAMES[role] || role;
  const getRoleIcon = (role) => ROLE_ICONS[role] || '👤';

  // Definir los módulos disponibles
  const modules = [
    {
      title: 'Pedidos',
      description: 'Gestión de pedidos y comandas',
      icon: '📋',
      href: null, // '/pedidos' cuando esté listo
      color: 'primary',
      disabled: true,
    },
    {
      title: 'Ventas',
      description: 'Ventas y facturación',
      icon: '💳',
      href: null, // '/ventas' cuando esté listo
      color: 'success',
      disabled: true,
    },
    {
      title: 'Artículos',
      description: 'Gestión de menú y productos',
      icon: '🍔',
      href: '/articulos',
      color: 'warning',
      disabled: false,
    },
    {
      title: 'Inventario',
      description: 'Control de stock y pedidos',
      icon: '📦',
      href: null, // '/inventario' cuando esté listo
      color: 'info',
      disabled: true,
    },
    {
      title: 'Gastos',
      description: 'Gastos de la empresa',
      icon: '💰',
      href: null, // '/gastos' cuando esté listo
      color: 'danger',
      disabled: true,
    },
    {
      title: 'Reportes',
      description: 'Reportes e informes',
      icon: '📊',
      href: null, // '/reportes' cuando esté listo
      color: 'primary',
      disabled: true,
    },
    {
      title: 'Empleados',
      description: 'Administración de personal',
      icon: '👥',
      href: null, // '/usuarios' cuando esté listo
      color: 'success',
      disabled: true,
    },
  ];

  // Determinar color de rol
  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'purple';
      case 'GERENTE': return 'blue';
      case 'CAJERO': return 'green';
      case 'COCINA': return 'orange';
      default: return 'blue';
    }
  };

  return (
    <Layout title="Dashboard">
      <div className="main-content">
        {/* Tarjeta de bienvenida */}
        <WelcomeCard
          userName={userName}
          userRole={userRole}
          roleIcon={getRoleIcon(userRole)}
          roleDisplayName={getRoleDisplayName(userRole)}
        />

        {/* Información del usuario y estado */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-slide-up">
          <UserInfoCard
            user={user}
            roleIcon={getRoleIcon(userRole)}
            roleDisplayName={getRoleDisplayName(userRole)}
            roleColor={getRoleColor(userRole)}
          />

          <StatusCard
            title="Sistema Activo"
            subtitle="Funcionando correctamente"
            icon="🏪"
            color="green"
          />

          <StatusCard
            title="Autenticación"
            subtitle="Sesión segura iniciada"
            icon="🔐"
            color="blue"
          />
        </div>

        {/* Estadísticas del sistema */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Información del Sistema
          </h2>
          <StatsGrid columns={4}>
            <StatsCard
              title="Última conexión"
              value={new Date().toLocaleDateString('es-AR')}
              subtitle={new Date().toLocaleTimeString('es-AR')}
              icon="⏰"
              color="blue"
            />
            <StatsCard
              title="Estado"
              value="Online"
              subtitle="Todo funcionando bien"
              icon="✅"
              color="green"
            />
            <StatsCard
              title="Versión"
              value="1.0.0"
              subtitle="Actualizado"
              icon="🎯"
              color="purple"
            />
            <StatsCard
              title="Usuario"
              value={user?.usuario}
              subtitle="Activo"
              icon="👤"
              color="orange"
            />
          </StatsGrid>
        </div>

        {/* Módulos del sistema */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Módulos del Sistema
          </h2>
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
        </div>

        {/* Nota sobre módulos */}
        {modules.some(m => m.disabled) && (
          <div className="card bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              📢 Próximamente
            </h3>
            <p className="text-gray-600">
              Los módulos deshabilitados estarán disponibles próximamente. 
              Actualmente puedes acceder al módulo de <strong>Artículos</strong>.
            </p>
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

