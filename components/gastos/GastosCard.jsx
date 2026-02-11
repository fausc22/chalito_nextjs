import { Edit, Trash2, Eye, Calendar, CreditCard, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const FORMAS_PAGO_LABELS = {
    'EFECTIVO': { label: 'Efectivo', color: 'bg-green-100 text-green-800' },
    'DEBITO': { label: 'Débito', color: 'bg-blue-100 text-blue-800' },
    'CREDITO': { label: 'Crédito', color: 'bg-purple-100 text-purple-800' },
    'TRANSFERENCIA': { label: 'Transferencia', color: 'bg-orange-100 text-orange-800' },
    'MERCADOPAGO': { label: 'MercadoPago', color: 'bg-cyan-100 text-cyan-800' },
};

export function GastosCard({ gasto, onVer, onEditar, onEliminar }) {
    const formatFecha = (fechaStr) => {
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatMonto = (monto) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(monto);
    };

    const formaPago = FORMAS_PAGO_LABELS[gasto.forma_pago] || { label: gasto.forma_pago, color: 'bg-gray-100 text-gray-800' };

    return (
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            {gasto.categoria_nombre}
                        </Badge>
                        <Badge className={formaPago.color}>
                            {formaPago.label}
                        </Badge>
                    </div>
                    <span className="text-xl font-bold text-red-600">
                        {formatMonto(gasto.monto)}
                    </span>
                </div>

                {/* Descripción */}
                <p className="text-slate-700 font-medium mb-3 line-clamp-2">
                    {gasto.descripcion}
                </p>

                {/* Detalles */}
                <div className="space-y-1 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatFecha(gasto.fecha)}</span>
                    </div>
                    {gasto.cuenta_nombre && (
                        <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{gasto.cuenta_nombre}</span>
                        </div>
                    )}
                    {gasto.observaciones && (
                        <p className="text-xs text-slate-400 mt-2 italic">
                            {gasto.observaciones}
                        </p>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-3 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onVer && onVer(gasto)}
                        className="flex-1 gap-2"
                    >
                        <Eye className="h-4 w-4" />
                        Ver
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditar(gasto)}
                        className="flex-1 gap-2"
                    >
                        <Edit className="h-4 w-4" />
                        Editar
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEliminar(gasto)}
                        className="flex-1 gap-2 text-red-500 hover:text-red-700 hover:border-red-300"
                    >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

