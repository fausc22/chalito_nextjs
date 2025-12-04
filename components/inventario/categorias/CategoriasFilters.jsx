import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export const CategoriasFilters = ({ filtros, onFiltroChange, onLimpiarFiltros }) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  // Contar filtros activos
  const filtrosActivos = Object.entries(filtros).filter(([key, value]) => {
    if (key === 'busqueda') return value !== '';
    if (key === 'activo') return value !== 'todos';
    return false;
  }).length;

  const handleMostrarInactivos = (checked) => {
    onFiltroChange({ activo: checked ? 'todos' : 'activo' });
  };

  const mostrarInactivos = filtros.activo === 'todos' || filtros.activo === 'inactivo';

  return (
    <div className="space-y-4">
      {/* Botón toggle de filtros */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {filtrosActivos > 0 && (
            <Badge variant="secondary" className="ml-1">
              {filtrosActivos}
            </Badge>
          )}
        </Button>
      </div>

      {/* Panel de filtros */}
      {mostrarFiltros && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="busqueda" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar por nombre
              </Label>
              <Input
                id="busqueda"
                type="text"
                placeholder="Buscar categoría..."
                value={filtros.busqueda}
                onChange={(e) => onFiltroChange({ busqueda: e.target.value })}
              />
            </div>

            {/* Checkbox mostrar inactivos */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mostrarInactivos"
                checked={mostrarInactivos}
                onCheckedChange={handleMostrarInactivos}
              />
              <Label htmlFor="mostrarInactivos" className="cursor-pointer">
                Mostrar categorías inactivas
              </Label>
            </div>

            {/* Botón limpiar filtros */}
            <Button
              variant="outline"
              onClick={onLimpiarFiltros}
              className="w-full gap-2"
              disabled={filtrosActivos === 0}
            >
              <X className="h-4 w-4" />
              Limpiar Filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
