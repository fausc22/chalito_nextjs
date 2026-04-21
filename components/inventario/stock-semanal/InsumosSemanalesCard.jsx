import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';
import { isInsumoSemanalActivo } from './insumosSemanalesUtils';

export function InsumosSemanalesCard({ insumo, onEditar, onEliminar }) {
  const activo = isInsumoSemanalActivo(insumo);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-tight">{insumo.nombre}</CardTitle>
          <Badge
            className={
              activo
                ? 'shrink-0 bg-green-100 text-green-800 border-green-200'
                : 'shrink-0 bg-red-100 text-red-800 border-red-200'
            }
          >
            {activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-4">
          {insumo.descripcion?.trim() ? insumo.descripcion : 'Sin descripción'}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t bg-slate-50/50 pt-3">
        <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => onEditar(insumo)}>
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1 text-destructive"
          onClick={() => onEliminar(insumo)}
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  );
}
