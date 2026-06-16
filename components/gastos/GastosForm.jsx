import { useState, useMemo } from 'react';
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
import { FieldError } from '@/components/ui/field-error';

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
    onSubmit,
    isEditing,
    loading
}) {
    const [errors, setErrors] = useState({});

    const todayInput = useMemo(() => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }, []);

    const handleChange = (field, value) => {
        setFormulario(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const nextErrors = {};

        if (!formulario.categoria_id) nextErrors.categoria_id = 'La categoría es obligatoria';
        if (!formulario.fecha) nextErrors.fecha = 'La fecha del gasto es obligatoria';
        if (!formulario.descripcion?.trim()) nextErrors.descripcion = 'La descripción es obligatoria';
        if (!formulario.monto || parseFloat(formulario.monto) <= 0) nextErrors.monto = 'El monto debe ser mayor a 0';

        setErrors(nextErrors);

        if (Object.keys(nextErrors).some((key) => nextErrors[key])) {
            return;
        }

        onSubmit();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        💸 {isEditing ? 'Editar Gasto' : 'Nuevo Gasto'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Fecha del gasto */}
                    <div>
                        <Label htmlFor="fecha" className="text-sm font-medium">
                            Fecha del gasto <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="fecha"
                            type="date"
                            value={formulario.fecha || ''}
                            onChange={(e) => handleChange('fecha', e.target.value)}
                            max={todayInput}
                            className="mt-1"
                            error={Boolean(errors.fecha)}
                            aria-invalid={Boolean(errors.fecha)}
                        />
                        <FieldError error={errors.fecha} />
                    </div>

                    {/* Categoría */}
                    <div>
                        <Label htmlFor="categoria_id" className="text-sm font-medium">
                            Categoría <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formulario.categoria_id?.toString() || ''}
                            onValueChange={(value) => handleChange('categoria_id', value)}
                        >
                            <SelectTrigger className="mt-1" error={Boolean(errors.categoria_id)} aria-invalid={Boolean(errors.categoria_id)}>
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
                        <FieldError error={errors.categoria_id} />
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
                            error={Boolean(errors.descripcion)}
                            aria-invalid={Boolean(errors.descripcion)}
                        />
                        <FieldError error={errors.descripcion} />
                    </div>

                    {/* Monto */}
                    <div>
                        <Label htmlFor="monto" className="text-sm font-medium">
                            Monto <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
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
                                error={Boolean(errors.monto)}
                                aria-invalid={Boolean(errors.monto)}
                            />
                        </div>
                        <FieldError error={errors.monto} />
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
                        <p className="text-xs text-muted-foreground mt-1">
                            El gasto se descuenta del total operativo del negocio.
                        </p>
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
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
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
