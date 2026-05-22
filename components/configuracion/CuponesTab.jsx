import { useEffect } from 'react';
import { Plus, RefreshCw, Tag } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import { useCuponesConfig } from '@/hooks/configuracion/useCuponesConfig';
import { cuponesService } from '@/services/cuponesService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CuponesTab() {
  const notification = useNotification();
  const {
    loading,
    guardando,
    cupones,
    modalOpen,
    editando,
    form,
    setForm,
    cargarCupones,
    abrirNuevo,
    abrirEditar,
    cerrarModal,
    guardarCupon,
    toggleActivo,
  } = useCuponesConfig(notification);

  useEffect(() => {
    cargarCupones();
  }, [cargarCupones]);

  return (
    <Card className="border-border max-w-5xl">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Tag className="h-5 w-5 text-violet-700" />
            Cupones (tienda online)
          </CardTitle>
          <CardDescription>
            Descuentos por porcentaje o monto fijo. Solo aplican en pedidos web; no en mostrador.
          </CardDescription>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={cargarCupones} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button type="button" size="sm" onClick={abrirNuevo} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo cupón
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && cupones.length === 0 ? (
          <p className="text-sm text-muted-foreground">Cargando cupones...</p>
        ) : cupones.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay cupones creados.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Código</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 font-medium">Valor</th>
                  <th className="px-3 py-2 font-medium">Mínimo</th>
                  <th className="px-3 py-2 font-medium">Usos</th>
                  <th className="px-3 py-2 font-medium">Vigencia</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  <th className="px-3 py-2 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cupones.map((cupon) => (
                  <tr key={cupon.id} className="hover:bg-muted/80">
                    <td className="px-3 py-2 font-mono font-semibold">{cupon.codigo}</td>
                    <td className="px-3 py-2 capitalize">{cupon.tipo?.replace('_', ' ')}</td>
                    <td className="px-3 py-2">{cuponesService.formatValor(cupon)}</td>
                    <td className="px-3 py-2">${parseFloat(cupon.monto_minimo || 0).toFixed(2)}</td>
                    <td className="px-3 py-2">
                      {cupon.usos_actuales}/{cupon.usos_maximos}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {cupon.fecha_inicio || cupon.fecha_fin ? (
                        <>
                          {cuponesService.formatDateTime(cupon.fecha_inicio)}
                          {' — '}
                          {cuponesService.formatDateTime(cupon.fecha_fin)}
                        </>
                      ) : (
                        'Sin límite'
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={cupon.activo ? 'default' : 'secondary'}>
                        {cupon.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right space-x-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => abrirEditar(cupon)}>
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActivo(cupon)}
                      >
                        {cupon.activo ? 'Desactivar' : 'Activar'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <Dialog open={modalOpen} onOpenChange={(open) => !open && cerrarModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar cupón' : 'Nuevo cupón'}</DialogTitle>
            <DialogDescription>
              El código se guarda en mayúsculas sin espacios. Un cupón por pedido.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="cupon-codigo">Código</Label>
              <Input
                id="cupon-codigo"
                value={form.codigo}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))}
                placeholder="VERANO10"
                disabled={guardando}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cupon-tipo">Tipo</Label>
                <select
                  id="cupon-tipo"
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 text-sm"
                  value={form.tipo}
                  onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                  disabled={guardando}
                >
                  <option value="porcentaje">Porcentaje</option>
                  <option value="monto_fijo">Monto fijo</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="cupon-valor">Valor</Label>
                <Input
                  id="cupon-valor"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                  disabled={guardando}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cupon-minimo">Monto mínimo ($)</Label>
                <Input
                  id="cupon-minimo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monto_minimo}
                  onChange={(e) => setForm((f) => ({ ...f, monto_minimo: e.target.value }))}
                  disabled={guardando}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cupon-usos">Usos máximos</Label>
                <Input
                  id="cupon-usos"
                  type="number"
                  min="1"
                  step="1"
                  value={form.usos_maximos}
                  onChange={(e) => setForm((f) => ({ ...f, usos_maximos: e.target.value }))}
                  disabled={guardando}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cupon-inicio">Inicio (opcional)</Label>
                <Input
                  id="cupon-inicio"
                  type="datetime-local"
                  value={form.fecha_inicio}
                  onChange={(e) => setForm((f) => ({ ...f, fecha_inicio: e.target.value }))}
                  disabled={guardando}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cupon-fin">Fin (opcional)</Label>
                <Input
                  id="cupon-fin"
                  type="datetime-local"
                  value={form.fecha_fin}
                  onChange={(e) => setForm((f) => ({ ...f, fecha_fin: e.target.value }))}
                  disabled={guardando}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={cerrarModal} disabled={guardando}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={guardarCupon}
              disabled={guardando}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
