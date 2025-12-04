import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Componente de filtros para la página de ingredientes
 */
export const IngredientesFilters = ({
  filtros,
  onFiltroChange,
  onLimpiarFiltros,
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center sm:items-end">
          {/* Input de búsqueda */}
          <div className="flex-1 w-full sm:min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre..."
                value={filtros.nombre || ''}
                onChange={(e) => onFiltroChange('nombre', e.target.value)}
                className="pl-7 sm:pl-9 text-sm h-9 sm:h-10"
              />
            </div>
          </div>

          {/* Select de estado */}
          <div className="w-full sm:w-[180px]">
            <Select
              value={filtros.disponible || 'all'}
              onValueChange={(value) => onFiltroChange('disponible', value)}
            >
              <SelectTrigger className="h-9 sm:h-10 text-sm">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Solo Activos</SelectItem>
                <SelectItem value="inactive">Solo Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botón Limpiar Filtros */}
          <Button
            variant="outline"
            onClick={onLimpiarFiltros}
            className="w-auto h-10 text-sm px-4"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};