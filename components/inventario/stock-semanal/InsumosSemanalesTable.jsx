import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { isInsumoSemanalActivo } from './insumosSemanalesUtils';

export function InsumosSemanalesTable({
  insumos,
  onEditar,
  onEliminar,
}) {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <Table className="bg-white rounded-lg overflow-hidden shadow-sm">
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-b-2 border-gray-200 py-3 px-2">
              Nombre
            </TableHead>
            <TableHead className="text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-b-2 border-gray-200 py-3 px-2">
              Descripción
            </TableHead>
            <TableHead className="w-[120px] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-b-2 border-gray-200 py-3 px-2">
              Estado
            </TableHead>
            <TableHead className="w-[160px] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-b-2 border-gray-200 py-3 px-2">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {insumos.map((insumo, index) => {
            const activo = isInsumoSemanalActivo(insumo);
            return (
              <TableRow
                key={insumo.id}
                className={`border-b border-gray-200 transition-colors hover:bg-blue-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <TableCell className="font-medium text-center py-2 px-2 align-top">
                  <div className="break-words">{insumo.nombre}</div>
                </TableCell>
                <TableCell className="text-center py-2 px-2 align-top">
                  <div className="break-words text-sm text-muted-foreground line-clamp-3">
                    {insumo.descripcion?.trim() ? insumo.descripcion : '—'}
                  </div>
                </TableCell>
                <TableCell className="text-center py-2 px-2 align-middle">
                  <Badge
                    className={
                      activo
                        ? 'bg-green-100 text-green-800 border-green-200 pointer-events-none'
                        : 'bg-red-100 text-red-800 border-red-200 pointer-events-none'
                    }
                  >
                    {activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center py-2 px-2 align-middle">
                  <div className="flex gap-2 justify-center items-center whitespace-nowrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onEditar(insumo)}
                      title="Editar"
                      className="hover:scale-110 hover:bg-blue-50 hover:border-blue-300 transition-all"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onEliminar(insumo)}
                      title="Eliminar"
                      className="text-destructive hover:bg-red-50 hover:border-red-300 hover:scale-110 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
