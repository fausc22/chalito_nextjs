import { memo, useRef } from 'react';
import {
  Check,
  Package,
  Printer,
  Edit,
  Trash2,
  Banknote,
  Clock,
  CalendarClock,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  isPedidoMercadoPagoPendiente,
  isPedidoPaid,
  shouldShowPrepararYa,
  shouldShowCambiarHorario,
} from '@/lib/pedidoPaymentUtils';
import { getMinutosHastaVentanaPreparacion } from '@/lib/pedidoTimeUtils';
import { getActionDensity, useContainerWidth } from '@/hooks/useContainerWidth';

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

const PRIMARY_LABELS = {
  preparar: 'Preparar ya',
  cobrar: 'COBRAR',
  listo: 'LISTO',
  entregar: 'ENTREGAR',
};

function getPrimaryLabel(key, density) {
  if (density === 'comfortable' || density === 'medium') {
    return PRIMARY_LABELS[key];
  }
  return null;
}

function PrimaryActionButton({
  density,
  isCard,
  label,
  icon: Icon,
  title,
  className,
  disabled,
  onClick,
}) {
  const iconOnly = !label;
  const isCompactCard = isCard && (density === 'compact' || density === 'minimal');

  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      size="sm"
      title={title}
      className={cn(
        'shrink-0 font-semibold whitespace-nowrap',
        isCompactCard
          ? 'h-7 w-7 p-0'
          : isCard
            ? 'h-8 px-2.5 text-xs'
            : 'h-8 px-2.5 text-xs',
        className
      )}
    >
      <Icon className={cn(isCompactCard ? 'h-3.5 w-3.5' : isCard ? 'h-3.5 w-3.5' : 'h-4 w-4', !iconOnly && 'mr-1')} />
      {label}
    </Button>
  );
}

function SecondaryIconButton({
  density,
  isCard,
  icon: Icon,
  title,
  className,
  disabled,
  onClick,
}) {
  const isCompactCard = isCard && (density === 'compact' || density === 'minimal');

  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      variant="outline"
      size="sm"
      title={title}
      className={cn(
        'shrink-0 p-0',
        isCompactCard ? 'h-7 w-7' : isCard ? 'h-8 w-8' : 'h-8 w-8',
        className
      )}
    >
      <Icon className={isCompactCard ? 'h-3.5 w-3.5' : isCard ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
    </Button>
  );
}

