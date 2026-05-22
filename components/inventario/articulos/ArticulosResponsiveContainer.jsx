import { useBreakpoint } from '@/hooks/useBreakpoint';
import { ArticulosTableView } from './ArticulosTableView';
import { ArticulosGridView } from './ArticulosGridView';
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
 * 🎯 CONTENEDOR RESPONSIVO - Orchestrator Pattern
 * 
 * Responsabilidades:
 * 1. Detectar breakpoint
 * 2. Renderizar vista apropiada (Tabla o Cards)
 * 3. Manejar lógica compartida (paginación, acciones)
 * 4. Mantener single source of truth
 * 
 * Ventajas:
 * ✅ Código no duplicado
 * ✅ Solo renderiza una vista
 * ✅ Fácil de testear
 * ✅ Fácil de mantener
 */
export const ArticulosResponsiveContainer = ({
  articulos = [],
  onEditar,
  onEliminar,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
}) => {
  // 🎯 Detectar breakpoint (1024px = lg en Tailwind)
  const isDesktop = useBreakpoint(1024);

  // 📊 Lógica de paginación (compartida)
  const totalPages = Math.ceil(articulos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticulos = articulos.slice(startIndex, endIndex);

  // 🎨 Funciones de estilo (compartidas)
  const getTipoBadgeClass = (tipo) => {
    const classes = {
      ELABORADO: 'bg-orange-100 text-orange-800 border-orange-200',
      'MATERIA PRIMA': 'bg-blue-100 text-blue-800 border-blue-200',
      OTRO: 'bg-gray-100 text-foreground border-border',
    };
    return classes[tipo] || classes.OTRO;
  };

  const getEstadoBadgeClass = (activo) => {
    return activo
      ? 'bg-green-100 text-green-800 border-green-200 pointer-events-none'
      : 'bg-red-100 text-red-800 border-red-200 pointer-events-none';
  };

  // 🔄 Props compartidas para ambas vistas
  const sharedViewProps = {
    articulos: currentArticulos,
    onEditar,
    onEliminar,
    getTipoBadgeClass,
    getEstadoBadgeClass,
  };

  return (
    <div className="space-y-4">
      {/* 🖥️📱 RENDERIZADO CONDICIONAL - Sin CSS hacks */}
      {isDesktop ? (
        <ArticulosTableView {...sharedViewProps} />
      ) : (
        <ArticulosGridView {...sharedViewProps} />
      )}

      {/* 📄 PAGINACIÓN - Compartida entre vistas */}
      {totalPages > 1 && (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

/**
 * 📄 Componente de Paginación
 * Separado para reutilización
 */
function PaginationComponent({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Lógica inteligente para mostrar páginas
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }

    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          <PaginationItem key={index}>
            {page === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}










