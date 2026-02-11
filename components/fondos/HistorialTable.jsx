import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export function HistorialTable({ historial, loading, meta }) {
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

    // Badge de tipo
    const getTipoBadge = (tipo) => {
        if (tipo === 'INGRESO') {
            return (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                    Ingreso
                </Badge>
            );
        }
        return (
            <Badge variant="destructive">
                Egreso
            </Badge>
        );
    };

    // Badge de origen
    const getOrigenBadge = (origenTipo) => {
        const colores = {
            'VENTA': 'bg-blue-100 text-blue-800',
            'GASTO': 'bg-red-100 text-red-800',
            'MOVIMIENTO': 'bg-purple-100 text-purple-800'
        };
        
        return (
            <Badge className={colores[origenTipo] || 'bg-slate-100 text-slate-800'}>
                {origenTipo}
            </Badge>
        );
    };

    if (loading && historial.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Cargando historial...</p>
                </CardContent>
            </Card>
        );
    }

    if (historial.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No hay movimientos registrados</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Los movimientos aparecerán aquí cuando se registren ventas, gastos o movimientos manuales
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
                                <TableHead>Fecha</TableHead>
                                <TableHead>Origen</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead className="text-right">Saldo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {historial.map((movimiento, index) => (
                                <TableRow key={`${movimiento.origen_tipo}-${movimiento.registro_id}-${index}`}>
                                    <TableCell className="text-sm">
                                        {formatFecha(movimiento.fecha)}
                                    </TableCell>
                                    <TableCell>
                                        {getOrigenBadge(movimiento.origen_tipo)}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{movimiento.descripcion}</p>
                                            {movimiento.observaciones && (
                                                <p className="text-xs text-muted-foreground">
                                                    {movimiento.observaciones}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getTipoBadge(movimiento.tipo)}
                                    </TableCell>
                                    <TableCell className={`text-right font-semibold ${
                                        movimiento.tipo === 'INGRESO' 
                                            ? 'text-emerald-700' 
                                            : 'text-red-700'
                                    }`}>
                                        {movimiento.tipo === 'INGRESO' ? '+' : '-'}
                                        {formatMonto(movimiento.monto)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {movimiento.saldo_nuevo !== null ? (
                                            <span className="font-semibold">
                                                {formatMonto(movimiento.saldo_nuevo)}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
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

