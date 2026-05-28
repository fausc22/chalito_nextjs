import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { Layout } from '@/components/layout/Layout';
import { PedidosTopbarActions } from '@/components/pedidos/PedidosTopbarActions';
import { PedidosSidebar } from '@/components/pedidos/PedidosSidebar';
import { PedidosColumn } from '@/components/pedidos/PedidosColumn';
import { OrderCardGhost } from '@/components/pedidos/OrderCard';
import { OrderRowGhost } from '@/components/pedidos/OrderRow';
import { ModalCancelarPedido } from '@/components/pedidos/modals/ModalCancelarPedido';
import { ModalPedidosEntregados } from '@/components/pedidos/modals/ModalPedidosEntregados';
import { ModalNuevoPedido } from '@/components/pedidos/modals/ModalNuevoPedido';
import { ModalEditarPedido } from '@/components/pedidos/modals/ModalEditarPedido';
import { ModalExtras } from '@/components/pedidos/modals/ModalExtras';
import { ModoCocina } from '@/components/pedidos/ModoCocina';
import { ModalCobro } from '@/components/pedidos/modals/ModalCobro';
import { ModalImprimir } from '@/components/pedidos/modals/ModalImprimir';
import { ModalAyudaImpresora } from '@/components/pedidos/modals/ModalAyudaImpresora';
import { ModalCambiarHorario } from '@/components/pedidos/modals/ModalCambiarHorario';
import { usePedidos } from '@/hooks/pedidos/usePedidos';
import { useNuevoPedido } from '@/hooks/pedidos/useNuevoPedido';
import { useEditarPedido } from '@/hooks/pedidos/useEditarPedido';
import { useWebOrderAlerts } from '../../contexts/WebOrderAlertsContext';
import { ventasService } from '../../services/ventasService';
import { pedidosService } from '../../services/pedidosService';
import { isPedidoMercadoPagoPendiente } from '../../lib/pedidoPaymentUtils';
import { calculateLineSubtotalFromSnapshot } from '../../lib/pedidoTotals';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const isPedidosDebugEnabled = () => {
  if (typeof window === 'undefined') return false;
  return window.__PEDIDOS_DEBUG__ === true || window.localStorage?.getItem('pedidos_debug') === '1';
};

const debugPedidos = (event, payload = {}) => {
  if (!isPedidosDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.debug(`[PedidosDebug] ${event}`, payload);
};

const PEDIDOS_DESKTOP_MQ = '(min-width: 1280px)';

function isPedidosDesktopViewport() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia(PEDIDOS_DESKTOP_MQ).matches;
}

