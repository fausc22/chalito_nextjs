import { Pencil, KeyRound, UserX, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ROLE_NAMES } from '@/config/api';

const rolBadgeClass = (rol) => {
  const map = {
    ADMIN: 'bg-purple-100 text-purple-800',
    GERENTE: 'bg-blue-100 text-blue-800',
    CAJERO: 'bg-emerald-100 text-emerald-800',
    COCINA: 'bg-orange-100 text-orange-800',
  };
  return map[rol] || 'bg-muted text-foreground';
};

const getEstadoBadgeClass = (activo) =>
  activo
    ? 'bg-green-100 text-green-800 border-green-200 pointer-events-none'
    : 'bg-red-100 text-red-800 border-red-200 pointer-events-none';

export function UsuariosTable({ usuarios, onEditar, onResetPassword, onToggleActivo }) {
  if (!usuarios?.length) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No hay usuarios para mostrar.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Última conexión</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((u) => (
          <TableRow key={u.id}>
            <TableCell className="font-medium">{u.nombre}</TableCell>
            <TableCell>{u.usuario}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>
              <Badge className={rolBadgeClass(u.rol)}>{ROLE_NAMES[u.rol] || u.rol}</Badge>
            </TableCell>
            <TableCell>
              <Badge className={getEstadoBadgeClass(u.activo)}>
                {u.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {u.ultima_conexion
                ? new Date(u.ultima_conexion).toLocaleString('es-AR')
                : '—'}
            </TableCell>
            <TableCell className="text-right space-x-1">
              <Button type="button" size="sm" variant="outline" onClick={() => onEditar(u)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => onResetPassword(u)}>
                <KeyRound className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant={u.activo ? 'destructive' : 'default'}
                onClick={() => onToggleActivo(u)}
              >
                {u.activo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
