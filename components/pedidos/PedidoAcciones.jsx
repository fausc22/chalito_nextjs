import { memo } from 'react';
import { Check, Package, Printer, Edit, Trash2, Banknote, Clock, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  isPedidoMercadoPagoPendiente,
  isPedidoPaid,
  shouldShowPrepararYa,
  shouldShowCambiarHorario,
} from '@/lib/pedidoPaymentUtils';
import { getMinutosHastaVentanaPreparacion } from '@/lib/pedidoTimeUtils';

/**
 * Reglas de UI unificadas para botones (OrderCard, OrderRow, ghost).
 * LISTO: visible solo en EN PREPARACION (en_cocina).
 * COBRAR: visible si el pedido aun no esta pago (incluye MP pendiente: Postnet / cobro manual).
 * ENTREGAR: visible solo en LISTO y PAGADO.
 * Si es MERCADOPAGO y no esta PAGADO, se bloquean cocina/listo/entregar/programado; COBRAR sigue disponible.
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
  onCambiarHorario,
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
  const showCobrar = shouldShowCobrar(pedido);
  const showPrepararYa = !isOperativamenteBloqueado && shouldShowPrepararYa(pedido);
  const showCambiarHorario = !isOperativamenteBloqueado && shouldShowCambiarHorario(pedido);
  const isCobrandoEste = cobrandoPedidoId != null && String(pedido.id) === String(cobrandoPedidoId);

  const handlePrepararYa = () => {
    if (isGhost || !onMarcharACocina) return;
    const minutos = getMinutosHastaVentanaPreparacion(pedido);
    if (minutos != null && minutos > 15) {
      const ok = window.confirm(
        `Este pedido está programado. Faltan aproximadamente ${minutos} minutos para la ventana de preparación automática. ¿Marchar a cocina igual?`
      );
      if (!ok) return;
    }
    onMarcharACocina(pedido.id);
  };

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

      {showPrepararYa && (
        <Button
          disabled={isGhost || isUpdatingState}
          onClick={handlePrepararYa}
          className={`flex-1 min-w-0 bg-amber-600 hover:bg-amber-700 text-white ${btnClassBase}`}
          size="sm"
          title="Iniciar preparación ahora"
        >
          <Clock className={`${btnClassIcon} mr-1 shrink-0`} />
          <span className="hidden sm:inline">Preparar ya</span>
          <span className="sm:hidden">Ya</span>
        </Button>
      )}

      {showCambiarHorario && (
        <Button
          disabled={isGhost || isUpdatingState}
          onClick={isGhost ? undefined : () => onCambiarHorario?.(pedido)}
          variant="outline"
          className={`border border-amber-300 text-amber-800 hover:bg-amber-500/10 ${btnIconOnlyClass}`}
          size="sm"
          title="Cambiar horario programado"
          style={btnIconOnlyStyle}
        >
          <CalendarClock className={btnClassIcon} />
        </Button>
      )}

      {/* COBRAR: solo cuando DEBE (no pagado); deshabilitado si el modal de cobro está abierto para este pedido */}
      {showCobrar && (
        <Button
          disabled={isGhost || isCobrandoEste || isUpdatingState}
          onClick={isGhost || isCobrandoEste ? undefined : () => onCobrar?.(pedido)}
          className={`flex-1 min-w-0 bg-green-600 hover:bg-green-700 text-white ${btnClassBase}`}
          size="sm"
          title={
            isCobrandoEste
              ? 'Cobrando...'
              : isOperativamenteBloqueado
                ? 'Registrar cobro (Postnet / MP manual)'
                : 'Cobrar pedido'
          }
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
        className={`border border-border hover:bg-muted ${btnIconOnlyClass}`}
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
        className={`border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed ${btnIconOnlyClass}`}
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
        className={`border border-red-300 hover:bg-destructive/10 text-red-600 ${btnIconOnlyClass}`}
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
