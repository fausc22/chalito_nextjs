import { useState } from 'react';
import { BsSearch, BsFilter, BsX } from 'react-icons/bs';
import { Button } from '../common/Button';
import { Input, Select } from '../common/Input';
import { Card } from '../common/Card';

/**
 * Componente de filtros para la página de artículos
 */
export const ArticulosFilters = ({
  filtros,
  categorias = [],
  onFiltroChange,
  onLimpiarFiltros,
}) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const hasActiveFilters = 
    filtros.busqueda || 
    filtros.categoria || 
    filtros.disponible !== 'todos' || 
    filtros.precioMin || 
    filtros.precioMax;

  return (
    <Card className="mb-8">
      <div className="flex flex-col gap-4">
        {/* Barra principal de búsqueda */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Input de búsqueda */}
          <Input
            icon={<BsSearch />}
            type="text"
            placeholder="Buscar por nombre o código..."
            value={filtros.busqueda || ''}
            onChange={(e) => onFiltroChange('busqueda', e.target.value)}
            fullWidth
          />

          {/* Botones de control */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant={mostrarFiltros ? 'primary' : 'outline'}
              icon={<BsFilter />}
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              Filtros
            </Button>

            {hasActiveFilters && (
              <Button
                variant="danger"
                icon={<BsX />}
                onClick={onLimpiarFiltros}
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {mostrarFiltros && (
          <div className="pt-6 border-t border-gray-200 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro de categoría */}
              <Select
                label="Categoría"
                value={filtros.categoria || ''}
                onChange={(e) => onFiltroChange('categoria', e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </Select>

              {/* Filtro de disponibilidad */}
              <Select
                label="Disponibilidad"
                value={filtros.disponible || 'todos'}
                onChange={(e) => onFiltroChange('disponible', e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="disponible">Disponibles</option>
                <option value="no_disponible">No disponibles</option>
              </Select>

              {/* Rango de precio */}
              <div>
                <label className="label">Rango de precio</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filtros.precioMin || ''}
                    onChange={(e) => onFiltroChange('precioMin', e.target.value)}
                    className="input flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filtros.precioMax || ''}
                    onChange={(e) => onFiltroChange('precioMax', e.target.value)}
                    className="input flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};


