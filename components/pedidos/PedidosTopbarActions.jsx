import { PanelLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PedidosTopbarActions({ onNuevoPedido, onToggleOperSidebar, operSidebarOpen = false }) {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onToggleOperSidebar}
        className="h-10 w-10 shrink-0 border-border text-foreground hover:bg-muted xl:hidden"
        aria-label={operSidebarOpen ? 'Cerrar panel de pedidos' : 'Abrir panel de pedidos'}
        aria-expanded={operSidebarOpen}
      >
        <PanelLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        onClick={onNuevoPedido}
        className="h-10 shrink-0 rounded-xl bg-green-600 px-3 text-sm font-medium text-white hover:bg-green-700"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        <span className="hidden sm:inline">Nuevo pedido</span>
        <span className="sm:hidden">Nuevo</span>
        <span className="ml-1 hidden text-xs opacity-80 md:inline">(F1)</span>
      </Button>
    </>
  );
}
