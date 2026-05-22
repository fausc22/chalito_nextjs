import Link from 'next/link';
import { Clock, Plus, Search, X, ChevronLeft, ChevronRight, ClipboardCheck, Store, LayoutGrid, List, ChefHat, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useConnectionStatus, CONNECTION_STATUS } from '../../contexts/ConnectionStatusContext';
import { PrinterStatusIndicator } from './PrinterStatusIndicator';

const TOPBAR_OFFSET = 'var(--admin-topbar-height, 72px)';

export function PedidosSidebar({
  demoraCocina,
  setDemoraCocina,
  onNuevoPedido,
  onVerPedidosEntregados,
  busquedaPedidos,
  setBusquedaPedidos,
  soundEnabled = false,
  onSoundToggle,
  isOpen,
  setIsOpen,
  isMobile = false,
  vistaTabla = false,
  onCambiarVista,
  onOpenPrinterHelp,
}) {
  const { status, getStatusTooltip, getStatusText } = useConnectionStatus();

  const getIndicatorStyles = () => {
    switch (status) {
      case CONNECTION_STATUS.ACTIVE:
        return {
          color: 'bg-emerald-500/100/100',
          textColor: 'text-green-500',
          pulse: false,
        };
      case CONNECTION_STATUS.WITH_DELAYS:
        return {
          color: 'bg-amber-500/100',
          textColor: 'text-yellow-500',
          pulse: false,
        };
      case CONNECTION_STATUS.INACTIVE:
        return {
          color: 'bg-destructive/100',
          textColor: 'text-red-500',
          pulse: false,
        };
      default:
        return {
          color: 'bg-muted0',
          textColor: 'text-muted-foreground',
          pulse: false,
        };
    }
  };

  const indicatorStyles = getIndicatorStyles();

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 bg-black/50"
          style={{ top: TOPBAR_OFFSET }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          ${
            isMobile
              ? `fixed left-0 z-50 w-56 transform transition-transform duration-300 ease-out ${
                  isOpen ? 'translate-x-0' : '-translate-x-full'
                }`
              : 'h-full transition-all duration-500 ease-out'
          }
          bg-slate-800 border-r border-slate-700
          ${!isMobile && isOpen ? 'w-56' : ''}
          ${!isMobile && !isOpen ? 'w-14' : ''}
          overflow-hidden
          flex flex-col
          flex-shrink-0
          relative
        `}
        style={
          isMobile
            ? {
                top: TOPBAR_OFFSET,
                height: `calc(100vh - ${TOPBAR_OFFSET})`,
              }
            : undefined
        }
      >
        <div className="relative flex h-16 flex-shrink-0 flex-col justify-between p-2">
          {isOpen ? (
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Store className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <div>
                  <h2 className="text-sm font-bold text-white">El Chalito</h2>
                  <div className="flex items-center gap-1">
                    <div
                      className={`h-1.5 w-1.5 ${indicatorStyles.color} rounded-full ${indicatorStyles.pulse ? 'animate-pulse' : ''}`}
                      title={getStatusTooltip()}
                    />
                    <span className={`text-[10px] font-medium ${indicatorStyles.textColor}`}>
                      {getStatusText()}
                    </span>
                    {onOpenPrinterHelp && (
                      <PrinterStatusIndicator onOpenHelp={onOpenPrinterHelp} />
                    )}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:bg-slate-700 hover:text-white"
                title="Cerrar panel"
                aria-label="Cerrar panel de pedidos"
              >
                {isMobile ? <X className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <div
                className={`h-3 w-3 flex-shrink-0 ${indicatorStyles.color} rounded-full ${indicatorStyles.pulse ? 'animate-pulse' : ''}`}
                title={getStatusTooltip()}
              />
              {onOpenPrinterHelp && (
                <PrinterStatusIndicator onOpenHelp={onOpenPrinterHelp} compact />
              )}
              {!isMobile ? (
                <Button
                  onClick={() => setIsOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:bg-slate-700 hover:text-white"
                  title="Abrir panel"
                  aria-label="Abrir panel de pedidos"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          )}
          <Separator className="bg-slate-700" />
        </div>

        {isOpen && (
          <>
            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              <div className="space-y-2.5">
                <Button
                  onClick={onNuevoPedido}
                  className="h-9 w-full bg-green-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-green-700"
                  size="sm"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  NUEVO PEDIDO
                  <span className="ml-1.5 text-[10px] opacity-80">(F1)</span>
                </Button>

                <Link href="/cocina" className="block w-full">
                  <Button
                    className="h-9 w-full border border-slate-600 bg-slate-700 px-3 py-2 text-xs text-white hover:bg-slate-600"
                    size="sm"
                  >
                    <ChefHat className="mr-1.5 h-4 w-4" />
                    VISTA COCINA
                  </Button>
                </Link>

                {onSoundToggle && (
                  <Button
                    onClick={() => onSoundToggle(!soundEnabled)}
                    className="h-9 w-full border border-slate-600 bg-slate-700 px-3 py-2 text-xs text-white hover:bg-slate-600"
                    size="sm"
                    title={
                      soundEnabled
                        ? 'Sonido activado - click para desactivar'
                        : 'Sonido desactivado - click para activar'
                    }
                  >
                    {soundEnabled ? (
                      <Volume2 className="mr-1.5 h-4 w-4" />
                    ) : (
                      <VolumeX className="mr-1.5 h-4 w-4" />
                    )}
                    Sonido {soundEnabled ? 'ON' : 'OFF'}
                  </Button>
                )}

                <Button
                  onClick={onCambiarVista}
                  className="h-9 w-full border border-slate-600 bg-slate-700 px-3 py-2 text-xs text-white hover:bg-slate-600"
                  size="sm"
                >
                  {vistaTabla ? (
                    <>
                      <LayoutGrid className="mr-1.5 h-4 w-4" />
                      VISTA CARDS
                    </>
                  ) : (
                    <>
                      <List className="mr-1.5 h-4 w-4" />
                      VISTA TABLA
                    </>
                  )}
                </Button>
              </div>

              <Card className="border-slate-600 bg-slate-700 p-2">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-300">BUSCAR PEDIDOS</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="ID o nombre..."
                      value={busquedaPedidos}
                      onChange={(e) => setBusquedaPedidos(e.target.value)}
                      className="h-7 border-slate-600 bg-slate-800 pl-7 text-xs text-white shadow-none placeholder:text-muted-foreground focus:border-slate-500 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
              </Card>

              <Button
                onClick={onVerPedidosEntregados}
                className="h-9 w-full border border-slate-600 bg-slate-700 px-3 py-2 text-xs text-white hover:bg-slate-600"
                size="sm"
              >
                <ClipboardCheck className="mr-1.5 h-4 w-4" />
                PEDIDOS ENTREGADOS
              </Button>
            </div>

            <div className="flex-shrink-0 border-t border-slate-700 p-2">
              <div className="flex justify-center">
                <Card className="w-fit border-slate-600 bg-slate-700 p-2">
                  <div className="space-y-1.5">
                    <label className="block text-center text-[10px] font-semibold text-slate-300">
                      DEMORA COCINA
                    </label>
                    <div className="flex items-center justify-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={demoraCocina}
                          onChange={(e) => setDemoraCocina(parseInt(e.target.value, 10) || 0)}
                          className="h-7 w-12 rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-center text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold text-slate-300">MIN</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}

        {!isOpen && !isMobile && (
          <>
            <div className="flex flex-1 flex-col items-center justify-start space-y-2.5 overflow-y-auto px-2 pt-2">
              <Button
                onClick={onNuevoPedido}
                className="h-9 w-full bg-green-600 text-white hover:bg-green-700"
                size="sm"
                title="Nuevo Pedido (F1)"
              >
                <Plus className="h-4 w-4" />
              </Button>

              <Link href="/cocina" className="block w-full">
                <Button
                  className="h-9 w-full bg-slate-700 text-white hover:bg-slate-600"
                  size="sm"
                  title="Vista Cocina"
                >
                  <ChefHat className="h-4 w-4" />
                </Button>
              </Link>

              {onSoundToggle && (
                <Button
                  onClick={() => onSoundToggle(!soundEnabled)}
                  className="h-9 w-full bg-slate-700 text-white hover:bg-slate-600"
                  size="sm"
                  title={`Sonido ${soundEnabled ? 'ON' : 'OFF'}`}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              )}

              <Button
                onClick={onCambiarVista}
                className="h-9 w-full bg-slate-700 text-white hover:bg-slate-600"
                size="sm"
                title={vistaTabla ? 'Vista Cards' : 'Vista Tabla'}
              >
                {vistaTabla ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </Button>

              <Button
                onClick={() => {
                  setIsOpen(true);
                  setTimeout(() => {
                    const searchInput = document.querySelector('input[placeholder="ID o nombre..."]');
                    searchInput?.focus();
                  }, 100);
                }}
                className="h-9 w-full bg-slate-700 text-white hover:bg-slate-600"
                size="sm"
                title="Buscar Pedidos"
              >
                <Search className="h-4 w-4" />
              </Button>

              <Button
                onClick={onVerPedidosEntregados}
                className="h-9 w-full bg-slate-700 text-white hover:bg-slate-600"
                size="sm"
                title="Pedidos Entregados"
              >
                <ClipboardCheck className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-shrink-0 border-t border-slate-700 p-2">
              <div className="flex justify-center">
                <div className="min-w-[32px] rounded border border-slate-600 bg-slate-700 px-2 py-1.5">
                  <div className="text-center">
                    <div className="text-xs font-bold text-white">{demoraCocina}</div>
                    <div className="mt-0.5 text-[8px] text-muted-foreground">MIN</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
