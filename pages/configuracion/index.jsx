import { useEffect, useMemo, useState } from 'react';
import { Cog, Save } from 'lucide-react';
import { TiendaOnlineTab } from '@/components/configuracion/TiendaOnlineTab';
import { CuponesTab } from '@/components/configuracion/CuponesTab';
import { IntegracionesTab } from '@/components/configuracion/IntegracionesTab';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotification } from '@/contexts/NotificationContext';
import { configuracionService } from '@/services/configuracionService';

function ConfiguracionContent() {
  const notification = useNotification();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [savingOperation, setSavingOperation] = useState(false);
  const [operationConfig, setOperationConfig] = useState({});
  const [activeTab, setActiveTab] = useState('operacion');

  const operationFields = useMemo(
    () => Object.keys(configuracionService.operationConfigKeys || configuracionService.configKeys || {}),
    []
  );

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
    if (Array.isArray(result.warnings) && result.warnings.length > 0) {
      notification.showWarning(result.warnings.join(' '));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOperationValueChange = (key, rawValue) => {
    setOperationConfig((prev) => {
      if (!prev[key]) return prev;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          value: rawValue,
        },
      };
    });
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

  return (
    <Layout title="Configuración del sistema">
      <div className="main-content">
        <div className="mb-6">
          <h1 className="admin-page-heading mb-2">Configuración del sistema</h1>
          <p className="page-subtitle">
            Parámetros globales del negocio. Los cambios aplican a todo el panel y operación.
          </p>
        </div>

        {loadError ? (
          <Card className="mb-6 border-red-200">
            <CardContent className="pt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-red-700">No se pudo cargar la configuración</p>
                <p className="text-sm text-muted-foreground mt-1">{loadError}</p>
              </div>
              <Button type="button" variant="outline" onClick={loadData} disabled={loading}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-1 mb-6">
            <TabsList className="inline-flex h-auto w-max min-w-max justify-start gap-1.5 rounded-xl border border-border bg-card p-1 sm:min-w-0">
              <TabsTrigger
                value="operacion"
                className="rounded-lg px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Operación
              </TabsTrigger>
              <TabsTrigger
                value="tienda-online"
                className="rounded-lg px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Tienda online
              </TabsTrigger>
              <TabsTrigger
                value="cupones"
                className="rounded-lg px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Cupones
              </TabsTrigger>
              <TabsTrigger
                value="integraciones"
                className="rounded-lg px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                Integraciones
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="operacion">
            <Card className="border-border max-w-3xl">
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
                      <Card key={key} className="border-border shadow-none">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div className="md:col-span-2">
                              <Label htmlFor={`config-${key}`} className="text-sm font-semibold">
                                {item.label}
                              </Label>
                              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
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
                                disabled={loading || savingOperation}
                              />
                              <p className="text-xs text-muted-foreground">Rango: {item.min} - {item.max}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading || savingOperation}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {savingOperation ? 'Guardando...' : 'Guardar operación'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tienda-online">
            <TiendaOnlineTab />
          </TabsContent>

          <TabsContent value="cupones">
            <CuponesTab />
          </TabsContent>

          <TabsContent value="integraciones">
            <IntegracionesTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

export default function ConfiguracionPage() {
  return (
    <ProtectedRoute module="configuracion">
      <ErrorBoundary>
        <ConfiguracionContent />
      </ErrorBoundary>
    </ProtectedRoute>
  );
}
