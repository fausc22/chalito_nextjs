import { memo } from 'react';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { calcularEstadoTemporalPedido } from '@/lib/pedidoTimeUtils';
import { isPedidoMercadoPagoPendiente, isPedidoPaid } from '@/lib/pedidoPaymentUtils';
import { PedidoAcciones } from './PedidoAcciones';

function OrderCardComponent({
  pedido,
  onMarcharACocina,
  onListo,
  onEditar,
  onCancelar,
  onCobrar,
  onImprimir,
  onEntregar,
  cobrandoPedidoId,
  isHighlighted = false,
  isNewWebOrder = false,
  isNew = false,
  isDraggable = false,
  currentTime = Date.now(),
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pedido-${pedido.id}`,
    data: {
      pedido: pedido,
      estado: pedido.estado,
    },
  });

  const style = {
    transform: isDraggable && pedido.estado === 'recibido' ? CSS.Translate.toString(transform) : undefined,
    opacity: isDraggable && pedido.estado === 'recibido' && isDragging ? 0 : 1,
    visibility: isDraggable && pedido.estado === 'recibido' && isDragging ? 'hidden' : 'visible',
    transition: isDragging ? 'none' : 'opacity 0.2s ease',
    cursor: isDraggable && pedido.estado === 'recibido' ? (isDragging ? 'grabbing' : 'grab') : 'default',
    pointerEvents: isDragging ? 'none' : 'auto',
    willChange: isDraggable && pedido.estado === 'recibido' && isDragging ? 'transform' : 'auto',
  };

  // Usar la función utilitaria compartida para calcular el estado temporal
  const estadoTemporal = calcularEstadoTemporalPedido(pedido, currentTime);
  const mainTimeText = (() => {
    if (estadoTemporal.isLate || pedido.estado === 'en_cocina') {
      return estadoTemporal.label.replace(/^(En prep\.|Atrasado)\s/, '');
    }
    if (estadoTemporal.subLabel === 'Creado' && typeof estadoTemporal.label === 'string') {
      return estadoTemporal.label.replace(/^Creado\s*/i, '');
    }
    return estadoTemporal.horaProgramada || estadoTemporal.label;
  })();
  const isWebOrder = pedido?.origen_pedido === 'WEB' || pedido?.origen === 'web';
  const medioPagoRaw = (pedido?.medio_pago || pedido?.medioPago || '').toString().toUpperCase();
  const montoConCuantoAbona = Number(pedido?.monto_con_cuanto_abona);
  const showWebDetailBadges =
    isWebOrder && medioPagoRaw === 'EFECTIVO' && Number.isFinite(montoConCuantoAbona) && montoConCuantoAbona > 0;

  const origenRaw = (pedido?.origen || pedido?.origen_pedido || '').toString().toLowerCase();
  const origenLabel = (() => {
    switch (origenRaw) {
      case 'web':
        return 'WEB';
      case 'whatsapp':
        return 'WHATSAPP';
      case 'mostrador':
        return 'MOSTRADOR';
      case 'telefono':
        return 'TELEFONO';
      default:
        return null;
    }
  })();

  // Sin estilos por estado listo: misma apariencia siempre (solo acciones cambian)
  const isActualizadoRecientemente = pedido.actualizadoRecientemente === true;
  const showHighlight = isHighlighted || isActualizadoRecientemente;
  const isPaid = isPedidoPaid(pedido);
  const isMercadoPagoPendiente = isPedidoMercadoPagoPendiente(pedido);
  const cardStateClassName = showHighlight
    ? 'bg-amber-100 border-amber-500 ring-1 ring-amber-300 animate-breathe'
    : 'border-slate-300';
  const cardClassName = `group mb-2 shadow-sm hover:shadow-md transition-all border rounded-lg overflow-hidden flex flex-col h-full min-h-[210px] sm:min-h-[220px] ${
    isDragging ? 'select-none' : ''
  } ${cardStateClassName}`;

  const shouldAnimateEntry = isNewWebOrder || isNew;
  const CardWrapper = shouldAnimateEntry ? motion.div : 'div';
  const cardProps = shouldAnimateEntry
    ? {
        initial: { opacity: 0, y: -8, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.4, ease: 'easeOut' },
      }
    : {};

  return (
    <CardWrapper {...cardProps} className="h-full">
    <Card
      ref={setNodeRef}
      style={style}
      className={cardClassName}
      data-pedido-id={pedido.id}
    >
      <CardHeader className="pb-2 pt-3 px-3 flex-shrink-0 bg-slate-200">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {isDraggable && pedido.estado === 'recibido' && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
              >
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-md border border-slate-300/70 bg-white/80 
                             shadow-[0_0_0_1px_rgba(148,163,184,0.25)] 
                             group-hover:border-slate-400 group-hover:bg-slate-50
                             transition-colors"
                  title="Arrastrar para adelantar a preparación"
                >
                  <GripVertical className="h-3 w-3 text-slate-500 group-hover:text-slate-700" />
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1 flex-wrap">
                <span className="text-xs font-bold text-slate-900">#{pedido.id}</span>
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
                {origenLabel && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0.5 font-semibold ${
                      origenLabel === 'WEB'
                        ? 'bg-sky-100 text-sky-800 border-sky-300'
                        : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {origenLabel}
                  </Badge>
                )}
                {isActualizadoRecientemente && (
                  <Badge className="bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 font-semibold animate-pulse">
                    Actualizado
                  </Badge>
                )}
              </div>
              <p className="text-xs font-bold text-slate-900 truncate flex-1">{pedido.clienteNombre}</p>
              {showWebDetailBadges && (
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge
                    variant="outline"
                    className="bg-indigo-100 text-indigo-800 border-indigo-300 text-[10px] px-1.5 py-0 font-semibold"
                  >
                    EFECTIVO
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] px-1.5 py-0 font-semibold"
                  >
                    Con ${montoConCuantoAbona.toLocaleString('es-AR')}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {pedido.estado !== 'listo' && (
            <div
              className={`
              inline-flex flex-col items-end justify-center flex-shrink-0
                px-2.5 py-1 rounded-md border text-xs leading-tight
                ${
                  estadoTemporal.isLate
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : (estadoTemporal.isNearLimit || estadoTemporal.isNearScheduled)
                      ? 'bg-amber-50 border-amber-300 text-amber-700'
                      : 'bg-slate-50 border-slate-300 text-slate-700'
                }
              `}
            >
              <span className="font-semibold">
                {estadoTemporal.subLabel}
              </span>
              <span className="text-xs font-semibold">
                {mainTimeText}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-2 px-3 pb-3 flex flex-col flex-grow">
        <div className="mb-2 bg-white rounded p-2 border border-slate-200">
          <ul className="space-y-1 text-slate-900">
            {pedido.items.slice(0, 2).map((item, idx) => (
              <li key={idx} className="truncate" title={`${item.cantidad}x ${item.nombre}`}>
                <span className="text-xs font-bold text-slate-900">{item.cantidad}x</span>{' '}
                <span className="text-sm truncate">{item.nombre}</span>
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
          {isPaid ? (
            <Badge className="bg-green-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none">
              ✓ PAGADO
            </Badge>
          ) : isMercadoPagoPendiente ? (
            <Badge className="bg-amber-500 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none">
              PENDIENTE MP
            </Badge>
          ) : (
            <Badge className="bg-red-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none">
              DEBE: ${pedido.total.toLocaleString('es-AR')}
            </Badge>
          )}
          {isMercadoPagoPendiente && (
            <p className="mt-1 text-[11px] font-semibold text-amber-700">
              Esperando pago Mercado Pago
            </p>
          )}
        </div>

        <div className="mt-1 flex justify-start sm:justify-end w-full">
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
    </CardWrapper>
  );
}

export const OrderCard = memo(OrderCardComponent);

/**
 * Componente OrderCardGhost - Versión estática para DragOverlay
 * Copia exacta de OrderCard pero sin interactividad y con estilos visuales diferenciados
 */
export function OrderCardGhost({ pedido }) {
  const currentTime = Date.now();

  // Usar la función utilitaria compartida para calcular el estado temporal
  const estadoTemporal = calcularEstadoTemporalPedido(pedido, currentTime);
  const origenRaw = (pedido?.origen || pedido?.origen_pedido || '').toString().toLowerCase();
  const origenLabel = (() => {
    switch (origenRaw) {
      case 'web':
        return 'WEB';
      case 'whatsapp':
        return 'WHATSAPP';
      case 'mostrador':
        return 'MOSTRADOR';
      case 'telefono':
        return 'TELEFONO';
      default:
        return null;
    }
  })();

  return (
    <Card className="mb-2 shadow-lg border-2 border-blue-400 rounded-lg overflow-hidden flex flex-col pointer-events-none select-none min-h-[220px]">
      <CardHeader className="pb-2 pt-3 px-3 bg-slate-200 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0">
              <GripVertical className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1 flex-wrap">
                <span className="text-xs font-bold text-slate-900">#{pedido.id}</span>
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
                {origenLabel && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0.5 font-semibold ${
                      origenLabel === 'WEB'
                        ? 'bg-sky-100 text-sky-800 border-sky-300'
                        : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {origenLabel}
                  </Badge>
                )}
              </div>
              <p className="text-xs font-bold text-slate-900 truncate flex-1">{pedido.clienteNombre}</p>
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

        <div className="mt-1 flex justify-start sm:justify-end w-full">
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

