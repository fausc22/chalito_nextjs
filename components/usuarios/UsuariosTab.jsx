import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ROLES, ROLE_NAMES } from '@/config/api';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { UsuariosTable } from './UsuariosTable';
import { UsuarioFormModal } from './UsuarioFormModal';
import { ResetPasswordDialog } from './ResetPasswordDialog';
import { toast } from '@/hooks/use-toast';

export function UsuariosTab({
  usuarios,
  loading,
  isMutating,
  error,
  pagination,
  cargarUsuarios,
  crearUsuario,
  actualizarUsuario,
  setActivoUsuario,
  resetPassword,
}) {
  const [filtros, setFiltros] = useState({ q: '', rol: '', activo: 'all', page: 1 });
  const [modalForm, setModalForm] = useState(false);
  const [modalReset, setModalReset] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);

  const recargar = useCallback(() => {
    cargarUsuarios({
      page: filtros.page,
      q: filtros.q || undefined,
      rol: filtros.rol || undefined,
      activo: filtros.activo,
    });
  }, [cargarUsuarios, filtros]);

  useEffect(() => {
    recargar();
  }, [filtros.page, filtros.rol, filtros.activo]);

  const buscar = () => {
    setFiltros((f) => ({ ...f, page: 1 }));
    recargar();
  };

  const handleCrear = async (payload) => {
    const result = await crearUsuario(payload);
    if (result.success) {
      toast.success(result.message || 'Usuario creado');
      setModalForm(false);
      recargar();
    } else {
      toast.error(result.error);
    }
  };

  const handleEditar = async (payload) => {
    const result = await actualizarUsuario(seleccionado.id, payload);
    if (result.success) {
      toast.success(result.message || 'Usuario actualizado');
      if (result.requiresRelogin) {
        toast.info('El usuario afectado debe volver a iniciar sesión.');
      }
      setModalForm(false);
      setSeleccionado(null);
      recargar();
    } else {
      toast.error(result.error);
    }
  };

  const handleReset = async (payload) => {
    const result = await resetPassword(seleccionado.id, payload);
    if (result.success) {
      toast.success(result.message || 'Contraseña restablecida');
      setModalReset(false);
      setSeleccionado(null);
    } else {
      toast.error(result.error);
    }
  };

  const confirmarToggle = async () => {
    if (!confirmToggle) return;
    const nuevoActivo = !confirmToggle.activo;
    const result = await setActivoUsuario(confirmToggle.id, nuevoActivo);
    if (result.success) {
      toast.success(result.message);
      setConfirmToggle(null);
      recargar();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-4">
      <ModuleHeader
        title="Usuarios del sistema"
        description="Gestión de cuentas, roles y acceso al panel."
        actions={
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              setSeleccionado(null);
              setModalForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo usuario
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2 items-end bg-muted p-4 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar nombre, usuario o email..."
            value={filtros.q}
            onChange={(e) => setFiltros((f) => ({ ...f, q: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
          />
        </div>
        <Select
          value={filtros.rol || 'all'}
          onValueChange={(v) => setFiltros((f) => ({ ...f, rol: v === 'all' ? '' : v, page: 1 }))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            {Object.values(ROLES).map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_NAMES[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filtros.activo}
          onValueChange={(v) => setFiltros((f) => ({ ...f, activo: v, page: 1 }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="1">Activos</SelectItem>
            <SelectItem value="0">Inactivos</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={buscar}>
          Buscar
        </Button>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
          {error}
        </p>
      )}

      <div className="border rounded-lg bg-card overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-muted-foreground">Cargando...</p>
        ) : (
          <UsuariosTable
            usuarios={usuarios}
            onEditar={(u) => { setSeleccionado(u); setModalForm(true); }}
            onResetPassword={(u) => { setSeleccionado(u); setModalReset(true); }}
            onToggleActivo={(u) => setConfirmToggle(u)}
          />
        )}
      </div>

      {pagination?.totalPages > 1 && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} usuarios)
          </span>
          <div className="space-x-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => setFiltros((f) => ({ ...f, page: f.page - 1 }))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFiltros((f) => ({ ...f, page: f.page + 1 }))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <UsuarioFormModal
        open={modalForm}
        onOpenChange={setModalForm}
        usuario={seleccionado}
        isSubmitting={isMutating}
        onSubmit={seleccionado?.id ? handleEditar : handleCrear}
      />

      <ResetPasswordDialog
        open={modalReset}
        onOpenChange={setModalReset}
        usuario={seleccionado}
        isSubmitting={isMutating}
        onSubmit={handleReset}
      />

      <AlertDialog open={Boolean(confirmToggle)} onOpenChange={() => setConfirmToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmToggle?.activo ? 'Desactivar usuario' : 'Activar usuario'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmToggle?.activo
                ? `${confirmToggle.nombre} no podrá iniciar sesión hasta que se reactive la cuenta.`
                : `Se reactivará la cuenta de ${confirmToggle?.nombre}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-green-600 hover:bg-green-700 text-white" onClick={confirmarToggle}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
