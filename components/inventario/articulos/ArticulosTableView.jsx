import Image from 'next/image';
import { Pencil, Trash2, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * 🖥️ Vista de TABLA para Desktop
 * 
 * Responsabilidad: Solo renderizado visual de tabla
 * Lógica de negocio: Manejada por el contenedor padre
 */
export function ArticulosTableView({ 
  articulos, 
  onEditar, 
  onEliminar,
  getTipoBadgeClass,
  getEstadoBadgeClass 
}) {
  return (
    <div className="overflow-x-auto">
      <Table className="bg-white rounded-lg overflow-hidden shadow-sm">
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[100px] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-l-2 border-r-2 border-b-2 border-gray-200 py-3">
              Imagen
            </TableHead>
            <TableHead className="w-[200px] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-3">
              Nombre
            </TableHead>
            <TableHead className="w-[250px] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-3">
              Descripción
            </TableHead>
            <TableHead className="w-[150px] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-3">
              Categoría
            </TableHead>
            <TableHead className="w-[120px] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-3">
              Tipo
            </TableHead>
            <TableHead className="w-[100px] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-3">
              Precio
            </TableHead>
            <TableHead className="w-[100px] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-3">
              Stock
            </TableHead>
            <TableHead className="w-[100px] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-3">
              Estado
            </TableHead>
            <TableHead className="w-[150px] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-3">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articulos.map((articulo, index) => (
            <TableRow
              key={articulo.id}
              className={`border-b border-gray-200 transition-colors hover:bg-blue-50 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              {/* Imagen */}
              <TableCell className="text-center py-3">
                <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 mx-auto shadow-sm">
                  {articulo.imagen_url ? (
                    <Image
                      src={articulo.imagen_url}
                      alt={articulo.nombre}
                      fill
                      className="object-contain p-1"
                      sizes="80px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Utensils className="h-6 w-6 lg:h-8 lg:w-8 text-slate-400" />
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Nombre */}
              <TableCell className="font-medium max-w-[300px] text-center py-3">
                <div className="break-words uppercase">{articulo.nombre}</div>
              </TableCell>

              {/* Descripción */}
              <TableCell className="max-w-xs text-center py-3">
                <div className="break-words text-sm text-muted-foreground line-clamp-2">
                  {articulo.descripcion || 'Sin descripción'}
                </div>
              </TableCell>

              {/* Categoría */}
              <TableCell className="max-w-[150px] text-center py-3">
                <div className="flex justify-center">
                  <Badge variant="outline" className="max-w-full truncate">
                    {articulo.categoria}
                  </Badge>
                </div>
              </TableCell>

              {/* Tipo */}
              <TableCell className="text-center py-3">
                <Badge className={getTipoBadgeClass(articulo.tipo || 'OTRO')}>
                  {articulo.tipo || 'OTRO'}
                </Badge>
              </TableCell>

              {/* Precio */}
              <TableCell className="text-right py-3">
                <span className="font-semibold text-green-600">
                  ${articulo.precio}
                </span>
              </TableCell>

              {/* Stock */}
              <TableCell className="text-center py-3">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium">{articulo.stock_actual || 0}</span>
                  <span className="text-xs text-muted-foreground">
                    Min: {articulo.stock_minimo || 0}
                  </span>
                </div>
              </TableCell>

              {/* Estado */}
              <TableCell className="text-center py-3">
                <Badge className={getEstadoBadgeClass(articulo.activo)}>
                  {articulo.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>

              {/* Acciones */}
              <TableCell className="text-center py-3">
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditar(articulo)}
                    className="hover:bg-blue-50 hover:border-blue-500 text-xs"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEliminar(articulo)}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}



