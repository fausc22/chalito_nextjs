import { useState, useMemo } from 'react';
import { Edit, Trash2, Eye, ChevronUp, ChevronDown } from 'lucide-react';
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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

const FORMAS_PAGO_LABELS = {
    'EFECTIVO': { label: 'Efectivo', color: 'bg-green-100 text-green-800' },
    'DEBITO': { label: 'Débito', color: 'bg-blue-100 text-blue-800' },
    'CREDITO': { label: 'Crédito', color: 'bg-purple-100 text-purple-800' },
    'TRANSFERENCIA': { label: 'Transferencia', color: 'bg-orange-100 text-orange-800' },
    'MERCADOPAGO': { label: 'MercadoPago', color: 'bg-cyan-100 text-cyan-800' },
};

export function GastosTable({ gastos, onEditar, onEliminar, onVer, scrollRef }) {
    const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Ordenar gastos
    const gastosOrdenados = useMemo(() => {
        const sorted = [...gastos].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            if (sortConfig.key === 'fecha') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            if (sortConfig.key === 'monto') {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [gastos, sortConfig]);

    // Paginación
    const totalPages = Math.ceil(gastosOrdenados.length / itemsPerPage);
    const currentGastos = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return gastosOrdenados.slice(start, start + itemsPerPage);
    }, [gastosOrdenados, currentPage]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        scrollRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

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

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'asc' 
            ? <ChevronUp className="h-4 w-4 inline ml-1" />
            : <ChevronDown className="h-4 w-4 inline ml-1" />;
    };

    if (gastos.length === 0) {
        return (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
                <p className="text-muted-foreground">No se encontraron gastos</p>
                <p className="text-sm text-muted-foreground mt-2">
                    Prueba ajustando los filtros o registra un nuevo gasto
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50">
                        <TableHead 
                            className="cursor-pointer hover:bg-slate-100"
                            onClick={() => handleSort('fecha')}
                        >
                            Fecha <SortIcon columnKey="fecha" />
                        </TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead 
                            className="cursor-pointer hover:bg-slate-100 text-right"
                            onClick={() => handleSort('monto')}
                        >
                            Monto <SortIcon columnKey="monto" />
                        </TableHead>
                        <TableHead>Forma Pago</TableHead>
                        <TableHead>Cuenta</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentGastos.map((gasto) => {
                        const formaPago = FORMAS_PAGO_LABELS[gasto.forma_pago] || { label: gasto.forma_pago, color: 'bg-gray-100 text-gray-800' };
                        
                        return (
                            <TableRow key={gasto.id} className="hover:bg-slate-50">
                                <TableCell className="font-medium">
                                    {formatFecha(gasto.fecha)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                        {gasto.categoria_nombre}
                                    </Badge>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate" title={gasto.descripcion}>
                                    {gasto.descripcion}
                                </TableCell>
                                <TableCell className="text-right font-bold text-red-600">
                                    {formatMonto(gasto.monto)}
                                </TableCell>
                                <TableCell>
                                    <Badge className={formaPago.color}>
                                        {formaPago.label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-600">
                                    {gasto.cuenta_nombre || '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onVer(gasto)}
                                            className="h-8 w-8 p-0"
                                            title="Ver detalle"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEditar(gasto)}
                                            className="h-8 w-8 p-0"
                                            title="Editar"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEliminar(gasto)}
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="border-t p-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                                />
                            </PaginationItem>

                            {[...Array(totalPages)].map((_, i) => (
                                <PaginationItem key={i + 1}>
                                    <PaginationLink
                                        onClick={() => handlePageChange(i + 1)}
                                        isActive={currentPage === i + 1}
                                        className="cursor-pointer"
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}

