import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const FORMAS_PAGO = [
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'DEBITO', label: 'Débito' },
    { value: 'CREDITO', label: 'Crédito' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' },
    { value: 'MERCADOPAGO', label: 'MercadoPago' },
];

export function GastosForm({
    isOpen,
    onClose,
    formulario,
    setFormulario,
    categorias,
    cuentas,
    onSubmit,
    isEditing,
    loading
}) {
    const handleChange = (field, value) => {
        setFormulario(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    // Encontrar la cuenta seleccionada para mostrar el saldo
    const cuentaSeleccionada = cuentas.find(c => c.id.toString() === formulario.cuenta_id?.toString());

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        💸 {isEditing ? 'Editar Gasto' : 'Nuevo Gasto'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Categoría */}
                    <div>
                        <Label htmlFor="categoria_id" className="text-sm font-medium">
                            Categoría <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formulario.categoria_id?.toString() || ''}
                            onValueChange={(value) => handleChange('categoria_id', value)}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {categorias.filter(c => c.activa).map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                        {cat.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Descripción */}
                    <div>
                        <Label htmlFor="descripcion" className="text-sm font-medium">
                            Descripción <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="descripcion"
                            value={formulario.descripcion || ''}
                            onChange={(e) => handleChange('descripcion', e.target.value)}
                            placeholder="Ej: Compra de harina para producción"
                            className="mt-1"
                            maxLength={255}
                        />
                    </div>

                    {/* Monto */}
                    <div>
                        <Label htmlFor="monto" className="text-sm font-medium">
                            Monto <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                                $
                            </span>
                            <Input
                                id="monto"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={formulario.monto || ''}
                                onChange={(e) => handleChange('monto', e.target.value)}
                                placeholder="0.00"
                                className="pl-8"
                            />
                        </div>
                    </div>

                    {/* Forma de Pago */}
                    <div>
                        <Label htmlFor="forma_pago" className="text-sm font-medium">
                            Forma de Pago
                        </Label>
                        <Select
                            value={formulario.forma_pago || 'EFECTIVO'}
                            onValueChange={(value) => handleChange('forma_pago', value)}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Seleccionar forma de pago" />
                            </SelectTrigger>
                            <SelectContent>
                                {FORMAS_PAGO.map((fp) => (
                                    <SelectItem key={fp.value} value={fp.value}>
                                        {fp.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Cuenta de Fondos */}
                    <div>
                        <Label htmlFor="cuenta_id" className="text-sm font-medium">
                            Cuenta de Fondos <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formulario.cuenta_id?.toString() || ''}
                            onValueChange={(value) => handleChange('cuenta_id', value)}
                            required
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Seleccionar cuenta de fondos" />
                            </SelectTrigger>
                            <SelectContent>
                                {cuentas.filter(c => c.activa).map((cuenta) => (
                                    <SelectItem key={cuenta.id} value={cuenta.id.toString()}>
                                        {cuenta.nombre} - Saldo: ${parseFloat(cuenta.saldo).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {cuentaSeleccionada && (
                            <p className="text-xs text-slate-500 mt-1">
                                Saldo actual: <span className={`font-semibold ${
                                    parseFloat(cuentaSeleccionada.saldo) >= 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}>
                                    ${parseFloat(cuentaSeleccionada.saldo).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </span>
                                {formulario.monto && parseFloat(formulario.monto) > parseFloat(cuentaSeleccionada.saldo) && (
                                    <span className="text-amber-600 ml-2">
                                        (Quedará en negativo)
                                    </span>
                                )}
                            </p>
                        )}
                        {!formulario.cuenta_id && (
                            <p className="text-xs text-red-600 mt-1">
                                La cuenta de fondos es obligatoria
                            </p>
                        )}
                    </div>

                    {/* Observaciones */}
                    <div>
                        <Label htmlFor="observaciones" className="text-sm font-medium">
                            Observaciones
                        </Label>
                        <Textarea
                            id="observaciones"
                            value={formulario.observaciones || ''}
                            onChange={(e) => handleChange('observaciones', e.target.value)}
                            placeholder="Notas adicionales (opcional)"
                            className="mt-1"
                            rows={2}
                            maxLength={255}
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-red-600 hover:bg-red-700"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Registrar Gasto')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

