import { useState } from 'react';
import { Plus, AlertTriangle, Tag, Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

export function CategoriasGastosTab({
    categorias,
    loadingCategorias,
    errorCategorias,
    onCrearCategoria,
    onEditarCategoria,
    onEliminarCategoria
}) {
    // Estados locales
    const [modalAgregar, setModalAgregar] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalEliminar, setModalEliminar] = useState(false);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

    // Estado del formulario
    const [formulario, setFormulario] = useState({
        nombre: '',
        descripcion: ''
    });

    // Limpiar formulario
    const limpiarFormulario = () => {
        setFormulario({ nombre: '', descripcion: '' });
    };

    // Handlers
    const handleCrearCategoria = async () => {
        if (!formulario.nombre?.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "El nombre es obligatorio"
            });
            return;
        }

        const resultado = await onCrearCategoria(formulario);

        if (resultado.success) {
            setModalAgregar(false);
            limpiarFormulario();
            toast({
                title: "Categoría creada",
                description: resultado.message || "La categoría se creó correctamente"
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: resultado.error
            });
        }
    };

    const handleActualizarCategoria = async () => {
        if (!formulario.nombre?.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "El nombre es obligatorio"
            });
            return;
        }

        const resultado = await onEditarCategoria(categoriaSeleccionada.id, formulario);

        if (resultado.success) {
            setModalEditar(false);
            setCategoriaSeleccionada(null);
            limpiarFormulario();
            toast({
                title: "Categoría actualizada",
                description: resultado.message || "La categoría se actualizó correctamente"
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: resultado.error
            });
        }
    };

    const handleEliminarCategoria = async () => {
        const resultado = await onEliminarCategoria(categoriaSeleccionada.id);

        if (resultado.success) {
            setModalEliminar(false);
            setCategoriaSeleccionada(null);
            toast({
                title: resultado.data?.desactivada ? "Categoría desactivada" : "Categoría eliminada",
                description: resultado.message
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: resultado.error
            });
        }
    };

    const handleToggleActiva = async (categoria) => {
        const resultado = await onEditarCategoria(categoria.id, { activa: !categoria.activa });

        if (resultado.success) {
            toast({
                title: categoria.activa ? "Categoría desactivada" : "Categoría activada",
                description: `La categoría "${categoria.nombre}" fue ${categoria.activa ? 'desactivada' : 'activada'}`
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: resultado.error
            });
        }
    };

    const handleEditar = (categoria) => {
        setCategoriaSeleccionada(categoria);
        setFormulario({
            nombre: categoria.nombre || '',
            descripcion: categoria.descripcion || ''
        });
        setModalEditar(true);
    };

    const handleEliminar = (categoria) => {
        setCategoriaSeleccionada(categoria);
        setModalEliminar(true);
    };

    const handleCloseModal = () => {
        setModalAgregar(false);
        setModalEditar(false);
        setModalEliminar(false);
        setCategoriaSeleccionada(null);
        limpiarFormulario();
    };

    const formatMonto = (monto) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(monto || 0);
    };

    // Error state
    if (errorCategorias) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error al cargar categorías</AlertTitle>
                <AlertDescription>{errorCategorias}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4">
                <div className="text-center sm:text-left w-full sm:w-auto">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center justify-center sm:justify-start gap-2">
                        <Tag className="h-6 w-6 text-amber-500" />
                        Categorías de Gastos
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Organiza los gastos por tipo o concepto
                    </p>
                </div>

                <Button 
                    onClick={() => setModalAgregar(true)} 
                    className="gap-2 w-[200px] sm:w-auto bg-amber-600 hover:bg-amber-700"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Categoría
                </Button>
            </div>

            {/* Tabla Desktop */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                            <TableHead className="text-right">Total Gastos</TableHead>
                            <TableHead className="text-right">Monto Total</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categorias.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No hay categorías registradas
                                </TableCell>
                            </TableRow>
                        ) : (
                            categorias.map((categoria) => (
                                <TableRow key={categoria.id} className={!categoria.activa ? 'opacity-50' : ''}>
                                    <TableCell className="font-medium">
                                        {categoria.nombre}
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {categoria.descripcion || '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge 
                                            variant={categoria.activa ? "default" : "secondary"}
                                            className={categoria.activa ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}
                                        >
                                            {categoria.activa ? 'Activa' : 'Inactiva'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {categoria.total_gastos || 0}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-red-600">
                                        {formatMonto(categoria.monto_total)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleActiva(categoria)}
                                                className="h-8 w-8 p-0"
                                                title={categoria.activa ? 'Desactivar' : 'Activar'}
                                            >
                                                {categoria.activa ? (
                                                    <X className="h-4 w-4 text-slate-500" />
                                                ) : (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditar(categoria)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEliminar(categoria)}
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Vista Mobile - Cards */}
            <div className="md:hidden space-y-4">
                {categorias.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <p className="text-muted-foreground">No hay categorías registradas</p>
                        </CardContent>
                    </Card>
                ) : (
                    categorias.map((categoria) => (
                        <Card 
                            key={categoria.id} 
                            className={`border-l-4 border-l-amber-500 ${!categoria.activa ? 'opacity-50' : ''}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{categoria.nombre}</h3>
                                        <p className="text-sm text-slate-500">{categoria.descripcion || 'Sin descripción'}</p>
                                    </div>
                                    <Badge 
                                        variant={categoria.activa ? "default" : "secondary"}
                                        className={categoria.activa ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}
                                    >
                                        {categoria.activa ? 'Activa' : 'Inactiva'}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center text-sm text-slate-600 mb-4">
                                    <span>{categoria.total_gastos || 0} gastos</span>
                                    <span className="font-semibold text-red-600">{formatMonto(categoria.monto_total)}</span>
                                </div>

                                <div className="flex gap-2 pt-3 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggleActiva(categoria)}
                                        className="flex-1 gap-2"
                                    >
                                        {categoria.activa ? (
                                            <><X className="h-4 w-4" /> Desactivar</>
                                        ) : (
                                            <><Check className="h-4 w-4" /> Activar</>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditar(categoria)}
                                        className="flex-1 gap-2"
                                    >
                                        <Edit className="h-4 w-4" /> Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEliminar(categoria)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Modal Agregar/Editar */}
            <Dialog open={modalAgregar || modalEditar} onOpenChange={handleCloseModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-amber-500" />
                            {modalEditar ? 'Editar Categoría' : 'Nueva Categoría'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="nombre">
                                Nombre <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="nombre"
                                value={formulario.nombre}
                                onChange={(e) => setFormulario(prev => ({ ...prev, nombre: e.target.value }))}
                                placeholder="Ej: Insumos, Servicios, Personal..."
                                className="mt-1"
                                maxLength={100}
                            />
                        </div>

                        <div>
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Input
                                id="descripcion"
                                value={formulario.descripcion}
                                onChange={(e) => setFormulario(prev => ({ ...prev, descripcion: e.target.value }))}
                                placeholder="Descripción opcional"
                                className="mt-1"
                                maxLength={255}
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseModal}
                                className="flex-1"
                                disabled={loadingCategorias}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={modalEditar ? handleActualizarCategoria : handleCrearCategoria}
                                className="flex-1 bg-amber-600 hover:bg-amber-700"
                                disabled={loadingCategorias}
                            >
                                {loadingCategorias ? 'Guardando...' : (modalEditar ? 'Actualizar' : 'Crear')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* AlertDialog Eliminar */}
            <AlertDialog open={modalEliminar} onOpenChange={setModalEliminar}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Eliminar Categoría
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p>
                                    ¿Estás seguro de que quieres eliminar esta categoría?
                                </p>
                                {categoriaSeleccionada && (
                                    <div className="bg-muted rounded-lg p-4 border">
                                        <p className="font-semibold">{categoriaSeleccionada.nombre}</p>
                                        {categoriaSeleccionada.total_gastos > 0 && (
                                            <p className="text-sm text-amber-600 mt-1">
                                                ⚠️ Esta categoría tiene {categoriaSeleccionada.total_gastos} gastos asociados. 
                                                Será desactivada en lugar de eliminarse.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loadingCategorias}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleEliminarCategoria}
                            disabled={loadingCategorias}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {loadingCategorias ? 'Procesando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

