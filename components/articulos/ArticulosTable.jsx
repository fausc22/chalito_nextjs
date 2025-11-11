import Image from 'next/image';
import { BsPencil, BsTrash, BsCheck2, BsX } from 'react-icons/bs';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/Badge';

/**
 * Componente de tabla para mostrar artículos
 */
export const ArticulosTable = ({
  articulos = [],
  onEditar,
  onEliminar,
}) => {
  if (articulos.length === 0) {
    return (
      <Card>
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No se encontraron artículos
          </h3>
          <p className="text-gray-500">
            Prueba ajustando los filtros o agrega un nuevo artículo
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Imagen
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Tiempo
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articulos.map((articulo) => (
              <tr key={articulo.id} className="hover:bg-gray-50 transition-colors">
                {/* Imagen */}
                <td className="px-6 py-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    {articulo.imagen ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}${articulo.imagen}`}
                        alt={articulo.nombre}
                        fill
                        className="object-cover"
                        sizes="64px"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                        Sin imagen
                      </div>
                    )}
                  </div>
                </td>

                {/* Nombre */}
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">
                    {articulo.nombre}
                  </span>
                </td>

                {/* Descripción */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 max-w-xs truncate">
                    {articulo.descripcion || 'Sin descripción'}
                  </div>
                </td>

                {/* Categoría */}
                <td className="px-6 py-4">
                  <span className="badge-primary">{articulo.categoria}</span>
                </td>

                {/* Precio */}
                <td className="px-6 py-4">
                  <span className="font-semibold text-green-600">
                    ${articulo.precio}
                  </span>
                </td>

                {/* Estado */}
                <td className="px-6 py-4">
                  <StatusBadge 
                    active={articulo.disponible}
                    activeText="Disponible"
                    inactiveText="No disponible"
                  />
                </td>

                {/* Tiempo de preparación */}
                <td className="px-6 py-4">
                  <span className="text-gray-600">
                    {articulo.tiempoPreparacion} min
                  </span>
                </td>

                {/* Acciones */}
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onEditar(articulo)}
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                      title="Editar"
                    >
                      <BsPencil size={16} />
                    </button>
                    <button
                      onClick={() => onEliminar(articulo)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                      title="Eliminar"
                    >
                      <BsTrash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};


