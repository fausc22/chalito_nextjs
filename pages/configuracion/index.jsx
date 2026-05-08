import { useEffect, useMemo, useState } from 'react';
import { Cog, Moon, Palette, Save, Store } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useNotification } from '@/contexts/NotificationContext';
import { configuracionService } from '@/services/configuracionService';
import {
  applyDarkMode,
  applyPrimaryColor,
  extractThemeFromGeneralConfig,
  persistThemePreference,
} from '@/lib/theme';

function ConfiguracionContent() {
  const notification = useNotification();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [savingOperation, setSavingOperation] = useState(false);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [operationConfig, setOperationConfig] = useState({});
  const [generalConfig, setGeneralConfig] = useState({});
  const [generalErrors, setGeneralErrors] = useState({});

  const HEX_COLOR_REGEX = /^#[0-9A-F]{6}$/i;

  const operationFields = useMemo(
    () => Object.keys(configuracionService.operationConfigKeys || configuracionService.configKeys || {}),
    []
  );

  const looksLikeUrl = (value) => {
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol);
    } catch (error) {
      return false;
    }
  };

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    const result = await configuracionService.getConfiguracionSistema();

    if (!result.success) {
      const message = result.message || 'No se pudo cargar la configuracion';
      setLoadError(message);
      notification.showError(message);
      setLoading(false);
      return;
    }

    setOperationConfig(result.operationData || {});
    setGeneralConfig(result.generalData || {});
    persistThemePreference(extractThemeFromGeneralConfig(result.generalData));
    if (Array.isArray(result.warnings) && result.warnings.length > 0) {
      notification.showWarning(result.warnings.join(' '));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const colorValue = String(generalConfig.COLOR_PRIMARIO?.value || '').trim();
    if (HEX_COLOR_REGEX.test(colorValue)) {
      applyPrimaryColor(colorValue.toUpperCase());
    }
  }, [generalConfig.COLOR_PRIMARIO?.value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyDarkMode(generalConfig.MODO_OSCURO?.value);
  }, [generalConfig.MODO_OSCURO?.value]);

  const handleOperationValueChange = (key, rawValue) => {
    setOperationConfig((prev) => {
      if (!prev[key]) return prev;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          value: rawValue,
        }
      };
    });
  };

  const handleGeneralValueChange = (key, rawValue) => {
    setGeneralConfig((prev) => {
      if (!prev[key]) return prev;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          value: rawValue,
        }
      };
    });
    setGeneralErrors((prev) => ({
      ...prev,
      [key]: '',
    }));
  };

  const validateOperation = () => {
    for (const key of operationFields) {
      const item = operationConfig[key];
      const valueAsText = String(item?.value ?? '').trim();
      if (!valueAsText) {
        notification.showError(`Valor inválido para ${item?.label || key}`);
        return false;
      }
      const numericValue = Number(valueAsText);
      if (!Number.isInteger(numericValue)) {
        notification.showError(`${item?.label || key} debe ser un número entero`);
        return false;
      }
      if (!Number.isFinite(item?.min) || !Number.isFinite(item?.max)) {
        notification.showError(`Configuración inválida para ${item?.label || key}`);
        return false;
      }
      if (numericValue < item.min || numericValue > item.max) {
        notification.showError(`${item.label} debe estar entre ${item.min} y ${item.max}`);
        return false;
      }
    }

    return true;
  };

  const validateGeneral = () => {
    const nextErrors = {};
    const nombre = String(generalConfig.NOMBRE_NEGOCIO?.value || '').trim();
    const logoUrl = String(generalConfig.LOGO_URL?.value || '').trim();
    const color = String(generalConfig.COLOR_PRIMARIO?.value || '').trim().toUpperCase();

    if (!nombre) {
      nextErrors.NOMBRE_NEGOCIO = 'El nombre del negocio es obligatorio.';
    }

    if (!HEX_COLOR_REGEX.test(color)) {
      nextErrors.COLOR_PRIMARIO = 'El color primario debe tener formato HEX, por ejemplo #1D4ED8.';
    }

    if (logoUrl && !looksLikeUrl(logoUrl)) {
      nextErrors.LOGO_URL = 'La URL del logo no parece valida.';
    }

    setGeneralErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      notification.showError(Object.values(nextErrors)[0]);
      return false;
    }
    return true;
  };

  const handleSaveOperation = async (event) => {
    event.preventDefault();
    if (!validateOperation()) return;

    setSavingOperation(true);
    const payload = operationFields.reduce((acc, key) => {
      acc[key] = Number(operationConfig[key].value);
      return acc;
    }, {});

    const result = await configuracionService.updateConfiguracionOperativa(payload);
    setSavingOperation(false);

    if (!result.success) {
      notification.showError(result.message || 'No se pudo guardar la configuracion');
      return;
    }

    notification.showSuccess(result.message || 'Configuracion guardada correctamente');
  };

  const handleToggleDarkMode = () => {
    const nextValue = !generalConfig.MODO_OSCURO?.value;
    handleGeneralValueChange('MODO_OSCURO', nextValue);
    applyDarkMode(nextValue);
    persistThemePreference({
      darkMode: nextValue,
      primaryColor: generalConfig.COLOR_PRIMARIO?.value,
    });
  };

  const saveGeneralConfig = async () => {
    if (!validateGeneral()) return;

    setSavingGeneral(true);
    const payload = {
      NOMBRE_NEGOCIO: String(generalConfig.NOMBRE_NEGOCIO?.value || '').trim(),
      LOGO_URL: String(generalConfig.LOGO_URL?.value || '').trim(),
      COLOR_PRIMARIO: String(generalConfig.COLOR_PRIMARIO?.value || '').trim().toUpperCase(),
      MODO_OSCURO: Boolean(generalConfig.MODO_OSCURO?.value),
    };

    const result = await configuracionService.updateConfiguracionGeneral(payload);
    setSavingGeneral(false);

    if (!result.success) {
      notification.showError(result.message || 'No se pudo guardar la configuracion general');
      return;
    }

    notification.showSuccess(result.message || 'Configuracion general guardada correctamente');
    persistThemePreference({
      darkMode: payload.MODO_OSCURO,
      primaryColor: payload.COLOR_PRIMARIO,
    });
    setGeneralConfig((prev) => ({
      ...prev,
      COLOR_PRIMARIO: {
        ...prev.COLOR_PRIMARIO,
        value: payload.COLOR_PRIMARIO,
      },
      NOMBRE_NEGOCIO: {
        ...prev.NOMBRE_NEGOCIO,
        value: payload.NOMBRE_NEGOCIO,
      },
      LOGO_URL: {
        ...prev.LOGO_URL,
        value: payload.LOGO_URL,
      },
      MODO_OSCURO: {
        ...prev.MODO_OSCURO,
        value: payload.MODO_OSCURO,
      },
    }));
  };

  const handleSaveGeneral = async (event) => {
    event.preventDefault();
    await saveGeneralConfig();
  };

  const logoPreviewUrl = String(generalConfig.LOGO_URL?.value || '').trim();
  const hasValidLogoPreview = logoPreviewUrl && looksLikeUrl(logoPreviewUrl);

  return (
    <Layout title="Configuración">
      <main className="main-content">
        <div className="mb-6">
          <h1 className="text-[2rem] font-semibold text-[#315e92] mb-2">Configuración</h1>
          <p className="text-slate-500">Ajusta parametros operativos y generales del sistema.</p>
        </div>

        {loadError ? (
          <Card className="mb-6 border-red-200">
            <CardContent className="pt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-red-700">No se pudo cargar la configuración</p>
                <p className="text-sm text-slate-600 mt-1">{loadError}</p>
              </div>
              <Button type="button" variant="outline" onClick={loadData} disabled={loading}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Cog className="h-5 w-5 text-blue-700" />
                Operación
              </CardTitle>
              <CardDescription>
                Edita solo las claves permitidas para operación diaria.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSaveOperation}>
                {operationFields.map((key) => {
                  const item = operationConfig[key];
                  if (!item) return null;

                  return (
                    <Card key={key} className="border-slate-200 shadow-none">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                          <div className="md:col-span-2">
                            <Label htmlFor={`config-${key}`} className="text-sm font-semibold">
                              {item.label}
                            </Label>
                            <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                          </div>
                          <div className="space-y-1">
                            <Input
                              id={`config-${key}`}
                              type="number"
                              value={item.value}
                              step={1}
                              min={item.min}
                              max={item.max}
                              onChange={(event) => handleOperationValueChange(key, event.target.value)}
                              disabled={loading || savingOperation || savingGeneral}
                            />
                            <p className="text-xs text-slate-400">Rango: {item.min} - {item.max}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading || savingOperation || savingGeneral}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingOperation ? 'Guardando...' : 'Guardar operación'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Store className="h-5 w-5 text-blue-700" />
                  General / Negocio
                </CardTitle>
                <CardDescription>Configuración general visible para todo el sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSaveGeneral}>
                  <div className="space-y-2">
                    <Label htmlFor="config-nombre-negocio">Nombre del negocio</Label>
                    <Input
                      id="config-nombre-negocio"
                      value={generalConfig.NOMBRE_NEGOCIO?.value || ''}
                      onChange={(event) => handleGeneralValueChange('NOMBRE_NEGOCIO', event.target.value)}
                      disabled={loading || savingOperation || savingGeneral}
                      error={Boolean(generalErrors.NOMBRE_NEGOCIO)}
                    />
                    {generalErrors.NOMBRE_NEGOCIO ? (
                      <p className="text-xs text-red-600">{generalErrors.NOMBRE_NEGOCIO}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="config-logo-url">Logo URL</Label>
                    <Input
                      id="config-logo-url"
                      placeholder="https://..."
                      value={generalConfig.LOGO_URL?.value || ''}
                      onChange={(event) => handleGeneralValueChange('LOGO_URL', event.target.value)}
                      disabled={loading || savingOperation || savingGeneral}
                      error={Boolean(generalErrors.LOGO_URL)}
                    />
                    {generalErrors.LOGO_URL ? (
                      <p className="text-xs text-red-600">{generalErrors.LOGO_URL}</p>
                    ) : null}
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4 bg-slate-50 min-h-[128px] flex items-center justify-center">
                    {hasValidLogoPreview ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoPreviewUrl}
                          alt="Preview del logo"
                          className="max-h-20 w-auto object-contain"
                        />
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">Sin logo configurado</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading || savingOperation || savingGeneral}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {savingGeneral ? 'Guardando...' : 'Guardar general'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Palette className="h-5 w-5 text-violet-700" />
                  Interfaz
                </CardTitle>
                <CardDescription>Ajustes visuales de color y modo oscuro.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="config-color-primario">Color primario</Label>
                  <div className="grid grid-cols-[76px_1fr] gap-3">
                    <Input
                      id="config-color-primario"
                      type="color"
                      value={HEX_COLOR_REGEX.test(String(generalConfig.COLOR_PRIMARIO?.value || ''))
                        ? String(generalConfig.COLOR_PRIMARIO?.value || '')
                        : '#1D4ED8'}
                      onChange={(event) =>
                        handleGeneralValueChange('COLOR_PRIMARIO', event.target.value.toUpperCase())
                      }
                      disabled={loading || savingOperation || savingGeneral}
                    />
                    <Input
                      value={generalConfig.COLOR_PRIMARIO?.value || ''}
                      onChange={(event) => handleGeneralValueChange('COLOR_PRIMARIO', event.target.value)}
                      placeholder="#1D4ED8"
                      disabled={loading || savingOperation || savingGeneral}
                      error={Boolean(generalErrors.COLOR_PRIMARIO)}
                    />
                  </div>
                  {generalErrors.COLOR_PRIMARIO ? (
                    <p className="text-xs text-red-600">{generalErrors.COLOR_PRIMARIO}</p>
                  ) : (
                    <p className="text-xs text-slate-500">Formato esperado: #1D4ED8</p>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Moon className="h-4 w-4 text-slate-600" />
                        Modo oscuro
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Guarda preferencia y aplica clase <code>dark</code> al documento.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={Boolean(generalConfig.MODO_OSCURO?.value)}
                      onClick={handleToggleDarkMode}
                      disabled={loading || savingOperation || savingGeneral}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                        generalConfig.MODO_OSCURO?.value ? 'bg-slate-800' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                          generalConfig.MODO_OSCURO?.value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <Separator />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={saveGeneralConfig}
                    disabled={loading || savingOperation || savingGeneral}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingGeneral ? 'Guardando...' : 'Guardar interfaz'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default function ConfiguracionPage() {
  return (
    <ProtectedRoute>
      <ConfiguracionContent />
    </ProtectedRoute>
  );
}
