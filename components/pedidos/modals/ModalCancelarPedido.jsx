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

export function ModalCancelarPedido({ pedido, isOpen, onClose, onConfirmar }) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar pedido?</AlertDialogTitle>
          <AlertDialogDescription>
            {pedido && (
              <>
                Estás por cancelar el pedido <strong>#{pedido.id}</strong> de <strong>{pedido.clienteNombre}</strong>.
                <br /><br />
                Esta acción eliminará el pedido del sistema. ¿Deseas continuar?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No, mantener pedido</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmar}
            className="bg-red-600 hover:bg-red-700"
          >
            Sí, cancelar pedido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}





















