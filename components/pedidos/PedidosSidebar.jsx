import { ChefHat, Clock, Plus, Search, Package, Menu, X, ChevronLeft, ChevronRight, ClipboardCheck, Bell, Store, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function PedidosSidebar({
  demoraCocina,
  setDemoraCocina,
  onNuevoPedido,
  onModoCocina,
  onVerPedidosEntregados,
  onNotificaciones,
  notificacionesCount = 0,
  busquedaPedidos,
  setBusquedaPedidos,
  isOpen,
  setIsOpen,
  isMobile = false,
  isOnline = true,
  vistaTabla = false,
  onCambiarVista
}) {
  return (
    <>
      {/* Botón toggle para móvil */}
      {isMobile && (
        <div className="absolute top-4 left-4 z-50">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-slate-800 hover:bg-slate-700 text-white"
            size="sm"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Overlay para móvil */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? 'fixed left-0 top-0 h-screen z-50' : 'h-full'}
          bg-slate-800 border-r border-slate-700
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-56' : isMobile ? 'w-0' : 'w-14'}
          ${!isOpen && !isMobile ? 'overflow-visible' : 'overflow-hidden'}
          flex flex-col
          flex-shrink-0
          relative
        `}
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
                    <div className={`h-1.5 w-1.5 ${isOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full ${isOnline ? 'animate-pulse' : ''}`}></div>
                    <span className={`text-[10px] ${isOnline ? 'text-green-500' : 'text-red-500'} font-medium`}>
                      {isOnline ? 'Abierto' : 'Offline'}
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
              <div className={`h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full ${isOnline ? 'animate-pulse' : ''} flex-shrink-0`} title={isOnline ? 'Sistema Online' : 'Sistema Offline'}></div>
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
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {/* Botones de acción */}
            <div className="space-y-2.5">
              <Button
                onClick={onNuevoPedido}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm text-xs py-2 h-9 px-3"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                NUEVO PEDIDO
                <span className="ml-1.5 text-[10px] opacity-80">(F1)</span>
              </Button>

              <Button
                onClick={onModoCocina}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 text-xs py-2 h-9 px-3"
                size="sm"
              >
                <ChefHat className="h-4 w-4 mr-1.5" />
                MODO COCINA
              </Button>

              <Button
                onClick={onNotificaciones}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm text-xs py-2 h-9 px-3 relative"
                size="sm"
              >
                <Bell className="h-4 w-4 mr-1.5" />
                NOTIFICACIONES
                {notificacionesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificacionesCount > 9 ? '9+' : notificacionesCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Búsqueda de pedidos */}
            <Card className="bg-slate-700 border-slate-600 p-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-300 block">
                  Buscar Pedidos
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="ID o nombre..."
                    value={busquedaPedidos}
                    onChange={(e) => setBusquedaPedidos(e.target.value)}
                    className="pl-7 h-7 text-xs bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </Card>

            {/* Demora cocina */}
            <Card className="bg-slate-700 border-slate-600 p-2 w-fit">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-300 block">
                  Demora Cocina
                </label>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={demoraCocina}
                      onChange={(e) => setDemoraCocina(parseInt(e.target.value) || 0)}
                      className="w-12 h-7 bg-slate-800 text-white px-1.5 py-0.5 rounded text-xs font-bold border border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                    />
                    <span className="text-xs font-bold text-slate-300">min</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Pedidos Entregados */}
            <Button
              onClick={onVerPedidosEntregados}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 h-9 px-3"
              size="sm"
            >
              <ClipboardCheck className="h-4 w-4 mr-1.5" />
              Pedidos Entregados
            </Button>

            {/* Cambiar Vista */}
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
        )}

        {/* Iconos cuando está colapsado */}
        {!isOpen && !isMobile && (
          <div className="flex-1 flex flex-col items-center justify-start pt-2 space-y-2.5 px-2">
            <Button
              onClick={onNuevoPedido}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9"
              size="sm"
              title="Nuevo Pedido"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              onClick={onModoCocina}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white h-9"
              size="sm"
              title="Modo Cocina"
            >
              <ChefHat className="h-4 w-4" />
            </Button>
            <Button
              onClick={onNotificaciones}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-9 relative"
              size="sm"
              title="Notificaciones"
            >
              <Bell className="h-4 w-4" />
              {notificacionesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notificacionesCount > 9 ? '9+' : notificacionesCount}
                </span>
              )}
            </Button>
            <Button
              onClick={onVerPedidosEntregados}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-9"
              size="sm"
              title="Pedidos Entregados"
            >
              <ClipboardCheck className="h-4 w-4" />
            </Button>
            <Button
              onClick={onCambiarVista}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white h-9"
              size="sm"
              title={vistaTabla ? "Vista Cards" : "Vista Tabla"}
            >
              {vistaTabla ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}

