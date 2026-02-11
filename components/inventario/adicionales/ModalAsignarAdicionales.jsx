import { useState, useEffect } from 'react';
import { Package, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { adicionalesService } from '../../../services/adicionalesService';
import { toast } from '@/hooks/use-toast';

export function ModalAsignarAdicionales({
  isOpen,
  onClose,
  articulo,
  onObtenerAdicionalesPorArticulo,
  onAsignarAdicionalesAArticulo
}) {
  const [adicionalesDisponibles, setAdicionalesDisponibles] = useState([]);
  const [adicionalesAsignados, setAdicionalesAsignados] = useState([]);
  const [adicionalesSeleccionados, setAdicionalesSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGuardar, setLoadingGuardar] = useState(false);

  // Cargar adicionales disponibles y los asignados al artículo
  useEffect(() => {
    if (isOpen && articulo) {
      cargarDatos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, articulo]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar todos los adicionales disponibles
      const responseDisponibles = await adicionalesService.obtenerAdicionalesActivos();
      if (responseDisponibles.success) {
        setAdicionalesDisponibles(responseDisponibles.data || []);
      }

      // Cargar adicionales ya asignados a este artículo
      const responseAsignados = await onObtenerAdicionalesPorArticulo(articulo.id);
      if (responseAsignados.success) {
        const idsAsignados = (responseAsignados.data || []).map(a => a.id || a.adicional_id);
        setAdicionalesAsignados(idsAsignados);
        setAdicionalesSeleccionados(idsAsignados);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los adicionales');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdicional = (adicionalId) => {
    setAdicionalesSeleccionados(prev => {
      if (prev.includes(adicionalId)) {
        return prev.filter(id => id !== adicionalId);
      } else {
        return [...prev, adicionalId];
      }
    });
  };

  const handleGuardar = async () => {
    setLoadingGuardar(true);
    try {
      const resultado = await onAsignarAdicionalesAArticulo(articulo.id, adicionalesSeleccionados);
      
      if (resultado.success) {
        toast.success('Adicionales asignados correctamente');
        // Trigger a custom event para refrescar
        window.dispatchEvent(new CustomEvent('adicionalesActualizados'));
        onClose();
      } else {
        toast.error(resultado.error || 'Error al asignar adicionales');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar los cambios');
    } finally {
      setLoadingGuardar(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Asignar Adicionales a Artículo
          </DialogTitle>
          <DialogDescription className="sr-only">
            Selecciona los adicionales que estarán disponibles para: {articulo?.nombre}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Cargando adicionales...</p>
            </div>
          </div>
        ) : adicionalesDisponibles.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay adicionales disponibles. Crea algunos desde el tab de Adicionales.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 py-4">
            {adicionalesDisponibles.map((adicional) => {
              const estaSeleccionado = adicionalesSeleccionados.includes(adicional.id);
              const estabaAsignado = adicionalesAsignados.includes(adicional.id);
              
              return (
                <Card
                  key={adicional.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    estaSeleccionado ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                  }`}
                  onClick={() => toggleAdicional(adicional.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={estaSeleccionado}
                        onCheckedChange={() => toggleAdicional(adicional.id)}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <Label className="font-semibold text-base cursor-pointer">
                            {adicional.nombre}
                          </Label>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            ${parseFloat(adicional.precio_extra || 0).toFixed(2)}
                          </Badge>
                        </div>
                        {adicional.descripcion && (
                          <p className="text-sm text-muted-foreground">
                            {adicional.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <DialogFooter className="gap-2 flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loadingGuardar} className="h-11 px-6">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            disabled={loadingGuardar || loading}
            className="bg-green-600 hover:bg-green-700 gap-2 h-11 px-6"
          >
            {loadingGuardar ? (
              'Guardando...'
            ) : (
              <>
                <Check className="h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

