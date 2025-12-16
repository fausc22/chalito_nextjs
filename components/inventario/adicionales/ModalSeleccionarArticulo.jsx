import { useState, useEffect } from 'react';
import { Search, Package, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { articulosService } from '../../../services/articulosService';
import { toast } from '@/hooks/use-toast';

export function ModalSeleccionarArticulo({
  isOpen,
  onClose,
  onArticuloSeleccionado
}) {
  const [articulos, setArticulos] = useState([]);
  const [articulosFiltrados, setArticulosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);

  // Cargar artículos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarArticulos();
    } else {
      // Limpiar al cerrar
      setBusqueda('');
      setArticuloSeleccionado(null);
      setArticulosFiltrados([]);
    }
  }, [isOpen]);

  // Filtrar artículos cuando cambia la búsqueda
  useEffect(() => {
    if (busqueda.trim() === '') {
      setArticulosFiltrados(articulos);
    } else {
      const filtrados = articulos.filter(articulo =>
        articulo.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
      setArticulosFiltrados(filtrados);
    }
  }, [busqueda, articulos]);

  const cargarArticulos = async () => {
    setLoading(true);
    try {
      const response = await articulosService.obtenerArticulos({ disponible: true });
      if (response.success && Array.isArray(response.data)) {
        // Filtrar solo artículos elaborados
        const elaborados = response.data.filter(a => a.tipo === 'ELABORADO');
        setArticulos(elaborados);
        setArticulosFiltrados(elaborados);
      } else {
        setArticulos([]);
        setArticulosFiltrados([]);
      }
    } catch (error) {
      console.error('Error al cargar artículos:', error);
      toast.error('Error al cargar artículos');
      setArticulos([]);
      setArticulosFiltrados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarArticulo = (articulo) => {
    setArticuloSeleccionado(articulo);
  };

  const handleContinuar = () => {
    if (articuloSeleccionado) {
      onArticuloSeleccionado(articuloSeleccionado);
      onClose();
    } else {
      toast.error('Por favor selecciona un artículo');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Seleccionar Artículo Elaborado
          </DialogTitle>
          <DialogDescription className="sr-only">
            Busca y selecciona el artículo al que quieres asignar adicionales
          </DialogDescription>
        </DialogHeader>

        {/* Búsqueda */}
        <div className="flex-shrink-0 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar artículo por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Lista de artículos */}
        {loading ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Cargando artículos...</p>
            </div>
          </div>
        ) : articulosFiltrados.length === 0 ? (
          <div className="text-center py-12 flex-1">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {busqueda.trim() !== ''
                ? 'No se encontraron artículos con ese nombre'
                : 'No hay artículos elaborados disponibles'}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2">
            {articulosFiltrados.map((articulo) => {
              const estaSeleccionado = articuloSeleccionado?.id === articulo.id;
              
              return (
                <Card
                  key={articulo.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    estaSeleccionado ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                  }`}
                  onClick={() => handleSeleccionarArticulo(articulo)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base">{articulo.nombre}</h3>
                          {estaSeleccionado && (
                            <Badge className="bg-blue-600 text-white">
                              <Check className="h-3 w-3 mr-1" />
                              Seleccionado
                            </Badge>
                          )}
                        </div>
                        {articulo.descripcion && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {articulo.descripcion}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-muted-foreground">
                            Precio: <span className="font-semibold text-green-600">${parseFloat(articulo.precio || 0).toFixed(2)}</span>
                          </span>
                          {articulo.categoria && (
                            <span className="text-muted-foreground">
                              Categoría: <span className="font-medium">{articulo.categoria}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <DialogFooter className="gap-2 flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="h-11 px-6">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleContinuar}
            disabled={!articuloSeleccionado || loading}
            className="bg-green-600 hover:bg-green-700 gap-2 h-11 px-6"
          >
            <Check className="h-4 w-4" />
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

