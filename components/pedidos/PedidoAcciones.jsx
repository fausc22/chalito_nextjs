import { memo } from 'react';
import { Check, Package, Printer, Edit, Trash2, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isPedidoMercadoPagoPendiente, isPedidoPaid } from '@/lib/pedidoPaymentUtils';

/**
 * Reglas de UI unificadas para botones (OrderCard, OrderRow, ghost).
 * LISTO: visible solo en EN PREPARACION (en_cocina).
 * COBRAR: visible si el pedido aun no esta pago (independiente del estado).
 * ENTREGAR: visible solo en LISTO y PAGADO.
 * Si es MERCADOPAGO y no esta PAGADO, se bloquean acciones operativas.
 */
export function shouldShowListo(pedido) {
  const e = pedido?.estado;
  return e === 'en_cocina';
}

export function shouldShowEntregar(pedido) {
  if (!pedido) return false;
  return pedido.estado === 'listo' && isPedidoPaid(pedido);
}

export function shouldShowCobrar(pedido) {
  if (!pedido) return false;
  return !isPedidoPaid(pedido);
}

/**
 * Lógica unificada de botones para OrderCard y OrderRow.
 * Usa shouldShowListo / shouldShowCobrar para consistencia en card, row y ghost.
 */
function PedidoAccionesComponent({
  pedido,
  onMarcharACocina,
  onListo,
  onEntregar,
  onEditar,
  onCancelar,
  onCobrar,
  onImprimir,
  isGhost = false,
  variant = 'card',
  cobrandoPedidoId = null,
}) {
  const estado = pedido.estado;
  const isPaid = isPedidoPaid(pedido);
  const isOperativamenteBloqueado = isPedidoMercadoPagoPendiente(pedido);
  const isUpdatingState = Boolean(pedido?.uiPendingStateUpdate);

  const showListo = !isOperativamenteBloqueado && shouldShowListo(pedido);
  const showEntregar = !isOperativamenteBloqueado && shouldShowEntregar(pedido);
  const showCobrar = !isOperativamenteBloqueado && shouldShowCobrar(pedido);
  const isCobrandoEste = cobrandoPedidoId != null && String(pedido.id) === String(cobrandoPedidoId);

  const handleListo = () => {
    if (isGhost) return;
    onListo(pedido.id);
  };

  const handleEntregar = () => {
    if (isGhost) return;
    if (!isPaid) {
      return;
    }
    onEntregar?.(pedido.id);
  };

  const isCard = variant === 'card';
  const btnClassIcon = isCard ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const btnClassBase = isCard
    ? 'h-8 flex-shrink-0 text-xs font-semibold'
    : 'h-8 px-2 sm:px-3 text-[11px] sm:text-xs font-semibold whitespace-normal sm:whitespace-nowrap';
  const btnIconOnlyClass = isCard
    ? 'h-8 flex-shrink-0'
    : 'h-8 w-8 p-0 flex-shrink-0';
  const btnIconOnlyStyle = isCard ? { minWidth: 32, padding: '0 8px' } : undefined;

  return (
    <div className={`flex gap-1.5 flex-shrink-0 flex-wrap ${isCard ? 'w-full overflow-hidden' : 'w-full sm:w-auto'}`}>
      {/* LISTO: solo en en_cocina */}
      {showListo && (
        <Button
          disabled={isGhost || isUpdatingState}
          onClick={handleListo}
          className={`flex-1 min-w-0 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed ${btnClassBase}`}
          size="sm"
          title="Marcar como listo"
        >
          <Check className={`${btnClassIcon} mr-1`} />
          LISTO
        </Button>
      )}

      {/* ENTREGAR: solo cuando listo y pagado */}
      {showEntregar && (
        <Button
          disabled={isGhost || isUpdatingState}
          onClick={handleEntregar}
          className={`flex-1 min-w-0 bg-green-600 hover:bg-green-700 text-white ${btnClassBase}`}
          size="sm"
          title="Entregar pedido"
        >
          <Package className={`${btnClassIcon} mr-1`} />
          ENTREGAR
        </Button>
      )}

      {/* COBRAR: solo cuando DEBE (no pagado); deshabilitado si el modal de cobro está abierto para este pedido */}
      {showCobrar && (
        <Button
          disabled={isGhost || isCobrandoEste || isUpdatingState}
          onClick={isGhost || isCobrandoEste ? undefined : () => onCobrar?.(pedido)}
          className={`flex-1 min-w-0 bg-green-600 hover:bg-green-700 text-white ${btnClassBase}`}
          size="sm"
          title={isCobrandoEste ? 'Cobrando...' : 'Cobrar pedido'}
        >
          <Banknote className={`${btnClassIcon} mr-1`} />
          COBRAR
        </Button>
      )}

      {/* Imprimir */}
      <Button
          disabled={isGhost || isUpdatingState}
        onClick={isGhost ? undefined : () => onImprimir?.(pedido)}
        variant="outline"
        className={`border border-slate-300 hover:bg-slate-100 ${btnIconOnlyClass}`}
        size="sm"
        title="Imprimir"
        style={btnIconOnlyStyle}
      >
        <Printer className={btnClassIcon} />
      </Button>

      {/* Editar */}
      <Button
          disabled={isGhost || isUpdatingState || estado === 'entregado' || estado === 'cancelado'}
        onClick={isGhost ? undefined : () => onEditar(pedido)}
        variant="outline"
        className={`border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed ${btnIconOnlyClass}`}
        size="sm"
        title={estado === 'entregado' || estado === 'cancelado' ? 'No se puede editar' : 'Editar pedido'}
        style={btnIconOnlyStyle}
      >
        <Edit className={btnClassIcon} />
      </Button>

      {/* Eliminar */}
      <Button
          disabled={isGhost || isUpdatingState}
        onClick={isGhost ? undefined : () => onCancelar(pedido)}
        variant="outline"
        className={`border border-red-300 hover:bg-red-50 text-red-600 ${btnIconOnlyClass}`}
        size="sm"
        title="Cancelar pedido"
        style={btnIconOnlyStyle}
      >
        <Trash2 className={btnClassIcon} />
      </Button>
    </div>
  );
}

export const PedidoAcciones = memo(PedidoAccionesComponent);
