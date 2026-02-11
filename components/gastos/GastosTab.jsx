import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Plus, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { GastosFilters } from './GastosFilters';
import { GastosTable } from './GastosTable';
import { GastosCard } from './GastosCard';
import { GastosForm } from './GastosForm';
import { GastosPageSkeleton } from './GastosPageSkeleton';
import { GastoDetalleDrawer } from './GastoDetalleDrawer';
import { toast } from '@/hooks/use-toast';

export function GastosTab({
    gastos,
    loadingGastos,
    errorGastos,
    metaGastos,
    isMutatingGastos,
    categorias,
    cuentas,
    onCargarGastos,
    onCrearGasto,
    onEditarGasto,
    onEliminarGasto,
    onObtenerGastoPorId
}) {
    const router = useRouter();
    const containerRef = useRef(null);

    // Obtener fecha actual para inicializar filtros
    const getCurrentDate = useCallback(() => {
        const now = new Date();
        return {
            year: now.getFullYear(),
            month: now.getMonth() + 1, // 1-12
            day: now.getDate()
        };
    }, []);

    // Inicializar filtros desde URL o valores por defecto
    const initializeFilters = useCallback(() => {
        const current = getCurrentDate();
        const query = router.query;
        
        // Si no hay query params, usar valores por defecto (mes/año actual)
        const month = query.month === 'all' ? 'all' : (query.month ? parseInt(query.month) : current.month);
        const year = query.year ? parseInt(query.year) : current.year;
        const page = query.page ? parseInt(query.page) : 1;

        return {
            month: month,
            year: year,
            page: page,
            fecha_desde: query.fecha_desde || '',
            fecha_hasta: query.fecha_hasta || '',
            categoria_id: query.categoria_id || '',
            cuenta_id: query.cuenta_id || '',
            forma_pago: query.forma_pago || '',
            busqueda: query.busqueda || ''
        };
    }, [router.query, getCurrentDate]);

    // Estados locales para UI
    const [modalAgregar, setModalAgregar] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalEliminar, setModalEliminar] = useState(false);
    const [drawerDetalle, setDrawerDetalle] = useState(false);
    const [gastoSeleccionado, setGastoSeleccionado] = useState(null);
    const [gastoDetalle, setGastoDetalle] = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);

    // Estados locales para filtros (inicializados desde URL)
    const [filtros, setFiltros] = useState(() => initializeFilters());
    const [isInitialized, setIsInitialized] = useState(false);

    // Inicializar desde URL al montar o cuando cambia la URL
    useEffect(() => {
        if (!router.isReady) return;
        
        const newFilters = initializeFilters();
        const hasChanged = JSON.stringify(newFilters) !== JSON.stringify(filtros);
        
        if (!isInitialized) {
            // Primera inicialización: si no hay query params, establecerlos
            const hasQueryParams = Object.keys(router.query).length > 0;
            if (!hasQueryParams) {
                // Establecer query params por defecto (mes/año actual)
                router.replace({
                    pathname: router.pathname,
                    query: {
                        month: String(newFilters.month),
                        year: String(newFilters.year)
                    }
                }, undefined, { shallow: true });
            }
            setFiltros(newFilters);
            setIsInitialized(true);
        } else if (hasChanged) {
            // URL cambió externamente (navegación del navegador)
            setFiltros(newFilters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady, router.query]);

    // Cargar gastos cuando cambian los filtros o la página
    useEffect(() => {
        if (!isInitialized || !router.isReady) return;
        
        const loadGastos = async () => {
            const params = {
                month: filtros.month === 'all' ? null : filtros.month,
                year: filtros.year,
                page: filtros.page,
                limit: 20,
                fecha_desde: filtros.fecha_desde || undefined,
                fecha_hasta: filtros.fecha_hasta || undefined,
                categoria_id: filtros.categoria_id || undefined,
                cuenta_id: filtros.cuenta_id || undefined,
                forma_pago: filtros.forma_pago || undefined,
                busqueda: filtros.busqueda || undefined
            };
            
            // Limpiar parámetros undefined
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === '') {
                    delete params[key];
                }
            });
            
            await onCargarGastos(params);
        };
        
        loadGastos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros.month, filtros.year, filtros.page, filtros.categoria_id, filtros.cuenta_id, filtros.forma_pago, filtros.busqueda, isInitialized, router.isReady]);

    // Actualizar URL cuando cambian los filtros
    const updateURL = useCallback((newFilters) => {
        if (!router.isReady) return;
        
        const query = {};
        
        // Siempre incluir month y year (valores por defecto si no están)
        const current = getCurrentDate();
        query.month = newFilters.month === 'all' ? 'all' : String(newFilters.month || current.month);
        query.year = String(newFilters.year || current.year);
        
        // Página solo si es mayor a 1
        if (newFilters.page && newFilters.page > 1) {
            query.page = String(newFilters.page);
        }
        
        // Otros filtros opcionales
        if (newFilters.categoria_id) {
            query.categoria_id = newFilters.categoria_id;
        }
        
        if (newFilters.cuenta_id) {
            query.cuenta_id = newFilters.cuenta_id;
        }
        
        if (newFilters.forma_pago) {
            query.forma_pago = newFilters.forma_pago;
        }
        
        if (newFilters.busqueda) {
            query.busqueda = newFilters.busqueda;
        }
        
        // Fechas solo si no se usa month/year
        if (newFilters.fecha_desde && !newFilters.month && newFilters.month !== 'all') {
            query.fecha_desde = newFilters.fecha_desde;
        }
        
        if (newFilters.fecha_hasta && !newFilters.month && newFilters.month !== 'all') {
            query.fecha_hasta = newFilters.fecha_hasta;
        }
        
        router.push({
            pathname: router.pathname,
            query
        }, undefined, { shallow: true });
    }, [router, getCurrentDate]);

    // Estados para paginación móvil
    const itemsPerPageMobile = 4;

    // Estado del formulario
    const [formulario, setFormulario] = useState({
        categoria_id: '',
        descripcion: '',
        monto: '',
        forma_pago: 'EFECTIVO',
        cuenta_id: '',
        observaciones: ''
    });

    // Pre-seleccionar primera cuenta cuando se cargan las cuentas
    useEffect(() => {
        if (cuentas.length > 0 && !formulario.cuenta_id) {
            setFormulario(prev => ({
                ...prev,
                cuenta_id: cuentas[0].id
            }));
        }
    }, [cuentas]);

    // Paginación para vista móvil (basada en datos del servidor)
    const totalPagesMobile = useMemo(
        () => metaGastos.total_paginas || 1,
        [metaGastos.total_paginas]
    );
    
    const currentGastosMobile = useMemo(() => {
        return gastos;
    }, [gastos]);

    // Handler para cambio de página móvil
    const handlePageChangeMobile = (page) => {
        setFiltros(prev => {
            const newFilters = { ...prev, page };
            updateURL(newFilters);
            return newFilters;
        });
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Limpiar formulario
    const limpiarFormulario = () => {
        setFormulario({
            categoria_id: '',
            descripcion: '',
            monto: '',
            forma_pago: 'EFECTIVO',
            cuenta_id: cuentas.length > 0 ? cuentas[0].id : '',
            observaciones: ''
        });
    };

    // Validación
    const validarCamposObligatorios = () => {
        if (!formulario.categoria_id) {
            return 'La categoría es obligatoria';
        }
        if (!formulario.descripcion?.trim()) {
            return 'La descripción es obligatoria';
        }
        if (!formulario.monto || parseFloat(formulario.monto) <= 0) {
            return 'El monto debe ser mayor a 0';
        }
        if (!formulario.cuenta_id) {
            return 'La cuenta de fondos es obligatoria';
        }
        
        return null;
    };

    // Handlers
    const handleCrearGasto = async () => {
        const errorValidacion = validarCamposObligatorios();
        if (errorValidacion) {
            toast({
                variant: "destructive",
                title: "Error de validación",
                description: errorValidacion
            });
            return;
        }

        const resultado = await onCrearGasto(formulario);

        if (resultado.success) {
            setModalAgregar(false);
            limpiarFormulario();
            toast({
                title: "Gasto registrado",
                description: resultado.message || "El gasto se registró correctamente"
            });
            // Recargar con filtros actuales
            const params = {
                month: filtros.month === 'all' ? null : filtros.month,
                year: filtros.year,
                page: filtros.page,
                limit: 20,
                fecha_desde: filtros.fecha_desde || undefined,
                fecha_hasta: filtros.fecha_hasta || undefined,
                categoria_id: filtros.categoria_id || undefined,
                cuenta_id: filtros.cuenta_id || undefined,
                forma_pago: filtros.forma_pago || undefined,
                busqueda: filtros.busqueda || undefined
            };
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === '') {
                    delete params[key];
                }
            });
            onCargarGastos(params);
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: resultado.error
            });
        }
    };

    const handleActualizarGasto = async () => {
        const errorValidacion = validarCamposObligatorios();
        if (errorValidacion) {
            toast({
                variant: "destructive",
                title: "Error de validación",
                description: errorValidacion
            });
            return;
        }

        const resultado = await onEditarGasto(gastoSeleccionado.id, formulario);

        if (resultado.success) {
            setModalEditar(false);
            setGastoSeleccionado(null);
            limpiarFormulario();
            toast({
                title: "Gasto actualizado",
                description: resultado.message || "El gasto se actualizó correctamente"
            });
            // Recargar con filtros actuales
            const params = {
                month: filtros.month === 'all' ? null : filtros.month,
                year: filtros.year,
                page: filtros.page,
                limit: 20,
                fecha_desde: filtros.fecha_desde || undefined,
                fecha_hasta: filtros.fecha_hasta || undefined,
                categoria_id: filtros.categoria_id || undefined,
                cuenta_id: filtros.cuenta_id || undefined,
                forma_pago: filtros.forma_pago || undefined,
                busqueda: filtros.busqueda || undefined
            };
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === '') {
                    delete params[key];
                }
            });
            onCargarGastos(params);
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: resultado.error
            });
        }
    };

    const handleEliminarGasto = async () => {
        const resultado = await onEliminarGasto(gastoSeleccionado.id);

        if (resultado.success) {
            setModalEliminar(false);
            setGastoSeleccionado(null);
            toast({
                title: "Gasto eliminado",
                description: resultado.message || "El gasto se eliminó correctamente"
            });
            // Recargar con filtros actuales
            const params = {
                month: filtros.month === 'all' ? null : filtros.month,
                year: filtros.year,
                page: filtros.page,
                limit: 20,
                fecha_desde: filtros.fecha_desde || undefined,
                fecha_hasta: filtros.fecha_hasta || undefined,
                categoria_id: filtros.categoria_id || undefined,
                cuenta_id: filtros.cuenta_id || undefined,
                forma_pago: filtros.forma_pago || undefined,
                busqueda: filtros.busqueda || undefined
            };
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === '') {
                    delete params[key];
                }
            });
            onCargarGastos(params);
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: resultado.error
            });
        }
    };

    const handleEditar = (gasto) => {
        setGastoSeleccionado(gasto);
        setFormulario({
            categoria_id: gasto.categoria_id?.toString() || '',
            descripcion: gasto.descripcion || '',
            monto: gasto.monto?.toString() || '',
            forma_pago: gasto.forma_pago || 'EFECTIVO',
            cuenta_id: gasto.cuenta_id?.toString() || (cuentas.length > 0 ? cuentas[0].id.toString() : ''),
            observaciones: gasto.observaciones || ''
        });
        setModalEditar(true);
    };

    const handleEliminar = (gasto) => {
        setGastoSeleccionado(gasto);
        setModalEliminar(true);
    };

    const handleVer = async (gasto) => {
        setGastoSeleccionado(gasto);
        setDrawerDetalle(true);
        setLoadingDetalle(true);
        setGastoDetalle(null);
        
        if (onObtenerGastoPorId) {
            const resultado = await onObtenerGastoPorId(gasto.id);
            if (resultado.success) {
                setGastoDetalle(resultado.data);
            }
        } else {
            setGastoDetalle(gasto);
        }
        setLoadingDetalle(false);
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor, page: 1 }));
    };

    const handleBuscar = () => {
        const newFilters = { ...filtros, page: 1 };
        updateURL(newFilters);
        setFiltros(newFilters);
    };

    const limpiarFiltros = () => {
        const current = getCurrentDate();
        const filtrosVacios = {
            month: current.month,
            year: current.year,
            page: 1,
            fecha_desde: '',
            fecha_hasta: '',
            categoria_id: '',
            cuenta_id: '',
            forma_pago: '',
            busqueda: ''
        };
        updateURL(filtrosVacios);
        setFiltros(filtrosVacios);
    };

    const handleCloseModal = () => {
        setModalAgregar(false);
        setModalEditar(false);
        setModalEliminar(false);
        setGastoSeleccionado(null);
        limpiarFormulario();
    };

    // Formatear moneda
    const formatMonto = (monto) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(monto);
    };

    // Loading state
    if (loadingGastos && gastos.length === 0) {
        return <GastosPageSkeleton />;
    }

    // Error state
    if (errorGastos) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error al cargar gastos</AlertTitle>
                <AlertDescription>{errorGastos}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div ref={containerRef} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4">
                <div className="text-center sm:text-left w-full sm:w-auto">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center justify-center sm:justify-start gap-2">
                        <TrendingDown className="h-6 w-6 text-red-500" />
                        Gestión de Gastos
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Registra y controla los egresos del negocio
                    </p>
                </div>

                <Button 
                    onClick={() => setModalAgregar(true)} 
                    className="gap-2 w-[200px] sm:w-auto bg-red-600 hover:bg-red-700"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Gasto
                </Button>
            </div>

            {/* Resumen de totales */}
            {metaGastos.total_monto > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-red-700">Total Gastos</p>
                                    <p className="text-xl font-bold text-red-800">
                                        {formatMonto(metaGastos.total_monto)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-500 rounded-lg">
                                    <TrendingDown className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Cantidad</p>
                                    <p className="text-xl font-bold text-slate-800">
                                        {metaGastos.total_registros} gastos
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-amber-700">Promedio</p>
                                    <p className="text-xl font-bold text-amber-800">
                                        {formatMonto(metaGastos.total_registros > 0 
                                            ? metaGastos.total_monto / metaGastos.total_registros 
                                            : 0)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filtros */}
            <GastosFilters
                filtros={filtros}
                categorias={categorias}
                cuentas={cuentas}
                onFiltroChange={handleFiltroChange}
                onLimpiarFiltros={limpiarFiltros}
                onBuscar={handleBuscar}
            />

            {/* Vista Desktop - Tabla */}
            <div className="hidden md:block">
                <GastosTable
                    gastos={gastos}
                    onVer={handleVer}
                    onEditar={handleEditar}
                    onEliminar={handleEliminar}
                    scrollRef={containerRef}
                />
            </div>

            {/* Vista Mobile - Cards */}
            <div className="md:hidden">
                {gastos.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <p className="text-muted-foreground">No se encontraron gastos</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Prueba ajustando los filtros o registra un nuevo gasto
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-4">
                            {currentGastosMobile.map((gasto) => (
                                <GastosCard
                                    key={gasto.id}
                                    gasto={gasto}
                                    onVer={handleVer}
                                    onEditar={handleEditar}
                                    onEliminar={handleEliminar}
                                />
                            ))}
                        </div>

                        {/* Paginación móvil */}
                        {totalPagesMobile > 1 && (
                            <div className="mt-6">
                                <Pagination>
                                    <PaginationContent className="gap-1">
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => handlePageChangeMobile(Math.max(1, filtros.page - 1))}
                                                className={`cursor-pointer text-xs ${
                                                    filtros.page === 1 ? 'pointer-events-none opacity-50' : ''
                                                }`}
                                            />
                                        </PaginationItem>

                                        <div className="flex items-center px-3 text-sm text-muted-foreground">
                                            {filtros.page} / {totalPagesMobile}
                                        </div>

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => handlePageChangeMobile(Math.min(totalPagesMobile, filtros.page + 1))}
                                                className={`cursor-pointer text-xs ${
                                                    filtros.page === totalPagesMobile ? 'pointer-events-none opacity-50' : ''
                                                }`}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Agregar/Editar */}
            <GastosForm
                isOpen={modalAgregar || modalEditar}
                onClose={handleCloseModal}
                formulario={formulario}
                setFormulario={setFormulario}
                categorias={categorias}
                cuentas={cuentas}
                onSubmit={modalAgregar ? handleCrearGasto : handleActualizarGasto}
                isEditing={modalEditar}
                loading={isMutatingGastos}
            />

            {/* AlertDialog Eliminar */}
            <AlertDialog open={modalEliminar} onOpenChange={setModalEliminar}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Eliminar Gasto
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p>
                                    ¿Estás seguro de que quieres eliminar este gasto?
                                </p>
                                {gastoSeleccionado && (
                                    <div className="bg-muted rounded-lg p-4 border">
                                        <p className="font-semibold">{gastoSeleccionado.descripcion}</p>
                                        <p className="text-lg text-red-600 font-bold mt-1">
                                            {formatMonto(gastoSeleccionado.monto)}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {gastoSeleccionado.cuenta_id 
                                                ? 'El monto será devuelto a la cuenta de fondos.' 
                                                : 'Este gasto no tiene cuenta asociada.'}
                                        </p>
                                    </div>
                                )}
                                <p className="text-sm text-destructive font-medium">
                                    Esta acción no se puede deshacer.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isMutatingGastos}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleEliminarGasto}
                            disabled={isMutatingGastos}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isMutatingGastos ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Drawer de Detalle */}
            <GastoDetalleDrawer
                isOpen={drawerDetalle}
                onClose={() => {
                    setDrawerDetalle(false);
                    setGastoDetalle(null);
                    setGastoSeleccionado(null);
                }}
                gasto={gastoDetalle || gastoSeleccionado}
                loading={loadingDetalle}
            />
        </div>
    );
}

