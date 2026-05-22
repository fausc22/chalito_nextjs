import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, RefreshCw, Save, Wifi, WifiOff } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import { useWhatsAppConfig } from '@/hooks/configuracion/useWhatsAppConfig';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

function estadoBadge(waEstado, polling, waQr) {
  if (waEstado.connected) {
    return { label: 'Conectado', variant: 'default' };
  }
  if (polling || waQr) {
    return { label: 'Esperando QR', variant: 'secondary' };
  }
  return { label: 'Desconectado', variant: 'outline' };
}

export function WhatsAppIntegracionTab() {
  const notification = useNotification();
  const [previewsOpen, setPreviewsOpen] = useState(false);
  const {
    loading,
    guardando,
    waEstado,
    waQr,
    polling,
    settingsLocal,
    previews,
    setSettingsLocal,
    cargarTodo,
    conectar,
    desconectar,
    guardarSettings,
  } = useWhatsAppConfig(notification);

  const badge = estadoBadge(waEstado, polling, waQr);
  const nombreLocal = settingsLocal.nombreNegocio || 'El Chalito';

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="border-border">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {waEstado.connected ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-muted-foreground" />
              )}
              WhatsApp
            </CardTitle>
            <CardDescription>
              Vinculá el número del negocio para enviar confirmaciones automáticas en pedidos web.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={badge.variant}>{badge.label}</Badge>
            <Button type="button" variant="outline" size="sm" onClick={cargarTodo} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {waEstado.connected && waEstado.phone ? (
            <p className="text-sm text-muted-foreground">
              Teléfono vinculado: <strong>{waEstado.phone}</strong>
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {!waEstado.connected ? (
              <Button
                type="button"
                onClick={conectar}
                disabled={loading || polling}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Conectar WhatsApp
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={desconectar} disabled={loading}>
                Desconectar
              </Button>
            )}
          </div>

          {(polling || waQr) && !waEstado.connected ? (
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="text-sm text-muted-foreground mb-3">
                1. Abrí WhatsApp en el celular → Dispositivos vinculados → Vincular dispositivo
                <br />
                2. Escaneá este código (se actualiza solo cada 3 segundos):
              </p>
              {waQr ? (
                <img
                  src={`data:image/png;base64,${waQr}`}
                  alt="QR WhatsApp"
                  className="mx-auto w-64 h-64 border rounded-lg bg-card p-2"
                />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Generando QR…</p>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-700" />
            Notificaciones de pedidos web
          </CardTitle>
          <CardDescription>
            Los mensajes al cliente los arma el sistema según la forma de pago y si el pedido es retiro en el local
            o envío a domicilio. En todos los casos se incluye el saludo de <strong>{nombreLocal}</strong>, el número
            de pedido, el detalle y el total. Solo podés activar o desactivar el envío y configurar el alias de
            transferencia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Enviar notificaciones WhatsApp</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Si está desactivado, los pedidos se crean igual pero no se envía mensaje.
              </p>
            </div>
            <ToggleSwitch
              checked={Boolean(settingsLocal.notificacionesActivas)}
              onChange={(v) => setSettingsLocal((s) => ({ ...s, notificacionesActivas: v }))}
              disabled={loading || guardando}
              label="Notificaciones activas"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="wa-alias">Alias transferencia</Label>
            <Input
              id="wa-alias"
              value={settingsLocal.aliasTransferencia || ''}
              onChange={(e) =>
                setSettingsLocal((s) => ({ ...s, aliasTransferencia: e.target.value }))
              }
              disabled={loading || guardando}
              placeholder="ej. elchalito.mp"
            />
            <p className="text-xs text-muted-foreground">
              Se usa en pedidos con transferencia. Mercado Pago y credenciales de pago se configuran solo en el
              servidor (desarrollo).
            </p>
          </div>

          <div className="rounded-lg border border-border">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-semibold text-foreground hover:bg-muted/60"
              onClick={() => setPreviewsOpen((o) => !o)}
            >
              Ejemplos de mensajes (solo lectura)
              {previewsOpen ? (
                <ChevronUp className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" />
              )}
            </button>
            {previewsOpen ? (
              <div className="space-y-3 border-t border-border p-3">
                {loading && previews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Cargando ejemplos…</p>
                ) : null}
                {previews.map((preview) => (
                  <div key={preview.key} className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">{preview.label}</p>
                    <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground font-sans">
                      {preview.texto}
                    </pre>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={guardarSettings}
              disabled={loading || guardando}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {guardando ? 'Guardando...' : 'Guardar configuración'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
