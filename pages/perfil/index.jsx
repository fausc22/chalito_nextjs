import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Eye, EyeOff, KeyRound, Save, UserRound } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Layout } from '@/components/layout/Layout';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { AvatarPicker } from '@/components/user/AvatarPicker';
import { UserAvatar } from '@/components/user/UserAvatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { ROLE_NAMES } from '@/config/api';
import { formatDateTimeSafe } from '@/lib/formatters';
import { authService } from '@/services/authService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PerfilContent() {
  const { user, updateUser, refreshProfile } = useAuth();
  const notification = useNotification();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);

  const [profileForm, setProfileForm] = useState({
    nombre: '',
    email: '',
    usuario: '',
    avatar_key: null,
  });

  const [passwordForm, setPasswordForm] = useState({
    password_actual: '',
    password_nueva: '',
    confirmar_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });

  const roleLabel = useMemo(() => ROLE_NAMES[user?.rol] || user?.rol || '-', [user?.rol]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      const result = await refreshProfile();

      const source = result.success ? result.user : user;
      if (source) {
        setProfileForm({
          nombre: source.nombre || '',
          email: source.email || '',
          usuario: source.usuario || '',
          avatar_key: source.avatar_key || null,
        });
      }

      if (!result.success && result.message) {
        notification.showWarning(result.message);
      }

      setLoadingProfile(false);
    };

    loadProfile();
  }, [refreshProfile, notification]);

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateProfile = () => {
    if (!profileForm.nombre.trim()) {
      notification.showError('El nombre es obligatorio');
      return false;
    }
    if (!profileForm.email.trim() || !EMAIL_REGEX.test(profileForm.email.trim())) {
      notification.showError('Ingresa un email valido');
      return false;
    }
    if (!profileForm.usuario.trim()) {
      notification.showError('El usuario es obligatorio');
      return false;
    }
    return true;
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    if (!validateProfile()) return;

    setSavingProfile(true);
    const result = await authService.updateProfile({
      ...profileForm,
      nombre: profileForm.nombre.trim(),
      email: profileForm.email.trim().toLowerCase(),
      usuario: profileForm.usuario.trim(),
    });
    setSavingProfile(false);

    if (!result.success) {
      notification.showError(result.message || 'No se pudo actualizar el perfil');
      return;
    }

    updateUser(result.user);
    notification.showSuccess('Perfil actualizado correctamente');
  };

  const handleAvatarSelection = (avatarKey) => {
    setProfileForm((prev) => ({
      ...prev,
      avatar_key: avatarKey,
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePassword = () => {
    if (!passwordForm.password_actual || !passwordForm.password_nueva || !passwordForm.confirmar_password) {
      notification.showError('Completa todos los campos de contraseña');
      return false;
    }

    if (passwordForm.password_nueva.length < 6) {
      notification.showError('La nueva contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (passwordForm.password_nueva !== passwordForm.confirmar_password) {
      notification.showError('La confirmación de contraseña no coincide');
      return false;
    }

    return true;
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!validatePassword()) return;

    setSavingPassword(true);
    const result = await authService.changePassword(passwordForm);
    setSavingPassword(false);

    if (!result.success) {
      notification.showError(result.message || 'No se pudo actualizar la contraseña');
      return;
    }

    setPasswordForm({
      password_actual: '',
      password_nueva: '',
      confirmar_password: '',
    });
    notification.showSuccess(result.message || 'Contraseña actualizada correctamente');
  };

  return (
    <Layout title="Mi Perfil">
      <div className="main-content">
        <ModuleHeader
          title="Mi perfil"
          description="Administrá tus datos de cuenta, avatar y contraseña."
          icon={UserRound}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-1 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Resumen</CardTitle>
              <CardDescription>Vista rapida de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4 text-center">
                <UserAvatar
                  user={{ ...user, avatar_key: profileForm.avatar_key }}
                  avatarKey={profileForm.avatar_key}
                  size="xl"
                />
                <div>
                  <p className="text-lg font-semibold text-foreground">{profileForm.nombre || '-'}</p>
                  <p className="text-sm text-muted-foreground">{profileForm.email || `@${profileForm.usuario}`}</p>
                  <p className="text-xs mt-1 font-medium text-blue-700">{roleLabel}</p>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Cambiar avatar
                </Button>
              </div>
              <Separator className="my-5" />
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Ultima conexión</p>
                <p className="font-medium text-foreground">
                  {formatDateTimeSafe(user?.ultima_conexion)}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="xl:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-blue-700" />
                  Datos personales
                </CardTitle>
                <CardDescription>Actualiza la información visible en el sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSaveProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="perfil-nombre">Nombre</Label>
                      <Input
                        id="perfil-nombre"
                        value={profileForm.nombre}
                        onChange={(event) => handleProfileChange('nombre', event.target.value)}
                        disabled={loadingProfile || savingProfile}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="perfil-email">Email</Label>
                      <Input
                        id="perfil-email"
                        type="email"
                        value={profileForm.email}
                        onChange={(event) => handleProfileChange('email', event.target.value)}
                        disabled={loadingProfile || savingProfile}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="perfil-usuario">Usuario</Label>
                      <Input
                        id="perfil-usuario"
                        value={profileForm.usuario}
                        onChange={(event) => handleProfileChange('usuario', event.target.value)}
                        disabled={loadingProfile || savingProfile}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="perfil-rol">Rol</Label>
                      <Input id="perfil-rol" value={roleLabel} disabled readOnly />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loadingProfile || savingProfile}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <button
                  type="button"
                  className="w-full text-left flex items-center justify-between"
                  onClick={() => setIsPasswordSectionOpen((prev) => !prev)}
                  aria-expanded={isPasswordSectionOpen}
                >
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-amber-600" />
                      Cambiar contraseña
                    </CardTitle>
                    <CardDescription className="mt-1">Usa una contraseña segura para proteger tu cuenta.</CardDescription>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isPasswordSectionOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              </CardHeader>
              <CardContent
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isPasswordSectionOpen ? 'max-h-[460px] opacity-100 pt-0' : 'max-h-0 opacity-0 pt-0 pb-0'
                }`}
              >
                <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="password-actual">Contraseña actual</Label>
                    <div className="relative">
                      <Input
                        id="password-actual"
                        type={showPasswords.actual ? 'text' : 'password'}
                        value={passwordForm.password_actual}
                        onChange={(event) => handlePasswordChange('password_actual', event.target.value)}
                        disabled={savingPassword}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => togglePasswordVisibility('actual')}
                        disabled={savingPassword}
                        aria-label={showPasswords.actual ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'}
                      >
                        {showPasswords.actual ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password-nueva">Nueva contraseña</Label>
                      <div className="relative">
                        <Input
                          id="password-nueva"
                          type={showPasswords.nueva ? 'text' : 'password'}
                          value={passwordForm.password_nueva}
                          onChange={(event) => handlePasswordChange('password_nueva', event.target.value)}
                          disabled={savingPassword}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => togglePasswordVisibility('nueva')}
                          disabled={savingPassword}
                          aria-label={showPasswords.nueva ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
                        >
                          {showPasswords.nueva ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-confirmar">Confirmar contraseña</Label>
                      <div className="relative">
                        <Input
                          id="password-confirmar"
                          type={showPasswords.confirmar ? 'text' : 'password'}
                          value={passwordForm.confirmar_password}
                          onChange={(event) => handlePasswordChange('confirmar_password', event.target.value)}
                          disabled={savingPassword}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => togglePasswordVisibility('confirmar')}
                          disabled={savingPassword}
                          aria-label={showPasswords.confirmar ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                        >
                          {showPasswords.confirmar ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={savingPassword}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <AvatarPicker
          open={isAvatarPickerOpen}
          onOpenChange={setIsAvatarPickerOpen}
          selectedAvatarKey={profileForm.avatar_key}
          onSelect={handleAvatarSelection}
          user={user}
        />
      </div>
    </Layout>
  );
}

export default function PerfilPage() {
  return (
    <ProtectedRoute module="perfil">
      <ErrorBoundary>
        <PerfilContent />
      </ErrorBoundary>
    </ProtectedRoute>
  );
}
