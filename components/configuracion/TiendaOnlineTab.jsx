import { useEffect, useState } from 'react';
import { Clock, Globe, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import { useTiendaOnlineConfig } from '@/hooks/configuracion/useTiendaOnlineConfig';
import { tiendaOnlineService } from '@/services/tiendaOnlineService';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TiendaAparienciaTab } from '@/components/configuracion/TiendaAparienciaTab';

function ToggleSwitch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
        checked ? 'bg-blue-600' : 'bg-slate-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-card transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function estadoBadgeVariant(estado) {
  if (!estado) return 'outline';
  if (estado.bloqueado) return 'destructive';
  if (estado.estaAbierto) return 'default';
  return 'secondary';
}

function estadoBadgeLabel(estado) {
  if (!estado) return 'Sin datos';
  if (estado.bloqueado) return 'Tienda desactivada';
  if (estado.estaAbierto) return 'Abierto ahora';
  return 'Cerrado ahora';
}

function TiendaOnlineHorariosPanel() {
  const notification = useNotification();
  const {
    DIAS_SEMANA,
    loading,
    guardando,
    horarios,
    settings,
    estadoPreview,
    cargarTodo,
    actualizarHorarioDia,
    guardarSettings,
    obtenerHorariosDia,
    refrescarEstado,
  } = useTiendaOnlineConfig(notification);

  const [diaEditando, setDiaEditando] = useState(null);
  const [franjasEditando, setFranjasEditando] = useState([]);
  const [settingsLocal, setSettingsLocal] = useState(settings);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  useEffect(() => {
    setSettingsLocal(settings);
  }, [settings]);

  const abrirEditorDia = (dia) => {
    const franjas = obtenerHorariosDia(dia.id);
    setFranjasEditando(
      franjas.length > 0
        ? franjas
        : [{ hora_apertura: '09:00', hora_cierre: '22:00', activo: false }]
    );
    setDiaEditando(dia);
  };

  const cerrarEditor = () => {
    setDiaEditando(null);
    setFranjasEditando([]);
  };

  const agregarFranja = () => {
    setFranjasEditando((prev) => [
      ...prev,
      { hora_apertura: '09:00', hora_cierre: '22:00', activo: true },
    ]);
  };

  const actualizarFranja = (index, field, value) => {
    setFranjasEditando((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
  };

  const eliminarFranja = (index) => {
    setFranjasEditando((prev) => prev.filter((_, i) => i !== index));
  };

  const guardarDia = async () => {
    if (!diaEditando) return;
    const ok = await actualizarHorarioDia(diaEditando.id, franjasEditando);
    if (ok) cerrarEditor();
  };

  const guardarConfiguracionCanal = async () => {
    await guardarSettings({
      tiendaOnlineActiva: settingsLocal.tiendaOnlineActiva,
      validarHorarios: settingsLocal.validarHorarios,
      toleranceMinutes: Number(settingsLocal.toleranceMinutes),
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-700" />
            Estado del canal online
          </CardTitle>
          <CardDescription>
            Controla si la tienda web acepta pedidos y si se validan los horarios de atención.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={estadoBadgeVariant(estadoPreview)}>
              {estadoBadgeLabel(estadoPreview)}
            </Badge>
            {estadoPreview?.mensaje ? (
              <span className="text-sm text-muted-foreground">{estadoPreview.mensaje}</span>
            ) : null}
            {estadoPreview?.nextOpeningText ? (
              <span className="text-sm text-muted-foreground">{estadoPreview.nextOpeningText}</span>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refrescarEstado}
              disabled={loading || guardando}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Probar ahora
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Tienda online activa</p>
                <p className="text-xs text-muted-foreground mt-1">Cierre manual del canal (no acepta pedidos).</p>
              </div>
              <ToggleSwitch
                label="Tienda online activa"
                checked={Boolean(settingsLocal.tiendaOnlineActiva)}
                onChange={(value) =>
                  setSettingsLocal((prev) => ({ ...prev, tiendaOnlineActiva: value }))
                }
                disabled={loading || guardando}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Validar horarios en checkout</p>
                <p className="text-xs text-muted-foreground mt-1">Si está off, el local se considera siempre abierto.</p>
              </div>
              <ToggleSwitch
                label="Validar horarios"
                checked={Boolean(settingsLocal.validarHorarios)}
                onChange={(value) =>
                  setSettingsLocal((prev) => ({ ...prev, validarHorarios: value }))
                }
                disabled={loading || guardando}
              />
            </div>
          </div>

          <div className="max-w-xs space-y-2">
            <Label htmlFor="tolerancia-cierre">Tolerancia al cierre (minutos)</Label>
            <Input
              id="tolerancia-cierre"
              type="number"
              min={0}
              max={120}
              value={settingsLocal.toleranceMinutes ?? 5}
              onChange={(e) =>
                setSettingsLocal((prev) => ({
                  ...prev,
                  toleranceMinutes: e.target.value,
                }))
              }
              disabled={loading || guardando}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={guardarConfiguracionCanal}
              disabled={loading || guardando}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {guardando ? 'Guardando...' : 'Guardar canal'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-700" />
            Horarios semanales
          </CardTitle>
          <CardDescription>
            Franjas de atención para pedidos online. Hacé clic en un día para editar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando horarios...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DIAS_SEMANA.map((dia) => (
                <button
                  key={dia.id}
                  type="button"
                  onClick={() => abrirEditorDia(dia)}
                  disabled={guardando}
                  className="flex items-center justify-between rounded-lg border border-border p-4 text-left transition hover:border-blue-300 hover:bg-accent/50"
                >
                  <div>
                    <p className="font-semibold text-foreground">{dia.nombre}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tiendaOnlineService.formatFranjasResumen(horarios, dia.id)}
                    </p>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">Editar</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(diaEditando)} onOpenChange={(open) => !open && cerrarEditor()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Horarios — {diaEditando?.nombre}</DialogTitle>
            <DialogDescription>
              Agregá franjas activas. Si no hay franjas activas, el día queda cerrado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {franjasEditando.map((franja, index) => (
              <div
                key={`franja-${index}`}
                className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-end border border-border rounded-lg p-3"
              >
                <div className="space-y-1">
                  <Label className="text-xs">Apertura</Label>
                  <Input
                    type="time"
                    value={franja.hora_apertura}
                    onChange={(e) => actualizarFranja(index, 'hora_apertura', e.target.value)}
                    disabled={!franja.activo || guardando}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cierre</Label>
                  <Input
                    type="time"
                    value={franja.hora_cierre}
                    onChange={(e) => actualizarFranja(index, 'hora_cierre', e.target.value)}
                    disabled={!franja.activo || guardando}
                  />
                </div>
                <div className="flex flex-col items-center gap-1 pb-1">
                  <Label className="text-xs">Activa</Label>
                  <ToggleSwitch
                    label={`Franja ${index + 1} activa`}
                    checked={Boolean(franja.activo)}
                    onChange={(value) => actualizarFranja(index, 'activo', value)}
                    disabled={guardando}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => eliminarFranja(index)}
                  disabled={guardando || franjasEditando.length <= 1}
                  aria-label="Eliminar franja"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" size="sm" onClick={agregarFranja} disabled={guardando}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar franja
          </Button>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={cerrarEditor} disabled={guardando}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={guardarDia}
              disabled={guardando}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {guardando ? 'Guardando...' : 'Guardar día'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function TiendaOnlineTab() {
  return (
    <Tabs defaultValue="horarios" className="w-full">
      <TabsList className="mb-6 inline-flex h-auto w-max gap-1.5 rounded-xl border border-border bg-card p-1">
        <TabsTrigger
          value="horarios"
          className="rounded-lg px-3 py-1.5 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          Horarios
        </TabsTrigger>
        <TabsTrigger
          value="apariencia"
          className="rounded-lg px-3 py-1.5 text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          Apariencia tienda
        </TabsTrigger>
      </TabsList>
      <TabsContent value="horarios">
        <TiendaOnlineHorariosPanel />
      </TabsContent>
      <TabsContent value="apariencia">
        <TiendaAparienciaTab />
      </TabsContent>
    </Tabs>
  );
}
