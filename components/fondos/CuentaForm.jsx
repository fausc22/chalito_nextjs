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

export function CuentaForm({
    isOpen,
    onClose,
    cuenta = null,
    onSave,
    isMutating
}) {
    const [formulario, setFormulario] = useState({
        nombre: '',
        descripcion: '',
        saldo_inicial: 0
    });

    useEffect(() => {
        if (cuenta) {
            setFormulario({
                nombre: cuenta.nombre || '',
                descripcion: cuenta.descripcion || '',
                saldo_inicial: 0 // No se puede cambiar el saldo inicial al editar
            });
        } else {
            setFormulario({
                nombre: '',
                descripcion: '',
                saldo_inicial: 0
            });
        }
    }, [cuenta, isOpen]);

    const handleChange = (field, value) => {
        setFormulario(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formulario.nombre.trim()) {
            return;
        }

        const datos = cuenta 
            ? { nombre: formulario.nombre, descripcion: formulario.descripcion }
            : { 
                nombre: formulario.nombre, 
                descripcion: formulario.descripcion,
                saldo_inicial: parseFloat(formulario.saldo_inicial) || 0
            };
        
        onSave(datos);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        💰 {cuenta ? 'Editar Cuenta' : 'Nueva Cuenta'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Nombre */}
                    <div>
                        <Label htmlFor="nombre" className="text-sm font-medium">
                            Nombre <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nombre"
                            value={formulario.nombre}
                            onChange={(e) => handleChange('nombre', e.target.value)}
                            placeholder="Ej: Caja Principal, Banco Nación, etc."
                            className="mt-1"
                            maxLength={100}
                            required
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <Label htmlFor="descripcion" className="text-sm font-medium">
                            Descripción
                        </Label>
                        <Textarea
                            id="descripcion"
                            value={formulario.descripcion}
                            onChange={(e) => handleChange('descripcion', e.target.value)}
                            placeholder="Descripción opcional de la cuenta"
                            className="mt-1"
                            maxLength={255}
                            rows={3}
                        />
                    </div>

                    {/* Saldo inicial (solo al crear) */}
                    {!cuenta && (
                        <div>
                            <Label htmlFor="saldo_inicial" className="text-sm font-medium">
                                Saldo Inicial
                            </Label>
                            <Input
                                id="saldo_inicial"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formulario.saldo_inicial}
                                onChange={(e) => handleChange('saldo_inicial', e.target.value)}
                                placeholder="0.00"
                                className="mt-1"
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isMutating}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isMutating || !formulario.nombre.trim()}>
                            {isMutating ? 'Guardando...' : (cuenta ? 'Actualizar' : 'Crear')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

