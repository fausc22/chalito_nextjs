import { Pencil, Trash2, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Componente de tarjeta para mostrar una categoría individual
 */
export const CategoriaCard = ({ categoria, onEditar, onEliminar }) => {
  const estaActiva = categoria.activo === 1 || categoria.activo === "1" || categoria.activo === true;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      <CardHeader className="pb-3 flex-grow">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Tag className="h-5 w-5 text-primary flex-shrink-0" />
            <CardTitle className="text-lg break-words overflow-hidden">{categoria.nombre}</CardTitle>
          </div>
          <Badge
            variant={estaActiva ? 'default' : 'secondary'}
            className={`flex-shrink-0 pointer-events-none ${
              estaActiva
                ? 'bg-green-100 text-green-800 border-green-200'
                : 'bg-red-100 text-red-800 border-red-200'
            }`}
          >
            {estaActiva ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>
        {categoria.descripcion && (
          <CardDescription className="mt-2 break-words overflow-hidden">
            {categoria.descripcion}
          </CardDescription>
        )}
      </CardHeader>

      <CardFooter className="gap-2 pt-3 border-t mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEditar(categoria)}
          className="flex-1"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEliminar(categoria)}
          className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  );
};
