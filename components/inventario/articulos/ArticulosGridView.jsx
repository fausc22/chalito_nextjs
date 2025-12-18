import React, { useState } from 'react';
import Image from 'next/image';
import { Pencil, Trash2, Utensils } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * 📱 Vista de CARDS para Mobile/Tablet
 * 
 * Responsabilidad: Solo renderizado visual de cards
 * Lógica de negocio: Manejada por el contenedor padre
 */
export function ArticulosGridView({ 
  articulos, 
  onEditar, 
  onEliminar,
  getTipoBadgeClass,
  getEstadoBadgeClass 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {articulos.map((articulo) => (
        <ArticuloCard
          key={articulo.id}
          articulo={articulo}
          onEditar={onEditar}
          onEliminar={onEliminar}
          getTipoBadgeClass={getTipoBadgeClass}
          getEstadoBadgeClass={getEstadoBadgeClass}
        />
      ))}
    </div>
  );
}

/**
 * 🎴 Componente individual de Card
 * Separado para optimización de renders
 */
function ArticuloCard({ 
  articulo, 
  onEditar, 
  onEliminar, 
  getTipoBadgeClass, 
  getEstadoBadgeClass 
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 flex flex-col h-full rounded-t-xl rounded-b-none overflow-hidden border border-slate-200 hover:border-slate-400">
      {/* 🖼️ IMAGEN - Aspect Ratio 16:9 */}
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

// ⚡ Optimización: Memoizar card individual
export const MemoizedArticuloCard = React.memo(ArticuloCard);

