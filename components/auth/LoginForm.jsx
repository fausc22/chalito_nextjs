import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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
      const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '¡Buenos días';
        if (hour < 20) return '¡Buenas tardes';
        return '¡Buenas noches';
      };

      toast.success(`${getGreeting()}! Bienvenido al sistema`, {
        duration: 4000,
        icon: '👋',
      });

      router.push(ROUTES.DASHBOARD);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
        <p className="text-gray-600 text-sm">Ingresa tus credenciales para acceder al sistema</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Usuario */}
        <div className="space-y-2">
          <Label htmlFor="usuario">Usuario</Label>
          <Input
            type="text"
            id="usuario"
            name="usuario"
            placeholder="Ingresa tu usuario"
            value={formData.usuario}
            onChange={handleInputChange}
            disabled={isLoading}
            required
            autoComplete="username"
            className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
        </div>

        {/* Contraseña */}
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              required
              autoComplete="current-password"
              className={`pr-10 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Recordar sesión */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={formData.remember}
            onCheckedChange={(checked) =>
              setFormData(prev => ({ ...prev, remember: checked }))
            }
            disabled={isLoading}
          />
          <Label
            htmlFor="remember"
            className="text-sm font-normal cursor-pointer"
          >
            Recordar sesión (7 días)
          </Label>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2 animate-bounce-in">
            <span className="text-lg">⚠️</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isLoading || !formData.usuario.trim() || !formData.password.trim()}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
      </form>

      {/* Credenciales de prueba - solo desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Credenciales de prueba:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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
  );
}
