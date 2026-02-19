import { useState, useEffect } from 'react';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { NavBar } from '../../components/layout/NavBar';
import { Footer } from '../../components/layout/Footer';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { PedidosSidebar } from '../../components/pedidos/PedidosSidebar';
import { PedidosColumn } from '../../components/pedidos/PedidosColumn';
import { OrderCardGhost } from '../../components/pedidos/OrderCard';
import { OrderRowGhost } from '../../components/pedidos/OrderRow';
import { ModalCancelarPedido } from '../../components/pedidos/modals/ModalCancelarPedido';
import { ModalPedidosEntregados } from '../../components/pedidos/modals/ModalPedidosEntregados';
import { ModalNuevoPedido } from '../../components/pedidos/modals/ModalNuevoPedido';
import { ModalEditarPedido } from '../../components/pedidos/modals/ModalEditarPedido';
import { ModalExtras } from '../../components/pedidos/modals/ModalExtras';
import { ModoCocina } from '../../components/pedidos/ModoCocina';
import { ModalCobro } from '../../components/pedidos/modals/ModalCobro';
import { ModalImprimir } from '../../components/pedidos/modals/ModalImprimir';
import { usePedidos } from '../../hooks/pedidos/usePedidos';
import { useNuevoPedido } from '../../hooks/pedidos/useNuevoPedido';
import { useEditarPedido } from '../../hooks/pedidos/useEditarPedido';
import { ventasService } from '../../services/ventasService';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Head from 'next/head';

