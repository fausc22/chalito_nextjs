import { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  RefreshCw,
  RotateCcw,
  Save,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import { useWhatsAppConfig } from '@/hooks/configuracion/useWhatsAppConfig';
import { WhatsAppPlantillaEditor } from '@/components/configuracion/WhatsAppPlantillaEditor';
import { TEMPLATE_GROUPS, formatNumeroWhatsAppDisplay } from '@/lib/whatsappTemplateUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MODO_OPTIONS = [
  {
    id: 'local_a_cliente',
    title: 'El local envía confirmaciones automáticas al cliente',
    description: 'WhatsApp vía Baileys al teléfono del cliente cuando entra un pedido web.',
  },
  {
    id: 'cliente_a_local',
    title: 'El cliente envía el resumen del pedido al local',
    description: 'La carta abre WhatsApp con el mensaje armado hacia el número del local.',
  },
  {
    id: 'desactivado',
    title: 'Desactivado',
    description: 'Solo se crea el pedido en el sistema; sin mensajes WhatsApp.',
  },
];

function estadoBadge(waEstado, polling, waQr) {
  if (waEstado.connected) {
    return { label: 'Conectado', variant: 'default' };
  }
  if (waEstado.reconnecting) {
    return { label: 'Reconectando...', variant: 'secondary' };
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
    hasPlantillaErrors,
    modoPedidosWeb,
    plantillasActivas,
    setModoPedidosWeb,
    setSettingsLocal,
    setPlantilla,
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
  const plantillasDisabled = disabled || modoPedidosWeb === 'desactivado';
  const editorVariant =
    modoPedidosWeb === 'cliente_a_local' ? 'cliente_a_local' : 'local_a_cliente';

  const numeroDisplay = formatNumeroWhatsAppDisplay(settingsLocal.numeroContactoResuelto);
  const telefonoVinculadoDisplay = formatNumeroWhatsAppDisplay(waEstado.phone);
  const sinNumero =
    modoPedidosWeb === 'cliente_a_local' && !settingsLocal.numeroContactoResuelto;

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
          {waEstado.lastError === 'session_expired' ? (
            <div className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>Sesión expirada. Volvé a conectar WhatsApp escaneando el QR.</p>
            </div>
          ) : null}

          {waEstado.connected && telefonoVinculadoDisplay ? (
            <p className="text-sm text-muted-foreground">
              Teléfono vinculado: <strong>{telefonoVinculadoDisplay}</strong>
            </p>
          ) : waEstado.connected && waEstado.phone ? (
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
            Pedidos web por WhatsApp
          </CardTitle>
          <CardDescription>
            El pedido siempre se crea en el sistema. WhatsApp es complementario para confirmar o enviar
            el resumen según el modo elegido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-foreground">Modo de WhatsApp para pedidos web</legend>
            {MODO_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                  modoPedidosWeb === option.id
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-border hover:bg-muted/40'
                } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="wa-modo-pedidos"
                  className="mt-1"
                  checked={modoPedidosWeb === option.id}
                  disabled={disabled}
                  onChange={() => setModoPedidosWeb(option.id)}
                />
                <span>
                  <span className="text-sm font-semibold text-foreground">{option.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{option.description}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-sm font-semibold text-foreground">Número usado</p>
            {numeroDisplay ? (
              <p className="mt-1 text-sm text-foreground">
                {numeroDisplay}
                {settingsLocal.numeroContactoFuente ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (fuente: {settingsLocal.numeroContactoFuente})
                  </span>
                ) : null}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">Sin número configurado</p>
            )}
          </div>

          {sinNumero ? (
            <div className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>
                No hay número de WhatsApp disponible para recibir pedidos. Conectá WhatsApp arriba o
                configurá el número en el servidor.
              </p>
            </div>
          ) : null}

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
              Se usa en plantillas de transferencia (<code>{'{{alias}}'}</code> o{' '}
              <code>{'{{bloque_transferencia}}'}</code>).
            </p>
          </div>

          <div
            className={`rounded-lg border border-border ${plantillasDisabled ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
              <button
                type="button"
                className="flex flex-1 items-center justify-between gap-2 text-left text-sm font-semibold text-foreground hover:opacity-80"
                onClick={() => setPlantillasOpen((o) => !o)}
              >
                Plantillas de mensajes (6)
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
                disabled={plantillasDisabled}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Restaurar de este modo
              </Button>
            </div>

            {plantillasOpen ? (
              <div className="space-y-3 border-t border-border p-3">
                {modoPedidosWeb === 'desactivado' ? (
                  <p className="text-sm text-muted-foreground">
                    Activá un modo para editar las plantillas correspondientes.
                  </p>
                ) : null}

                {loading && !plantillasActivas ? (
                  <p className="text-sm text-muted-foreground">Cargando plantillas…</p>
                ) : null}

                {modoPedidosWeb !== 'desactivado'
                  ? TEMPLATE_GROUPS.map((group) => (
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
                                key={`${modoPedidosWeb}-${templateKey}`}
                                templateKey={templateKey}
                                variant={editorVariant}
                                value={plantillasActivas?.[templateKey] || ''}
                                onChange={(text) => setPlantilla(templateKey, text)}
                                onRestore={() => restaurarPlantilla(templateKey)}
                                disabled={plantillasDisabled}
                                nombreNegocio={nombreLocal}
                                aliasTransferencia={settingsLocal.aliasTransferencia}
                                serverErrors={plantillaErrors[templateKey] || []}
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))
                  : null}
              </div>
            ) : null}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={guardarSettings}
              disabled={disabled || hasPlantillaErrors}
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
