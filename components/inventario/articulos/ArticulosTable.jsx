import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Pencil, Trash2, Utensils, Calculator } from 'lucide-react';
import { ArticuloImagenTable } from './ArticuloImagenTable';
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
  onVerCostos,
  scrollRef,
  currentPage: currentPageProp,
  setCurrentPage: setCurrentPageProp,
}) => {
  // Pagination state - usar props si están disponibles, sino usar estado local
  const [currentPageLocal, setCurrentPageLocal] = useState(1);
  const currentPage = currentPageProp !== undefined ? currentPageProp : currentPageLocal;
  const setCurrentPage = setCurrentPageProp !== undefined ? setCurrentPageProp : setCurrentPageLocal;
  
  const [itemsPerPage, setItemsPerPage] = useState(4); // Empezar con 4 (mobile-first)
  const tableRef = useRef(null);

  // Ajustar página actual si queda fuera de rango después de operaciones
  useEffect(() => {
    const totalPages = Math.ceil(articulos.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articulos.length, itemsPerPage, currentPage]);

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
          // NO resetear automáticamente - el useEffect de ajuste se encargará si es necesario
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <Utensils className="h-16 w-16 text-muted-foreground mb-4" />
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
      {/* Vista Desktop - Tabla: sin scroll horizontal; columnas proporcionales al 100% del ancho */}
      <div className="hidden lg:block mb-8 min-w-0 overflow-x-hidden">
        <Table className="w-full max-w-full table-fixed bg-white rounded-lg shadow-sm">
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[8%] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-l-2 border-r-2 border-b-2 border-gray-200 py-4">Imagen</TableHead>
              <TableHead className="w-[14%] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-4">Nombre</TableHead>
              <TableHead className="w-[18%] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-4">Descripción</TableHead>
              <TableHead className="w-[10%] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-4">Categoría</TableHead>
              <TableHead className="w-[9%] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-4">Tipo</TableHead>
              <TableHead className="w-[9%] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-4">Precio</TableHead>
              <TableHead className="w-[7%] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-4">Stock</TableHead>
              <TableHead className="w-[8%] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-4">Estado</TableHead>
              <TableHead className="w-[17%] text-center text-sm font-bold text-slate-800 uppercase tracking-wider border-r-2 border-b-2 border-gray-200 py-4">Acciones</TableHead>
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
                {/* Imagen: contenido en la celda para no invadir NOMBRE */}
                <TableCell className="text-center py-1 pr-2 min-w-0 overflow-hidden align-middle">
                  <ArticuloImagenTable 
                    imagen_url={articulo.imagen_url} 
                    nombre={articulo.nombre} 
                  />
                </TableCell>

                {/* Nombre: wrap en varias líneas como descripción; padding para no tocar la imagen */}
                <TableCell className="font-medium text-center py-1 min-w-0 pl-3 align-middle">
                  <div className="break-words uppercase text-left max-w-full" title={articulo.nombre}>
                    {articulo.nombre}
                  </div>
                </TableCell>

                {/* Descripción */}
                <TableCell className="text-center py-1 min-w-0">
                  <div className="break-words text-sm text-muted-foreground line-clamp-2 max-w-full overflow-hidden">
                    {articulo.descripcion || 'Sin descripción'}
                  </div>
                </TableCell>

                {/* Categoría */}
                <TableCell className="text-center py-1 min-w-0">
                  <div className="flex justify-center min-w-0">
                    <Badge variant="outline" className="max-w-full truncate" title={articulo.categoria}>
                      {articulo.categoria}
                    </Badge>
                  </div>
                </TableCell>

                {/* Tipo */}
                <TableCell className="text-center py-1 min-w-0">
                  <Badge className={getTipoBadgeClass(articulo.tipo || 'OTRO')}>
                    {articulo.tipo || 'OTRO'}
                  </Badge>
                </TableCell>

                {/* Precio */}
                <TableCell className="text-right py-1 px-2 min-w-0">
                  <span className="font-semibold text-green-600">
                    ${articulo.precio}
                  </span>
                </TableCell>

                {/* Stock */}
                <TableCell className="text-center py-1 min-w-0">
                  <span className="font-medium">{articulo.stock_actual || 0}</span>
                </TableCell>

                {/* Estado */}
                <TableCell className="text-center py-1 min-w-0">
                  <Badge className={getEstadoBadgeClass(articulo.activo)}>
                    {articulo.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-center py-1 min-w-0">
                  <div className="flex gap-1 sm:gap-2 justify-center flex-wrap">
                    {onVerCostos && (articulo.tipo === 'ELABORADO') && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onVerCostos(articulo)}
                        title="Ver costos"
                        className="hover:scale-110 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-emerald-700"
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    )}
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
          <ArticuloMobileCard
            key={articulo.id}
            articulo={articulo}
            onEditar={onEditar}
            onEliminar={onEliminar}
            onVerCostos={onVerCostos}
            getTipoBadgeClass={getTipoBadgeClass}
            getEstadoBadgeClass={getEstadoBadgeClass}
          />
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

/**
 * 🎴 Componente individual de Card Mobile
 * ✅ Hooks en nivel superior (no en loop)
 */
function ArticuloMobileCard({ 
  articulo, 
  onEditar, 
  onEliminar, 
  onVerCostos, 
  getTipoBadgeClass, 
  getEstadoBadgeClass 
}) {
  // ✅ CORRECTO: Hook en nivel superior del componente
  const [imageError, setImageError] = React.useState(false);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 flex flex-col h-full rounded-t-xl rounded-b-none overflow-hidden border border-slate-200 hover:border-slate-400">
      {/* 🖼️ IMAGEN - Aspect Ratio 16:9, max 180px */}
      <div className="relative w-full aspect-video max-h-[160px] md:max-h-[180px] bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 overflow-hidden">
        {articulo.imagen_url && !imageError ? (
          <Image
            src={articulo.imagen_url}
            alt={articulo.nombre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="h-10 w-10 md:h-12 md:w-12 text-slate-400" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <CardContent className="p-3 md:p-4 flex-grow flex flex-col gap-2">
        {/* 📝 NOMBRE */}
        <h3 className="font-bold text-sm md:text-base line-clamp-2 leading-tight uppercase tracking-tight min-h-[2.5rem] md:min-h-[2.75rem]">
          {articulo.nombre}
        </h3>

        {/* 💰 PRECIO */}
        <p className="text-xl md:text-2xl font-bold text-green-600 leading-none">
          ${articulo.precio}
        </p>

        {/* 🏷️ BADGES */}
        <div className="flex flex-wrap gap-1.5 min-h-[1.5rem]">
          <Badge
            className={`text-[10px] md:text-xs font-medium ${
              articulo.activo
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-red-100 text-red-800 border-red-300'
            }`}
          >
            {articulo.activo ? 'Activo' : 'Inactivo'}
          </Badge>

          <Badge className={`text-[10px] md:text-xs ${getTipoBadgeClass(articulo.tipo || 'OTRO')}`}>
            {articulo.tipo || 'OTRO'}
          </Badge>

          <Badge 
            className={`text-[10px] md:text-xs ${
              articulo.stock_actual <= articulo.stock_minimo
                ? 'bg-red-50 text-red-700 border-red-300'
                : 'bg-green-50 text-green-700 border-green-300 hidden md:inline-flex'
            }`}
          >
            Stock: {articulo.stock_actual || 0}
          </Badge>

          <Badge variant="outline" className="hidden md:inline-flex text-xs text-purple-700 border-purple-300">
            {articulo.categoria}
          </Badge>
        </div>

        {/* 📄 DESCRIPCIÓN - Solo desktop */}
        {articulo.descripcion && (
          <p className="hidden md:block text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {articulo.descripcion}
          </p>
        )}

        {/* SPACER */}
        <div className="flex-grow min-h-[0.5rem]"></div>

        {/* ⚙️ ACCIONES */}
        <div className="flex gap-2 pt-2">
          {onVerCostos && articulo.tipo === 'ELABORADO' && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onVerCostos(articulo)}
              title="Ver costos"
              className="h-10 w-10 shrink-0 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 border-2"
            >
              <Calculator className="h-4 w-4" strokeWidth={2} />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditar(articulo)}
            className="flex-1 h-10 md:h-11 text-xs md:text-sm font-medium rounded-lg border-2 hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-98"
          >
            <Pencil className="h-4 w-4 mr-1.5" strokeWidth={2} />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEliminar(articulo)}
            className="flex-1 h-10 md:h-11 text-xs md:text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700 border-2 rounded-lg transition-all active:scale-98"
          >
            <Trash2 className="h-4 w-4 mr-1.5" strokeWidth={2} />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
