import { useState } from 'react';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ProductCard({ producto, onAgregar }) {
  const [cantidad, setCantidad] = useState(1);
  const [imageError, setImageError] = useState(false);

  const incrementar = () => setCantidad(prev => prev + 1);
  const decrementar = () => {
    if (cantidad > 1) setCantidad(prev => prev - 1);
  };

  const handleAgregar = () => {
    onAgregar(producto, cantidad);
    setCantidad(1);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-200 hover:border-slate-400 hover:bg-slate-50 flex flex-col bg-white h-full rounded-t-xl rounded-b-none">
      {/* 🖼️ IMAGEN - Aspect Ratio 16:9, más compacta */}
      <div className="relative w-full aspect-video max-h-[130px] sm:max-h-[150px] bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 overflow-hidden">
        {producto.imagen_url && !imageError ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          // ✨ Fallback unificado sin imagen
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-xs text-slate-400 font-medium">SIN IMAGEN</span>
          </div>
        )}
      </div>

      {/* 📝 CONTENIDO - Jerarquía visual clara */}
      <div className="p-2 flex flex-col flex-grow gap-1">
        {/* NOMBRE - Centrado */}
        <h4 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-2 leading-tight uppercase tracking-tight min-h-[2rem] sm:min-h-[2.25rem] text-center">
          {producto.nombre}
        </h4>

        {/* PRECIO Y BADGE EN LA MISMA FILA */}
        <div className="flex items-center justify-between gap-2">
          {/* PRECIO - Izquierda */}
          <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">
            ${producto.precio.toLocaleString('es-AR')}
          </p>
          
          {/* BADGE EXTRAS - Derecha */}
          {producto.extrasDisponibles && producto.extrasDisponibles.length > 0 && (
            <Badge variant="outline" className="text-[10px] sm:text-xs bg-amber-50 text-amber-700 border-amber-300 px-1.5 py-0.5 flex-shrink-0">
              {producto.extrasDisponibles.length} extras
            </Badge>
          )}
        </div>

        {/* 🏷️ BADGES ADICIONALES - Desktop only */}
        <div className="hidden sm:flex flex-wrap gap-1.5 min-h-[1.25rem]">
          {producto.tipo && (
            <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5">
              {producto.tipo}
            </Badge>
          )}
          
          {producto.stock_actual !== undefined && (
            <Badge 
              variant="outline" 
              className={`text-xs px-2 py-0.5 ${
                producto.stock_actual <= producto.stock_minimo 
                  ? 'bg-red-50 text-red-700 border-red-300' 
                  : 'bg-green-50 text-green-700 border-green-300'
              }`}
            >
              Stock: {producto.stock_actual}
            </Badge>
          )}
        </div>

        {/* SPACER - Empuja controles al bottom */}
        <div className="flex-grow min-h-[0.125rem]"></div>

        {/* ➕➖ CONTROLES DE CANTIDAD - Touch-friendly */}
        <div className="flex items-center justify-center gap-3 py-0 mb-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-lg border-2 border-slate-300 hover:border-green-500 hover:bg-green-50 text-lg font-bold transition-all active:scale-95"
            onClick={decrementar}
            disabled={cantidad <= 1}
          >
            −
          </Button>
          <span className="font-bold text-base sm:text-lg w-8 text-center tabular-nums">
            {cantidad}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-lg border-2 border-slate-300 hover:border-green-500 hover:bg-green-50 text-lg font-bold transition-all active:scale-95"
            onClick={incrementar}
          >
            +
          </Button>
        </div>

        {/* ✅ BOTÓN AGREGAR - CTA claro y accesible */}
        <Button
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold text-sm sm:text-base h-8 sm:h-9 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-98"
          onClick={handleAgregar}
        >
          <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
          Agregar al pedido
        </Button>
      </div>
    </Card>
  );
}

