import { useState } from 'react';
import Image from 'next/image';
import { Edit, Trash2, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ArticulosCard({ articulo, onEditar, onEliminar }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 h-full flex flex-col rounded-t-xl rounded-b-none overflow-hidden border border-slate-200 hover:border-slate-400">
      {/* 🖼️ IMAGEN - Aspect Ratio 16:9, max 180px mobile */}
      <div className="relative w-full aspect-video max-h-[160px] sm:max-h-[180px] bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 overflow-hidden">
        {articulo.imagen_url && !imageError ? (
          <Image
            src={articulo.imagen_url}
            alt={articulo.nombre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          // ✨ Fallback unificado sin imagen
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="h-10 w-10 text-slate-400" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <CardContent className="p-3 sm:p-4 flex-grow flex flex-col gap-2">
        {/* 📝 NOMBRE - Prominente */}
        <h3 className="font-bold text-sm sm:text-base line-clamp-2 leading-tight uppercase tracking-tight min-h-[2.5rem] sm:min-h-[2.75rem]">
          {articulo.nombre}
        </h3>

        {/* 💰 PRECIO - Destacado */}
        <p className="text-xl sm:text-2xl font-bold text-green-600 leading-none">
          ${parseFloat(articulo.precio).toFixed(2)}
        </p>

        {/* 🏷️ BADGES - Info crítica */}
        <div className="flex flex-wrap gap-1.5 min-h-[1.5rem]">
          {/* Estado (siempre visible) */}
          <Badge
            className={`text-[10px] sm:text-xs font-medium ${
              articulo.activo
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-red-100 text-red-800 border-red-300'
            }`}
          >
            {articulo.activo ? 'Activo' : 'Inactivo'}
          </Badge>

          {/* Tipo (siempre visible) */}
          <Badge className="text-[10px] sm:text-xs bg-blue-50 text-blue-700 border-blue-200">
            {articulo.tipo || 'OTRO'}
          </Badge>

          {/* Stock (mobile: solo si bajo, desktop: siempre) */}
          <Badge 
            className={`text-[10px] sm:text-xs ${
              articulo.stock_bajo === 1 || articulo.stock_actual <= articulo.stock_minimo
                ? 'bg-red-50 text-red-700 border-red-300'
                : 'bg-green-50 text-green-700 border-green-300 hidden sm:inline-flex'
            }`}
          >
            Stock: {articulo.stock_actual}
          </Badge>

          {/* Categoría (solo desktop) */}
          <Badge variant="outline" className="hidden sm:inline-flex text-xs text-purple-700 border-purple-300">
            {articulo.categoria || 'Sin categoría'}
          </Badge>
        </div>

        {/* 📄 DESCRIPCIÓN - Solo desktop, colapsada */}
        {articulo.descripcion && (
          <p className="hidden sm:block text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {articulo.descripcion}
          </p>
        )}

        {/* ⚠️ ALERTAS - Stock bajo prominente */}
        {articulo.stock_bajo === 1 && (
          <div className="sm:hidden">
            <Badge variant="destructive" className="w-full justify-center text-xs py-1">
              ⚠️ Stock Bajo
            </Badge>
          </div>
        )}

        {/* SPACER */}
        <div className="flex-grow min-h-[0.5rem]"></div>
      </CardContent>

      {/* ⚙️ BOTONES DE ACCIÓN - Touch-friendly */}
      <CardFooter className="gap-2 p-3 sm:p-4 pt-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-10 sm:h-11 text-xs sm:text-sm font-medium rounded-lg border-2 hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-98"
          onClick={() => onEditar(articulo)}
        >
          <Edit className="h-4 w-4 mr-1.5" strokeWidth={2} />
          <span className="truncate">Editar</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-10 sm:h-11 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700 border-2 rounded-lg transition-all active:scale-98"
          onClick={() => onEliminar(articulo)}
        >
          <Trash2 className="h-4 w-4 mr-1.5" strokeWidth={2} />
          <span className="truncate">Eliminar</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
