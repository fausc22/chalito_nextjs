import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROLES, ROLE_NAMES } from '@/config/api';

const EMPTY = {
  nombre: '',
  email: '',
  usuario: '',
  password: '',
  rol: ROLES.CAJERO,
};

export function UsuarioFormModal({ open, onOpenChange, usuario, onSubmit, isSubmitting }) {
  const isEdit = Boolean(usuario?.id);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) {
      if (usuario) {
        setForm({
          nombre: usuario.nombre || '',
          email: usuario.email || '',
          usuario: usuario.usuario || '',
          password: '',
          rol: usuario.rol || ROLES.CAJERO,
        });
      } else {
        setForm(EMPTY);
      }
    }
  }, [open, usuario]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      usuario: form.usuario.trim(),
      rol: form.rol,
    };
    if (!isEdit) {
      payload.password = form.password;
    }
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="usuario">Usuario (login)</Label>
            <Input
              id="usuario"
              value={form.usuario}
              onChange={(e) => handleChange('usuario', e.target.value)}
              required
            />
          </div>
          {!isEdit && (
            <div>
              <Label htmlFor="password">Contraseña inicial</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                minLength={6}
              />
            </div>
          )}
          <div>
            <Label>Rol</Label>
            <Select value={form.rol} onValueChange={(v) => handleChange('rol', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ROLES).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_NAMES[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
