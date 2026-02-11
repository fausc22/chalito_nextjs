import { 
    X, Calendar, CreditCard, FileText, Wallet, Tag, User, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

export function GastoDetalleDrawer({ 
    isOpen, 
    onClose, 
    gasto, 
    loading 
}) {
    // Formatear moneda
    const formatMonto = (monto) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(monto);
    };

    // Formatear fecha
    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-AR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-red-600" />
                            Detalle de Gasto
                        </SheetTitle>
                    </div>
                </SheetHeader>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                    </div>
                ) : gasto ? (
                    <div className="mt-6 space-y-6">
                        {/* Header con número */}
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Número de Gasto</p>
                                    <p className="text-2xl font-bold font-mono text-red-700">#{gasto.id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {formatFecha(gasto.fecha)}
                            </div>
                        </div>

                        {/* Información principal */}
                        <div>
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                                Información del Gasto
                            </h3>
                            <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Tag className="h-4 w-4 text-slate-400" />
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground">Categoría</p>
                                        <p className="font-medium">{gasto.categoria_nombre}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FileText className="h-4 w-4 text-slate-400 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground">Descripción</p>
                                        <p className="font-medium">{gasto.descripcion}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CreditCard className="h-4 w-4 text-slate-400" />
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground">Forma de Pago</p>
                                        <p className="font-medium">{gasto.forma_pago || 'EFECTIVO'}</p>
                                    </div>
                                </div>
                                {gasto.cuenta_nombre && (
                                    <div className="flex items-center gap-3">
                                        <Wallet className="h-4 w-4 text-slate-400" />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">Cuenta de Fondos</p>
                                            <p className="font-medium">{gasto.cuenta_nombre}</p>
                                        </div>
                                    </div>
                                )}
                                {gasto.usuario_nombre && (
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-slate-400" />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">Registrado por</p>
                                            <p className="font-medium">{gasto.usuario_nombre}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Monto */}
                        <div className="p-4 rounded-lg bg-red-50">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">Monto Total</span>
                                <span className="text-2xl font-bold text-red-700">
                                    {formatMonto(gasto.monto)}
                                </span>
                            </div>
                        </div>

                        {/* Observaciones */}
                        {gasto.observaciones && (
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                                    Observaciones
                                </h3>
                                <p className="text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                                    {gasto.observaciones}
                                </p>
                            </div>
                        )}

                        {/* Fecha de modificación */}
                        {gasto.fecha_modificacion && gasto.fecha_modificacion !== gasto.fecha && (
                            <div className="text-xs text-muted-foreground">
                                Última modificación: {formatFecha(gasto.fecha_modificacion)}
                            </div>
                        )}

                        {/* Botón cerrar */}
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                            className="w-full"
                        >
                            Cerrar
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        No se encontró el gasto
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

