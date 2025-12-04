import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Componente de filtros para la página de artículos
 */
export const ArticulosFilters = ({
  filtros,
  categorias = [],
  onFiltroChange,
  onLimpiarFiltros,
}) => {
  const tiposArticulo = ['ELABORADO', 'BEBIDA', 'OTRO'];

  return (
    <Card className="mb-6">
      <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 items-center lg:items-end">
          {/* Input de búsqueda */}
          <div className="flex-1 w-full lg:min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-2.5 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre..."
                value={filtros.busqueda || ''}
                onChange={(e) => onFiltroChange('busqueda', e.target.value)}
                className="pl-7 sm:pl-9 text-sm h-9 sm:h-10"
              />
            </div>
          </div>

          {/* Select de categoría */}
          <div className="w-full lg:w-[180px]">
            <Select
              value={filtros.categoria || 'todas'}
              onValueChange={(value) => onFiltroChange('categoria', value === 'todas' ? '' : value)}
            >
              <SelectTrigger className="h-9 sm:h-10 text-sm">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias.map(categoria => (
                  <SelectItem key={categoria.id || categoria.nombre} value={categoria.nombre}>
                    {categoria.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select de tipo */}
          <div className="w-full lg:w-[160px]">
            <Select
              value={filtros.tipo || 'todos'}
              onValueChange={(value) => onFiltroChange('tipo', value === 'todos' ? '' : value)}
            >
              <SelectTrigger className="h-9 sm:h-10 text-sm">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {tiposArticulo.map(tipo => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Checkbox Mostrar Inactivos */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 h-9 sm:h-10 px-2 sm:px-3 self-end">
            <Checkbox
              id="mostrarInactivos"
              checked={filtros.mostrarInactivos || false}
              onCheckedChange={(checked) => onFiltroChange('mostrarInactivos', checked)}
              className="h-4 w-4"
            />
            <label
              htmlFor="mostrarInactivos"
              className="text-xs sm:text-sm font-medium leading-none cursor-pointer whitespace-nowrap"
            >
              Mostrar Inactivos
            </label>
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