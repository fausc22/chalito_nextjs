import Image from 'next/image';
import { Edit, Trash2, Utensils, DollarSign, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ArticulosCard({ articulo, onEditar, onEliminar }) {
  return (
    <Card className="hover:shadow-lg transition-all min-w-0 h-full flex flex-col">
      <CardContent className="p-3 sm:p-4 flex-grow">
        <div className="space-y-3">
          {/* Imagen y Header */}
          <div className="flex gap-2 sm:gap-3">
            {/* Imagen del artículo */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {articulo.imagen ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}${articulo.imagen}`}
                  alt={articulo.nombre}
                  fill
                  className="object-cover"
                  sizes="80px"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Utensils className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Header con nombre y estado */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base break-words mb-1">{articulo.nombre}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {articulo.codigo_barra && (
                  <p className="text-xs text-muted-foreground">
                    Código: {articulo.codigo_barra}
                  </p>
                )}
                <Badge
                  className={`flex-shrink-0 text-xs ${
                    articulo.activo
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}
                >
                  {articulo.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {articulo.descripcion && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {articulo.descripcion}
            </p>
          )}

          {/* Info en grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm pt-3 border-t">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Precio</p>
                <p className="font-semibold">${parseFloat(articulo.precio).toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <Tag className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Categoría</p>
                <p className="font-medium text-xs truncate">
                  {articulo.categoria || 'Sin categoría'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <Utensils className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="font-medium text-xs truncate">{articulo.tipo}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <Utensils className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Stock</p>
                <p className="font-medium text-xs truncate">
                  {articulo.stock_actual} / {articulo.stock_minimo}
                </p>
              </div>
            </div>
          </div>

          {/* Stock bajo warning */}
          {articulo.stock_bajo === 1 && (
            <Badge variant="destructive" className="w-full justify-center">
              Stock Bajo
            </Badge>
          )}
        </div>
      </CardContent>

      {/* Botones de acción */}
      <CardFooter className="gap-1 sm:gap-2 pt-3 border-t mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 px-2 sm:px-3 text-xs sm:text-sm"
          onClick={() => onEditar(articulo)}
        >
          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="truncate">Editar</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 px-2 sm:px-3 text-xs sm:text-sm text-destructive hover:text-destructive"
          onClick={() => onEliminar(articulo)}
        >
          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="truncate">Eliminar</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
