import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Pencil, Trash2, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

/**
 * Componente de tabla para mostrar artículos con shadcn/ui
 */
export const ArticulosTable = ({
  articulos = [],
  onEditar,
  onEliminar,
  scrollRef,
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4); // Empezar con 4 (mobile-first)
  const tableRef = useRef(null);

  // Detectar tamaño de pantalla y actualizar items por página
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;

      let newItems;
      if (width < 768) {
        newItems = 4; // Mobile
      } else if (width < 1024) {
        newItems = 6; // Tablet
      } else {
        newItems = 8; // Desktop
      }

      setItemsPerPage(prev => {
        if (prev !== newItems) {
          setCurrentPage(1); // Reset to first page when items per page changes
          return newItems;
        }
        return prev;
      });
    };

    // Ejecutar inmediatamente en mount
    updateItemsPerPage();

    // Agregar listener para resize
    window.addEventListener('resize', updateItemsPerPage);

    return () => {
      window.removeEventListener('resize', updateItemsPerPage);
    };
  }, [itemsPerPage]);

  // Calculate pagination
  const totalPages = Math.ceil(articulos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticulos = articulos.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll suavemente hasta el inicio del contenedor principal
    scrollRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (articulos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No se encontraron artículos
          </h3>
          <p className="text-muted-foreground">
            Prueba ajustando los filtros o agrega un nuevo artículo
          </p>
        </CardContent>
      </Card>
    );
  }

  // Función helper para obtener el estilo del badge según el tipo
  const getTipoBadgeClass = (tipo) => {
    switch (tipo) {
      case 'ELABORADO':
        return 'bg-blue-100 text-blue-800 border-blue-200 pointer-events-none';
      case 'BEBIDA':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 pointer-events-none';
      case 'OTRO':
        return 'bg-purple-200 text-purple-900 border-purple-300 pointer-events-none';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 pointer-events-none';
    }
  };

  const getEstadoBadgeClass = (activo) => {
    return activo
      ? 'bg-green-100 text-green-800 border-green-200 pointer-events-none'
      : 'bg-red-100 text-red-800 border-red-200 pointer-events-none';
  };

  return (
    <div ref={tableRef}>
      {/* Vista Desktop - Tabla */}
      <div className="hidden lg:block overflow-x-auto mb-8">
        <Table className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[70px] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-l-2 border-r-2 border-b-2 border-gray-200 py-4">Imagen</TableHead>
              <TableHead className="text-center text-sm font-bold text-slate-800 uppercase tracking-wider max-w-[300px] min-w-[200px] border-r-2 border-b-2 border-gray-200 py-4">Nombre</TableHead>
              <TableHead className="text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-4">Descripción</TableHead>
              <TableHead className="text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-4">Categoría</TableHead>
              <TableHead className="text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-4">Tipo</TableHead>
              <TableHead className="text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-4">Precio</TableHead>
              <TableHead className="w-[80px] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-4">Stock</TableHead>
              <TableHead className="text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-4">Estado</TableHead>
              <TableHead className="text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-4">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentArticulos.map((articulo, index) => (
              <TableRow
                key={articulo.id}
                className={`border-b border-gray-200 transition-colors hover:bg-blue-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {/* Imagen */}
                <TableCell className="text-center py-3">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted mx-auto">
                    {articulo.imagen ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}${articulo.imagen}`}
                        alt={articulo.nombre}
                        fill
                        className="object-cover"
                        sizes="48px"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Nombre */}
                <TableCell className="font-medium max-w-[300px] text-center py-3">
                  <div className="break-words">{articulo.nombre}</div>
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
                    <Badge variant="outline" className="max-w-full truncate" title={articulo.categoria}>
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
                <TableCell className="text-right py-3 px-4">
                  <span className="font-semibold text-green-600">
                    ${articulo.precio}
                  </span>
                </TableCell>

                {/* Stock */}
                <TableCell className="text-center py-3">
                  <span className="font-medium">{articulo.stock_actual || 0}</span>
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
                      size="icon"
                      onClick={() => onEditar(articulo)}
                      title="Editar"
                      className="hover:scale-110 hover:bg-blue-50 hover:border-blue-300 transition-all"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEliminar(articulo)}
                      title="Eliminar"
                      className="text-destructive hover:bg-red-50 hover:border-red-300 hover:scale-110 transition-all"
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

      {/* Vista Mobile/Tablet - Cards */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentArticulos.map((articulo) => (
          <Card key={articulo.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {/* Imagen y Header */}
              <div className="flex gap-3 mb-3">
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {articulo.imagen ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}${articulo.imagen}`}
                      alt={articulo.nombre}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 80px, 96px"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base break-words mb-1.5 md:mb-2">{articulo.nombre}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-xs">
                      {articulo.categoria}
                    </Badge>
                    <Badge className={`text-xs ${getTipoBadgeClass(articulo.tipo || 'OTRO')}`}>
                      {articulo.tipo || 'OTRO'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              {articulo.descripcion && (
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 break-words mb-3">
                  {articulo.descripcion}
                </p>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-4 py-2.5 md:py-3 border-y">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Precio</p>
                  <p className="font-semibold text-green-600 text-sm md:text-base">${articulo.precio}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Stock</p>
                  <p className="font-medium text-sm md:text-base">{articulo.stock_actual || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Estado</p>
                  <Badge className={`text-xs ${getEstadoBadgeClass(articulo.activo)}`}>
                    {articulo.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditar(articulo)}
                  className="flex-1 hover:scale-105 transition-transform text-xs md:text-sm"
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEliminar(articulo)}
                  className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:scale-105 transition-transform text-xs md:text-sm"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 md:mt-8">
          <Pagination>
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={`cursor-pointer text-xs md:text-sm ${
                    currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                  }`}
                />
              </PaginationItem>

              {/* Page Numbers - Ocultos en móvil pequeño, visibles desde 640px */}
              <div className="hidden sm:flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1);

                  // Show ellipsis
                  const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                  const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

                  if (showEllipsisBefore || showEllipsisAfter) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
              </div>

              {/* Indicador de página actual en móvil */}
              <div className="flex sm:hidden items-center px-3 text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </div>

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={`cursor-pointer text-xs md:text-sm ${
                    currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};
