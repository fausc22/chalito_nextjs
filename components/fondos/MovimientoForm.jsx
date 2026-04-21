import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FieldError } from '@/components/ui/field-error';

export function MovimientoForm({
    isOpen,
    onClose,
    cuenta = null,
    tipo = 'INGRESO',
    cuentas = [],
    onSave,
    isMutating
}) {
    const [formulario, setFormulario] = useState({
        cuenta_id: cuenta?.id || '',
        tipo: tipo,
        monto: '',
        observaciones: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (cuenta) {
            setFormulario(prev => ({
                ...prev,
                cuenta_id: cuenta.id
            }));
        }
        setErrors({});
    }, [cuenta, isOpen]);

    const handleChange = (field, value) => {
        setFormulario(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const nextErrors = {};

        if (!formulario.cuenta_id) {
            nextErrors.cuenta_id = 'Debes seleccionar una cuenta';
        }

        if (!formulario.monto || parseFloat(formulario.monto) <= 0) {
            nextErrors.monto = 'El monto debe ser mayor a 0';
        } else if (tipo === 'EGRESO' && parseFloat(formulario.monto) > saldoActual) {
            nextErrors.monto = 'El monto excede el saldo disponible';
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).some((key) => nextErrors[key])) {
            return;
        }

        const datos = {
            cuenta_id: parseInt(formulario.cuenta_id),
            tipo: formulario.tipo,
            monto: parseFloat(formulario.monto),
            observaciones: formulario.observaciones || null
        };
        
        onSave(datos);
    };

    const cuentaSeleccionada = cuentas.find(c => c.id.toString() === formulario.cuenta_id?.toString());
    const saldoActual = cuentaSeleccionada ? parseFloat(cuentaSeleccionada.saldo) : 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {tipo === 'INGRESO' ? '💰 Registrar Ingreso' : '💸 Registrar Egreso'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Cuenta */}
                    <div>
                        <Label htmlFor="cuenta_id" className="text-sm font-medium">
                            Cuenta <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formulario.cuenta_id?.toString() || ''}
                            onValueChange={(value) => handleChange('cuenta_id', value)}
                        >
                            <SelectTrigger className="mt-1" error={Boolean(errors.cuenta_id)} aria-invalid={Boolean(errors.cuenta_id)}>
                                <SelectValue placeholder="Seleccionar cuenta" />
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
                            <p className="text-xs text-muted-foreground mt-1">
                                Saldo actual: <span className={`font-semibold ${
                                    saldoActual >= 0 ? 'text-emerald-700' : 'text-red-700'
                                }`}>
                                    ${saldoActual.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </span>
                            </p>
                        )}
                        <FieldError error={errors.cuenta_id} />
                    </div>

                    {/* Monto */}
                    <div>
                        <Label htmlFor="monto" className="text-sm font-medium">
                            Monto <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="monto"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={formulario.monto}
                            onChange={(e) => handleChange('monto', e.target.value)}
                            placeholder="0.00"
                            className="mt-1"
                            error={Boolean(errors.monto)}
                            aria-invalid={Boolean(errors.monto)}
                        />
                        <FieldError error={errors.monto} />
                    </div>

                    {/* Observaciones */}
                    <div>
                        <Label htmlFor="observaciones" className="text-sm font-medium">
                            Observaciones
                        </Label>
                        <Textarea
                            id="observaciones"
                            value={formulario.observaciones}
                            onChange={(e) => handleChange('observaciones', e.target.value)}
                            placeholder="Descripción opcional del movimiento"
                            className="mt-1"
                            maxLength={255}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isMutating}>
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={
                                isMutating || 
                                !formulario.cuenta_id || 
                                !formulario.monto || 
                                parseFloat(formulario.monto) <= 0 ||
                                (tipo === 'EGRESO' && parseFloat(formulario.monto) > saldoActual)
                            }
                            className={tipo === 'INGRESO' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
                        >
                            {isMutating ? 'Registrando...' : 'Registrar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

