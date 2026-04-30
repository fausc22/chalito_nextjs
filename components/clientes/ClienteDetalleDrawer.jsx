import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clientesService } from '@/services/clientesService';

export function ClienteDetalleDrawer({ isOpen, onClose, clienteId, onClienteUpdated }) {
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!isOpen || !clienteId) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const result = await clientesService.obtenerPorId(clienteId);
      if (!mounted) return;
      if (result.success) {
        setDetalle(result.data);
        setNombre(result.data?.cliente?.nombre || '');
        setEmail(result.data?.cliente?.email || '');
      } else {
        setDetalle(null);
      }
      setLoading(false);
    };

    load();
    return () => {
      mounted = false;
    };
  }, [isOpen, clienteId]);

  const handleGuardar = async () => {
    if (!clienteId) return;
    const result = await clientesService.actualizar(clienteId, { nombre, email });
    if (result.success) {
      onClienteUpdated?.();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalle de cliente</SheetTitle>
        </SheetHeader>

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
        ) : detalle?.cliente ? (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <p className="text-sm"><b>Teléfono:</b> {detalle.cliente.telefono}</p>

            <div>
              <h4 className="font-semibold mb-2">Direcciones</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {(detalle.direcciones || []).map((d) => (
                  <li key={d.id}>{d.direccion}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Últimos pedidos</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {(detalle.pedidos || []).map((p) => (
                  <li key={p.id}>#{p.id} - {p.estado} - ${Number(p.total || 0).toLocaleString('es-AR')}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Últimas ventas</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {(detalle.ventas || []).map((v) => (
                  <li key={v.id}>#{v.id} - {v.estado} - ${Number(v.total || 0).toLocaleString('es-AR')}</li>
                ))}
              </ul>
            </div>

            <Button onClick={handleGuardar}>Guardar cambios</Button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No se encontró el cliente.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default ClienteDetalleDrawer;
