import { Search, Filter, X, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export function VentasFilters({
    filtros,
    mediosPago = [],
    onFiltroChange,
    onLimpiarFiltros,
    onBuscar
}) {
    const estados = [
        { value: 'FACTURADA', label: 'Facturada' },
        { value: 'ANULADA', label: 'Anulada' }
    ];

    // Generar opciones de meses
    const meses = [
        { value: '1', label: 'Enero' },
        { value: '2', label: 'Febrero' },
        { value: '3', label: 'Marzo' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Mayo' },
        { value: '6', label: 'Junio' },
        { value: '7', label: 'Julio' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' }
    ];

    // Generar opciones de años (últimos 5 años + próximos 2 años)
    const currentYear = new Date().getFullYear();
    const años = Array.from({ length: 8 }, (_, i) => {
        const year = currentYear - 3 + i;
        return { value: String(year), label: String(year) };
    });

    const hayFiltrosActivos = Object.values(filtros).some(v => v && v !== '' && v !== 'all');

    return (
        <Card className="border-slate-200">
            <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                    {/* Filtros maestros - Mes y Año */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-4 border-b border-slate-200">
                        {/* Mes */}
                        <Select
                            value={filtros.month === 'all' ? 'all' : String(filtros.month || '')}
                            onValueChange={(value) => onFiltroChange('month', value === 'all' ? 'all' : parseInt(value))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Mes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los meses</SelectItem>
                                {meses.map((mes) => (
                                    <SelectItem key={mes.value} value={mes.value}>
                                        {mes.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Año */}
                        <Select
                            value={String(filtros.year || '')}
                            onValueChange={(value) => onFiltroChange('year', parseInt(value))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Año" />
                            </SelectTrigger>
                            <SelectContent>
                                {años.map((año) => (
                                    <SelectItem key={año.value} value={año.value}>
                                        {año.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Primera fila - Búsqueda y fechas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Búsqueda */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por cliente o # venta..."
                                value={filtros.busqueda || ''}
                                onChange={(e) => onFiltroChange('busqueda', e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Fecha desde */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                placeholder="Fecha desde"
                                value={filtros.fecha_desde || ''}
                                onChange={(e) => onFiltroChange('fecha_desde', e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Fecha hasta */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                placeholder="Fecha hasta"
                                value={filtros.fecha_hasta || ''}
                                onChange={(e) => onFiltroChange('fecha_hasta', e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Estado */}
                        <Select
                            value={filtros.estado || 'all'}
                            onValueChange={(value) => onFiltroChange('estado', value === 'all' ? '' : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                {estados.map((estado) => (
                                    <SelectItem key={estado.value} value={estado.value}>
                                        {estado.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Segunda fila - Medio de pago y acciones */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            {/* Medio de pago */}
                            <Select
                                value={filtros.medio_pago || 'all'}
                                onValueChange={(value) => onFiltroChange('medio_pago', value === 'all' ? '' : value)}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Medio de pago" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los medios</SelectItem>
                                    {mediosPago.map((medio) => (
                                        <SelectItem key={medio} value={medio}>
                                            {medio}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                variant="default"
                                onClick={onBuscar}
                                className="gap-2 flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Filter className="h-4 w-4" />
                                Filtrar
                            </Button>

                            {hayFiltrosActivos && (
                                <Button
                                    variant="outline"
                                    onClick={onLimpiarFiltros}
                                    className="gap-2 flex-1 sm:flex-initial"
                                >
                                    <X className="h-4 w-4" />
                                    Limpiar
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

