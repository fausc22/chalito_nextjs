/**
 * Loading Skeleton Components
 * Componentes de esqueleto para mejorar la experiencia de carga
 */

/**
 * Skeleton básico
 */
export function Skeleton({ className = '', width = 'w-full', height = 'h-4' }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${width} ${height} ${className}`}
      role="status"
      aria-label="Cargando..."
    />
  );
}

/**
 * Skeleton de texto
 */
export function TextSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(lines)].map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? 'w-3/4' : 'w-full'}
          height="h-4"
        />
      ))}
    </div>
  );
}

/**
 * Skeleton de card
 */
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`card ${className}`}>
      <div className="animate-pulse">
        <Skeleton height="h-6" width="w-3/4" className="mb-4" />
        <TextSkeleton lines={3} />
      </div>
    </div>
  );
}

/**
 * Skeleton de tabla
 */
export function TableSkeleton({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {[...Array(cols)].map((_, index) => (
                <th key={index} className="px-4 py-3 text-left">
                  <Skeleton height="h-4" width="w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100">
                {[...Array(cols)].map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-4">
                    <Skeleton
                      height="h-4"
                      width={colIndex === 0 ? 'w-16' : 'w-24'}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Skeleton de lista de artículos
 */
export function ArticulosTableSkeleton({ rows = 10 }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left">
                <Skeleton height="h-4" width="w-16" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton height="h-4" width="w-20" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton height="h-4" width="w-32" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton height="h-4" width="w-24" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton height="h-4" width="w-16" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton height="h-4" width="w-20" />
              </th>
              <th className="px-4 py-3 text-left">
                <Skeleton height="h-4" width="w-28" />
              </th>
              <th className="px-4 py-3 text-center">
                <Skeleton height="h-4" width="w-20" className="mx-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                {/* Imagen */}
                <td className="px-4 py-3">
                  <Skeleton height="h-12" width="w-12" className="rounded" />
                </td>
                {/* Nombre */}
                <td className="px-4 py-3">
                  <Skeleton height="h-4" width="w-32" />
                </td>
                {/* Descripción */}
                <td className="px-4 py-3">
                  <Skeleton height="h-4" width="w-48" />
                </td>
                {/* Categoría */}
                <td className="px-4 py-3">
                  <Skeleton height="h-6" width="w-20" className="rounded-full" />
                </td>
                {/* Precio */}
                <td className="px-4 py-3">
                  <Skeleton height="h-4" width="w-16" />
                </td>
                {/* Estado */}
                <td className="px-4 py-3">
                  <Skeleton height="h-6" width="w-24" className="rounded-full" />
                </td>
                {/* Tiempo */}
                <td className="px-4 py-3">
                  <Skeleton height="h-4" width="w-16" />
                </td>
                {/* Acciones */}
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <Skeleton height="h-8" width="w-8" className="rounded" />
                    <Skeleton height="h-8" width="w-8" className="rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Skeleton de estadísticas
 */
export function StatsCardSkeleton() {
  return (
    <div className="card">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <Skeleton height="h-8" width="w-24" />
          <Skeleton height="h-8" width="w-8" className="rounded-full" />
        </div>
        <Skeleton height="h-4" width="w-32" />
      </div>
    </div>
  );
}

/**
 * Grid de estadísticas skeleton
 */
export function StatsGridSkeleton({ cards = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[...Array(cards)].map((_, index) => (
        <StatsCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Skeleton de formulario
 */
export function FormSkeleton({ fields = 5 }) {
  return (
    <div className="space-y-4">
      {[...Array(fields)].map((_, index) => (
        <div key={index}>
          <Skeleton height="h-4" width="w-24" className="mb-2" />
          <Skeleton height="h-10" width="w-full" className="rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton height="h-10" width="w-24" className="rounded-lg" />
        <Skeleton height="h-10" width="w-24" className="rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Página completa de artículos skeleton
 */
export function ArticulosPageSkeleton() {
  return (
    <div className="main-content animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <Skeleton height="h-10" width="w-48" />
        <Skeleton height="h-10" width="w-40" className="rounded-lg" />
      </div>

      {/* Barra de búsqueda */}
      <div className="card mb-6">
        <Skeleton height="h-10" width="w-full" className="rounded-lg" />
      </div>

      {/* Estadísticas */}
      <StatsGridSkeleton cards={4} />

      {/* Tabla */}
      <ArticulosTableSkeleton rows={10} />
    </div>
  );
}

export default {
  Skeleton,
  TextSkeleton,
  CardSkeleton,
  TableSkeleton,
  ArticulosTableSkeleton,
  StatsCardSkeleton,
  StatsGridSkeleton,
  FormSkeleton,
  ArticulosPageSkeleton
};
