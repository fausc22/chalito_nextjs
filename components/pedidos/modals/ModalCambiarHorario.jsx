import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
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
import { pedidosService, buildHorarioEntregaIso } from '@/services/pedidosService';
import { toast } from '@/hooks/use-toast';

export function ModalCambiarHorario({ pedido, isOpen, onClose, onSuccess }) {
  const [hora, setHora] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !pedido) return;
    const raw = pedido.horaProgramada || pedido.horario_entrega_formateado;
    if (typeof raw === 'string' && /^\d{2}:\d{2}$/.test(raw)) {
      setHora(raw);
      return;
    }
    if (pedido.horaProgramada) {
      setHora(pedido.horaProgramada);
      return;
    }
    setHora('');
  }, [isOpen, pedido]);

  const handleCuantoAntes = async () => {
    if (!pedido?.id) return;
    setLoading(true);
    try {
      const result = await pedidosService.actualizarHorarioEntrega(pedido.id, null);
      if (!result.success) {
        toast.error(result.error || 'No se pudo actualizar el pedido');
        return;
      }
      toast.success('Pedido actualizado a "cuanto antes"');
      onSuccess?.(result.data);
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!pedido?.id) return;
    if (!hora) {
      toast.error('Indicá una hora');
      return;
    }
    const iso = buildHorarioEntregaIso(hora);
    if (!iso) {
      toast.error('Hora inválida');
      return;
    }
    setLoading(true);
    try {
      const result = await pedidosService.actualizarHorarioEntrega(pedido.id, iso);
      if (!result.success) {
        toast.error(result.error || 'No se pudo actualizar el horario');
        return;
      }
      toast.success('Horario actualizado');
      onSuccess?.(result.data);
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cambiar horario · Pedido #{pedido?.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="hora-programada">Nueva hora de entrega</Label>
            <Input
              id="hora-programada"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="mt-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Si la hora ya pasó hoy, se programará para mañana a esa hora.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={handleCuantoAntes} disabled={loading}>
            Cuanto antes
          </Button>
          <Button type="button" variant="outline" onClick={() => onClose?.()} disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleGuardar} disabled={loading}>
            Guardar horario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
