import { Edit, Trash2, Leaf, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function IngredientesCard({ ingrediente, onEditar, onEliminar }) {
  return (
    <Card className="hover:shadow-lg transition-all h-full flex flex-col">
      <CardContent className="p-4 flex-grow">
        <div className="space-y-3">
          {/* Header con nombre y estado */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="h-4 w-4 text-green-500" />
                <h3 className="font-semibold text-base">{ingrediente.nombre}</h3>
              </div>
            </div>
            <Badge
              className={
                ingrediente.disponible === 1
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }
            >
              {ingrediente.disponible === 1 ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>

          {/* Descripción */}
          {ingrediente.descripcion && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {ingrediente.descripcion}
            </p>
          )}

          {/* Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Precio Extra</span>
              </div>
              <span className="font-semibold text-sm">
                ${parseFloat(ingrediente.precio_extra || 0).toFixed(2)}
              </span>
            </div>

            {ingrediente.usado_en_articulos !== undefined && (
              <div className="text-xs text-muted-foreground text-center p-2 bg-muted/30 rounded-md">
                Usado en {ingrediente.usado_en_articulos} artículo(s)
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Botones de acción */}
      <CardFooter className="gap-2 pt-3 border-t mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEditar(ingrediente)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-destructive hover:text-destructive"
          onClick={() => onEliminar(ingrediente)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  );
}
