import { Palette, Save } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import { useTiendaAparienciaConfig } from '@/hooks/configuracion/useTiendaAparienciaConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const HEX_REGEX = /^#[0-9A-F]{6}$/i;

export function TiendaAparienciaTab() {
  const notification = useNotification();
  const { loading, guardando, apariencia, setApariencia, guardar, cargar } = useTiendaAparienciaConfig(notification);

  const handleColorChange = (field, value) => {
    setApariencia((prev) => ({ ...prev, [field]: value.toUpperCase() }));
  };

  const handleSave = async () => {
    if (!HEX_REGEX.test(apariencia.colorPrimario) || !HEX_REGEX.test(apariencia.colorSecundario)) {
      notification?.showError?.('Los colores deben tener formato HEX (#RRGGBB)');
      return;
    }
    await guardar();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Palette className="h-5 w-5 text-violet-700" />
            Apariencia de la tienda web
          </CardTitle>
          <CardDescription>
            Colores del carrito online. El nombre y el logo del negocio son fijos en la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            El carrusel de la página de inicio usa imágenes fijas del sitio (no configurable en esta fase).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tienda-color-primario">Color primario web</Label>
              <div className="grid grid-cols-[76px_1fr] gap-2">
                <Input
                  id="tienda-color-primario-picker"
                  type="color"
                  value={HEX_REGEX.test(apariencia.colorPrimario) ? apariencia.colorPrimario : '#1D4ED8'}
                  onChange={(e) => handleColorChange('colorPrimario', e.target.value)}
                  disabled={loading || guardando}
                />
                <Input
                  id="tienda-color-primario"
                  value={apariencia.colorPrimario}
                  onChange={(e) => handleColorChange('colorPrimario', e.target.value)}
                  disabled={loading || guardando}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tienda-color-secundario">Color secundario / botones</Label>
              <div className="grid grid-cols-[76px_1fr] gap-2">
                <Input
                  id="tienda-color-secundario-picker"
                  type="color"
                  value={HEX_REGEX.test(apariencia.colorSecundario) ? apariencia.colorSecundario : '#88E1F2'}
                  onChange={(e) => handleColorChange('colorSecundario', e.target.value)}
                  disabled={loading || guardando}
                />
                <Input
                  id="tienda-color-secundario"
                  value={apariencia.colorSecundario}
                  onChange={(e) => handleColorChange('colorSecundario', e.target.value)}
                  disabled={loading || guardando}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={cargar} disabled={loading || guardando}>
              Recargar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={loading || guardando}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {guardando ? 'Guardando...' : 'Guardar apariencia'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
