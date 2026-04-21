import { useEffect, useMemo, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useLiquidaciones } from '@/hooks/empleados/useLiquidaciones';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmpleadosFeedback } from '@/components/empleados/EmpleadosFeedback';
import { LiquidacionFilters } from './LiquidacionFilters';
import { LiquidacionSummary } from './LiquidacionSummary';
import { LiquidacionAsistenciasTable } from './LiquidacionAsistenciasTable';
import { LiquidacionMovimientosTable } from './LiquidacionMovimientosTable';
import { LiquidacionesHistoryTable } from './LiquidacionesHistoryTable';

const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const currentDate = new Date();

const EMPTY_FILTERS = {
  empleado_id: '',
  modo_calculo: 'mes',
  anio: String(currentDate.getFullYear()),
  mes: String(currentDate.getMonth() + 1),
  fecha_desde: '',
  fecha_hasta: '',
};

const SAVE_EVENT_NAME = 'empleados:liquidaciones:guardar';
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const toDateOnly = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const match = trimmed.match(DATE_ONLY_PATTERN);
    if (match) {
      const [, y, m, d] = match;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const formatDate = (value) => {
  if (!value) return '';
  const date = toDateOnly(value);
  if (!date || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const toYmd = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (DATE_ONLY_PATTERN.test(trimmed)) return trimmed;
  }
  const date = value instanceof Date ? value : toDateOnly(value);
  if (!date || Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getMonthRange = (yearValue, monthValue) => {
  const year = Number(yearValue);
  const month = Number(monthValue);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    fecha_desde: toYmd(start),
    fecha_hasta: toYmd(end),
  };
};

const isFullMonthRange = (fromValue, toValue) => {
  if (!fromValue || !toValue) return false;
  const from = toDateOnly(fromValue);
  const to = toDateOnly(toValue);
  if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return false;
  if (from.getFullYear() !== to.getFullYear() || from.getMonth() !== to.getMonth()) return false;
  if (from.getDate() !== 1) return false;
  const lastDay = new Date(from.getFullYear(), from.getMonth() + 1, 0).getDate();
  return to.getDate() === lastDay;
};

const buildPeriodLabels = (context, liquidacion) => {
  const fallbackDesde = liquidacion?.fechaDesde ? formatDate(liquidacion.fechaDesde) : '';
  const fallbackHasta = liquidacion?.fechaHasta ? formatDate(liquidacion.fechaHasta) : '';
  const fallbackRange = fallbackDesde && fallbackHasta ? `${fallbackDesde} al ${fallbackHasta}` : 'Periodo calculado';

  if (!context) {
    return { title: fallbackRange, range: '' };
  }

  if (context.mode === 'mes') {
    const monthIndex = Number(context.mes) - 1;
    const monthLabel = MONTH_LABELS[monthIndex] || 'Mes';
    const yearLabel = context.anio || '';
    const desde = formatDate(context.fecha_desde);
    const hasta = formatDate(context.fecha_hasta);
    return {
      title: `${monthLabel} ${yearLabel}`.trim(),
      range: desde && hasta ? `${desde} al ${hasta}` : fallbackRange,
    };
  }

  const desde = formatDate(context.fecha_desde);
  const hasta = formatDate(context.fecha_hasta);
  return {
    title: desde && hasta ? `${desde} al ${hasta}` : fallbackRange,
    range: '',
  };
};

const buildSaveDescription = (context) => {
  if (!context) return null;
  if (context.mode === 'mes') {
    const monthName = (MONTH_LABELS[Number(context.mes) - 1] || 'Mes').toLowerCase();
    return `Liquidacion mensual ${monthName} ${context.anio}`;
  }
  return `Liquidacion del ${formatDate(context.fecha_desde)} al ${formatDate(context.fecha_hasta)}`;
};

const scrollToResumen = () => {
  if (typeof window === 'undefined') return;

  const doScroll = () => {
    const target = document.getElementById('panel-calculo');
    if (!target) return false;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  };

  // Run twice to cover render timing after async state updates.
  if (doScroll()) return;
  window.requestAnimationFrame(() => {
    if (doScroll()) return;
    window.setTimeout(() => {
      doScroll();
    }, 80);
  });
};

const validateFilters = (filters) => {
  if (!filters.empleado_id) return 'Selecciona un empleado para calcular la liquidacion';

  if (filters.modo_calculo === 'mes') {
    const year = Number(filters.anio);
    const month = Number(filters.mes);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) return 'Selecciona un año valido';
    if (!Number.isInteger(month) || month < 1 || month > 12) return 'Selecciona un mes valido';
    return null;
  }

  if (!filters.fecha_desde || !filters.fecha_hasta) return 'Selecciona fecha desde y fecha hasta';
  if (filters.fecha_desde > filters.fecha_hasta) return 'La fecha desde no puede ser mayor a la fecha hasta';
  return null;
};

const toInputDate = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (DATE_ONLY_PATTERN.test(trimmed)) return trimmed;
  }
  const date = toDateOnly(value);
  if (!date || Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export function LiquidacionesSection() {
  const {
    empleados,
    liquidacion,
    historial,
    loadingInicial,
    calculando,
    guardando,
    loadingHistorial,
    error,
    historialError,
    hasCalculatedData,
    setLiquidacion,
    cargarInicial,
    calcularLiquidacion,
    guardarLiquidacion,
    cargarHistorial,
    cargarDetalleLiquidacion,
  } = useLiquidaciones();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [calculationContext, setCalculationContext] = useState(null);
  const [loadingDetailId, setLoadingDetailId] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('asistencias');

  useEffect(() => {
    cargarInicial();
  }, [cargarInicial]);

  useEffect(() => {
    const handleGuardarDesdeHeader = async () => {
      if (!hasCalculatedData) {
        toast.error('Primero calcula una liquidacion para poder guardarla');
        return;
      }
      const description = buildSaveDescription(calculationContext);
      const response = await guardarLiquidacion(
        description
          ? { observaciones: description, descripcion: description, concepto: description }
          : {}
      );
      if (!response.success) {
        toast.error('No se pudo guardar la liquidacion', { description: response.error });
        return;
      }
      await cargarHistorial();
      toast.success('Liquidacion guardada');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(SAVE_EVENT_NAME, handleGuardarDesdeHeader);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(SAVE_EVENT_NAME, handleGuardarDesdeHeader);
      }
    };
  }, [calculationContext, cargarHistorial, guardarLiquidacion, hasCalculatedData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setLiquidacion(null);
    setCalculationContext(null);
  };

  const handleModeChange = (mode) => {
    setFilters((prev) => ({
      ...prev,
      modo_calculo: mode,
      anio: prev.anio || String(new Date().getFullYear()),
      mes: prev.mes || String(new Date().getMonth() + 1),
    }));
    setLiquidacion(null);
    setCalculationContext(null);
  };

  const handleCalcular = async () => {
    const validationError = validateFilters(filters);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const range = filters.modo_calculo === 'mes'
      ? getMonthRange(filters.anio, filters.mes)
      : {
          fecha_desde: filters.fecha_desde,
          fecha_hasta: filters.fecha_hasta,
        };

    if (!range?.fecha_desde || !range?.fecha_hasta) {
      toast.error('No se pudo construir un período válido para calcular');
      return;
    }

    const payloadFilters = {
      empleado_id: filters.empleado_id,
      fecha_desde: range.fecha_desde,
      fecha_hasta: range.fecha_hasta,
    };

    const response = await calcularLiquidacion(payloadFilters);
    if (!response.success) {
      toast.error('No se pudo calcular la liquidación', { description: response.error });
      return;
    }

    setCalculationContext({
      mode: filters.modo_calculo,
      anio: filters.anio,
      mes: filters.mes,
      fecha_desde: range.fecha_desde,
      fecha_hasta: range.fecha_hasta,
    });
    scrollToResumen();
    if (response.empty || response.data?.isEmpty) {
      toast.info('No hay datos para el período seleccionado');
    } else {
      toast.success('Liquidación calculada correctamente');
    }
  };

  const handleGuardar = async () => {
    if (!hasCalculatedData) {
      toast.error('No hay una liquidacion calculada para guardar');
      return;
    }
    if (liquidacion?.isGuardada) {
      toast.info('Esta liquidación ya esta guardada');
      return;
    }
    const description = buildSaveDescription(calculationContext);
    const response = await guardarLiquidacion(
      description
        ? { observaciones: description, descripcion: description, concepto: description }
        : {}
    );
    if (!response.success) {
      toast.error('No se pudo guardar la liquidación', { description: response.error });
      return;
    }
    await cargarHistorial();
    toast.success('Liquidación guardada');
  };

  const handleViewDetalle = async (row) => {
    if (!row?.id) return;
    setLoadingDetailId(row.id);
    const response = await cargarDetalleLiquidacion(row.id);
    if (!response.success) {
      toast.error('No se pudo cargar el detalle', { description: response.error });
      setLoadingDetailId(null);
      return;
    }

    const nextDesde = response.data.fechaDesde ? toInputDate(response.data.fechaDesde) : '';
    const nextHasta = response.data.fechaHasta ? toInputDate(response.data.fechaHasta) : '';
    const isMonthMode = isFullMonthRange(nextDesde, nextHasta);
    const fromDate = nextDesde ? toDateOnly(nextDesde) : null;

    setFilters({
      empleado_id: response.data.empleadoId || row.empleadoId || '',
      modo_calculo: isMonthMode ? 'mes' : 'rango',
      anio: fromDate ? String(fromDate.getFullYear()) : EMPTY_FILTERS.anio,
      mes: fromDate ? String(fromDate.getMonth() + 1) : EMPTY_FILTERS.mes,
      fecha_desde: nextDesde,
      fecha_hasta: nextHasta,
    });
    setCalculationContext({
      mode: isMonthMode ? 'mes' : 'rango',
      anio: fromDate ? String(fromDate.getFullYear()) : EMPTY_FILTERS.anio,
      mes: fromDate ? String(fromDate.getMonth() + 1) : EMPTY_FILTERS.mes,
      fecha_desde: nextDesde,
      fecha_hasta: nextHasta,
    });
    scrollToResumen();
    setLoadingDetailId(null);
    toast.success('Detalle de liquidación cargado');
  };

  const periodLabels = useMemo(
    () => buildPeriodLabels(calculationContext, liquidacion),
    [calculationContext, liquidacion]
  );
  const asistenciasRows = liquidacion?.asistencias || [];
  const movimientosRows = liquidacion?.movimientos || [];
  const hasAsistencias = asistenciasRows.length > 0;
  const hasMovimientos = movimientosRows.length > 0;
  const hasTechnicalDetail = hasAsistencias || hasMovimientos;

  useEffect(() => {
    if (!hasTechnicalDetail) {
      setActiveDetailTab('asistencias');
      return;
    }

    if (activeDetailTab === 'asistencias' && !hasAsistencias) {
      setActiveDetailTab('movimientos');
      return;
    }

    if (activeDetailTab === 'movimientos' && !hasMovimientos) {
      setActiveDetailTab('asistencias');
    }
  }, [activeDetailTab, hasAsistencias, hasMovimientos, hasTechnicalDetail]);

  if (loadingInicial) {
    return (
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LiquidacionFilters
        filters={filters}
        empleados={empleados}
        onChange={handleFilterChange}
        onModeChange={handleModeChange}
        onCalculate={handleCalcular}
        calculando={calculando}
      />

      {error ? (
        <EmpleadosFeedback type="error" message={error} />
      ) : null}

      {liquidacion ? (
        <>
          {liquidacion.isEmpty ? (
            <EmpleadosFeedback
              type="empty"
              message={`No se encontraron registros para ${periodLabels.title || 'el período seleccionado'}.`}
            />
          ) : (
            <>
              <LiquidacionSummary
                liquidacion={liquidacion}
                periodTitle={periodLabels.title}
                periodRangeLabel={periodLabels.range}
                ultimaAsistenciaLabel={liquidacion?.ultimaAsistenciaFecha ? formatDate(liquidacion.ultimaAsistenciaFecha) : ''}
                onGuardar={handleGuardar}
                guardando={guardando}
                canGuardar={!liquidacion.isGuardada}
              />
              {hasTechnicalDetail ? (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-slate-800">Detalle tecnico</CardTitle>
                    <p className="text-sm text-slate-500">
                      Navega el detalle de asistencias y movimientos de la liquidación actual.
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Tabs
                      value={activeDetailTab}
                      onValueChange={setActiveDetailTab}
                      className="w-full"
                    >
                      <TabsList className="mb-4 grid w-full grid-cols-1 gap-2 bg-slate-100 p-1 sm:grid-cols-2">
                        <TabsTrigger
                          value="asistencias"
                          disabled={!hasAsistencias}
                          className="data-[state=active]:bg-white data-[state=active]:text-slate-900"
                        >
                          Asistencias ({asistenciasRows.length})
                        </TabsTrigger>
                        <TabsTrigger
                          value="movimientos"
                          disabled={!hasMovimientos}
                          className="data-[state=active]:bg-white data-[state=active]:text-slate-900"
                        >
                          Movimientos ({movimientosRows.length})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="asistencias" className="mt-0">
                        <LiquidacionAsistenciasTable rows={asistenciasRows} />
                      </TabsContent>

                      <TabsContent value="movimientos" className="mt-0">
                        <LiquidacionMovimientosTable rows={movimientosRows} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="pt-6">
                    <EmpleadosFeedback
                      type="empty"
                      message="Esta liquidación no tiene detalle de asistencias ni movimientos para mostrar."
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      ) : (
        <EmpleadosFeedback
          type="empty"
          message="Ejecutá un cálculo para visualizar el resumen y los detalles de la liquidación"
        />
      )}

      <LiquidacionesHistoryTable
        rows={historial}
        loading={loadingHistorial}
        error={historialError}
        onRefresh={cargarHistorial}
        onViewDetail={handleViewDetalle}
        loadingDetailId={loadingDetailId}
      />
    </div>
  );
}
