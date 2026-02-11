import { Edit, Trash2, ArrowDown, ArrowUp, ArrowLeftRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

export function CuentasTable({
    cuentas,
    onEditar,
    onEliminar,
    onIngreso,
    onEgreso,
    onTransferencia,
    onHistorial
}) {
    // Formatear moneda
    const formatMonto = (monto) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(monto);
    };

    if (cuentas.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No hay cuentas registradas</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Crea tu primera cuenta para comenzar
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
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead className="text-right">Saldo</TableHead>
                                <TableHead className="text-center w-[200px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cuentas.map((cuenta) => (
                                <TableRow 
                                    key={cuenta.id}
                                    className={!cuenta.activa ? 'bg-slate-100 opacity-60' : ''}
                                >
                                    <TableCell className="font-mono font-semibold">
                                        {cuenta.id}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{cuenta.nombre}</p>
                                            {cuenta.descripcion && (
                                                <p className="text-xs text-muted-foreground">
                                                    {cuenta.descripcion}
                                                </p>
                                            )}
                                            {!cuenta.activa && (
                                                <Badge variant="secondary" className="mt-1">
                                                    Inactiva
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={`font-bold text-lg ${
                                            parseFloat(cuenta.saldo) >= 0 
                                                ? 'text-emerald-700' 
                                                : 'text-red-700'
                                        }`}>
                                            {formatMonto(cuenta.saldo)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onIngreso(cuenta)}
                                                title="Registrar ingreso"
                                                className="h-8 w-8 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                                            >
                                                <ArrowDown className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEgreso(cuenta)}
                                                title="Registrar egreso"
                                                className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                                            >
                                                <ArrowUp className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onTransferencia(cuenta)}
                                                title="Transferir"
                                                className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                            >
                                                <ArrowLeftRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onHistorial(cuenta)}
                                                title="Ver historial"
                                                className="h-8 w-8 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                                            >
                                                <Clock className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEditar(cuenta)}
                                                title="Editar cuenta"
                                                className="h-8 w-8 text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEliminar(cuenta)}
                                                title="Eliminar cuenta"
                                                className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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

