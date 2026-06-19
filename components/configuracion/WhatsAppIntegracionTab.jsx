import { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle, RefreshCw, RotateCcw, Save, Wifi, WifiOff } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import { useWhatsAppConfig } from '@/hooks/configuracion/useWhatsAppConfig';
import { WhatsAppPlantillaEditor } from '@/components/configuracion/WhatsAppPlantillaEditor';
import { WhatsAppClienteAlLocalEditor } from '@/components/configuracion/WhatsAppClienteAlLocalEditor';
import { TEMPLATE_GROUPS } from '@/lib/whatsappTemplateUtils';
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
  const [plantillasOpen, setPlantillasOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState(() =>
    TEMPLATE_GROUPS.reduce((acc, group) => ({ ...acc, [group.id]: true }), {})
  );

  const {
    loading,
    guardando,
    waEstado,
    waQr,
    polling,
    settingsLocal,
    plantillaErrors,
    clienteAlLocalErrors,
    hasPlantillaErrors,
    hasClienteAlLocalErrors,
    setSettingsLocal,
    setPlantilla,
    setTemplateClienteAlLocal,
    restaurarPlantilla,
    restaurarTodasPlantillas,
    cargarTodo,
    conectar,
    desconectar,
    guardarSettings,
  } = useWhatsAppConfig(notification);

  const badge = estadoBadge(waEstado, polling, waQr);
  const nombreLocal = settingsLocal.nombreNegocio || 'El Chalito';
  const disabled = loading || guardando;

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

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
            Personalizá los mensajes que se envían al cliente según la forma de pago y si el pedido es retiro o envío.
            Usá las variables para insertar el número de pedido (<code>{'{{id}}'}</code>), el detalle de productos (
            <code>{'{{contenido}}'}</code>) y el total (<code>{'{{total}}'}</code>). El nombre del local se inserta con{' '}
            <code>{'{{local}}'}</code>.
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
              disabled={disabled}
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
              disabled={disabled}
              placeholder="ej. elchalito.mp"
            />
            <p className="text-xs text-muted-foreground">
              Se inserta con <code>{'{{alias}}'}</code> en plantillas de transferencia. Mercado Pago y credenciales de
              pago se configuran solo en el servidor (desarrollo).
            </p>
          </div>

          <div className="rounded-lg border border-border">
            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
              <button
                type="button"
                className="flex flex-1 items-center justify-between gap-2 text-left text-sm font-semibold text-foreground hover:opacity-80"
                onClick={() => setPlantillasOpen((o) => !o)}
              >
                Plantillas de mensajes
                {plantillasOpen ? (
                  <ChevronUp className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                )}
              </button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 text-xs"
                onClick={restaurarTodasPlantillas}
                disabled={disabled}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Restaurar todas
              </Button>
            </div>

            {plantillasOpen ? (
              <div className="space-y-3 border-t border-border p-3">
                {loading && !settingsLocal.plantillas ? (
                  <p className="text-sm text-muted-foreground">Cargando plantillas…</p>
                ) : null}

                {TEMPLATE_GROUPS.map((group) => (
                  <div key={group.id} className="rounded-lg border border-border">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-muted/60"
                      onClick={() => toggleGroup(group.id)}
                    >
                      {group.label}
                      {openGroups[group.id] ? (
                        <ChevronUp className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      )}
                    </button>

                    {openGroups[group.id] ? (
                      <div className="space-y-3 border-t border-border p-3">
                        {group.keys.map((templateKey) => (
                          <WhatsAppPlantillaEditor
                            key={templateKey}
                            templateKey={templateKey}
                            value={settingsLocal.plantillas?.[templateKey] || ''}
                            onChange={(text) => setPlantilla(templateKey, text)}
                            onRestore={() => restaurarPlantilla(templateKey)}
                            disabled={disabled}
                            nombreNegocio={nombreLocal}
                            aliasTransferencia={settingsLocal.aliasTransferencia}
                            serverErrors={plantillaErrors[templateKey] || []}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={guardarSettings}
              disabled={disabled || hasPlantillaErrors || hasClienteAlLocalErrors}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {guardando ? 'Guardando...' : 'Guardar configuración'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-700" />
            Carta online — mensaje del cliente al local
          </CardTitle>
          <CardDescription>
            Cuando un cliente finaliza un pedido en la carta web, puede abrir WhatsApp hacia el local con el
            resumen. El alias de transferencia usa el mismo valor configurado arriba (
            <code>{'{{alias}}'}</code> / <code>{'{{bloque_transferencia}}'}</code>).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Cliente envía pedido por WhatsApp</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                El pedido se crea igual en el sistema; esto solo abre WhatsApp con el mensaje armado.
              </p>
            </div>
            <ToggleSwitch
              checked={Boolean(settingsLocal.clienteEnviaAlLocal)}
              onChange={(v) => setSettingsLocal((s) => ({ ...s, clienteEnviaAlLocal: v }))}
              disabled={disabled}
              label="Cliente envía al local"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="wa-numero-contacto">Número WhatsApp del local (wa.me)</Label>
            <Input
              id="wa-numero-contacto"
              value={settingsLocal.numeroContacto || ''}
              onChange={(e) =>
                setSettingsLocal((s) => ({ ...s, numeroContacto: e.target.value }))
              }
              disabled={disabled}
              placeholder="5492302633818"
            />
            <p className="text-xs text-muted-foreground">
              Solo dígitos, con código de país. Si queda vacío, se usa el número de la sesión Baileys vinculada.
            </p>
          </div>

          <WhatsAppClienteAlLocalEditor
            value={settingsLocal.templateClienteAlLocal || ''}
            defaultValue={settingsLocal.templateClienteAlLocalDefault || ''}
            onChange={setTemplateClienteAlLocal}
            onRestore={() =>
              setSettingsLocal((s) => ({
                ...s,
                templateClienteAlLocal: s.templateClienteAlLocalDefault || '',
              }))
            }
            disabled={disabled}
            nombreNegocio={nombreLocal}
            aliasTransferencia={settingsLocal.aliasTransferencia}
            serverErrors={clienteAlLocalErrors}
          />

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={guardarSettings}
              disabled={disabled || hasPlantillaErrors || hasClienteAlLocalErrors}
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
