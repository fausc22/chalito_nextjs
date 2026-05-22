import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  getPrintAgentUrl,
  setPrintAgentUrl,
  getPrintAgentToken,
  setPrintAgentToken,
  isBrowserPrintFallbackEnabled,
  setBrowserPrintFallbackEnabled
} from '@/lib/printConfig';
import { checkPrintAgentHealth, printTestPage, getAgentErrorMessage } from '@/services/printAgentService';

export function ModalAyudaImpresora({ open, onOpenChange }) {
  const [agentUrl, setAgentUrlState] = useState('');
  const [token, setToken] = useState('');
  const [browserFallback, setBrowserFallback] = useState(true);
  const [health, setHealth] = useState(null);
  const [testing, setTesting] = useState(false);
  const [loadingHealth, setLoadingHealth] = useState(false);

  useEffect(() => {
    if (open) {
      setAgentUrlState(getPrintAgentUrl());
      setToken(getPrintAgentToken());
      setBrowserPrintFallback(isBrowserPrintFallbackEnabled());
      refreshHealth();
    }
  }, [open]);

  const refreshHealth = async () => {
    setLoadingHealth(true);
    const h = await checkPrintAgentHealth({ force: true });
    setHealth(h);
    setLoadingHealth(false);
  };

  const handleSave = () => {
    setPrintAgentUrl(agentUrl.trim() || 'http://127.0.0.1:9100');
    setPrintAgentToken(token);
    setBrowserPrintFallbackEnabled(browserFallback);
    toast.success('Configuración guardada');
    refreshHealth();
  };

  const handleTestPrint = async () => {
    setTesting(true);
    handleSave();
    const result = await printTestPage();
    setTesting(false);
    if (result.success) {
      toast.success('Prueba enviada', { description: 'Debería salir un ticket de prueba' });
    } else {
      toast.error('Prueba fallida', {
        description: getAgentErrorMessage(result.code, result.message)
      });
    }
    refreshHealth();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Impresora térmica</DialogTitle>
          <DialogDescription>
            El Chalito Print debe estar abierto en esta PC (Iniciar-impresion.bat).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div
            className={`rounded-md border px-3 py-2 ${
              health?.ok
                ? 'border-emerald-300 bg-emerald-500/10 text-emerald-900'
                : 'border-red-300 bg-destructive/10 text-red-900'
            }`}
          >
            {loadingHealth ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando agente…
              </span>
            ) : health?.ok ? (
              <span>
                Agente conectado
                {health.printerName ? ` — ${health.printerName}` : ''}
                {health.simulate ? ' (simulación)' : ''}
              </span>
            ) : (
              <span>{health?.message || 'Agente no detectado en esta PC'}</span>
            )}
          </div>

          <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
            <li>Instalá el driver Xprinter</li>
            <li>Ejecutá scripts/Iniciar-impresion.bat en la carpeta print-agent</li>
            <li>Copiá el token de config.json y pegalo abajo</li>
            <li>Usá Imprimir prueba</li>
          </ol>

          <a
            href="/docs/INSTALACION_IMPRESORA.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              window.open(
                'https://github.com',
                '_blank'
              );
              toast.info('Guía en docs/INSTALACION_IMPRESORA.md del proyecto');
            }}
          >
            Ver guía completa
            <ExternalLink className="h-3 w-3" />
          </a>

          <div className="space-y-2">
            <Label htmlFor="agentUrl">URL del agente</Label>
            <Input
              id="agentUrl"
              value={agentUrl}
              onChange={(e) => setAgentUrlState(e.target.value)}
              placeholder="http://127.0.0.1:9100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="printToken">Token (config.json)</Label>
            <Input
              id="printToken"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Token del print-agent"
            />
          </div>

          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={browserFallback}
              onChange={(e) => setBrowserFallback(e.target.checked)}
              className="rounded"
            />
            Permitir impresión por navegador si falla la ticketera
          </label>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={refreshHealth} disabled={loadingHealth}>
            Verificar
          </Button>
          <Button onClick={handleTestPrint} disabled={testing}>
            {testing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Imprimir prueba
          </Button>
          <Button variant="secondary" onClick={handleSave}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
