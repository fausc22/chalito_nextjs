import { useState } from 'react';
import { Plus, RefreshCw, ArrowDown, ArrowUp, ArrowLeftRight, Clock, AlertTriangle } from 'lucide-react';
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
import { CuentasTable } from './CuentasTable';
import { CuentaForm } from './CuentaForm';
import { MovimientoForm } from './MovimientoForm';
import { toast } from '@/hooks/use-toast';

export function CuentasTab({
    cuentas,
    loadingCuentas,
    errorCuentas,
    metaCuentas,
    isMutatingCuentas,
    onCargarCuentas,
    onCrearCuenta,
    onActualizarCuenta,
    onEliminarCuenta,
    onRegistrarMovimiento,
    onCargarHistorial
}) {
    // Estados locales para UI
    const [modalNuevaCuenta, setModalNuevaCuenta] = useState(false);
    const [modalEditarCuenta, setModalEditarCuenta] = useState(false);
    const [modalEliminarCuenta, setModalEliminarCuenta] = useState(false);
    const [modalIngreso, setModalIngreso] = useState(false);
    const [modalEgreso, setModalEgreso] = useState(false);
    const [modalTransferencia, setModalTransferencia] = useState(false);
    const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);

    // Handlers
    const handleNuevaCuenta = () => {
        setCuentaSeleccionada(null);
        setModalNuevaCuenta(true);
    };

    const handleEditarCuenta = (cuenta) => {
        setCuentaSeleccionada(cuenta);
        setModalEditarCuenta(true);
    };

    const handleEliminarCuenta = (cuenta) => {
        setCuentaSeleccionada(cuenta);
        setModalEliminarCuenta(true);
    };

    const handleConfirmarEliminar = async () => {
        if (!cuentaSeleccionada) return;

        const resultado = await onEliminarCuenta(cuentaSeleccionada.id);

        if (resultado.success) {
            setModalEliminarCuenta(false);
            setCuentaSeleccionada(null);
            toast({
                title: "Cuenta eliminada",
                description: resultado.message || "La cuenta se eliminó correctamente"
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: resultado.error
            });
        }
    };

    const handleIngreso = (cuenta) => {
        setCuentaSeleccionada(cuenta);
        setModalIngreso(true);
    };

    const handleEgreso = (cuenta) => {
        setCuentaSeleccionada(cuenta);
        setModalEgreso(true);
    };

    const handleTransferencia = (cuenta) => {
        setCuentaSeleccionada(cuenta);
        setModalTransferencia(true);
    };

    const handleHistorial = async (cuenta) => {
        await onCargarHistorial(cuenta.id);
        // Aquí podrías abrir un modal o navegar a otra vista
        toast({
            title: "Historial cargado",
            description: `Historial de ${cuenta.nombre} cargado correctamente`
        });
    };

    // Formatear moneda
    const formatMonto = (monto) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(monto);
    };

    // Loading state
    if (loadingCuentas && cuentas.length === 0) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-slate-200 rounded animate-pulse" />
                <div className="h-64 bg-slate-200 rounded animate-pulse" />
            </div>
        );
    }

    // Error state
    if (errorCuentas) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error al cargar cuentas</AlertTitle>
                <AlertDescription>{errorCuentas}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con acciones */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                        Cuentas Disponibles
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Gestiona las cuentas de fondos del negocio
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={handleNuevaCuenta}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva Cuenta
                    </Button>
                    <Button
                        onClick={onCargarCuentas}
                        variant="outline"
                        className="gap-2"
                        disabled={loadingCuentas}
                    >
                        <RefreshCw className={`h-4 w-4 ${loadingCuentas ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Tabla de cuentas */}
            <CuentasTable
                cuentas={cuentas}
                onEditar={handleEditarCuenta}
                onEliminar={handleEliminarCuenta}
                onIngreso={handleIngreso}
                onEgreso={handleEgreso}
                onTransferencia={handleTransferencia}
                onHistorial={handleHistorial}
            />

            {/* Total */}
            {metaCuentas.total_saldo !== undefined && (
                <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-teal-900">Total:</span>
                            <span className="text-2xl font-bold text-teal-800">
                                {formatMonto(metaCuentas.total_saldo)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Acciones rápidas */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Acciones Rápidas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button
                        onClick={() => {
                            if (cuentas.length > 0) {
                                handleIngreso(cuentas[0]);
                            } else {
                                toast({
                                    variant: "destructive",
                                    title: "Sin cuentas",
                                    description: "Primero debes crear una cuenta"
                                });
                            }
                        }}
                        className="h-20 gap-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={cuentas.length === 0}
                    >
                        <ArrowDown className="h-6 w-6" />
                        <span>Registrar Ingreso</span>
                    </Button>
                    <Button
                        onClick={() => {
                            if (cuentas.length > 0) {
                                handleEgreso(cuentas[0]);
                            } else {
                                toast({
                                    variant: "destructive",
                                    title: "Sin cuentas",
                                    description: "Primero debes crear una cuenta"
                                });
                            }
                        }}
                        className="h-20 gap-3 bg-red-600 hover:bg-red-700 text-white"
                        disabled={cuentas.length === 0}
                    >
                        <ArrowUp className="h-6 w-6" />
                        <span>Registrar Egreso</span>
                    </Button>
                    <Button
                        onClick={() => {
                            if (cuentas.length > 0) {
                                handleTransferencia(cuentas[0]);
                            } else {
                                toast({
                                    variant: "destructive",
                                    title: "Sin cuentas",
                                    description: "Primero debes crear una cuenta"
                                });
                            }
                        }}
                        className="h-20 gap-3 bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={cuentas.length === 0}
                    >
                        <ArrowLeftRight className="h-6 w-6" />
                        <span>Realizar Transferencia</span>
                    </Button>
                </div>
            </div>

            {/* Modales */}
            <CuentaForm
                isOpen={modalNuevaCuenta}
                onClose={() => {
                    setModalNuevaCuenta(false);
                    setCuentaSeleccionada(null);
                }}
                onSave={async (datos) => {
                    const resultado = await onCrearCuenta(datos);
                    if (resultado.success) {
                        setModalNuevaCuenta(false);
                        toast({
                            title: "Cuenta creada",
                            description: resultado.message || "La cuenta se creó correctamente"
                        });
                    } else {
                        toast({
                            variant: "destructive",
                            title: "Error",
                            description: resultado.error
                        });
                    }
                }}
                isMutating={isMutatingCuentas}
            />

            <CuentaForm
                isOpen={modalEditarCuenta}
                onClose={() => {
                    setModalEditarCuenta(false);
                    setCuentaSeleccionada(null);
                }}
                cuenta={cuentaSeleccionada}
                onSave={async (datos) => {
                    const resultado = await onActualizarCuenta(cuentaSeleccionada.id, datos);
                    if (resultado.success) {
                        setModalEditarCuenta(false);
                        setCuentaSeleccionada(null);
                        toast({
                            title: "Cuenta actualizada",
                            description: resultado.message || "La cuenta se actualizó correctamente"
                        });
                    } else {
                        toast({
                            variant: "destructive",
                            title: "Error",
                            description: resultado.error
                        });
                    }
                }}
                isMutating={isMutatingCuentas}
            />

            <MovimientoForm
                isOpen={modalIngreso}
                onClose={() => {
                    setModalIngreso(false);
                    setCuentaSeleccionada(null);
                }}
                cuenta={cuentaSeleccionada}
                tipo="INGRESO"
                cuentas={cuentas}
                onSave={async (datos) => {
                    const resultado = await onRegistrarMovimiento(datos);
                    if (resultado.success) {
                        setModalIngreso(false);
                        setCuentaSeleccionada(null);
                        toast({
                            title: "Ingreso registrado",
                            description: resultado.message || "El ingreso se registró correctamente"
                        });
                    } else {
                        toast({
                            variant: "destructive",
                            title: "Error",
                            description: resultado.error
                        });
                    }
                }}
                isMutating={isMutatingCuentas}
            />

            <MovimientoForm
                isOpen={modalEgreso}
                onClose={() => {
                    setModalEgreso(false);
                    setCuentaSeleccionada(null);
                }}
                cuenta={cuentaSeleccionada}
                tipo="EGRESO"
                cuentas={cuentas}
                onSave={async (datos) => {
                    const resultado = await onRegistrarMovimiento(datos);
                    if (resultado.success) {
                        setModalEgreso(false);
                        setCuentaSeleccionada(null);
                        toast({
                            title: "Egreso registrado",
                            description: resultado.message || "El egreso se registró correctamente"
                        });
                    } else {
                        toast({
                            variant: "destructive",
                            title: "Error",
                            description: resultado.error
                        });
                    }
                }}
                isMutating={isMutatingCuentas}
            />

            {/* Modal de eliminación */}
            <AlertDialog open={modalEliminarCuenta} onOpenChange={setModalEliminarCuenta}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Eliminar Cuenta
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-4">
                                <p>
                                    ¿Estás seguro de que quieres eliminar esta cuenta?
                                </p>
                                {cuentaSeleccionada && (
                                    <div className="bg-muted rounded-lg p-4 border">
                                        <p className="font-semibold">{cuentaSeleccionada.nombre}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {cuentaSeleccionada.descripcion || 'Sin descripción'}
                                        </p>
                                        <p className="text-lg font-bold text-emerald-600 mt-2">
                                            Saldo: {formatMonto(cuentaSeleccionada.saldo)}
                                        </p>
                                    </div>
                                )}
                                <p className="text-sm text-destructive font-medium">
                                    ⚠️ Esta acción marcará la cuenta como inactiva. No se podrá eliminar si tiene movimientos asociados.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isMutatingCuentas}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmarEliminar}
                            disabled={isMutatingCuentas}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isMutatingCuentas ? 'Eliminando...' : 'Eliminar Cuenta'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

