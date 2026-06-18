import { memo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { calcularEstadoTemporalPedido } from '@/lib/pedidoTimeUtils';
import { isPedidoMercadoPagoPendiente, isPedidoPaid } from '@/lib/pedidoPaymentUtils';
import { ROW_INLINE_MIN, useContainerWidth } from '@/hooks/useContainerWidth';
import { PedidoAcciones } from './PedidoAcciones';

function OrderRowBodyLayout({ pedido, isGhost = false, cobrandoPedidoId = null, handlers = {} }) {
  const bodyRef = useRef(null);
  const bodyWidth = useContainerWidth(bodyRef);
  const isInlineLayout = bodyWidth >= ROW_INLINE_MIN;

  return (
    <div ref={bodyRef} className="pt-2 px-3 pb-3 flex flex-col flex-grow bg-card min-w-0">
      <div className={cn('flex gap-3', isInlineLayout ? 'flex-row items-end' : 'flex-col')}>
        <div className={cn('bg-card rounded p-2 border border-border min-w-0', isInlineLayout ? 'flex-1' : 'w-full')}>
          <div className="text-foreground">
            {pedido.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="truncate" title={`${item.cantidad}x ${item.nombre}`}>
                <span className="text-xs font-bold">{item.cantidad}x</span>{' '}
                <span className="text-sm truncate">{item.nombre}</span>
              </div>
            ))}
            {pedido.items.length > 3 && (
              <div className="text-xs text-muted-foreground font-medium">
                +{pedido.items.length - 3} más...
              </div>
            )}
          </div>
        </div>
        <div className={cn(isInlineLayout ? 'shrink-0 self-end' : 'w-full')}>
          <PedidoAcciones
            pedido={pedido}
            onMarcharACocina={handlers.onMarcharACocina}
            onListo={handlers.onListo}
            onEntregar={handlers.onEntregar}
            onEditar={handlers.onEditar}
            onCambiarHorario={handlers.onCambiarHorario}
            onCancelar={handlers.onCancelar}
            onCobrar={handlers.onCobrar}
            onImprimir={handlers.onImprimir}
            isGhost={isGhost}
            variant="row"
            cobrandoPedidoId={cobrandoPedidoId}
          />
        </div>
      </div>
    </div>
  );
}

