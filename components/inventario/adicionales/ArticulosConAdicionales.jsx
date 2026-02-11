import { useState, useEffect } from 'react';
import { Edit, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { articulosService } from '../../../services/articulosService';
import { toast } from '@/hooks/use-toast';

export function ArticulosConAdicionales({
  onObtenerAdicionalesPorArticulo,
  onAsignarAdicionalesAArticulo,
  onEditarArticulo,
  onRefrescar
}) {
  const [articulosConAdicionales, setArticulosConAdicionales] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarArticulosConAdicionales = async () => {
    setLoading(true);
    try {
      // Obtener todos los artículos elaborados
      const response = await articulosService.obtenerArticulos({ disponible: true });
      
      if (response.success && Array.isArray(response.data)) {
        // Filtrar solo artículos elaborados
        const articulosElaborados = response.data.filter(a => a.tipo === 'ELABORADO');
        
        // Para cada artículo, verificar si tiene adicionales
        const articulosConExtras = await Promise.all(
          articulosElaborados.map(async (articulo) => {
            const adicionalesResponse = await onObtenerAdicionalesPorArticulo(articulo.id);
            if (adicionalesResponse.success && adicionalesResponse.data && adicionalesResponse.data.length > 0) {
              return {
                ...articulo,
                adicionales: adicionalesResponse.data
              };
            }
            return null;
          })
        );

        // Filtrar solo los que tienen adicionales
        const articulosFiltrados = articulosConExtras.filter(a => a !== null);
        setArticulosConAdicionales(articulosFiltrados);
      } else {
        setArticulosConAdicionales([]);
      }
    } catch (error) {
      console.error('Error al cargar artículos con adicionales:', error);
      toast.error('Error al cargar artículos con adicionales');
      setArticulosConAdicionales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarArticulosConAdicionales();
  }, []);

  const handleEditar = (articulo) => {
    if (onEditarArticulo) {
      onEditarArticulo(articulo);
    }
  };

  // Escuchar eventos de actualización
  useEffect(() => {
    const handleActualizacion = () => {
      cargarArticulosConAdicionales();
    };
    
    window.addEventListener('adicionalesActualizados', handleActualizacion);
    return () => {
      window.removeEventListener('adicionalesActualizados', handleActualizacion);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Cargando artículos...</p>
        </div>
      </div>
    );
  }

  if (articulosConAdicionales.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          No hay artículos con adicionales asignados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articulosConAdicionales.map((articulo) => (
        <Card key={articulo.id} className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-base text-slate-800">{articulo.nombre}</h3>
                  <Badge variant="outline" className="text-xs">
                    {articulo.adicionales.length} adicional{articulo.adicionales.length !== 1 ? 'es' : ''}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {articulo.adicionales.map((adicional) => (
                    <Badge
                      key={adicional.id || adicional.adicional_id}
                      className="bg-blue-100 text-blue-800 border-blue-200"
                    >
                      {adicional.nombre || adicional.adicional_nombre}
                      {adicional.precio_extra && (
                        <span className="ml-1">(+${parseFloat(adicional.precio_extra || 0).toFixed(2)})</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditar(articulo)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

