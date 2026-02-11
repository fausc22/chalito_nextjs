import { useState, useEffect } from 'react';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { NavBar } from '../../components/layout/NavBar';
import { Footer } from '../../components/layout/Footer';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { PedidosSidebar } from '../../components/pedidos/PedidosSidebar';
import { PedidosColumn } from '../../components/pedidos/PedidosColumn';
import { ModalCancelarPedido } from '../../components/pedidos/modals/ModalCancelarPedido';
import { ModalPedidosEntregados } from '../../components/pedidos/modals/ModalPedidosEntregados';
import { ModalNuevoPedido } from '../../components/pedidos/modals/ModalNuevoPedido';
import { ModalExtras } from '../../components/pedidos/modals/ModalExtras';
import { ModoCocina } from '../../components/pedidos/ModoCocina';
import { ModalCobro } from '../../components/pedidos/modals/ModalCobro';
import { usePedidos } from '../../hooks/pedidos/usePedidos';
import { useNuevoPedido } from '../../hooks/pedidos/useNuevoPedido';
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
  const [pedidoPendienteCrear, setPedidoPendienteCrear] = useState(null);
  const [mostrarConfirmacionFacturacion, setMostrarConfirmacionFacturacion] = useState(false);
  const [medioPagoParaCrear, setMedioPagoParaCrear] = useState(null);
  const [notificacionesCount, setNotificacionesCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true); // Estado de conexión del sistema
  const [modoCocinaOpen, setModoCocinaOpen] = useState(false);

  const {
    pedidosRecibidos,
    pedidosEnCocina,
    pedidosEntregados,
    busquedaPedidos,
    setBusquedaPedidos,
    handleDragEnd,
    handleMarcharACocina,
    handleListo,
    handleCancelar: cancelarPedido,
    agregarPedido,
    actualizarPedido,
    recargarPedidos,
  } = usePedidos();

  const nuevoPedido = useNuevoPedido();

  // Configuración de sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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
    toast.info(`Editar pedido ${pedido.id}`, {
      description: 'Modal por implementar',
    });
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

  const handleCobroExitosoYCrearPedido = async (medioPagoSeleccionado) => {
    // Guardar el medio de pago y mostrar modal de confirmación
    setMedioPagoParaCrear(medioPagoSeleccionado);
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
      
      // Crear el pedido con los datos actualizados
      // Usar un callback que no muestre el modal de cobro de nuevo
      const handleCrearPedidoFinal = async (pedidoCreado) => {
        if (pedidoCreado) {
          // Mostrar toast de éxito
          toast.success('Pedido creado exitosamente', {
            description: `Pedido #${pedidoCreado.id} creado y cobrado correctamente`
          });
          
          // Recargar pedidos
          if (recargarPedidos) {
            await recargarPedidos();
          }
          // Limpiar datos pendientes
          setPedidoPendienteCrear(null);
          setMedioPagoParaCrear(null);
          // Cerrar modal de nuevo pedido
          nuevoPedido.setIsOpen(false);
        }
      };
      
      const pedido = await nuevoPedido.crearPedido(handleCrearPedidoFinal);
      if (!pedido) {
        // Si falló, volver a abrir el modal de cobro
        setPedidoACobrar(pedidoPendienteCrear);
        setModalCobro(true);
        toast.error('Error al crear el pedido', {
          description: 'No se pudo crear el pedido después del cobro'
        });
      }
    } else {
      toast.error('Error al procesar el pedido', {
        description: 'Faltan datos para crear el pedido'
      });
    }
  };

  const handleCobroExitoso = async (pedidoId) => {
    // Actualizar el estado del pedido a pagado
    if (recargarPedidos) {
      await recargarPedidos();
    }
    // El pedido ya debería estar actualizado en el backend
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
              isOnline={isOnline}
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
              isOnline={isOnline}
            />
          </div>

          {/* Contenido principal que se ajusta al sidebar */}
          <div 
            className="flex-1 transition-all duration-300 overflow-hidden min-w-0"
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
            >
              <div className="flex-1 w-full px-3 sm:px-4 lg:px-6 py-3 min-h-0 flex flex-col">
                <div className="flex gap-3 h-[calc(100vh-140px)] w-full transition-all duration-300">
                  <div className="h-full w-[40%] transition-all duration-300">
                    <PedidosColumn
                      titulo="RECIBIDOS"
                      pedidos={pedidosRecibidos}
                      onMarcharACocina={handleMarcharACocina}
                      onListo={handleListo}
                      onEditar={handleEditar}
                      onCancelar={handleCancelar}
                      onCobrar={abrirModalCobro}
                      estado="recibido"
                      compacto={true}
                    />
                  </div>

                  <div className="h-full w-[60%] transition-all duration-300">
                    <PedidosColumn
                      titulo="EN PREPARACIÓN"
                      pedidos={pedidosEnCocina}
                      onMarcharACocina={handleMarcharACocina}
                      onListo={handleListo}
                      onEditar={handleEditar}
                      onCancelar={handleCancelar}
                      onCobrar={abrirModalCobro}
                      estado="en_cocina"
                      compacto={true}
                    />
                  </div>
                </div>
              </div>
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
        onSuccess={handlePedidoCreado}
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
        isOpen={nuevoPedido.modalExtras}
        onClose={(open) => !open && nuevoPedido.cerrarModalExtras()}
        producto={nuevoPedido.productoParaExtras}
        cantidadProducto={nuevoPedido.cantidadProducto}
        extrasSeleccionados={nuevoPedido.extrasSeleccionados}
        setExtrasSeleccionados={nuevoPedido.setExtrasSeleccionados}
        observacionItem={nuevoPedido.observacionItem}
        setObservacionItem={nuevoPedido.setObservacionItem}
        editandoItemCarrito={nuevoPedido.editandoItemCarrito}
        unidadActual={nuevoPedido.unidadActual}
        totalUnidades={nuevoPedido.totalUnidades}
        unidadesConfiguradas={nuevoPedido.unidadesConfiguradas}
        onConfirmar={nuevoPedido.confirmarExtras}
      />

      <ModalCobro
        pedido={pedidoACobrar}
        isOpen={modalCobro}
        onClose={() => {
          setModalCobro(false);
          setPedidoACobrar(null);
          setPedidoPendienteCrear(null);
        }}
        onCobroExitoso={(pedidoIdOrMedioPago) => {
          // Si es un pedido nuevo (medioPago es string), usar handleCobroExitosoYCrearPedido
          // Si es un pedido existente (pedidoId es número), usar handleCobroExitoso
          if (pedidoACobrar && pedidoACobrar.id === 'nuevo') {
            handleCobroExitosoYCrearPedido(pedidoIdOrMedioPago);
          } else {
            handleCobroExitoso(pedidoIdOrMedioPago);
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
