import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { HistorialTable } from './HistorialTable';

export function HistorialTab({
    cuentas,
    historial,
    loadingHistorial,
    errorHistorial,
    metaHistorial,
    onCargarHistorial
}) {
    const [cuentaSeleccionada, setCuentaSeleccionada] = useState('');
    const [filtros, setFiltros] = useState({
        fecha_desde: '',
        fecha_hasta: ''
    });

    useEffect(() => {
        if (cuentas.length > 0 && !cuentaSeleccionada) {
            setCuentaSeleccionada(cuentas[0].id.toString());
        }
    }, [cuentas, cuentaSeleccionada]);

    useEffect(() => {
        if (cuentaSeleccionada) {
            onCargarHistorial(parseInt(cuentaSeleccionada), filtros);
        }
    }, [cuentaSeleccionada, filtros, onCargarHistorial]);

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    };

    // Error state
    if (errorHistorial) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error al cargar historial</AlertTitle>
                <AlertDescription>{errorHistorial}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Historial de Movimientos
                </h2>
                <p className="text-muted-foreground mt-1">
                    Consulta el historial unificado de ventas, gastos y movimientos
                </p>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Cuenta */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Cuenta
                            </label>
                            <Select
                                value={cuentaSeleccionada}
                                onValueChange={setCuentaSeleccionada}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar cuenta" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cuentas.filter(c => c.activa).map((cuenta) => (
                                        <SelectItem key={cuenta.id} value={cuenta.id.toString()}>
                                            {cuenta.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fecha desde */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Fecha desde
                            </label>
                            <input
                                type="date"
                                value={filtros.fecha_desde}
                                onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                            />
                        </div>

                        {/* Fecha hasta */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Fecha hasta
                            </label>
                            <input
                                type="date"
                                value={filtros.fecha_hasta}
                                onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla de historial */}
            {cuentaSeleccionada ? (
                <HistorialTable
                    historial={historial}
                    loading={loadingHistorial}
                    meta={metaHistorial}
                />
            ) : (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">
                            Selecciona una cuenta para ver su historial
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

