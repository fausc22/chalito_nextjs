import { AlertTriangle } from 'lucide-react';
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

const formatTime = (date) => {
  if (!date) return '--:--';
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

export function CancelarFichajeDialog({
  isOpen,
  onClose,
  empleado,
  onConfirm,
  isSubmitting,
}) {
  const asistencia = empleado?.asistenciaActual || null;
  const nombre = empleado?.nombre || asistencia?.empleadoNombre || 'este empleado';

  const handleOpenChange = (open) => {
    if (!open && !isSubmitting) onClose();
  };

  const handleConfirm = (event) => {
    event.preventDefault();
    onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancelar fichaje
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Se va a cancelar el ingreso de <span className="font-medium text-foreground">{nombre}</span>
                {asistencia?.ingreso ? ` de las ${formatTime(asistencia.ingreso)}` : ''}.
                El empleado quedará sin turno abierto.
              </p>
              <p className="text-sm font-medium text-destructive">
                Esta acción no se puede deshacer.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Volver</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSubmitting ? 'Cancelando...' : 'Cancelar fichaje'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
