import { useEffect } from 'react';
import { ProtectedRoute } from '../src/components/auth/ProtectedRoute';
import { Layout } from '../src/components/layout/Layout';
import { useAuth } from '../src/contexts/AuthContext';
import { ROLE_NAMES, ROLE_ICONS } from '../src/config/api';

function DashboardContent() {
  const { user, userRole, userName } = useAuth();

  const getRoleDisplayName = (role) => ROLE_NAMES[role] || role;
  const getRoleIcon = (role) => ROLE_ICONS[role] || '👤';

  const getCurrentTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <Layout title="Dashboard">
      <div className="main-content">
        {/* Bienvenida */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-lg">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {getCurrentTimeGreeting()}, {userName}!
            </h1>
            <div className="flex items-center space-x-2 text-primary-100">
              <span className="text-2xl">{getRoleIcon(userRole)}</span>
              <span className="text-lg">{getRoleDisplayName(userRole)}</span>
            </div>
            <p className="mt-4 text-primary-50">
              Has iniciado sesión correctamente en el sistema El Chalito
            </p>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-slide-up">
          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-3xl">
                {getRoleIcon(userRole)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user?.nombre}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-400">@{user?.usuario}</p>
                <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                  userRole === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                  userRole === 'GERENTE' ? 'bg-blue-100 text-blue-800' :
                  userRole === 'CAJERO' ? 'bg-green-100 text-green-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {getRoleDisplayName(userRole)}
                </span>
              </div>
            </div>
          </div>

          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🏪</div>
              <div>
                <h3 className="font-semibold text-gray-900">Sistema Activo</h3>
                <p className="text-sm text-gray-600">Funcionando correctamente</p>
              </div>
            </div>
          </div>

          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🔐</div>
              <div>
                <h3 className="font-semibold text-gray-900">Autenticación</h3>
                <p className="text-sm text-gray-600">Sesión segura iniciada</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Información del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">⏰</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">Última conexión</h3>
              <p className="text-2xl font-bold">{new Date().toLocaleDateString('es-AR')}</p>
              <p className="text-sm text-blue-100 mt-1">{new Date().toLocaleTimeString('es-AR')}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">Estado</h3>
              <p className="text-2xl font-bold">Online</p>
              <p className="text-sm text-green-100 mt-1">Todo funcionando bien</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">Versión</h3>
              <p className="text-2xl font-bold">1.0.0</p>
              <p className="text-sm text-purple-100 mt-1">Actualizado</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">Usuario</h3>
              <p className="text-2xl font-bold truncate">{user?.usuario}</p>
              <p className="text-sm text-orange-100 mt-1">Activo</p>
            </div>
          </div>
        </div>

        {/* Módulos próximamente */}
        <div className="card bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Próximamente</h2>
          <p className="text-gray-600 mb-6">Los módulos de gestión estarán disponibles próximamente:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
              <span className="text-4xl block mb-2">📋</span>
              <span className="text-sm font-medium text-gray-700">Pedidos</span>
            </div>
            <div className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
              <span className="text-4xl block mb-2">💳</span>
              <span className="text-sm font-medium text-gray-700">Ventas</span>
            </div>
            <div className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
              <span className="text-4xl block mb-2">🍔</span>
              <span className="text-sm font-medium text-gray-700">Artículos</span>
            </div>
            <div className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
              <span className="text-4xl block mb-2">📊</span>
              <span className="text-sm font-medium text-gray-700">Reportes</span>
            </div>
          </div>
        </div>
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
