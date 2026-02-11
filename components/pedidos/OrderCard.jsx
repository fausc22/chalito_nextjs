import { useState, useEffect } from 'react';
import { Phone, Globe, MessageCircle, Store, Package, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { calcularEstadoTemporalPedido } from '@/lib/pedidoTimeUtils';
import { PedidoAcciones } from './PedidoAcciones';

export function OrderCard({ pedido, onMarcharACocina, onListo, onEditar, onCancelar, onCobrar, onImprimir, onEntregar, cobrandoPedidoId }) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pedido-${pedido.id}`,
    data: {
      pedido: pedido,
      estado: pedido.estado
    }
  });

  // Actualizar el tiempo cada 30 segundos para verificar si falta poco
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? 'hidden' : 'visible',
    transition: isDragging ? 'none' : 'opacity 0.2s ease',
    cursor: isDragging ? 'grabbing' : 'grab',
    pointerEvents: isDragging ? 'none' : 'auto',
    willChange: isDragging ? 'transform' : 'auto'
  };

  // Usar la función utilitaria compartida para calcular el estado temporal
  const estadoTemporal = calcularEstadoTemporalPedido(pedido, currentTime);

  const IconoOrigen = () => {
    switch (pedido.origen) {
      case 'whatsapp': return <MessageCircle className="h-4 w-4 text-slate-600" />;
      case 'web': return <Globe className="h-4 w-4 text-slate-600" />;
      case 'telefono': return <Phone className="h-4 w-4 text-slate-600" />;
      case 'mostrador': return <Store className="h-4 w-4 text-slate-600" />;
      default: return <Package className="h-4 w-4 text-slate-600" />;
    }
  };

  // Sin estilos por estado listo: misma apariencia siempre (solo acciones cambian)
  const isActualizadoRecientemente = pedido.actualizadoRecientemente === true;
  const cardClassName = `mb-2 shadow-sm hover:shadow-md transition-all border border-slate-300 flex flex-col ${isDragging ? 'select-none' : ''} ${isActualizadoRecientemente ? 'animate-pulse bg-yellow-50 border-yellow-400' : ''}`;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cardClassName}
    >
      <CardHeader className="pb-2 pt-3 px-3 flex-shrink-0 bg-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0">
              <GripVertical className="h-4 w-4 text-slate-600 hover:text-slate-800" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1 flex-wrap">
                <span className="text-xs font-bold text-slate-900">#{pedido.id}</span>
                <IconoOrigen />
                {pedido.tipoEntrega === 'delivery' && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400 text-[10px] px-1 py-0.5 font-semibold">
                    DELIVERY
                  </Badge>
                )}
                {pedido.tipoEntrega === 'retiro' && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-400 text-[10px] px-1 py-0.5 font-semibold">
                    RETIRO
                  </Badge>
                )}
                {isActualizadoRecientemente && (
                  <Badge className="bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 font-semibold animate-pulse">
                    Actualizado
                  </Badge>
                )}
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">{pedido.clienteNombre}</p>
            </div>
          </div>

          <div className={`
            text-right flex-shrink-0 px-2 py-1 rounded text-[10px]
            ${estadoTemporal.isLate || estadoTemporal.isNearScheduled 
              ? 'bg-red-200 border-2 border-red-500 animate-pulse' 
              : estadoTemporal.isNearLimit 
                ? 'bg-yellow-200 border-2 border-yellow-500'
                : 'bg-slate-200 border border-slate-400'}
          `}>
            <div>
              <p className={`text-[10px] font-medium ${
                estadoTemporal.isLate || estadoTemporal.isNearScheduled 
                  ? 'text-red-700' 
                  : estadoTemporal.isNearLimit 
                    ? 'text-yellow-700'
                    : 'text-slate-700'
              }`}>
                {estadoTemporal.subLabel}
              </p>
              <p className={`text-xs font-bold ${
                estadoTemporal.isLate || estadoTemporal.isNearScheduled 
                  ? 'text-red-900' 
                  : estadoTemporal.isNearLimit 
                    ? 'text-yellow-900'
                    : 'text-slate-900'
              }`}>
                {estadoTemporal.isLate || pedido.estado === 'en_cocina' 
                  ? estadoTemporal.label.replace(/^(En prep\.|Atrasado)\s/, '')
                  : estadoTemporal.horaProgramada || estadoTemporal.label}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 px-3 pb-3 flex flex-col flex-grow">
        <div className="mb-2 bg-white rounded p-2 border border-slate-200">
          <ul className="space-y-1">
            {pedido.items.slice(0, 2).map((item, idx) => (
              <li key={idx} className="text-xs text-slate-800">
                <span className="font-bold text-slate-900">{item.cantidad}x</span> <span className="font-semibold">{item.nombre}</span>
              </li>
            ))}
            {pedido.items.length > 2 && (
              <li className="text-xs text-slate-600 font-semibold">
                +{pedido.items.length - 2} más...
              </li>
            )}
          </ul>
        </div>

        {/* Spacer para empujar el badge y botones al final */}
        <div className="flex-grow"></div>

        <div className="mb-2">
          {pedido.paymentStatus === 'paid' ? (
            <Badge className="bg-green-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none">
              ✓ PAGADO
            </Badge>
          ) : (
            <Badge className="bg-red-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none">
              DEBE: ${pedido.total.toLocaleString('es-AR')}
            </Badge>
          )}
        </div>

        <div className="space-y-1.5">
          <PedidoAcciones
            pedido={pedido}
            onMarcharACocina={onMarcharACocina}
            onListo={onListo}
            onEditar={onEditar}
            onCancelar={onCancelar}
            onCobrar={onCobrar}
            onImprimir={onImprimir}
            onEntregar={onEntregar}
            isGhost={false}
            variant="card"
            cobrandoPedidoId={cobrandoPedidoId}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Componente OrderCardGhost - Versión estática para DragOverlay
 * Copia exacta de OrderCard pero sin interactividad y con estilos visuales diferenciados
 */
export function OrderCardGhost({ pedido }) {
  const [currentTime] = useState(Date.now());

  // Usar la función utilitaria compartida para calcular el estado temporal
  const estadoTemporal = calcularEstadoTemporalPedido(pedido, currentTime);

  const IconoOrigen = () => {
    switch (pedido.origen) {
      case 'whatsapp': return <MessageCircle className="h-4 w-4 text-slate-600" />;
      case 'web': return <Globe className="h-4 w-4 text-slate-600" />;
      case 'telefono': return <Phone className="h-4 w-4 text-slate-600" />;
      case 'mostrador': return <Store className="h-4 w-4 text-slate-600" />;
      default: return <Package className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <Card className="mb-2 shadow-lg border-2 border-blue-400 flex flex-col pointer-events-none select-none">
      <CardHeader className="pb-2 pt-3 px-3 bg-slate-200 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0">
              <GripVertical className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1 flex-wrap">
                <span className="text-xs font-bold text-slate-900">#{pedido.id}</span>
                <IconoOrigen />
                {pedido.tipoEntrega === 'delivery' && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400 text-[10px] px-1 py-0.5 font-semibold">
                    DELIVERY
                  </Badge>
                )}
                {pedido.tipoEntrega === 'retiro' && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-400 text-[10px] px-1 py-0.5 font-semibold">
                    RETIRO
                  </Badge>
                )}
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">{pedido.clienteNombre}</p>
            </div>
          </div>

          <div className={`
            text-right flex-shrink-0 px-2 py-1 rounded text-[10px]
            ${estadoTemporal.isLate || estadoTemporal.isNearScheduled 
              ? 'bg-red-200 border-2 border-red-500 animate-pulse' 
              : estadoTemporal.isNearLimit 
                ? 'bg-yellow-200 border-2 border-yellow-500'
                : 'bg-slate-200 border border-slate-400'}
          `}>
            <div>
              <p className={`text-[10px] font-medium ${
                estadoTemporal.isLate || estadoTemporal.isNearScheduled 
                  ? 'text-red-700' 
                  : estadoTemporal.isNearLimit 
                    ? 'text-yellow-700'
                    : 'text-slate-700'
              }`}>
                {estadoTemporal.subLabel}
              </p>
              <p className={`text-xs font-bold ${
                estadoTemporal.isLate || estadoTemporal.isNearScheduled 
                  ? 'text-red-900' 
                  : estadoTemporal.isNearLimit 
                    ? 'text-yellow-900'
                    : 'text-slate-900'
              }`}>
                {estadoTemporal.isLate || pedido.estado === 'en_cocina' 
                  ? estadoTemporal.label.replace(/^(En prep\.|Atrasado)\s/, '')
                  : estadoTemporal.horaProgramada || estadoTemporal.label}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 px-3 pb-3 flex flex-col flex-grow">
        <div className="mb-2 bg-white rounded p-2 border border-slate-200">
          <ul className="space-y-1">
            {pedido.items.slice(0, 2).map((item, idx) => (
              <li key={idx} className="text-xs text-slate-800">
                <span className="font-bold text-slate-900">{item.cantidad}x</span> <span className="font-semibold">{item.nombre}</span>
              </li>
            ))}
            {pedido.items.length > 2 && (
              <li className="text-xs text-slate-600 font-semibold">
                +{pedido.items.length - 2} más...
              </li>
            )}
          </ul>
        </div>

        {/* Spacer para empujar el badge y botones al final */}
        <div className="flex-grow"></div>

        <div className="mb-2">
          {pedido.paymentStatus === 'paid' ? (
            <Badge className="bg-green-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none">
              ✓ PAGADO
            </Badge>
          ) : (
            <Badge className="bg-red-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none">
              DEBE: ${pedido.total.toLocaleString('es-AR')}
            </Badge>
          )}
        </div>

        <div className="space-y-1.5">
          <PedidoAcciones
            pedido={pedido}
            onMarcharACocina={() => {}}
            onListo={() => {}}
            onEditar={() => {}}
            onCancelar={() => {}}
            onCobrar={() => {}}
            onImprimir={() => {}}
            isGhost={true}
            variant="card"
          />
        </div>
      </CardContent>
    </Card>
  );
}

