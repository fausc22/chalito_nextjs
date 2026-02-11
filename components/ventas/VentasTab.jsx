import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { AlertTriangle, TrendingUp, DollarSign, Receipt, Ban } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
    PaginationEllipsis,
    PaginationLink,
} from '@/components/ui/pagination';
import { VentasFilters } from './VentasFilters';
import { VentasTable } from './VentasTable';
import { VentasCard } from './VentasCard';
import { VentaDetalleDrawer } from './VentaDetalleDrawer';
import { VentasPageSkeleton } from './VentasPageSkeleton';
import { toast } from '@/hooks/use-toast';

export function VentasTab({
    ventas,
    loadingVentas,
    errorVentas,
    metaVentas,
    isMutatingVentas,
    mediosPago,
    onCargarVentas,
    onAnularVenta,
    onObtenerVentaPorId,
    ventaDetalle,
    loadingDetalle,
    onLimpiarVentaDetalle
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
        const hasQueryParams = Object.keys(query).length > 0;
        
        const month = query.month === 'all' ? 'all' : (query.month ? parseInt(query.month) : current.month);
        const year = query.year ? parseInt(query.year) : current.year;
        const page = query.page ? parseInt(query.page) : 1;

        return {
            month: month,
            year: year,
            page: page,
            fecha_desde: query.fecha_desde || '',
            fecha_hasta: query.fecha_hasta || '',
            estado: query.estado || '',
            medio_pago: query.medio_pago || '',
            busqueda: query.busqueda || ''
        };
    }, [router.query, getCurrentDate]);

    // Estados locales para UI
    const [drawerDetalle, setDrawerDetalle] = useState(false);
    const [modalAnular, setModalAnular] = useState(false);
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
    const [motivoAnulacion, setMotivoAnulacion] = useState('');

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

    // Cargar ventas cuando cambian los filtros o la página
    useEffect(() => {
        if (!isInitialized || !router.isReady) return;
        
        const loadVentas = async () => {
            const params = {
                month: filtros.month === 'all' ? null : filtros.month,
                year: filtros.year,
                page: filtros.page,
                limit: 20,
                fecha_desde: filtros.fecha_desde || undefined,
                fecha_hasta: filtros.fecha_hasta || undefined,
                estado: filtros.estado || undefined,
                medio_pago: filtros.medio_pago || undefined,
                busqueda: filtros.busqueda || undefined
            };
            
            // Limpiar parámetros undefined
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === '') {
                    delete params[key];
                }
            });
            
            await onCargarVentas(params);
        };
        
        loadVentas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros.month, filtros.year, filtros.page, filtros.estado, filtros.medio_pago, filtros.busqueda, isInitialized, router.isReady]);

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
        if (newFilters.estado) {
            query.estado = newFilters.estado;
        }
        
        if (newFilters.medio_pago) {
            query.medio_pago = newFilters.medio_pago;
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

    // Paginación para vista móvil (basada en datos del servidor)
    const totalPagesMobile = useMemo(
        () => metaVentas.total_paginas || 1,
        [metaVentas.total_paginas]
    );
    
    const currentVentasMobile = useMemo(() => {
        return ventas;
    }, [ventas]);

    // Handler para cambio de página móvil
    const handlePageChangeMobile = (page) => {
        setFiltros(prev => {
            const newFilters = { ...prev, page };
            updateURL(newFilters);
            return newFilters;
        });
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Handlers
    const handleVerDetalle = async (venta) => {
        setVentaSeleccionada(venta);
        setDrawerDetalle(true);
        await onObtenerVentaPorId(venta.id);
    };

    const handleAnular = (venta) => {
        setVentaSeleccionada(venta);
        setMotivoAnulacion('');
        setModalAnular(true);
    };

    const handleConfirmarAnulacion = async () => {
        if (!ventaSeleccionada) return;

        const resultado = await onAnularVenta(ventaSeleccionada.id, motivoAnulacion);

        if (resultado.success) {
            setModalAnular(false);
            setVentaSeleccionada(null);
            setMotivoAnulacion('');
            toast({
                title: "Venta anulada",
                description: resultado.message || "La venta se anuló correctamente"
            });
            const params = {
                month: filtros.month === 'all' ? null : filtros.month,
                year: filtros.year,
                page: filtros.page,
                limit: 20
            };
            onCargarVentas(params);
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: resultado.error
            });
        }
    };

    const handleCloseDrawer = () => {
        setDrawerDetalle(false);
        setVentaSeleccionada(null);
        onLimpiarVentaDetalle();
    };

    const handleFiltroChange = (campo, valor) => {
        const newFilters = { ...filtros, [campo]: valor, page: 1 }; // Resetear a página 1 al cambiar filtros
        setFiltros(newFilters);
        updateURL(newFilters);
    };

    const handleBuscar = () => {
        const newFilters = { ...filtros, page: 1 };
        setFiltros(newFilters);
        updateURL(newFilters);
    };

    const limpiarFiltros = () => {
        const current = getCurrentDate();
        const filtrosVacios = {
            month: current.month,
            year: current.year,
            page: 1,
            fecha_desde: '',
            fecha_hasta: '',
            estado: '',
            medio_pago: '',
            busqueda: ''
        };
        setFiltros(filtrosVacios);
        updateURL(filtrosVacios);
    };

    // Handler para cambio de página (desktop)
    const handlePageChange = (newPage) => {
        const newFilters = { ...filtros, page: newPage };
        setFiltros(newFilters);
        updateURL(newFilters);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Formatear moneda
    const formatMonto = (monto) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(monto);
    };

    // Loading state
    if (loadingVentas && ventas.length === 0) {
        return <VentasPageSkeleton />;
    }

    // Error state
    if (errorVentas) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error al cargar ventas</AlertTitle>
                <AlertDescription>{errorVentas}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div ref={containerRef} className="space-y-6">

            {/* Resumen de totales */}
            {metaVentas.total_registros > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-700">Total Facturado</p>
                                    <p className="text-xl font-bold text-emerald-800">
                                        {formatMonto(metaVentas.total_facturado)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-500 rounded-lg">
                                    <Receipt className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Cantidad</p>
                                    <p className="text-xl font-bold text-slate-800">
                                        {metaVentas.total_registros} ventas
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {metaVentas.total_anulado > 0 && (
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500 rounded-lg">
                                        <Ban className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-red-700">Total Anulado</p>
                                        <p className="text-xl font-bold text-red-800">
                                            {formatMonto(metaVentas.total_anulado)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Filtros */}
            <VentasFilters
                filtros={filtros}
                mediosPago={mediosPago}
                onFiltroChange={handleFiltroChange}
                onLimpiarFiltros={limpiarFiltros}
                onBuscar={handleBuscar}
            />

            {/* Vista Desktop - Tabla */}
            <div className="hidden md:block">
                <VentasTable
                    ventas={ventas}
                    onVerDetalle={handleVerDetalle}
                    onAnular={handleAnular}
                />
                
                {/* Paginación Desktop */}
                {metaVentas.total_paginas > 1 && (
                    <div className="mt-6">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => handlePageChange(Math.max(1, metaVentas.pagina_actual - 1))}
                                        className={`cursor-pointer ${
                                            metaVentas.pagina_actual === 1 ? 'pointer-events-none opacity-50' : ''
                                        }`}
                                    />
                                </PaginationItem>
                                
                                {/* Mostrar páginas */}
                                {Array.from({ length: Math.min(5, metaVentas.total_paginas) }, (_, i) => {
                                    let pageNum;
                                    if (metaVentas.total_paginas <= 5) {
                                        pageNum = i + 1;
                                    } else if (metaVentas.pagina_actual <= 3) {
                                        pageNum = i + 1;
                                    } else if (metaVentas.pagina_actual >= metaVentas.total_paginas - 2) {
                                        pageNum = metaVentas.total_paginas - 4 + i;
                                    } else {
                                        pageNum = metaVentas.pagina_actual - 2 + i;
                                    }
                                    
                                    return (
                                        <PaginationItem key={pageNum}>
                                            <PaginationLink
                                                onClick={() => handlePageChange(pageNum)}
                                                isActive={metaVentas.pagina_actual === pageNum}
                                                className="cursor-pointer"
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}
                                
                                {metaVentas.total_paginas > 5 && metaVentas.pagina_actual < metaVentas.total_paginas - 2 && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}
                                
                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => handlePageChange(Math.min(metaVentas.total_paginas, metaVentas.pagina_actual + 1))}
                                        className={`cursor-pointer ${
                                            metaVentas.pagina_actual >= metaVentas.total_paginas ? 'pointer-events-none opacity-50' : ''
                                        }`}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                        <div className="text-center text-sm text-muted-foreground mt-2">
                            Página {metaVentas.pagina_actual} de {metaVentas.total_paginas} 
                            {' '}({metaVentas.total_registros} ventas en total)
                        </div>
                    </div>
                )}
            </div>

            {/* Vista Mobile - Cards */}
            <div className="md:hidden">
                {ventas.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <p className="text-muted-foreground">No se encontraron ventas</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Prueba ajustando los filtros de búsqueda
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-4">
                            {currentVentasMobile.map((venta) => (
                                <VentasCard
                                    key={venta.id}
                                    venta={venta}
                                    onVerDetalle={handleVerDetalle}
                                    onAnular={handleAnular}
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
                                                onClick={() => handlePageChangeMobile(Math.max(1, metaVentas.pagina_actual - 1))}
                                                className={`cursor-pointer text-xs ${
                                                    metaVentas.pagina_actual === 1 ? 'pointer-events-none opacity-50' : ''
                                                }`}
                                            />
                                        </PaginationItem>

                                        <div className="flex items-center px-3 text-sm text-muted-foreground">
                                            {metaVentas.pagina_actual} / {totalPagesMobile}
                                        </div>

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => handlePageChangeMobile(Math.min(totalPagesMobile, metaVentas.pagina_actual + 1))}
                                                className={`cursor-pointer text-xs ${
                                                    metaVentas.pagina_actual >= totalPagesMobile ? 'pointer-events-none opacity-50' : ''
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

            {/* Drawer de Detalle */}
            <VentaDetalleDrawer
                isOpen={drawerDetalle}
                onClose={handleCloseDrawer}
                ventaDetalle={ventaDetalle}
                loading={loadingDetalle}
            />

            {/* AlertDialog Anular */}
            <AlertDialog open={modalAnular} onOpenChange={setModalAnular}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Ban className="h-5 w-5 text-destructive" />
                            Anular Venta
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-4">
                                <p>
                                    ¿Estás seguro de que quieres anular esta venta?
                                </p>
                                {ventaSeleccionada && (
                                    <div className="bg-muted rounded-lg p-4 border">
                                        <p className="font-semibold">Venta #{ventaSeleccionada.id}</p>
                                        <p className="text-lg text-emerald-600 font-bold mt-1">
                                            {formatMonto(ventaSeleccionada.total)}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Cliente: {ventaSeleccionada.cliente_nombre || 'Consumidor Final'}
                                        </p>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="motivo">Motivo de anulación (opcional)</Label>
                                    <Textarea
                                        id="motivo"
                                        placeholder="Ingrese el motivo de la anulación..."
                                        value={motivoAnulacion}
                                        onChange={(e) => setMotivoAnulacion(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <p className="text-sm text-destructive font-medium">
                                    ⚠️ Esta acción revertirá el stock y el saldo de la cuenta asociada.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isMutatingVentas}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmarAnulacion}
                            disabled={isMutatingVentas}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isMutatingVentas ? 'Anulando...' : 'Anular Venta'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

