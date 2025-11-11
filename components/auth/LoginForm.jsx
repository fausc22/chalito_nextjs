import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';

export function LoginForm() {
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
    remember: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (error && (name === 'usuario' || name === 'password')) {
      clearError();
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.usuario.trim() || !formData.password.trim()) {
      return;
    }

    const result = await login(formData);

    if (result.success) {
      router.push(ROUTES.DASHBOARD);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 animate-fade-in">
      <div className="card">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
          <p className="text-gray-600">Ingresa tus credenciales para acceder al sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Usuario */}
          <div>
            <label htmlFor="usuario" className="label">
              Usuario
            </label>
            <input
              type="text"
              id="usuario"
              name="usuario"
              placeholder="Ingresa tu usuario"
              value={formData.usuario}
              onChange={handleInputChange}
              disabled={isLoading}
              required
              autoComplete="username"
              className={`input ${error ? 'input-error' : ''}`}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="label">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Ingresa tu contraseña"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                autoComplete="current-password"
                className={`input pr-12 ${error ? 'input-error' : ''}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Recordar sesión */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={formData.remember}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-700 cursor-pointer">
              Recordar sesión (7 días)
            </label>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg flex items-start space-x-2 animate-bounce-in">
              <span className="text-lg">⚠️</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !formData.usuario.trim() || !formData.password.trim()}
            className="w-full btn-primary btn-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="spinner spinner-sm"></div>
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Credenciales de prueba - solo desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Credenciales de prueba:</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="bg-gray-50 px-3 py-2 rounded">
                <strong>Admin:</strong> admin / admin123
              </div>
              <div className="bg-gray-50 px-3 py-2 rounded">
                <strong>Gerente:</strong> gerente / gerente123
              </div>
              <div className="bg-gray-50 px-3 py-2 rounded">
                <strong>Cajero:</strong> cajero / cajero123
              </div>
              <div className="bg-gray-50 px-3 py-2 rounded">
                <strong>Chef:</strong> chef / cocina123
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
