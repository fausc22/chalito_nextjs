import Link from 'next/link';
import { Clock, Plus, Search, Package, Menu, X, ChevronLeft, ChevronRight, ClipboardCheck, Store, LayoutGrid, List, ChefHat, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useConnectionStatus, CONNECTION_STATUS } from '../../contexts/ConnectionStatusContext';

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
  navbarHeightPx = 64,
  onCambiarVista
}) {
  const { status, getStatusTooltip, getStatusText } = useConnectionStatus();

  // Determinar el color y animación del indicador según el estado
  const getIndicatorStyles = () => {
    switch (status) {
      case CONNECTION_STATUS.ACTIVE:
        return {
          color: 'bg-green-500',
          textColor: 'text-green-500',
          pulse: false,
        };
      case CONNECTION_STATUS.WITH_DELAYS:
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-500',
          pulse: false,
        };
      case CONNECTION_STATUS.INACTIVE:
        return {
          color: 'bg-red-500',
          textColor: 'text-red-500',
          pulse: false,
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-500',
          pulse: false,
        };
    }
  };

  const indicatorStyles = getIndicatorStyles();
  return (
    <>
      {/* Overlay móvil/tablet: igual al sidebar derecho (debajo del navbar) */}
      {isMobile && isOpen && (
        <div
          className="fixed left-0 right-0 bottom-0 bg-black/50 z-40"
          style={{ top: navbarHeightPx }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${
            isMobile
              ? `fixed left-0 w-56 z-50 transform transition-transform duration-300 ease-out ${
                  isOpen ? 'translate-x-0' : '-translate-x-full'
                }`
              : 'h-full transition-all duration-500 ease-out'
          }
          bg-slate-800 border-r border-slate-700
          ${!isMobile && isOpen ? 'w-56' : ''}
          ${!isMobile && !isOpen ? 'w-14' : ''}
          ${!isOpen && !isMobile ? 'overflow-visible' : 'overflow-hidden'}
          flex flex-col
          flex-shrink-0
          relative
        `}
        style={
          isMobile
            ? {
                top: navbarHeightPx,
                height: `calc(100vh - ${navbarHeightPx}px)`,
              }
            : undefined
        }
      >
        {/* Header del sidebar */}
        <div className="p-2 flex-shrink-0 relative h-16 flex flex-col justify-between">
          {isOpen ? (
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-4">
                <Store className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <div>
                  <h2 className="text-sm font-bold text-white">El Chalito</h2>
                  <div className="flex items-center gap-1">
                    <div
                      className={`h-1.5 w-1.5 ${indicatorStyles.color} rounded-full ${indicatorStyles.pulse ? 'animate-pulse' : ''}`}
                      title={getStatusTooltip()}
                    ></div>
                    <span className={`text-[10px] ${indicatorStyles.textColor} font-medium`}>
                      {getStatusText()}
                    </span>
                  </div>
                </div>
              </div>
              {/* Botón toggle - posicionado a la derecha */}
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-slate-700"
                title="Cerrar sidebar"
              >
                {isMobile ? <X className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div
                className={`h-3 w-3 ${indicatorStyles.color} rounded-full ${indicatorStyles.pulse ? 'animate-pulse' : ''} flex-shrink-0`}
                title={getStatusTooltip()}
              ></div>
            </div>
          )}
          {/* Botón toggle cuando está cerrado - posicionado fuera del sidebar */}
          {!isOpen && !isMobile && (
            <Button
              onClick={() => setIsOpen(true)}
              variant="ghost"
              size="sm"
              className="absolute -right-4 top-1/2 -translate-y-1/2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-2 border-slate-600 rounded-full h-8 w-8 p-0 z-20 shadow-lg flex items-center justify-center"
              title="Abrir sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* Línea divisoria */}
          <Separator className="bg-slate-700" />
        </div>

        {/* Contenido del sidebar */}
        {isOpen && (
          <>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {/* Botones de acción */}
              <div className="space-y-2.5">
                {/* 1) Nuevo pedido */}
                <Button
                  onClick={onNuevoPedido}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-sm text-xs py-2 h-9 px-3"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  NUEVO PEDIDO
                  <span className="ml-1.5 text-[10px] opacity-80">(F1)</span>
                </Button>

                {/* 2) Vista cocina */}
                <Link href="/cocina" className="block w-full">
                  <Button
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 text-xs py-2 h-9 px-3"
                    size="sm"
                  >
                    <ChefHat className="h-4 w-4 mr-1.5" />
                    VISTA COCINA
                  </Button>
                </Link>

                {/* 3) Toggle Sonido */}
                {onSoundToggle && (
                  <Button
                    onClick={() => onSoundToggle(!soundEnabled)}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 text-xs py-2 h-9 px-3"
                    size="sm"
                    title={soundEnabled ? 'Sonido activado - click para desactivar' : 'Sonido desactivado - click para activar (requiere interacción previa)'}
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4 mr-1.5" /> : <VolumeX className="h-4 w-4 mr-1.5" />}
                    Sonido {soundEnabled ? 'ON' : 'OFF'}
                  </Button>
                )}

                {/* 4) Cambiar Vista (cards/tabla) */}
                <Button
                  onClick={onCambiarVista}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 text-xs py-2 h-9 px-3"
                  size="sm"
                >
                  {vistaTabla ? (
                    <>
                      <LayoutGrid className="h-4 w-4 mr-1.5" />
                      VISTA CARDS
                    </>
                  ) : (
                    <>
                      <List className="h-4 w-4 mr-1.5" />
                      VISTA TABLA
                    </>
                  )}
                </Button>
              </div>

              {/* 5) Búsqueda de pedidos */}
              <Card className="bg-slate-700 border-slate-600 p-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-300 block">
                    BUSCAR PEDIDOS
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="ID o nombre..."
                      value={busquedaPedidos}
                      onChange={(e) => setBusquedaPedidos(e.target.value)}
                      className="pl-7 h-7 text-xs bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                    />
                  </div>
                </div>
              </Card>

              {/* 6) Pedidos Entregados */}
              <Button
                onClick={onVerPedidosEntregados}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 text-xs py-2 h-9 px-3"
                size="sm"
              >
                <ClipboardCheck className="h-4 w-4 mr-1.5" />
                PEDIDOS ENTREGADOS
              </Button>
            </div>

            {/* Footer con Demora Cocina - separado y centrado */}
            <div className="flex-shrink-0 p-2 border-t border-slate-700">
              <div className="flex justify-center">
                <Card className="bg-slate-700 border-slate-600 p-2 w-fit">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-300 block text-center">
                      DEMORA COCINA
                    </label>
                    <div className="flex items-center gap-1.5 justify-center">
                      <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={demoraCocina}
                          onChange={(e) => setDemoraCocina(parseInt(e.target.value) || 0)}
                          className="w-12 h-7 bg-slate-800 text-white px-1.5 py-0.5 rounded text-xs font-bold border border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
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

        {/* Iconos cuando está colapsado */}
        {!isOpen && !isMobile && (
          <>
            <div className="flex-1 flex flex-col items-center justify-start pt-2 space-y-2.5 px-2 overflow-y-auto">
              {/* 1) Nuevo pedido */}
              <Button
                onClick={onNuevoPedido}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-9"
                size="sm"
                title="Nuevo Pedido (F1)"
              >
                <Plus className="h-4 w-4" />
              </Button>

              {/* 2) Vista cocina */}
              <Link href="/cocina" className="block w-full">
                <Button
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white h-9"
                  size="sm"
                  title="Vista Cocina"
                >
                  <ChefHat className="h-4 w-4" />
                </Button>
              </Link>

              {/* 3) Toggle Sonido */}
              {onSoundToggle && (
                <Button
                  onClick={() => onSoundToggle(!soundEnabled)}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white h-9"
                  size="sm"
                  title={`Sonido ${soundEnabled ? 'ON' : 'OFF'}`}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              )}

              {/* 4) Cambiar Vista */}
              <Button
                onClick={onCambiarVista}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white h-9"
                size="sm"
                title={vistaTabla ? 'Vista Cards' : 'Vista Tabla'}
              >
                {vistaTabla ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </Button>

              {/* 5) Buscar pedidos */}
              <Button
                onClick={() => {
                  // Abrir sidebar para mostrar búsqueda
                  setIsOpen(true);
                  // Focus en el input de búsqueda después de un pequeño delay
                  setTimeout(() => {
                    const searchInput = document.querySelector('input[placeholder="ID o nombre..."]');
                    if (searchInput) {
                      searchInput.focus();
                    }
                  }, 100);
                }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white h-9"
                size="sm"
                title="Buscar Pedidos"
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* 6) Pedidos Entregados */}
              <Button
                onClick={onVerPedidosEntregados}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white h-9"
                size="sm"
                title="Pedidos Entregados"
              >
                <ClipboardCheck className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Mini recuadro de demora cocina cuando está cerrado */}
            <div className="flex-shrink-0 p-2 border-t border-slate-700">
              <div className="flex justify-center">
                <div className="bg-slate-700 border border-slate-600 rounded px-2 py-1.5 min-w-[32px]">
                  <div className="text-center">
                    <div className="text-xs font-bold text-white">
                      {demoraCocina}
                    </div>
                    <div className="text-[8px] text-slate-400 mt-0.5">
                      MIN
                    </div>
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