export function PedidosPageContent() {
  const [sidebarOpen, setSidebarOpen] = useState(isPedidosDesktopViewport);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [pedidoCancelar, setPedidoCancelar] = useState(null);
  const [modalPedidosEntregados, setModalPedidosEntregados] = useState(false);
  const [modalCobro, setModalCobro] = useState(false);
  const [pedidoACobrar, setPedidoACobrar] = useState(null);
  const [printDialogState, setPrintDialogState] = useState({ open: false, pedido: null });
  const [modalAyudaImpresora, setModalAyudaImpresora] = useState(false);
  const [pedidoPendienteCrear, setPedidoPendienteCrear] = useState(null);
  const [mostrarConfirmacionFacturacion, setMostrarConfirmacionFacturacion] = useState(false);
  const [medioPagoParaCrear, setMedioPagoParaCrear] = useState(null);
  const [datosCobroPendiente, setDatosCobroPendiente] = useState(null);
  const [modoCocinaOpen, setModoCocinaOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activePedido, setActivePedido] = useState(null);
  const dragStartedAtRef = useRef(null);
  const [pedidoDragConfirm, setPedidoDragConfirm] = useState(null);
  const [pedidoCambiarHorario, setPedidoCambiarHorario] = useState(null);
  const [dragConfirmLoading, setDragConfirmLoading] = useState(false);
  const [vistaTabla, setVistaTabla] = useState(false); // Estado para alternar entre vista de cards y tabla

  const {
    pedidosRecibidos,
    pedidosEnCocina,
    pedidosEntregados,
    busquedaPedidos,
    setBusquedaPedidos,
    handleMarcharACocina,
    handleListo,
    handleEntregar,
    handleCancelar: cancelarPedido,
    agregarPedido,
    actualizarPedido,
    recargarPedidos,
    highlightedWebOrderIds,
  } = usePedidos();

  const nuevoPedido = useNuevoPedido();
  const editarPedido = useEditarPedido();
  const { soundEnabled, setSoundEnabled } = useWebOrderAlerts();

  // Configuración de sensores para drag & drop optimizados
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reducido para respuesta más rápida
      },
    })
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        nuevoPedido.setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nuevoPedido]);

  // Breakpoint mobile/tablet para controlar comportamiento de sidebar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 1279px)');
    const syncViewport = (eventOrMedia) => {
      const matches = eventOrMedia.matches;
      setIsMobileOrTablet(matches);
      if (matches) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    syncViewport(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncViewport);
      return () => mediaQuery.removeEventListener('change', syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
  }, []);

  const handleCambiarHorario = useCallback((pedido) => {
    setPedidoCambiarHorario(pedido);
  }, []);

  const handleHorarioActualizado = useCallback(
    (pedidoActualizado) => {
      if (pedidoActualizado?.id) {
        actualizarPedido(pedidoActualizado.id, pedidoActualizado);
      }
      setPedidoCambiarHorario(null);
    },
    [actualizarPedido]
  );

  const handleEditar = useCallback((pedido) => {
    // Verificar que no esté ENTREGADO o CANCELADO
    if (pedido.estado === 'entregado' || pedido.estado === 'cancelado') {
      toast.error('No se puede editar un pedido entregado o cancelado');
      return;
    }
    
    // Abrir modal de edición
    editarPedido.abrirModal(pedido);
  }, [editarPedido]);

  const handleImprimir = useCallback((pedido) => {
    setPrintDialogState({ open: true, pedido });
    debugPedidos('print_modal_open_requested', {
      pedidoId: pedido?.id ?? null,
      estado: pedido?.estado ?? null,
    });
  }, []);

  const handleModalImprimirOpenChange = useCallback((nextOpen) => {
    setPrintDialogState((prev) => {
      const nextState = nextOpen
        ? { ...prev, open: true }
        : { open: false, pedido: null };
      debugPedidos('print_modal_open_change', {
        nextOpen,
        prevPedidoId: prev?.pedido?.id ?? null,
        nextPedidoId: nextState?.pedido?.id ?? null,
      });
      return nextState;
    });
  }, []);

  const handleCancelar = useCallback((pedido) => {
    setPedidoCancelar(pedido);
  }, []);

  const confirmarCancelacion = () => {
    if (pedidoCancelar) {
      cancelarPedido(pedidoCancelar.id);
      setPedidoCancelar(null);
    }
  };

  const handleNuevoPedido = useCallback(() => {
    nuevoPedido.setIsOpen(true);
  }, [nuevoPedido]);

  const handlePedidoCreado = async (data) => {
    // Si viene con flag de mostrar cobro, mostrar modal de cobro primero
    if (data?.mostrarCobro && data?.pedidoParaCobro) {
      // Guardar los datos del pedido para crearlo después del cobro
      setPedidoPendienteCrear(data.pedidoParaCobro);
      setPedidoACobrar(data.pedidoParaCobro);
      setModalCobro(true);
      return;
    }
    
    // Si es un pedido normal, procesarlo
    const nuevoPedido = data;
    if (!nuevoPedido) return;
    
    // Recargar pedidos desde el backend para obtener el pedido completo con su ID real
    if (recargarPedidos) {
      await recargarPedidos();
    } else {
      agregarPedido(nuevoPedido);
    }
    
    // El toast de éxito ya se muestra en useNuevoPedido.js
  };

  const handleCobroExitosoYCrearPedido = async (cobroData) => {
    // Compatibilidad: aceptar string antiguo o payload nuevo
    const payload = typeof cobroData === 'string'
      ? { medioPago: cobroData, tipoFactura: null, ventaData: null }
      : (cobroData || {});

    setMedioPagoParaCrear(payload.medioPago || null);
    setDatosCobroPendiente(payload);
    setMostrarConfirmacionFacturacion(true);
  };

  const confirmarFacturacionYCrearPedido = async () => {
    // Cerrar modal de confirmación
    setMostrarConfirmacionFacturacion(false);
    
    // Cerrar modal de cobro
    setModalCobro(false);
    setPedidoACobrar(null);
    
    // Después de cobrar exitosamente, crear el pedido
    if (pedidoPendienteCrear && pedidoPendienteCrear.datosFormulario && medioPagoParaCrear) {
      // Actualizar los estados del hook con los datos guardados
      const datos = pedidoPendienteCrear.datosFormulario;
      nuevoPedido.setCliente(datos.cliente);
      nuevoPedido.setTipoEntrega(datos.tipoEntrega);
      nuevoPedido.setOrigen(datos.origen);
      nuevoPedido.setTipoPedido(datos.tipoPedido);
      nuevoPedido.setHoraProgramada(datos.horaProgramada);
      nuevoPedido.setMedioPago(medioPagoParaCrear);
      // El cobro posterior es quien marca PAGADO; crear como pendiente evita saltarse la venta.
      nuevoPedido.setEstadoPago('pending');
      
      // Crear el pedido primero para obtener ID real y luego registrar la venta asociada
      const pedido = await nuevoPedido.crearPedido();
      if (!pedido) {
        // Si falló, volver a abrir el modal de cobro
        setPedidoACobrar(pedidoPendienteCrear);
        setModalCobro(true);
        toast.error('Error al crear el pedido', {
          description: 'No se pudo crear el pedido después del cobro'
        });
        return;
      }

      const itemsVenta = (pedido.items || []).map((item) => {
        const articuloId = item.articulo_id || item.id;
        const articuloIdNum = typeof articuloId === 'string' ? parseInt(articuloId, 10) : articuloId;
        return {
          articulo_id: articuloIdNum,
          articulo_nombre: item.articulo_nombre || item.nombre || 'Artículo sin nombre',
          cantidad: item.cantidad || 1,
          precio: parseFloat(item.precio) || 0,
          subtotal: calculateLineSubtotalFromSnapshot(item),
        };
      }).filter(item => item.articulo_id && !isNaN(item.articulo_id));

      const cobroResponse = await pedidosService.cobrarPedido(pedido.id, {
        medioPago: medioPagoParaCrear,
        descuentoPorcentaje: datosCobroPendiente?.ventaData?.descuento_porcentaje || 0,
      });
      if (!cobroResponse.success) {
        toast.error('Pedido creado, pero falló el cobro', {
          description: cobroResponse.error || 'No se pudo registrar la venta asociada'
        });
      } else {
        toast.success('Pedido creado y cobrado correctamente', {
          description: `Pedido #${pedido.id} - Venta #${cobroResponse.data?.venta_id || 'OK'}`
        });
      }

      if (recargarPedidos) {
        await recargarPedidos();
      }
      setPedidoPendienteCrear(null);
      setMedioPagoParaCrear(null);
      setDatosCobroPendiente(null);
      nuevoPedido.setIsOpen(false);
    } else {
      toast.error('Error al procesar el pedido', {
        description: 'Faltan datos para crear el pedido'
      });
    }
  };

  const handleCobroExitoso = async (pedidoIdOrMedioPago, pedidoActualizadoDesdeBackend) => {
    if (pedidoActualizadoDesdeBackend && pedidoIdOrMedioPago && pedidoIdOrMedioPago !== 'nuevo') {
      actualizarPedido(String(pedidoIdOrMedioPago), {
        ...pedidoActualizadoDesdeBackend,
        id: String(pedidoIdOrMedioPago),
        paymentStatus: 'paid'
      });
    } else if (recargarPedidos) {
      await recargarPedidos();
    }
  };

  const abrirModalCobro = useCallback((pedido) => {
    setPedidoACobrar(pedido);
    setModalCobro(true);
  }, []);

  const handleCambiarVista = useCallback(() => {
    setVistaTabla(!vistaTabla);
  }, [vistaTabla]);

  const handleManualDragEnd = useCallback((event) => {
    debugPedidos('drag_end', {
      activeId: event?.active?.id ?? null,
      overId: event?.over?.id ?? null,
      activeEstado: event?.active?.data?.current?.estado ?? null,
      overEstado: event?.over?.data?.current?.estado ?? null,
    });
    setActiveId(null);
    setActivePedido(null);
    dragStartedAtRef.current = null;

    const { active, over } = event;
    if (!over || !active?.data?.current) return;

    const pedido = active.data.current.pedido;
    const estadoActual = active.data.current.estado;
    const overData = over.data?.current || {};
    const isEnPreparacionTarget = overData.estado === 'en_cocina';

    // Solo permitir flujo manual: RECIBIDO -> EN PREPARACION
    if (estadoActual === 'recibido' && isEnPreparacionTarget) {
      if (isPedidoMercadoPagoPendiente(pedido)) {
        toast.warning('Pedido bloqueado', {
          description: 'Esperando pago Mercado Pago. No se puede mover a preparación todavía.',
        });
        return;
      }
      setPedidoDragConfirm(pedido);
    }
  }, []);

  const pedidosByDndId = useMemo(() => {
    const map = new Map();
    pedidosRecibidos.forEach((pedido) => map.set(`pedido-${pedido.id}`, pedido));
    pedidosEnCocina.forEach((pedido) => map.set(`pedido-${pedido.id}`, pedido));
    pedidosEntregados.forEach((pedido) => map.set(`pedido-${pedido.id}`, pedido));
    return map;
  }, [pedidosEnCocina, pedidosEntregados, pedidosRecibidos]);

  const handleDragStart = useCallback((event) => {
    debugPedidos('drag_start', {
      activeId: event?.active?.id ?? null,
      estado: event?.active?.data?.current?.estado ?? null,
      pedidoId: event?.active?.data?.current?.pedido?.id ?? null,
    });
    setActiveId(event.active.id);
    setActivePedido(pedidosByDndId.get(event.active.id) || null);
    dragStartedAtRef.current = Date.now();
  }, [pedidosByDndId]);

  const handleDragCancel = useCallback((event) => {
    debugPedidos('drag_cancel', {
      activeId: event?.active?.id ?? null,
    });
    setActiveId(null);
    setActivePedido(null);
    dragStartedAtRef.current = null;
  }, []);

  const confirmarDragManual = async () => {
    if (!pedidoDragConfirm) return;
    setDragConfirmLoading(true);
    try {
      await handleMarcharACocina(String(pedidoDragConfirm.id));
    } finally {
      setDragConfirmLoading(false);
      setPedidoDragConfirm(null);
    }
  };

  useEffect(() => {
    debugPedidos('ventas_render', {
      pedidosRecibidos: pedidosRecibidos.length,
      pedidosEnCocina: pedidosEnCocina.length,
      pedidosEntregados: pedidosEntregados.length,
      printOpen: printDialogState.open,
      printPedidoId: printDialogState.pedido?.id ?? null,
      modalCobroOpen: modalCobro,
      dragActiveId: activeId,
      hasActivePedido: Boolean(activePedido),
    });
  }, [
    pedidosRecibidos.length,
    pedidosEnCocina.length,
    pedidosEntregados.length,
    printDialogState.open,
    printDialogState.pedido?.id,
    modalCobro,
    activeId,
    activePedido,
  ]);

  useEffect(() => {
    if (!printDialogState.open && !printDialogState.pedido) return;
    if (!printDialogState.open && printDialogState.pedido) {
      debugPedidos('potential_inconsistent_print_state', {
        reason: 'dialog_closed_but_pedido_present',
        pedidoId: printDialogState.pedido?.id ?? null,
      });
    }
    if (printDialogState.open && !printDialogState.pedido) {
      debugPedidos('potential_inconsistent_print_state', {
        reason: 'dialog_open_without_pedido',
      });
    }
  }, [printDialogState.open, printDialogState.pedido]);

  useEffect(() => {
    if (!activeId || !dragStartedAtRef.current) return;
    const timeout = setTimeout(() => {
      debugPedidos('drag_stuck_warning', {
        activeId,
        elapsedMs: Date.now() - dragStartedAtRef.current,
      });
    }, 7000);
    return () => clearTimeout(timeout);
  }, [activeId]);

  useEffect(() => {
    if (typeof document === 'undefined' || !isPedidosDebugEnabled()) return undefined;

    const onClickCapture = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest('button');
      const pedidoCard = target.closest('[data-pedido-id]');
      debugPedidos('dom_click_capture', {
        targetTag: target.tagName,
        buttonText: button?.textContent?.trim() || null,
        pedidoId: pedidoCard?.getAttribute('data-pedido-id') || null,
        printOpen: printDialogState.open,
        printPedidoId: printDialogState.pedido?.id ?? null,
        dragActiveId: activeId,
      });
    };

    document.addEventListener('click', onClickCapture, true);
    return () => {
      document.removeEventListener('click', onClickCapture, true);
    };
  }, [activeId, printDialogState.open, printDialogState.pedido]);

  return (
    <Layout
      title="Pedidos"
      contentVariant="fullBleed"
      topbarActions={
        <PedidosTopbarActions
          onNuevoPedido={handleNuevoPedido}
          onToggleOperSidebar={() => setSidebarOpen((prev) => !prev)}
          operSidebarOpen={sidebarOpen}
        />
      }
    >
      <div className="relative flex min-h-0 flex-1 flex-row overflow-hidden bg-background">
          {/* Sidebar desktop - dentro del flujo del documento */}
          <div className="hidden xl:block flex-shrink-0">
            <PedidosSidebar
              onNuevoPedido={handleNuevoPedido}
              onVerPedidosEntregados={() => setModalPedidosEntregados(true)}
              busquedaPedidos={busquedaPedidos}
              setBusquedaPedidos={setBusquedaPedidos}
              soundEnabled={soundEnabled}
              onSoundToggle={setSoundEnabled}
              isOpen={sidebarOpen}
              setIsOpen={setSidebarOpen}
              isMobile={false}
              vistaTabla={vistaTabla}
              onCambiarVista={handleCambiarVista}
              onOpenPrinterHelp={() => setModalAyudaImpresora(true)}
            />
          </div>

          {/* Contenido principal que se ajusta al sidebar */}
          <div 
            className="flex-1 transition-all duration-300 overflow-hidden min-w-0"
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragCancel={handleDragCancel}
              onDragEnd={(event) => {
                handleManualDragEnd(event);
              }}
            >
              <div className="flex-1 w-full h-full px-2 sm:px-4 lg:px-6 py-2 sm:py-3 min-h-0 flex flex-col">
                <div className="flex gap-3 flex-1 min-h-0 w-full transition-all duration-300 flex-col lg:flex-row lg:h-full">
                  <div className="w-full min-h-[320px] lg:min-h-0 lg:h-full lg:flex-[4_4_0%] transition-all duration-300">
                    <PedidosColumn
                      titulo="RECIBIDOS"
                      pedidos={pedidosRecibidos}
                      onMarcharACocina={handleMarcharACocina}
                      onListo={handleListo}
                      onEntregar={handleEntregar}
                      onEditar={handleEditar}
                      onCambiarHorario={handleCambiarHorario}
                      onCancelar={handleCancelar}
                      onCobrar={abrirModalCobro}
                      onImprimir={handleImprimir}
                      estado="recibido"
                      compacto={true}
                      vistaTabla={vistaTabla}
                      cobrandoPedidoId={pedidoACobrar && pedidoACobrar.id !== 'nuevo' ? pedidoACobrar.id : null}
                      highlightedPedidoIds={highlightedWebOrderIds}
                      newWebOrderIds={highlightedWebOrderIds}
                    />
                  </div>

                  <div className="w-full min-h-[320px] lg:min-h-0 lg:h-full lg:flex-[6_6_0%] transition-all duration-300">
                    <PedidosColumn
                      titulo="EN PREPARACIÓN"
                      pedidos={pedidosEnCocina}
                      onMarcharACocina={handleMarcharACocina}
                      onListo={handleListo}
                      onEntregar={handleEntregar}
                      onEditar={handleEditar}
                      onCambiarHorario={handleCambiarHorario}
                      onCancelar={handleCancelar}
                      onCobrar={abrirModalCobro}
                      onImprimir={handleImprimir}
                      estado="en_cocina"
                      compacto={true}
                      vistaTabla={vistaTabla}
                      cobrandoPedidoId={pedidoACobrar && pedidoACobrar.id !== 'nuevo' ? pedidoACobrar.id : null}
                      highlightedPedidoIds={highlightedWebOrderIds}
                      newWebOrderIds={highlightedWebOrderIds}
                    />
                  </div>
                </div>
              </div>
              <DragOverlay
                dropAnimation={{
                  duration: 200,
                  easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                  sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                      active: {
                        opacity: '0.5',
                      },
                    },
                  }),
                }}
                style={{ cursor: 'grabbing' }}
              >
                {activePedido ? (
                  <div className="pointer-events-none">
                    {vistaTabla ? (
                      <OrderRowGhost pedido={activePedido} />
                    ) : (
                      <OrderCardGhost pedido={activePedido} />
                    )}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>

          {/* Sidebar móvil: absolute dentro del área bajo la topbar (evita desfase con fixed + CSS var) */}
          <div className="pointer-events-none absolute inset-0 z-30 xl:hidden">
            <PedidosSidebar
              onNuevoPedido={handleNuevoPedido}
              onVerPedidosEntregados={() => setModalPedidosEntregados(true)}
              busquedaPedidos={busquedaPedidos}
              setBusquedaPedidos={setBusquedaPedidos}
              soundEnabled={soundEnabled}
              onSoundToggle={setSoundEnabled}
              isOpen={sidebarOpen}
              setIsOpen={setSidebarOpen}
              isMobile={true}
              vistaTabla={vistaTabla}
              onCambiarVista={handleCambiarVista}
              onOpenPrinterHelp={() => setModalAyudaImpresora(true)}
            />
          </div>
      </div>

      {/* Modales */}
      <ModalCancelarPedido
        pedido={pedidoCancelar}
        isOpen={pedidoCancelar !== null}
        onClose={() => setPedidoCancelar(null)}
        onConfirmar={confirmarCancelacion}
      />

      <ModalPedidosEntregados
        isOpen={modalPedidosEntregados}
        onClose={() => setModalPedidosEntregados(false)}
        onImprimirPedido={handleImprimir}
      />

      <ModalCambiarHorario
        pedido={pedidoCambiarHorario}
        isOpen={pedidoCambiarHorario !== null}
        onClose={() => setPedidoCambiarHorario(null)}
        onSuccess={handleHorarioActualizado}
      />

      <ModalNuevoPedido
        isOpen={nuevoPedido.isOpen}
        onClose={() => nuevoPedido.setIsOpen(false)}
        pasoModal={nuevoPedido.pasoModal}
        setPasoModal={nuevoPedido.setPasoModal}
        categoriaSeleccionada={nuevoPedido.categoriaSeleccionada}
        setCategoriaSeleccionada={nuevoPedido.setCategoriaSeleccionada}
        busquedaProducto={nuevoPedido.busquedaProducto}
        setBusquedaProducto={nuevoPedido.setBusquedaProducto}
        carrito={nuevoPedido.carrito}
        productosFiltrados={nuevoPedido.productosFiltrados}
        categorias={nuevoPedido.categorias}
        loadingCategorias={nuevoPedido.loadingCategorias}
        loadingProductos={nuevoPedido.loadingProductos}
        loadingProductosMasSolicitados={nuevoPedido.loadingProductosMasSolicitados}
        tipoEntrega={nuevoPedido.tipoEntrega}
        setTipoEntrega={nuevoPedido.setTipoEntrega}
        cliente={nuevoPedido.cliente}
        setCliente={nuevoPedido.setCliente}
        origen={nuevoPedido.origen}
        setOrigen={nuevoPedido.setOrigen}
        tipoPedido={nuevoPedido.tipoPedido}
        setTipoPedido={nuevoPedido.setTipoPedido}
        horaProgramada={nuevoPedido.horaProgramada}
        setHoraProgramada={nuevoPedido.setHoraProgramada}
        medioPago={nuevoPedido.medioPago}
        setMedioPago={nuevoPedido.setMedioPago}
        estadoPago={nuevoPedido.estadoPago}
        setEstadoPago={nuevoPedido.setEstadoPago}
        fieldErrors={nuevoPedido.fieldErrors}
        setFieldErrors={nuevoPedido.setFieldErrors}
        clearFieldError={nuevoPedido.clearFieldError}
        calcularTotal={nuevoPedido.calcularTotal}
        agregarProductoConExtras={nuevoPedido.agregarProductoConExtras}
        modificarCantidad={nuevoPedido.modificarCantidad}
        eliminarDelCarrito={nuevoPedido.eliminarDelCarrito}
        editarExtrasItem={nuevoPedido.editarExtrasItem}
        resetearModal={nuevoPedido.resetearModal}
        crearPedido={nuevoPedido.crearPedido}
        validarPasoCliente={nuevoPedido.validarPasoCliente}
        onSuccess={handlePedidoCreado}
      />

      <ModalEditarPedido
        isOpen={editarPedido.isOpen}
        onClose={() => editarPedido.setIsOpen(false)}
        pasoModal={editarPedido.pasoModal}
        setPasoModal={editarPedido.setPasoModal}
        categoriaSeleccionada={editarPedido.categoriaSeleccionada}
        setCategoriaSeleccionada={editarPedido.setCategoriaSeleccionada}
        busquedaProducto={editarPedido.busquedaProducto}
        setBusquedaProducto={editarPedido.setBusquedaProducto}
        carrito={editarPedido.carrito}
        productosFiltrados={editarPedido.productosFiltrados}
        categorias={editarPedido.categorias}
        loadingCategorias={editarPedido.loadingCategorias}
        loadingProductos={editarPedido.loadingProductos}
        loadingPedido={editarPedido.loadingPedido}
        pedidoOriginal={editarPedido.pedidoOriginal}
        tipoEntrega={editarPedido.tipoEntrega}
        setTipoEntrega={editarPedido.setTipoEntrega}
        cliente={editarPedido.cliente}
        setCliente={editarPedido.setCliente}
        origen={editarPedido.origen}
        setOrigen={editarPedido.setOrigen}
        tipoPedido={editarPedido.tipoPedido}
        setTipoPedido={editarPedido.setTipoPedido}
        horaProgramada={editarPedido.horaProgramada}
        setHoraProgramada={editarPedido.setHoraProgramada}
        medioPago={editarPedido.medioPago}
        setMedioPago={editarPedido.setMedioPago}
        estadoPago={editarPedido.estadoPago}
        setEstadoPago={editarPedido.setEstadoPago}
        fieldErrors={editarPedido.fieldErrors}
        setFieldErrors={editarPedido.setFieldErrors}
        clearFieldError={editarPedido.clearFieldError}
        calcularTotal={editarPedido.calcularTotal}
        agregarProductoConExtras={editarPedido.agregarProductoConExtras}
        modificarCantidad={editarPedido.modificarCantidad}
        eliminarDelCarrito={editarPedido.eliminarDelCarrito}
        editarExtrasItem={editarPedido.editarExtrasItem}
        resetearModal={editarPedido.resetearModal}
        validarPasoCliente={editarPedido.validarPasoCliente}
        actualizarPedido={editarPedido.actualizarPedido}
        onSuccess={(pedidoActualizado) => {
          if (pedidoActualizado?.id) {
            actualizarPedido(pedidoActualizado.id, pedidoActualizado);
          }
          recargarPedidos?.();
        }}
      />

      {modoCocinaOpen && (
        <ModoCocina
          isOpen={modoCocinaOpen}
          onClose={() => setModoCocinaOpen(false)}
          onPedidoActualizado={(pedidoId, actualizaciones) => {
            // Actualizar el pedido en la lista principal cuando se marca como lista desde ModoCocina
            actualizarPedido(pedidoId, actualizaciones);
          }}
          modoCocina={false}
        />
      )}

      <ModalExtras
        isOpen={nuevoPedido.modalExtras || editarPedido.modalExtras}
        onClose={(open) => {
          if (!open) {
            nuevoPedido.cerrarModalExtras();
            editarPedido.cerrarModalExtras();
          }
        }}
        producto={nuevoPedido.modalExtras ? nuevoPedido.productoParaExtras : editarPedido.productoParaExtras}
        cantidadProducto={nuevoPedido.modalExtras ? nuevoPedido.cantidadProducto : editarPedido.cantidadProducto}
        extrasSeleccionados={nuevoPedido.modalExtras ? nuevoPedido.extrasSeleccionados : editarPedido.extrasSeleccionados}
        setExtrasSeleccionados={(extras) => {
          if (nuevoPedido.modalExtras) {
            nuevoPedido.setExtrasSeleccionados(extras);
          } else if (editarPedido.modalExtras) {
            editarPedido.setExtrasSeleccionados(extras);
          }
        }}
        observacionItem={nuevoPedido.modalExtras ? nuevoPedido.observacionItem : editarPedido.observacionItem}
        setObservacionItem={(obs) => {
          if (nuevoPedido.modalExtras) {
            nuevoPedido.setObservacionItem(obs);
          } else if (editarPedido.modalExtras) {
            editarPedido.setObservacionItem(obs);
          }
        }}
        editandoItemCarrito={nuevoPedido.modalExtras ? nuevoPedido.editandoItemCarrito : editarPedido.editandoItemCarrito}
        unidadActual={nuevoPedido.modalExtras ? nuevoPedido.unidadActual : editarPedido.unidadActual}
        totalUnidades={nuevoPedido.modalExtras ? nuevoPedido.totalUnidades : editarPedido.totalUnidades}
        unidadesConfiguradas={nuevoPedido.modalExtras ? nuevoPedido.unidadesConfiguradas : editarPedido.unidadesConfiguradas}
        onConfirmar={() => {
          if (nuevoPedido.modalExtras) {
            nuevoPedido.confirmarExtras();
          } else if (editarPedido.modalExtras) {
            editarPedido.confirmarExtras();
          }
        }}
      />

      {printDialogState.open && (
        <ModalImprimir
          pedido={printDialogState.pedido}
          open={printDialogState.open}
          onOpenChange={handleModalImprimirOpenChange}
        />
      )}

      <ModalAyudaImpresora
        open={modalAyudaImpresora}
        onOpenChange={setModalAyudaImpresora}
      />

      <ModalCobro
        pedido={pedidoACobrar}
        isOpen={modalCobro}
        onClose={() => {
          setModalCobro(false);
          setPedidoACobrar(null);
          setPedidoPendienteCrear(null);
          setDatosCobroPendiente(null);
        }}
        onCobroExitoso={(pedidoIdOrMedioPago, pedidoActualizado) => {
          if (pedidoACobrar && pedidoACobrar.id === 'nuevo') {
            handleCobroExitosoYCrearPedido(pedidoIdOrMedioPago);
          } else {
            handleCobroExitoso(pedidoIdOrMedioPago, pedidoActualizado);
          }
        }}
      />

      {/* Modal de confirmación antes de crear el pedido */}
      <AlertDialog open={mostrarConfirmacionFacturacion} onOpenChange={setMostrarConfirmacionFacturacion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Facturación</AlertDialogTitle>
            <AlertDialogDescription>
              Se va a facturar el siguiente pedido. ¿Desea continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setMostrarConfirmacionFacturacion(false);
              setMedioPagoParaCrear(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmarFacturacionYCrearPedido}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmación para mover manualmente pedido a EN PREPARACIÓN */}
      <AlertDialog
        open={!!pedidoDragConfirm}
        onOpenChange={(open) => {
          if (!open && !dragConfirmLoading) {
            setPedidoDragConfirm(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mover pedido a preparación</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Pedido <strong>#{pedidoDragConfirm?.id}</strong>
                  {pedidoDragConfirm?.clienteNombre ? (
                    <> de <strong>{pedidoDragConfirm.clienteNombre}</strong></>
                  ) : null}{' '}
                  pasará a <strong>En preparación</strong>.
                </p>
                <p>Se inicia el timer de cocina en este momento y se genera la comanda si corresponde.</p>
                <p className="text-xs">Dejará de esperar la transición automática por capacidad/horario.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                if (!dragConfirmLoading) {
                  setPedidoDragConfirm(null);
                }
              }}
              disabled={dragConfirmLoading}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarDragManual}
              disabled={dragConfirmLoading}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-70"
            >
              {dragConfirmLoading ? 'Procesando…' : 'Aceptar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
