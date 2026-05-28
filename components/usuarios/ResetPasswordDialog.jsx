import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ResetPasswordDialog({ open, onOpenChange, usuario, onSubmit, isSubmitting }) {
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      password_nueva: passwordNueva,
      confirmar_password: confirmar,
    });
  };

  const handleOpenChange = (v) => {
    if (!v) {
      setPasswordNueva('');
      setConfirmar('');
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restablecer contraseña</DialogTitle>
          <DialogDescription>
            Nueva contraseña para <strong>{usuario?.nombre}</strong> ({usuario?.usuario})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pw">Nueva contraseña</Label>
            <Input
              id="pw"
              type="password"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <Label htmlFor="pw2">Confirmar contraseña</Label>
            <Input
              id="pw2"
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Restablecer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
