import { 
    X, User, Phone, Mail, MapPin, Calendar, CreditCard, 
    FileText, CheckCircle, XCircle, Package, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export function VentaDetalleDrawer({ 
    isOpen, 
    onClose, 
    ventaDetalle, 
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

    const venta = ventaDetalle?.venta;
    const articulos = ventaDetalle?.articulos || [];
    const isAnulada = venta?.estado === 'ANULADA';

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-emerald-600" />
                            Detalle de Venta
                        </SheetTitle>
                    </div>
                </SheetHeader>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    </div>
                ) : venta ? (
                    <div className="mt-6 space-y-6">
                        {/* Header con número y estado */}
                        <div className={`p-4 rounded-lg ${isAnulada ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Número de Venta</p>
                                    <p className="text-2xl font-bold font-mono text-emerald-700">#{venta.id}</p>
                                </div>
                                {isAnulada ? (
                                    <Badge variant="destructive" className="gap-1 text-sm py-1 px-3">
                                        <XCircle className="h-4 w-4" />
                                        ANULADA
                                    </Badge>
                                ) : (
                                    <Badge className="bg-emerald-600 hover:bg-emerald-600 gap-1 text-sm py-1 px-3">
                                        <CheckCircle className="h-4 w-4" />
                                        FACTURADA
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {formatFecha(venta.fecha)}
                            </div>
                        </div>

                        {/* Datos del cliente */}
                        <div>
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                                Datos del Cliente
                            </h3>
                            <div className="space-y-2 bg-slate-50 p-4 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium">
                                        {venta.cliente_nombre || 'Consumidor Final'}
                                    </span>
                                </div>
                                {venta.cliente_telefono && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span>{venta.cliente_telefono}</span>
                                    </div>
                                )}
                                {venta.cliente_email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <span>{venta.cliente_email}</span>
                                    </div>
                                )}
                                {venta.cliente_direccion && (
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <span>{venta.cliente_direccion}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Datos de pago */}
                        <div>
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                                Información de Pago
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Medio de Pago</p>
                                        <p className="font-medium">{venta.medio_pago}</p>
                                    </div>
                                </div>
                                {venta.tipo_factura && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Tipo Factura</p>
                                        <p className="font-medium">Tipo {venta.tipo_factura}</p>
                                    </div>
                                )}
                                {venta.cuenta_nombre && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-muted-foreground">Cuenta</p>
                                        <p className="font-medium">{venta.cuenta_nombre}</p>
                                    </div>
                                )}
                                {venta.usuario_nombre && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-muted-foreground">Atendido por</p>
                                        <p className="font-medium">{venta.usuario_nombre}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Detalle de artículos */}
                        <div>
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Artículos ({articulos.length})
                            </h3>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead>Artículo</TableHead>
                                            <TableHead className="text-center w-[60px]">Cant.</TableHead>
                                            <TableHead className="text-right w-[100px]">Precio</TableHead>
                                            <TableHead className="text-right w-[100px]">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {articulos.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {item.articulo_nombre}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {item.cantidad}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {formatMonto(item.precio)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatMonto(item.subtotal)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Totales */}
                        <div className={`p-4 rounded-lg ${isAnulada ? 'bg-red-50' : 'bg-emerald-50'}`}>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatMonto(venta.subtotal)}</span>
                                </div>
                                {venta.descuento > 0 && (
                                    <div className="flex justify-between text-sm text-red-600">
                                        <span>Descuento</span>
                                        <span>-{formatMonto(venta.descuento)}</span>
                                    </div>
                                )}
                                {venta.iva_total > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">IVA</span>
                                        <span>{formatMonto(venta.iva_total)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className={isAnulada ? 'text-red-600 line-through' : 'text-emerald-700'}>
                                        {formatMonto(venta.total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Observaciones */}
                        {venta.observaciones && (
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                                    Observaciones
                                </h3>
                                <p className="text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                                    {venta.observaciones}
                                </p>
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
                        No se encontró la venta
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

