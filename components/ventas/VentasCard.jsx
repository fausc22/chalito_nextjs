import { Eye, Ban, CheckCircle, XCircle, User, Phone, CreditCard, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function VentasCard({ venta, onVerDetalle, onAnular }) {
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
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isAnulada = venta.estado === 'ANULADA';

    return (
        <Card className={`transition-all ${isAnulada ? 'bg-red-50/50 border-red-200' : 'hover:shadow-md'}`}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-lg text-emerald-700">
                                #{venta.id}
                            </span>
                            {isAnulada ? (
                                <Badge variant="destructive" className="gap-1">
                                    <XCircle className="h-3 w-3" />
                                    Anulada
                                </Badge>
                            ) : (
                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Facturada
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            {formatFecha(venta.fecha)}
                        </div>
                    </div>
                    <p className={`text-xl font-bold ${
                        isAnulada 
                            ? 'text-red-500 line-through' 
                            : 'text-emerald-700'
                    }`}>
                        {formatMonto(venta.total)}
                    </p>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Cliente */}
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">
                        {venta.cliente_nombre || 'Consumidor Final'}
                    </span>
                </div>

                {venta.cliente_telefono && (
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-muted-foreground">
                            {venta.cliente_telefono}
                        </span>
                    </div>
                )}

                {/* Medio de pago */}
                <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <Badge variant="outline" className="font-normal">
                        {venta.medio_pago}
                    </Badge>
                </div>

                {/* Desglose */}
                {(venta.descuento > 0 || venta.iva_total > 0) && (
                    <div className="pt-2 border-t text-sm text-muted-foreground">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatMonto(venta.subtotal)}</span>
                        </div>
                        {venta.descuento > 0 && (
                            <div className="flex justify-between text-red-600">
                                <span>Descuento:</span>
                                <span>-{formatMonto(venta.descuento)}</span>
                            </div>
                        )}
                        {venta.iva_total > 0 && (
                            <div className="flex justify-between">
                                <span>IVA:</span>
                                <span>{formatMonto(venta.iva_total)}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-2 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVerDetalle(venta)}
                        className="flex-1 gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                        <Eye className="h-4 w-4" />
                        Ver Detalle
                    </Button>
                    {!isAnulada && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAnular(venta)}
                            className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                            <Ban className="h-4 w-4" />
                            Anular
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

