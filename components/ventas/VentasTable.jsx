import { Eye, Ban, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function VentasTable({ ventas, onVerDetalle, onAnular }) {
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

    // Badge de estado
    const getEstadoBadge = (estado) => {
        if (estado === 'FACTURADA') {
            return (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Facturada
                </Badge>
            );
        }
        return (
            <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Anulada
            </Badge>
        );
    };

    if (ventas.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No se encontraron ventas</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Prueba ajustando los filtros de búsqueda
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-0">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="w-[80px]"># Venta</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Medio Pago</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-center w-[120px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ventas.map((venta) => (
                                <TableRow 
                                    key={venta.id}
                                    className={venta.estado === 'ANULADA' ? 'bg-red-50/50' : ''}
                                >
                                    <TableCell className="font-mono font-semibold text-emerald-700">
                                        #{venta.id}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {formatFecha(venta.fecha)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[200px]">
                                            <p className="font-medium truncate">
                                                {venta.cliente_nombre || 'Consumidor Final'}
                                            </p>
                                            {venta.cliente_telefono && (
                                                <p className="text-xs text-muted-foreground">
                                                    {venta.cliente_telefono}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className={`text-right font-bold ${
                                        venta.estado === 'ANULADA' 
                                            ? 'text-red-500 line-through' 
                                            : 'text-emerald-700'
                                    }`}>
                                        {formatMonto(venta.total)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-normal">
                                            {venta.medio_pago}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {getEstadoBadge(venta.estado)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onVerDetalle(venta)}
                                                title="Ver detalle"
                                                className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {venta.estado === 'FACTURADA' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onAnular(venta)}
                                                    title="Anular venta"
                                                    className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