function SecondaryActionsMenu({
  pedido,
  estado,
  isGhost,
  isUpdatingState,
  showCambiarHorario,
  onCambiarHorario,
  onImprimir,
  onEditar,
  onCancelar,
  density,
  isCard,
}) {
  const isCompactCard = isCard && (density === 'compact' || density === 'minimal');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isGhost || isUpdatingState}
          title="Más acciones"
          className={cn('shrink-0 p-0', isCompactCard ? 'h-7 w-7' : 'h-8 w-8')}
        >
          <MoreHorizontal className={isCompactCard ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {showCambiarHorario && (
          <DropdownMenuItem
            disabled={isGhost || isUpdatingState}
            onClick={() => onCambiarHorario?.(pedido)}
          >
            <CalendarClock className="h-4 w-4" />
            Cambiar horario
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          disabled={isGhost || isUpdatingState}
          onClick={() => onImprimir?.(pedido)}
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isGhost || isUpdatingState || estado === 'entregado' || estado === 'cancelado'}
          onClick={() => onEditar(pedido)}
        >
          <Edit className="h-4 w-4" />
          Editar pedido
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isGhost || isUpdatingState}
          onClick={() => onCancelar(pedido)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Cancelar pedido
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
  const containerRef = useRef(null);
  const containerWidth = useContainerWidth(containerRef);
  const density = containerWidth === 0 ? 'compact' : getActionDensity(containerWidth);

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

  const isCard = variant === 'card';
  const isCompactCard = isCard && (density === 'compact' || density === 'minimal');
  const showSecondaryInline = density !== 'minimal';
  const rowGap = isCompactCard ? 'gap-1' : 'gap-1.5';

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
    if (!isPaid) return;
    onEntregar?.(pedido.id);
  };

  const cobrarTitle = isCobrandoEste
    ? 'Cobrando...'
    : isOperativamenteBloqueado
      ? 'Registrar cobro (Postnet / MP manual)'
      : 'Cobrar pedido';

  return (
    <div ref={containerRef} className="w-full min-w-0">
      {/* Fila 1: acciones principales — siempre visibles */}
      <div className={cn('flex flex-wrap', rowGap)}>
        {showPrepararYa && (
          <PrimaryActionButton
            density={density}
            isCard={isCard}
            label={getPrimaryLabel('preparar', density)}
            icon={Clock}
            title="Iniciar preparación ahora"
            disabled={isGhost || isUpdatingState}
            onClick={handlePrepararYa}
            className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
        )}

        {showListo && (
          <PrimaryActionButton
            density={density}
            isCard={isCard}
            label={getPrimaryLabel('listo', density)}
            icon={Check}
            title="Marcar como listo"
            disabled={isGhost || isUpdatingState}
            onClick={handleListo}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
        )}

        {showEntregar && (
          <PrimaryActionButton
            density={density}
            isCard={isCard}
            label={getPrimaryLabel('entregar', density)}
            icon={Package}
            title="Entregar pedido"
            disabled={isGhost || isUpdatingState}
            onClick={handleEntregar}
            className="bg-green-600 hover:bg-green-700 text-white"
          />
        )}

        {showCobrar && (
          <PrimaryActionButton
            density={density}
            isCard={isCard}
            label={getPrimaryLabel('cobrar', density)}
            icon={Banknote}
            title={cobrarTitle}
            disabled={isGhost || isCobrandoEste || isUpdatingState}
            onClick={isGhost || isCobrandoEste ? undefined : () => onCobrar?.(pedido)}
            className="bg-green-600 hover:bg-green-700 text-white"
          />
        )}
      </div>

      {/* Fila 2: acciones secundarias */}
      <div className={cn('mt-1 flex flex-wrap', rowGap)}>
          {showSecondaryInline ? (
            <>
              {showCambiarHorario && (
                <SecondaryIconButton
                  density={density}
                  isCard={isCard}
                  icon={CalendarClock}
                  title="Cambiar horario programado"
                  disabled={isGhost || isUpdatingState}
                  onClick={isGhost ? undefined : () => onCambiarHorario?.(pedido)}
                  className="border-amber-300 text-amber-800 hover:bg-amber-500/10"
                />
              )}
              <SecondaryIconButton
                density={density}
                isCard={isCard}
                icon={Printer}
                title="Imprimir"
                disabled={isGhost || isUpdatingState}
                onClick={isGhost ? undefined : () => onImprimir?.(pedido)}
                className="border-border hover:bg-muted"
              />
              <SecondaryIconButton
                density={density}
                isCard={isCard}
                icon={Edit}
                title={estado === 'entregado' || estado === 'cancelado' ? 'No se puede editar' : 'Editar pedido'}
                disabled={isGhost || isUpdatingState || estado === 'entregado' || estado === 'cancelado'}
                onClick={isGhost ? undefined : () => onEditar(pedido)}
                className="border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <SecondaryIconButton
                density={density}
                isCard={isCard}
                icon={Trash2}
                title="Cancelar pedido"
                disabled={isGhost || isUpdatingState}
                onClick={isGhost ? undefined : () => onCancelar(pedido)}
                className="border-red-300 hover:bg-destructive/10 text-red-600"
              />
            </>
          ) : (
            <SecondaryActionsMenu
              pedido={pedido}
              estado={estado}
              isGhost={isGhost}
              isUpdatingState={isUpdatingState}
              showCambiarHorario={showCambiarHorario}
              onCambiarHorario={onCambiarHorario}
              onImprimir={onImprimir}
              onEditar={onEditar}
              onCancelar={onCancelar}
              density={density}
              isCard={isCard}
            />
          )}
      </div>
    </div>
  );
}

export const PedidoAcciones = memo(PedidoAccionesComponent);
