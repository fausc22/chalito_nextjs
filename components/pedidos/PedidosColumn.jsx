import { useState, useMemo, useEffect } from 'react';
import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDroppable } from '@dnd-kit/core';
import { OrderCard } from './OrderCard';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export function PedidosColumn({
  titulo,
  pedidos,
  onMarcharACocina,
  onListo,
  onEditar,
  onCobrar,
  onCancelar,
  estado,
  compacto = false
}) {
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 6; // 3 filas x 2 columnas = 6 items por página

  const { setNodeRef, isOver } = useDroppable({
    id: estado,
    data: {
      estado: estado
    }
  });

  // Calcular paginación
  const totalPaginas = useMemo(() => {
    return Math.ceil(pedidos.length / itemsPorPagina);
  }, [pedidos.length, itemsPorPagina]);

  const pedidosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return pedidos.slice(inicio, fin);
  }, [pedidos, paginaActual, itemsPorPagina]);

  // Resetear a página 1 cuando cambian los pedidos
  useEffect(() => {
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(1);
    }
  }, [totalPaginas, paginaActual]);

  const irAPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="h-full rounded-lg border-2 border-slate-300 bg-slate-100 overflow-hidden flex flex-col shadow">
      <div className="bg-slate-700 text-white px-3 py-2 flex-shrink-0">
        <h2 className="text-sm font-bold flex items-center justify-between">
          {titulo}
          <Badge className="bg-slate-600 text-white text-xs px-2 py-0.5 font-semibold">
            {pedidos.length}
          </Badge>
        </h2>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-3 min-h-0 transition-colors ${
          isOver ? 'bg-blue-100 border-2 border-blue-400' : ''
        }`}
      >
        {pedidos.length === 0 ? (
          <div className="text-center text-slate-400 py-6">
            <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium">No hay pedidos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {pedidosPaginados.map(pedido => (
              <OrderCard
                key={pedido.id}
                pedido={pedido}
                onMarcharACocina={onMarcharACocina}
                onListo={onListo}
                onEditar={onEditar}
                onCancelar={onCancelar}
                onCobrar={onCobrar}
              />
            ))}
          </div>
        )}
      </div>

      {/* Paginación - siempre visible en el pie */}
      <div className="bg-slate-200 border-t border-slate-300 px-3 py-2 flex items-center justify-center flex-shrink-0">
        {totalPaginas > 1 && (
          <Pagination>
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => irAPagina(paginaActual - 1)}
                  className={`cursor-pointer text-xs ${
                    paginaActual === 1 ? 'pointer-events-none opacity-50' : ''
                  }`}
                />
              </PaginationItem>
              
              {/* Números de página - mostrar máximo 5 páginas visibles */}
              {totalPaginas <= 5 ? (
                // Si hay 5 o menos páginas, mostrar todas
                [...Array(totalPaginas)].map((_, index) => (
                  <PaginationItem key={index + 1}>
                    <PaginationLink
                      onClick={() => irAPagina(index + 1)}
                      isActive={paginaActual === index + 1}
                      className="cursor-pointer text-xs h-7 w-7"
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))
              ) : (
                // Si hay más de 5 páginas, mostrar páginas inteligentes
                <>
                  {paginaActual > 2 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => irAPagina(1)}
                          className="cursor-pointer text-xs h-7 w-7"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {paginaActual > 3 && (
                        <PaginationItem>
                          <span className="text-xs px-1">...</span>
                        </PaginationItem>
                      )}
                    </>
                  )}
                  
                  {[...Array(Math.min(3, totalPaginas))].map((_, index) => {
                    let pageNum;
                    if (paginaActual <= 2) {
                      pageNum = index + 1;
                    } else if (paginaActual >= totalPaginas - 1) {
                      pageNum = totalPaginas - 2 + index;
                    } else {
                      pageNum = paginaActual - 1 + index;
                    }
                    
                    if (pageNum < 1 || pageNum > totalPaginas) return null;
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => irAPagina(pageNum)}
                          isActive={paginaActual === pageNum}
                          className="cursor-pointer text-xs h-7 w-7"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {paginaActual < totalPaginas - 1 && (
                    <>
                      {paginaActual < totalPaginas - 2 && (
                        <PaginationItem>
                          <span className="text-xs px-1">...</span>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => irAPagina(totalPaginas)}
                          className="cursor-pointer text-xs h-7 w-7"
                        >
                          {totalPaginas}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                </>
              )}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => irAPagina(paginaActual + 1)}
                  className={`cursor-pointer text-xs ${
                    paginaActual === totalPaginas ? 'pointer-events-none opacity-50' : ''
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}