function OrderRowComponent({
  pedido,
  onMarcharACocina,
  onListo,
  onEntregar,
  onEditar,
  onCambiarHorario,
  onCancelar,
  onCobrar,
  onImprimir,
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
  const horarioProgramado = pedido?.horaProgramada || pedido?.horario_entrega_formateado || null;
  const prioridadRaw = (pedido?.prioridad || '').toString().toUpperCase();
  // Solo mostrar detalles de medio de pago cuando es pedido WEB en efectivo
  const showWebDetailBadges = isWebOrder && medioPagoRaw === 'EFECTIVO' && Number.isFinite(montoConCuantoAbona) && montoConCuantoAbona > 0;
  
  // Feedback visual temporal para pedidos actualizados recientemente (2 segundos) o nuevos WEB
  const isActualizadoRecientemente = pedido.actualizadoRecientemente === true;
  const showHighlight = isHighlighted || isActualizadoRecientemente;
  const isPaid = isPedidoPaid(pedido);
  const isMercadoPagoPendiente = isPedidoMercadoPagoPendiente(pedido);
  const isPendingUpdate = Boolean(pedido.uiPendingStateUpdate);

  const isNewEntry = isNewWebOrder || isNew;
  const RowWrapper = isNewEntry ? motion.div : 'div';
  const rowProps = isNewEntry
    ? {
        initial: { opacity: 0, y: -8, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.4, ease: 'easeOut' },
      }
    : {};

  return (
    <RowWrapper {...rowProps}>
    <div
      ref={setNodeRef}
      style={style}
      data-pedido-id={pedido.id}
      className={`
        group relative bg-card rounded-lg overflow-hidden
        hover:shadow-md transition-all mb-3 flex flex-col
        ${showHighlight ? 'bg-amber-100 border-amber-500 ring-1 ring-amber-300 animate-breathe' : 'border border-border'}
        ${isDragging ? 'select-none' : ''}
        w-full min-h-[100px]
      `}
    >
      {isPendingUpdate && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-card/75 backdrop-blur-[1px]"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            <span>Procesando…</span>
          </div>
        </div>
      )}
      {/* Header Superior: Fondo oscuro igual a las cards */}
      <div className="bg-accent pb-2 pt-3 px-3 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Lado izquierdo: Drag Handle, ID, Origen, Cliente, Badge Retiro/Delivery */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {isDraggable && pedido.estado === 'recibido' && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
              >
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-md border border-border/70 bg-card/80 
                             shadow-[0_0_0_1px_rgba(148,163,184,0.25)]
                             group-hover:border-slate-400 group-hover:bg-muted
                             transition-colors"
                  title="Arrastrar para adelantar a preparación"
                >
                  <div className="flex flex-col gap-[2px]">
                    <div className="w-0.5 h-0.5 bg-muted0 rounded-full" />
                    <div className="w-0.5 h-0.5 bg-muted0 rounded-full" />
                    <div className="w-0.5 h-0.5 bg-muted0 rounded-full" />
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col flex-shrink-0 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-bold text-foreground">#{pedido.id}</span>
                {pedido.tipoEntrega === 'delivery' && (
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800 border-blue-400 text-[10px] px-1 py-0.5 font-semibold whitespace-nowrap flex-shrink-0"
                  >
                    DELIVERY
                  </Badge>
                )}
                {pedido.tipoEntrega === 'retiro' && (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-800 border-amber-400 text-[10px] px-1 py-0.5 font-semibold whitespace-nowrap flex-shrink-0"
                  >
                    RETIRO
                  </Badge>
                )}
                {origenLabel && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0.5 font-semibold whitespace-nowrap flex-shrink-0 ${
                      origenLabel === 'WEB'
                        ? 'bg-sky-100 text-sky-800 border-sky-300'
                        : 'bg-muted text-foreground border-border'
                    }`}
                  >
                    {origenLabel}
                  </Badge>
                )}
                {isActualizadoRecientemente && (
                  <Badge className="bg-amber-500/100 text-white text-[10px] px-1.5 py-0.5 font-semibold animate-pulse whitespace-nowrap flex-shrink-0">
                    Actualizado
                  </Badge>
                )}
              </div>
              <p className="text-xs font-bold text-foreground truncate min-w-0">
                {pedido.clienteNombre}
              </p>
            </div>
          </div>

          {/* Lado derecho: Badge Debe/Pagado y Badge Creado/Para alineados a la derecha */}
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
            {/* Badge Estado de pago */}
            {isPaid ? (
              <Badge className="bg-green-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none whitespace-nowrap">
                ✓ PAGADO
              </Badge>
            ) : isMercadoPagoPendiente ? (
              <Badge className="bg-amber-500/100 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none whitespace-nowrap">
                PENDIENTE MP
              </Badge>
            ) : (
              <Badge className="bg-red-600 text-white font-semibold text-xs px-2 py-0.5 pointer-events-none whitespace-nowrap" title={`Debe: $${pedido.total.toLocaleString('es-AR')}`}>
                DEBE ${pedido.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </Badge>
            )}

            {/* Badge Tiempo/Hora refinado */}
            {pedido.estado !== 'listo' && (
              <div
                className={`
                  inline-flex flex-col items-end justify-center flex-shrink-0
                  px-2.5 py-1 rounded-md border text-xs leading-tight
                  ${
                    isPendingUpdate
                      ? 'border-border bg-muted text-muted-foreground'
                      : estadoTemporal.isLate
                        ? 'bg-destructive/10 border-red-300 text-red-700'
                        : (estadoTemporal.isNearLimit || estadoTemporal.isNearScheduled)
                          ? 'bg-amber-500/10 border-amber-300 text-amber-700'
                          : 'bg-muted border-border text-foreground'
                  }
                `}
              >
                {isPendingUpdate ? (
                  <>
                    <span className="h-3 w-14 animate-pulse rounded bg-accent" />
                    <span className="mt-1 h-3 w-10 animate-pulse rounded bg-accent" />
                  </>
                ) : (
                  <>
                    <span className="font-semibold">
                      {estadoTemporal.subLabel}
                    </span>
                    <span className="text-xs font-semibold">
                      {mainTimeText}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        {showWebDetailBadges && (
          <div className="mt-2 pl-6 flex flex-wrap gap-1">
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
        {isMercadoPagoPendiente && (
          <p className="mt-2 pl-6 text-[11px] font-semibold text-amber-700">
            Esperando pago Mercado Pago (web) o usá COBRAR si cobraste con Postnet
          </p>
        )}
      </div>

      <OrderRowBodyLayout
        pedido={pedido}
        isGhost={false}
        cobrandoPedidoId={cobrandoPedidoId}
        handlers={{
          onMarcharACocina,
          onListo,
          onEntregar,
          onEditar,
          onCambiarHorario,
          onCancelar,
          onCobrar,
          onImprimir,
        }}
      />
    </div>
    </RowWrapper>
  );
}

export const OrderRow = memo(OrderRowComponent);

/**
 * Componente OrderRowGhost - Versión estática para DragOverlay
 * Copia exacta de OrderRow pero sin interactividad y con estilos visuales diferenciados
 */
export function OrderRowGhost({ pedido }) {
  const currentTime = Date.now();

  // Usar la función utilitaria compartida para calcular el estado temporal (igual que OrderRow)
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
    <div className="bg-card border-2 border-blue-400 rounded-lg overflow-hidden shadow-lg flex flex-col pointer-events-none select-none w-full min-h-[100px]">
      {/* Header Superior: Fondo oscuro igual a las cards */}
      <div className="bg-accent pb-2 pt-3 px-3 flex-shrink-0">
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
            
            <div className="flex flex-col flex-shrink-0 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-bold text-foreground">#{pedido.id}</span>
                {pedido.tipoEntrega === 'delivery' && (
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800 border-blue-400 text-[10px] px-1 py-0.5 font-semibold whitespace-nowrap flex-shrink-0"
                  >
                    DELIVERY
                  </Badge>
                )}
                {pedido.tipoEntrega === 'retiro' && (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 text-amber-800 border-amber-400 text-[10px] px-1 py-0.5 font-semibold whitespace-nowrap flex-shrink-0"
                  >
                    RETIRO
                  </Badge>
                )}
                {origenLabel && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0.5 font-semibold whitespace-nowrap flex-shrink-0 ${
                      origenLabel === 'WEB'
                        ? 'bg-sky-100 text-sky-800 border-sky-300'
                        : 'bg-muted text-foreground border-border'
                    }`}
                  >
                    {origenLabel}
                  </Badge>
                )}
              </div>
              <p className="text-xs font-bold text-foreground truncate min-w-0">
                {pedido.clienteNombre}
              </p>
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
                  : 'bg-accent border border-slate-400'}
            `}>
              <div>
                <p className={`text-[10px] font-medium ${
                  estadoTemporal.isLate || estadoTemporal.isNearScheduled 
                    ? 'text-red-700' 
                    : estadoTemporal.isNearLimit 
                      ? 'text-yellow-700'
                      : 'text-foreground'
                }`}>
                  {estadoTemporal.subLabel}
                </p>
                <p className={`text-xs font-bold ${
                  estadoTemporal.isLate || estadoTemporal.isNearScheduled 
                    ? 'text-red-900' 
                    : estadoTemporal.isNearLimit 
                      ? 'text-yellow-900'
                      : 'text-foreground'
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

      <OrderRowBodyLayout
        pedido={pedido}
        isGhost
        handlers={{
          onMarcharACocina: () => {},
          onListo: () => {},
          onEditar: () => {},
          onCancelar: () => {},
          onCobrar: () => {},
          onImprimir: () => {},
        }}
      />
    </div>
  );
}

