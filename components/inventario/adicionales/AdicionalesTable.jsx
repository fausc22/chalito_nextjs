import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';

const permiteCantidadActivo = (adicional) =>
  Boolean(adicional?.permite_cantidad === 1 || adicional?.permite_cantidad === true);

export function AdicionalesTable({ adicionales, onEditar, onEliminar }) {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <div className="max-w-[960px] mx-auto">
        <Table className="bg-card rounded-lg overflow-hidden shadow-sm">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-[180px] text-center text-sm font-bold text-foreground uppercase tracking-wider border-l-2 border-r-2 border-b-2 border-border py-3 px-2">Nombre</TableHead>
              <TableHead className="w-[250px] text-center text-sm font-bold text-foreground uppercase tracking-wider border-r-2 border-b-2 border-border py-3 px-2">Descripción</TableHead>
              <TableHead className="w-[130px] text-center text-sm font-bold text-foreground uppercase tracking-wider border-r-2 border-b-2 border-border py-3 px-2">Precio Extra</TableHead>
              <TableHead className="w-[100px] text-center text-sm font-bold text-foreground uppercase tracking-wider border-r-2 border-b-2 border-border py-3 px-2">Estado</TableHead>
              <TableHead className="w-[120px] text-center text-sm font-bold text-foreground uppercase tracking-wider border-r-2 border-b-2 border-border py-3 px-2">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adicionales.map((adicional, index) => (
              <TableRow
                key={adicional.id}
                className={`border-b border-border transition-colors hover:bg-purple-50 ${
                  index % 2 === 0 ? 'bg-card' : 'bg-muted'
                }`}
              >
                <TableCell className="font-medium text-center py-2 px-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="break-words">{adicional.nombre}</div>
                    {permiteCantidadActivo(adicional) && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 pointer-events-none text-xs">
                        Cantidad
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center py-2 px-2">
                  <div className="break-words text-sm text-muted-foreground line-clamp-2">
                    {adicional.descripcion || '-'}
                  </div>
                </TableCell>
                <TableCell className="text-right py-2 px-2">
                  <span className="font-semibold text-green-600">
                    ${parseFloat(adicional.precio_extra || 0).toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-center py-2 px-2">
                  <Badge className={adicional.disponible === 1
                    ? 'bg-green-100 text-green-800 border-green-200 pointer-events-none'
                    : 'bg-red-100 text-red-800 border-red-200 pointer-events-none'
                  }>
                    {adicional.disponible === 1 ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center py-2 px-2">
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEditar(adicional)}
                      title="Editar"
                      className="hover:scale-110 hover:bg-purple-50 hover:border-purple-300 transition-all"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEliminar(adicional)}
                      title="Eliminar"
                      className="text-destructive hover:bg-destructive/10 hover:border-red-300 hover:scale-110 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}




















