import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { calcularEstadoTemporalPedido } from '@/lib/pedidoTimeUtils';
import { PedidoAcciones } from './PedidoAcciones';

export function OrderRow({
  pedido,
  onMarcharACocina,
  onListo,
  onEntregar,
  onEditar,
  onCancelar,
  onCobrar,
  onImprimir,
  cobrandoPedidoId,
  isHighlighted = false,
  isNewWebOrder = false,
  isNew = false,
  isDraggable = false,
}) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `pedido-${pedido.id}`,
    data: {
      pedido: pedido,
      estado: pedido.estado,
    },
  });

  // Actualizar el tiempo cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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
  const estadoPagoRaw = (pedido?.estado_pago || (pedido?.paymentStatus === 'paid' ? 'PAGADO' : 'DEBE')).toString().toUpperCase();
  const montoConCuantoAbona = Number(pedido?.monto_con_cuanto_abona);
  const horarioProgramado = pedido?.horaProgramada || pedido?.horario_entrega_formateado || null;
  const prioridadRaw = (pedido?.prioridad || '').toString().toUpperCase();
  // Solo mostrar detalles de medio de pago cuando es pedido WEB en efectivo
  const showWebDetailBadges = isWebOrder && medioPagoRaw === 'EFECTIVO' && Number.isFinite(montoConCuantoAbona) && montoConCuantoAbona > 0;
  
  // Feedback visual temporal para pedidos actualizados recientemente (2 segundos) o nuevos WEB
  const isActualizadoRecientemente = pedido.actualizadoRecientemente === true;
  const showHighlight = isHighlighted || isActualizadoRecientemente;

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
        group bg-white rounded-lg overflow-hidden
        hover:shadow-md transition-all mb-3 flex flex-col
        ${showHighlight ? 'bg-yellow-50 border-yellow-400 ring-1 ring-yellow-200 animate-breathe' : 'border border-slate-300'}
        ${isDragging ? 'select-none' : ''}
        w-full min-h-[100px]
      `}
    >
      {/* Header Superior: Fondo oscuro igual a las cards */}
      <div className="bg-slate-200 pb-2 pt-3 px-3 flex-shrink-0">
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
                  className="flex items-center justify-center w-6 h-6 rounded-md border border-slate-300/70 bg-white/80 
                             shadow-[0_0_0_1px_rgba(148,163,184,0.25)]
                             group-hover:border-slate-400 group-hover:bg-slate-50
                             transition-colors"
                  title="Arrastrar para adelantar a preparación"
                >
                  <div className="flex flex-col gap-[2px]">
                    <div className="w-0.5 h-0.5 bg-slate-500 rounded-full" />
                    <div className="w-0.5 h-0.5 bg-slate-500 rounded-full" />
                    <div className="w-0.5 h-0.5 bg-slate-500 rounded-full" />
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col flex-shrink-0 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-bold text-slate-900">#{pedido.id}</span>
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
                        : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {origenLabel}
                  </Badge>
                )}
                {isActualizadoRecientemente && (
                  <Badge className="bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 font-semibold animate-pulse whitespace-nowrap flex-shrink-0">
                    Actualizado
                  </Badge>
                )}
              </div>
              <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                {pedido.clienteNombre}
              </p>
            </div>
          </div>

          {/* Lado derecho: Badge Debe/Pagado y Badge Creado/Para alineados a la derecha */}
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
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

            {/* Badge Tiempo/Hora refinado */}
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
      </div>

      {/* Cuerpo Inferior: Items y Acciones - Fondo blanco */}
      <div className="pt-2 px-3 pb-3 flex flex-col flex-grow bg-white">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          {/* Items del pedido */}
          <div className="bg-white rounded p-2 border border-slate-200 flex-1 min-w-0 lg:max-w-[70%]">
            <div className="text-slate-900">
              {pedido.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="truncate" title={`${item.cantidad}x ${item.nombre}`}>
                  <span className="text-xs font-bold">{item.cantidad}x</span>{' '}
                  <span className="text-sm truncate">{item.nombre}</span>
                </div>
              ))}
              {pedido.items.length > 3 && (
                <div className="text-xs text-slate-500 font-medium">
                  +{pedido.items.length - 3} más...
                </div>
              )}
            </div>
          </div>

          {/* Acciones: bloque fijo a la derecha en escritorio */}
          <div className="w-full lg:w-auto lg:flex-shrink-0 lg:self-end">
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
    </div>
    </RowWrapper>
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
    <div className="bg-white border-2 border-blue-400 rounded-lg overflow-hidden shadow-lg flex flex-col pointer-events-none select-none w-full min-h-[100px]">
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
            
            <div className="flex flex-col flex-shrink-0 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-bold text-slate-900">#{pedido.id}</span>
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
                        : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {origenLabel}
                  </Badge>
                )}
              </div>
              <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
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
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          {/* Items del pedido */}
          <div className="bg-white rounded p-2 border border-slate-200 flex-1 min-w-0 md:max-w-[70%]">
            <div className="text-slate-800">
              {pedido.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="truncate" title={`${item.cantidad}x ${item.nombre}`}>
                  <span className="text-xs font-bold">{item.cantidad}x</span>{' '}
                  <span className="text-sm truncate">{item.nombre}</span>
                </div>
              ))}
              {pedido.items.length > 3 && (
                <div className="text-xs text-slate-500 font-medium">
                  +{pedido.items.length - 3} más...
                </div>
              )}
            </div>
          </div>

          {/* Acciones: bloque fijo a la derecha en escritorio */}
          <div className="md:flex-shrink-0 md:self-end">
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
    </div>
  );
}

