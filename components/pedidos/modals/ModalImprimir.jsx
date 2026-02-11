import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, FileText, Receipt } from 'lucide-react';
import { pedidosService } from '@/services/pedidosService';
import { toast } from '@/hooks/use-toast';
import { imprimirComanda } from '@/lib/printUtils';
import { imprimirTicket } from '@/lib/printUtils';

export function ModalImprimir({ pedido, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);

  if (!pedido) return null;

  const handleImprimirComanda = async () => {
    setLoading(true);
    try {
      const response = await pedidosService.obtenerComandaParaImprimir(pedido.id);
      
      if (response.success) {
        imprimirComanda(response.data);
        onClose();
      } else {
        toast.error('Error al imprimir comanda', {
          description: response.error || 'No se pudo obtener los datos de la comanda'
        });
      }
    } catch (error) {
      console.error('Error al imprimir comanda:', error);
      toast.error('Error al imprimir comanda', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImprimirTicket = async () => {
    // Validar que el pedido esté cobrado
    if (pedido.paymentStatus !== 'paid') {
      toast.error('No se puede imprimir el ticket', {
        description: 'El pedido debe estar cobrado para imprimir el ticket/factura'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await pedidosService.obtenerTicketParaImprimir(pedido.id);
      
      if (response.success) {
        imprimirTicket(response.data);
        onClose();
      } else {
        toast.error('Error al imprimir ticket', {
          description: response.error || 'No se pudo obtener los datos del ticket'
        });
      }
    } catch (error) {
      console.error('Error al imprimir ticket:', error);
      toast.error('Error al imprimir ticket', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Imprimir Pedido #{pedido.id}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          {/* Opción: Imprimir Comanda */}
          <Button
            onClick={handleImprimirComanda}
            disabled={loading}
            className="w-full justify-start gap-3 h-auto py-4"
            variant="outline"
          >
            <Printer className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Imprimir Comanda</span>
            </div>
          </Button>

          {/* Opción: Imprimir Ticket/Factura */}
          <Button
            onClick={handleImprimirTicket}
            disabled={loading || pedido.paymentStatus !== 'paid'}
            className="w-full justify-start gap-3 h-auto py-4"
            variant="outline"
          >
            <Receipt className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Imprimir Ticket / Factura</span>
              <span className="text-xs text-slate-500">
                {pedido.paymentStatus === 'paid' 
                  ? 'Solo disponible si está cobrado' 
                  : 'El pedido debe estar cobrado'}
              </span>
            </div>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

