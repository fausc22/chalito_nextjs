import { useState, useEffect } from 'react';
import { Phone, Globe, MessageCircle, Store, Package, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { calcularEstadoTemporalPedido } from '@/lib/pedidoTimeUtils';
import { PedidoAcciones } from './PedidoAcciones';

export function OrderRow({ pedido, onMarcharACocina, onListo, onEntregar, onEditar, onCancelar, onCobrar, onImprimir, cobrandoPedidoId }) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pedido-${pedido.id}`,
    data: {
      pedido: pedido,
      estado: pedido.estado
    }
  });

  // Actualizar el tiempo cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000);
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
  
  // Feedback visual temporal para pedidos actualizados recientemente (2 segundos)
  const isActualizadoRecientemente = pedido.actualizadoRecientemente === true;

  const IconoOrigen = ({ className = "h-4 w-4 text-slate-600" }) => {
    switch (pedido.origen) {
      case 'whatsapp': return <MessageCircle className={className} />;
      case 'web': return <Globe className={className} />;
      case 'telefono': return <Phone className={className} />;
      case 'mostrador': return <Store className={className} />;
      default: return <Package className={className} />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white border rounded-lg 
        hover:shadow-md transition-all mb-3 flex flex-col
        ${isActualizadoRecientemente ? 'animate-pulse bg-yellow-50 border-yellow-400 border-2' : 'border border-slate-300'}
        ${isDragging ? 'select-none' : ''}
        w-full min-h-[100px]
      `}
    >
      {/* Header Superior: Fondo oscuro igual a las cards */}
      <div className="bg-slate-200 pb-2 pt-3 px-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Lado izquierdo: Drag Handle, ID, Origen, Cliente, Badge Retiro/Delivery */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0">
              <div className="flex items-center justify-center w-5">
                <div className="flex flex-col gap-0.5">
                  <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs font-bold text-slate-900">#{pedido.id}</span>
              <IconoOrigen className="h-4 w-4 text-slate-600" />
            </div>
            
            {/* Contenedor para nombre y badge juntos */}
            <div className="flex items-center gap-1.5 flex-shrink-0 min-w-0">
              <div className="min-w-0 max-w-[200px]">
                <p className="text-xs font-bold text-slate-900 truncate">{pedido.clienteNombre}</p>
              </div>

              {/* Badge Tipo de Entrega - junto al nombre del cliente */}
              {pedido.tipoEntrega === 'delivery' && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400 text-[10px] px-1 py-0.5 font-semibold whitespace-nowrap flex-shrink-0">
                  DELIVERY
                </Badge>
              )}
              {pedido.tipoEntrega === 'retiro' && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-400 text-[10px] px-1 py-0.5 font-semibold whitespace-nowrap flex-shrink-0">
                  RETIRO
                </Badge>
              )}
              {isActualizadoRecientemente && (
                <Badge className="bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 font-semibold animate-pulse whitespace-nowrap flex-shrink-0">
                  Actualizado
                </Badge>
              )}
            </div>
          </div>

          {/* Lado derecho: Badge Debe/Pagado y Badge Creado/Para alineados a la derecha */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Badge Estado de pago */}
            {pedido.paymentStatus === 'paid' ? (
              <Badge className="bg-green-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none whitespace-nowrap">
                ✓ PAGADO
              </Badge>
            ) : (
              <Badge className="bg-red-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none whitespace-nowrap" title={`Debe: $${pedido.total.toLocaleString('es-AR')}`}>
                DEBE ${pedido.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </Badge>
            )}

            {/* Badge Tiempo/Hora - último, con espacio */}
            <div className={`
              text-center px-2 py-1 rounded border flex-shrink-0
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
        </div>
      </div>

      {/* Cuerpo Inferior: Items y Acciones - Fondo blanco */}
      <div className="pt-2 px-3 pb-3 flex flex-col flex-grow bg-white">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Items del pedido */}
          <div className="flex-1 min-w-0">
            <div className="text-slate-900">
              {pedido.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="truncate" title={`${item.cantidad}x ${item.nombre}`}>
                  <span className="text-xs font-bold">{item.cantidad}x</span> <span className="text-sm truncate">{item.nombre}</span>
                </div>
              ))}
              {pedido.items.length > 3 && (
                <div className="text-xs text-slate-500 font-medium">
                  +{pedido.items.length - 3} más...
                </div>
              )}
            </div>
          </div>

          <PedidoAcciones
            pedido={pedido}
            onMarcharACocina={onMarcharACocina}
            onListo={onListo}
            onEntregar={onEntregar}
            onEditar={onEditar}
            onCancelar={onCancelar}
            onCobrar={onCobrar}
            onImprimir={onImprimir}
            isGhost={false}
            variant="row"
            cobrandoPedidoId={cobrandoPedidoId}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Componente OrderRowGhost - Versión estática para DragOverlay
 * Copia exacta de OrderRow pero sin interactividad y con estilos visuales diferenciados
 */
export function OrderRowGhost({ pedido }) {
  const [currentTime] = useState(Date.now());

  // Usar la función utilitaria compartida para calcular el estado temporal (igual que OrderRow)
  const estadoTemporal = calcularEstadoTemporalPedido(pedido, currentTime);

  const IconoOrigen = ({ className = "h-4 w-4 text-slate-600" }) => {
    switch (pedido.origen) {
      case 'whatsapp': return <MessageCircle className={className} />;
      case 'web': return <Globe className={className} />;
      case 'telefono': return <Phone className={className} />;
      case 'mostrador': return <Store className={className} />;
      default: return <Package className={className} />;
    }
  };

  return (
    <div className="bg-white border-2 border-blue-400 rounded-lg shadow-lg flex flex-col pointer-events-none select-none w-full min-h-[100px]">
      {/* Header Superior: Fondo oscuro igual a las cards */}
      <div className="bg-slate-200 pb-2 pt-3 px-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Lado izquierdo: Drag Handle, ID, Origen, Cliente, Badge Retiro/Delivery */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="flex items-center justify-center w-5 flex-shrink-0">
              <div className="flex flex-col gap-0.5">
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs font-bold text-slate-900">#{pedido.id}</span>
              <IconoOrigen />
            </div>
            
            {/* Contenedor para nombre y badge juntos */}
            <div className="flex items-center gap-1.5 flex-shrink-0 min-w-0">
              <div className="min-w-0 max-w-[200px]">
                <p className="text-xs font-bold text-slate-900 truncate">{pedido.clienteNombre}</p>
              </div>

              {/* Badge Tipo de Entrega - junto al nombre del cliente */}
              {pedido.tipoEntrega === 'delivery' && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-400 text-[10px] px-1 py-0.5 font-semibold whitespace-nowrap flex-shrink-0">
                  DELIVERY
                </Badge>
              )}
              {pedido.tipoEntrega === 'retiro' && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-400 text-[10px] px-1 py-0.5 font-semibold whitespace-nowrap flex-shrink-0">
                  RETIRO
                </Badge>
              )}
            </div>
          </div>

          {/* Lado derecho: Badge Debe/Pagado y Badge Creado/Para alineados a la derecha */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Badge Estado de pago */}
            {pedido.paymentStatus === 'paid' ? (
              <Badge className="bg-green-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none whitespace-nowrap">
                ✓ PAGADO
              </Badge>
            ) : (
              <Badge className="bg-red-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none whitespace-nowrap" title={`Debe: $${pedido.total.toLocaleString('es-AR')}`}>
                DEBE ${pedido.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </Badge>
            )}

            {/* Badge Tiempo/Hora - último, con espacio */}
            <div className={`
              text-center px-2 py-1 rounded border flex-shrink-0
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
        </div>
      </div>

      {/* Cuerpo Inferior: Items y Acciones - Fondo blanco */}
      <div className="pt-2 px-3 pb-3 flex flex-col flex-grow bg-white">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Items del pedido */}
          <div className="flex-1 min-w-0">
            <div className="text-slate-800">
              {pedido.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="truncate" title={`${item.cantidad}x ${item.nombre}`}>
                  <span className="text-xs font-bold">{item.cantidad}x</span> <span className="text-sm truncate">{item.nombre}</span>
                </div>
              ))}
              {pedido.items.length > 3 && (
                <div className="text-xs text-slate-500 font-medium">
                  +{pedido.items.length - 3} más...
                </div>
              )}
            </div>
          </div>

          <PedidoAcciones
            pedido={pedido}
            onMarcharACocina={() => {}}
            onListo={() => {}}
            onEditar={() => {}}
            onCancelar={() => {}}
            onCobrar={() => {}}
            onImprimir={() => {}}
            isGhost={true}
            variant="row"
          />
        </div>
      </div>
    </div>
  );
}