function VentasContent() {
  const [demoraCocina, setDemoraCocina] = useState(20);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pedidoCancelar, setPedidoCancelar] = useState(null);
  const [modalPedidosEntregados, setModalPedidosEntregados] = useState(false);
  const [modalCobro, setModalCobro] = useState(false);
  const [pedidoACobrar, setPedidoACobrar] = useState(null);
  const [modalImprimir, setModalImprimir] = useState(false);
  const [pedidoAImprimir, setPedidoAImprimir] = useState(null);
  const [pedidoPendienteCrear, setPedidoPendienteCrear] = useState(null);
  const [mostrarConfirmacionFacturacion, setMostrarConfirmacionFacturacion] = useState(false);
  const [medioPagoParaCrear, setMedioPagoParaCrear] = useState(null);
  const [datosCobroPendiente, setDatosCobroPendiente] = useState(null);
  const [notificacionesCount, setNotificacionesCount] = useState(0);
  const [modoCocinaOpen, setModoCocinaOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activePedido, setActivePedido] = useState(null);
  const [vistaTabla, setVistaTabla] = useState(false); // Estado para alternar entre vista de cards y tabla

  const {
    pedidosRecibidos,
    pedidosEnCocina,
    pedidosEntregados,
    busquedaPedidos,
    setBusquedaPedidos,
    handleDragEnd,
    handleMarcharACocina,
    handleListo,
    handleEntregar,
    handleCancelar: cancelarPedido,
    agregarPedido,
    actualizarPedido,
    recargarPedidos,
  } = usePedidos();

  const nuevoPedido = useNuevoPedido();
  const editarPedido = useEditarPedido();

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

  const handleEditar = (pedido) => {
    // Verificar que no esté ENTREGADO o CANCELADO
    if (pedido.estado === 'entregado' || pedido.estado === 'cancelado') {
      toast.error('No se puede editar un pedido entregado o cancelado');
      return;
    }
    
    // Abrir modal de edición
    editarPedido.abrirModal(pedido);
  };

  const handleImprimir = (pedido) => {
    setPedidoAImprimir(pedido);
    setModalImprimir(true);
  };

  const handleCancelar = (pedido) => {
    setPedidoCancelar(pedido);
  };

  const confirmarCancelacion = () => {
    if (pedidoCancelar) {
      cancelarPedido(pedidoCancelar.id);
      setPedidoCancelar(null);
    }
  };

  const handleNuevoPedido = () => {
    nuevoPedido.setIsOpen(true);
  };

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
      nuevoPedido.setDescuento(datos.descuento);
      nuevoPedido.setMedioPago(medioPagoParaCrear);
      nuevoPedido.setEstadoPago('paid');
      
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
          subtotal: parseFloat(item.subtotal) || ((parseFloat(item.precio) || 0) * (item.cantidad || 1))
        };
      }).filter(item => item.articulo_id && !isNaN(item.articulo_id));

      const ventaData = {
        ...(datosCobroPendiente?.ventaData || {}),
        pedido_id: parseInt(pedido.id, 10),
        clienteNombre: pedido.clienteNombre,
        direccion: pedido.direccion || '',
        telefono: pedido.telefono || '',
        email: pedido.email || null,
        subtotal: pedido.subtotal || datosCobroPendiente?.ventaData?.subtotal || 0,
        ivaTotal: pedido.ivaTotal || datosCobroPendiente?.ventaData?.ivaTotal || 0,
        descuento: pedido.descuento || datosCobroPendiente?.ventaData?.descuento || 0,
        total: pedido.total || datosCobroPendiente?.ventaData?.total || 0,
        medioPago: medioPagoParaCrear,
        tipo_factura: datosCobroPendiente?.tipoFactura || null,
        items: itemsVenta
      };

      const ventaResponse = await ventasService.crearVenta(ventaData);
      if (!ventaResponse.success) {
        toast.error('Pedido creado, pero falló la venta', {
          description: ventaResponse.error || 'No se pudo registrar la venta asociada'
        });
      } else {
        toast.success('Pedido creado y cobrado correctamente', {
          description: `Pedido #${pedido.id} - Venta #${ventaResponse.data?.id || 'OK'}`
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

  const handleModoCocina = () => {
    setModoCocinaOpen(true);
  };

  const handleNotificaciones = () => {
    // TODO: Abrir modal de notificaciones o mostrar lista de pedidos nuevos desde carrito online
    toast.info('Notificaciones', {
      description: 'Modal por implementar',
    });
    // Por ahora, resetear el contador cuando se hace clic
    setNotificacionesCount(0);
  };

  const abrirModalCobro = (pedido) => {
    setPedidoACobrar(pedido);
    setModalCobro(true);
  };

  const handleCambiarVista = () => {
    setVistaTabla(!vistaTabla);
  };

  return (
    <>
      <Head>
        <title>Pedidos - El Chalito</title>
      </Head>

      <div className="min-h-screen flex flex-col">
        <NavBar />

        <main className="flex-1 bg-gray-50 flex flex-row min-h-0 overflow-hidden relative">
          {/* Sidebar desktop - dentro del flujo del documento */}
          <div className="hidden lg:block flex-shrink-0">
            <PedidosSidebar
              demoraCocina={demoraCocina}
              setDemoraCocina={setDemoraCocina}
              onNuevoPedido={handleNuevoPedido}
              onModoCocina={handleModoCocina}
              onVerPedidosEntregados={() => setModalPedidosEntregados(true)}
              onNotificaciones={handleNotificaciones}
              notificacionesCount={notificacionesCount}
              busquedaPedidos={busquedaPedidos}
              setBusquedaPedidos={setBusquedaPedidos}
              isOpen={sidebarOpen}
              setIsOpen={setSidebarOpen}
              isMobile={false}
              vistaTabla={vistaTabla}
              onCambiarVista={handleCambiarVista}
            />
          </div>

          {/* Sidebar móvil - overlay fixed */}
          <div className="lg:hidden">
            <PedidosSidebar
              demoraCocina={demoraCocina}
              setDemoraCocina={setDemoraCocina}
              onNuevoPedido={handleNuevoPedido}
              onModoCocina={handleModoCocina}
              onVerPedidosEntregados={() => setModalPedidosEntregados(true)}
              onNotificaciones={handleNotificaciones}
              notificacionesCount={notificacionesCount}
              busquedaPedidos={busquedaPedidos}
              setBusquedaPedidos={setBusquedaPedidos}
              isOpen={sidebarOpen}
              setIsOpen={setSidebarOpen}
              isMobile={true}
              vistaTabla={vistaTabla}
              onCambiarVista={handleCambiarVista}
            />
          </div>

          {/* Contenido principal que se ajusta al sidebar */}
          <div 
            className="flex-1 transition-all duration-300 overflow-hidden min-w-0"
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={(event) => {
                setActiveId(event.active.id);
                // Buscar el pedido activo en todas las listas
                const pedidoEncontrado = 
                  pedidosRecibidos.find(p => `pedido-${p.id}` === event.active.id) ||
                  pedidosEnCocina.find(p => `pedido-${p.id}` === event.active.id) ||
                  pedidosEntregados.find(p => `pedido-${p.id}` === event.active.id);
                setActivePedido(pedidoEncontrado || null);
              }}
              onDragEnd={(event) => {
                setActiveId(null);
                setActivePedido(null);
                handleDragEnd(event);
              }}
            >
              <div className="flex-1 w-full px-3 sm:px-4 lg:px-6 py-3 min-h-0 flex flex-col">
                <div className="flex gap-3 h-[calc(100vh-140px)] w-full transition-all duration-300">
                  <div className="h-full w-[40%] transition-all duration-300">
                    <PedidosColumn
                      titulo="RECIBIDOS"
                      pedidos={pedidosRecibidos}
                      onMarcharACocina={handleMarcharACocina}
                      onListo={handleListo}
                      onEntregar={handleEntregar}
                      onEditar={handleEditar}
                      onCancelar={handleCancelar}
                      onCobrar={abrirModalCobro}
                      onImprimir={handleImprimir}
                      estado="recibido"
                      compacto={true}
                      vistaTabla={vistaTabla}
                      cobrandoPedidoId={pedidoACobrar && pedidoACobrar.id !== 'nuevo' ? pedidoACobrar.id : null}
                    />
                  </div>

                  <div className="h-full w-[60%] transition-all duration-300">
                    <PedidosColumn
                      titulo="EN PREPARACIÓN"
                      pedidos={pedidosEnCocina}
                      onMarcharACocina={handleMarcharACocina}
                      onListo={handleListo}
                      onEntregar={handleEntregar}
                      onEditar={handleEditar}
                      onCancelar={handleCancelar}
                      onCobrar={abrirModalCobro}
                      onImprimir={handleImprimir}
                      estado="en_cocina"
                      compacto={true}
                      vistaTabla={vistaTabla}
                      cobrandoPedidoId={pedidoACobrar && pedidoACobrar.id !== 'nuevo' ? pedidoACobrar.id : null}
                    />
                  </div>
                </div>
              </div>
              <DragOverlay 
                dropAnimation={null}
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
        </main>

        <Footer />
      </div>

      {/* Modales */}
      <ModalCancelarPedido
        pedido={pedidoCancelar}
        isOpen={pedidoCancelar !== null}
        onClose={() => setPedidoCancelar(null)}
        onConfirmar={confirmarCancelacion}
      />

      <ModalPedidosEntregados
        pedidos={pedidosEntregados}
        isOpen={modalPedidosEntregados}
        onClose={() => setModalPedidosEntregados(false)}
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
        descuento={nuevoPedido.descuento}
        setDescuento={nuevoPedido.setDescuento}
        calcularSubtotal={nuevoPedido.calcularSubtotal}
        calcularEnvio={nuevoPedido.calcularEnvio}
        calcularDescuento={nuevoPedido.calcularDescuento}
        calcularIVA={nuevoPedido.calcularIVA}
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
        descuento={editarPedido.descuento}
        setDescuento={editarPedido.setDescuento}
        calcularSubtotal={editarPedido.calcularSubtotal}
        calcularEnvio={editarPedido.calcularEnvio}
        calcularDescuento={editarPedido.calcularDescuento}
        calcularIVA={editarPedido.calcularIVA}
        calcularTotal={editarPedido.calcularTotal}
        agregarProductoConExtras={editarPedido.agregarProductoConExtras}
        modificarCantidad={editarPedido.modificarCantidad}
        eliminarDelCarrito={editarPedido.eliminarDelCarrito}
        editarExtrasItem={editarPedido.editarExtrasItem}
        resetearModal={editarPedido.resetearModal}
        actualizarPedido={editarPedido.actualizarPedido}
        onSuccess={(pedidoActualizado) => {
          if (pedidoActualizado?.id) {
            actualizarPedido(pedidoActualizado.id, pedidoActualizado);
          }
          recargarPedidos?.();
        }}
      />

      <ModoCocina
        isOpen={modoCocinaOpen}
        onClose={() => setModoCocinaOpen(false)}
        onPedidoActualizado={(pedidoId, actualizaciones) => {
          // Actualizar el pedido en la lista principal cuando se marca como lista desde ModoCocina
          actualizarPedido(pedidoId, actualizaciones);
        }}
        modoCocina={false}
      />

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

      <ModalImprimir
        pedido={pedidoAImprimir}
        isOpen={modalImprimir}
        onClose={() => {
          setModalImprimir(false);
          setPedidoAImprimir(null);
        }}
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
    </>
  );
}

export default function VentasPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <VentasContent />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
