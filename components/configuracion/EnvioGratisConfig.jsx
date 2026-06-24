import { Save, Truck } from 'lucide-react';
import { useEnvioGratisConfig } from '@/hooks/configuracion/useEnvioGratisConfig';
import { useNotification } from '@/contexts/NotificationContext';
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

export function EnvioGratisConfig() {
  const notification = useNotification();
  const { loading, guardando, settings, setSettings, guardar } = useEnvioGratisConfig(notification);

  const disabled = loading || guardando;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Truck className="h-5 w-5 text-blue-700" />
          Envío gratis por monto
        </CardTitle>
        <CardDescription>
          Si el pedido delivery desde la carta online supera el monto mínimo, el cliente y la
          comanda verán que el envío es gratis. El repartidor no debe cobrarlo al entregar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Activar envío gratis</p>
            <p className="text-xs text-muted-foreground mt-1">
              Solo aplica a pedidos con envío a domicilio desde la carta online.
            </p>
          </div>
          <ToggleSwitch
            label="Activar envío gratis"
            checked={Boolean(settings.activo)}
            onChange={(value) => setSettings((prev) => ({ ...prev, activo: value }))}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="envio-gratis-monto">Monto mínimo del pedido ($)</Label>
          <Input
            id="envio-gratis-monto"
            type="number"
            min="0"
            step="100"
            value={settings.montoMinimo ?? 0}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                montoMinimo: Number(e.target.value) || 0,
              }))
            }
            disabled={disabled || !settings.activo}
            placeholder="Ej: 25000"
          />
          <p className="text-xs text-muted-foreground">
            Si el total del pedido es igual o mayor a este monto, se mostrará &quot;envío gratis&quot;
            al cliente y en la comanda.
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={guardar}
            disabled={disabled || (settings.activo && Number(settings.montoMinimo) <= 0)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {guardando ? 'Guardando...' : 'Guardar envío gratis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
