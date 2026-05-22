import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { getDefaultRouteForRole } from '../../config/permissions';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldError } from '@/components/ui/field-error';

export function LoginForm() {
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
    remember: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
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

    setFieldErrors(prev => ({ ...prev, [name]: undefined }));

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!formData.usuario.trim()) {
      nextErrors.usuario = 'El usuario es obligatorio';
    }

    if (!formData.password.trim()) {
      nextErrors.password = 'La contraseña es obligatoria';
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
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

      router.push(getDefaultRouteForRole(result.user?.rol));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Iniciar Sesión</h2>
        <p className="text-muted-foreground text-sm">Ingresa tus credenciales para acceder al sistema</p>
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
            error={Boolean(fieldErrors.usuario)}
            aria-invalid={Boolean(fieldErrors.usuario)}
          />
          <FieldError error={fieldErrors.usuario} />
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
              error={Boolean(fieldErrors.password)}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
          <FieldError error={fieldErrors.password} />
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
          <div className="bg-destructive/10 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2 animate-bounce-in">
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
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">Credenciales de prueba:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-muted px-3 py-2 rounded">
              <strong>Admin:</strong> admin / admin123
            </div>
            <div className="bg-muted px-3 py-2 rounded">
              <strong>Gerente:</strong> gerente / gerente123
            </div>
            <div className="bg-muted px-3 py-2 rounded">
              <strong>Cajero:</strong> cajero / cajero123
            </div>
            <div className="bg-muted px-3 py-2 rounded">
              <strong>Chef:</strong> chef / cocina123
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
