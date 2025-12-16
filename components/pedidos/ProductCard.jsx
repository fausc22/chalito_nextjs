import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ProductCard({ producto, onAgregar }) {
  const [cantidad, setCantidad] = useState(1);

  const incrementar = () => setCantidad(prev => prev + 1);
  const decrementar = () => {
    if (cantidad > 1) setCantidad(prev => prev - 1);
  };

  const handleAgregar = () => {
    onAgregar(producto, cantidad);
    setCantidad(1);
  };

  return (
    <Card className="hover:shadow-lg transition-all p-3 text-center border-2 border-slate-300 hover:border-slate-400 flex flex-col bg-white shadow-md">
      <div className="text-3xl mb-2">{producto.imagen}</div>
      <h4 className="font-semibold text-sm text-slate-900 mb-2 line-clamp-2 min-h-[40px] leading-tight">
        {producto.nombre}
      </h4>
      <p className="text-base font-bold text-slate-800 mb-2.5">
        ${producto.precio.toLocaleString('es-AR')}
      </p>

      {producto.extrasDisponibles && producto.extrasDisponibles.length > 0 && (
        <Badge variant="outline" className="text-xs mb-2 bg-slate-50 text-slate-700 border-slate-300 px-2 py-0.5">
          {producto.extrasDisponibles.length} extras
        </Badge>
      )}

      <div className="flex items-center justify-center gap-2 mb-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 w-7 p-0 border border-slate-300 hover:bg-slate-100 text-sm font-semibold"
          onClick={decrementar}
        >
          -
        </Button>
        <span className="font-bold text-sm w-6 text-center">{cantidad}</span>
        <Button
          size="sm"
          variant="outline"
          className="h-7 w-7 p-0 border border-slate-300 hover:bg-slate-100 text-sm font-semibold"
          onClick={incrementar}
        >
          +
        </Button>
      </div>

      <Button
        size="sm"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2 h-9"
        onClick={handleAgregar}
      >
        <Plus className="h-4 w-4 mr-1" />
        Agregar
      </Button>
    </Card>
  );
}

