import { useState } from 'react';
import { CalendarRange, AlertCircle, CalendarPlus, Loader2, History } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CrearSemanaModal } from './CrearSemanaModal';
import { EditarDetalleStockModal } from './EditarDetalleStockModal';
import { SemanaActualDetalleTable } from './SemanaActualDetalleTable';
import { SemanaActualDetalleCard } from './SemanaActualDetalleCard';
import { toast } from '@/hooks/use-toast';
import { clearFieldError, hasErrors } from '@/lib/form-errors';
import { formatDateShort, getDetalleId, getStockFinalDetalle, getStockInicialDetalle, isSemanaAbierta } from './semanaActualUtils';

const emptyCrearForm = () => ({
  fecha_inicio: '',
  fecha_fin: '',
  observaciones: '',
});

function validateCrearSemana(form) {
  const e = {};
  if (!form.fecha_inicio?.trim()) e.fecha_inicio = 'La fecha de inicio es obligatoria';
  if (!form.fecha_fin?.trim()) e.fecha_fin = 'La fecha de fin es obligatoria';
  if (form.fecha_inicio && form.fecha_fin && form.fecha_fin < form.fecha_inicio) {
    e.fecha_fin = 'La fecha fin debe ser igual o posterior al inicio';
  }
  return e;
}

function parseStockInput(str) {
  const t = (str ?? '').trim();
  if (t === '') return { ok: true, value: undefined };
  const n = Number(t);
  if (!Number.isFinite(n)) return { ok: false, error: 'Valor numérico inválido' };
  if (!Number.isInteger(n) || n < 0) {
    return { ok: false, error: 'Usá un entero mayor o igual a 0 (sin decimales)' };
  }
  return { ok: true, value: n };
}

function normalizeObservacion(value) {
  const t = String(value ?? '').trim();
  return t === '' ? null : t;
}

function getErroresStockTiempoReal({ stockIniStr, stockFinStr, detalle }) {
  const nextErr = {};

  const iniParsed = parseStockInput(stockIniStr);
  const finParsed = parseStockInput(stockFinStr);

  if (!iniParsed.ok) {
    nextErr.stock_inicial = iniParsed.error;
  } else if (iniParsed.value === 0) {
    nextErr.stock_inicial = 'El stock inicial debe ser mayor a 0';
  }

  if (!finParsed.ok) nextErr.stock_final = finParsed.error;

  if (!nextErr.stock_final && finParsed.ok && finParsed.value !== undefined) {
    const stockInicialActual = getStockInicialDetalle(detalle);
    const stockInicialEvaluado = iniParsed.value !== undefined ? iniParsed.value : stockInicialActual;
    if (stockInicialEvaluado !== null && stockInicialEvaluado !== undefined && finParsed.value > stockInicialEvaluado) {
      nextErr.stock_final = 'El stock final no puede ser mayor al stock inicial';
    }
  }

  return nextErr;
}

function ProgressRow({ label, value, total }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const safePercentage = Math.max(0, Math.min(100, percentage));

  let barColorClass = 'bg-blue-500';
  if (label === 'Stock final cargado') {
    barColorClass = 'bg-blue-500';
  }
  if (label === 'Completos para cierre') {
    barColorClass = total > 0 && value === total ? 'bg-green-500' : 'bg-slate-400';
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-slate-800">
          {value} / {total}
        </span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
          style={{ width: `${safePercentage}%` }}
        />
      </div>
    </div>
  );
}

export function SemanaActualSection({
  semanaAbierta,
  loadingSemanaAbierta,
  errorSemanaAbierta,
  onCargarSemanaAbierta,
  onCrearSemanaStock,
  onActualizarStockInicialDetalle,
  onActualizarStockFinalDetalle,
  onCerrarSemana,
  onIrHistorico,
}) {
  const [modalCrear, setModalCrear] = useState(false);
  const [formCrear, setFormCrear] = useState(emptyCrearForm);
  const [errorsCrear, setErrorsCrear] = useState({});
  const [loadingCrear, setLoadingCrear] = useState(false);

  const [detalleEditando, setDetalleEditando] = useState(null);
  const [stockIniStr, setStockIniStr] = useState('');
  const [stockFinStr, setStockFinStr] = useState('');
  const [observacionesDetalleStr, setObservacionesDetalleStr] = useState('');
  const [errorsStock, setErrorsStock] = useState({});
  const [loadingStock, setLoadingStock] = useState(false);

  const [modalCerrarSemana, setModalCerrarSemana] = useState(false);
  const [loadingCerrarSemana, setLoadingCerrarSemana] = useState(false);

  const primeraCarga = semanaAbierta === undefined;
  const haySemana = semanaAbierta != null && typeof semanaAbierta === 'object';
  const detalles = haySemana
    ? Array.isArray(semanaAbierta.detalles)
      ? semanaAbierta.detalles
      : Array.isArray(semanaAbierta.detalle)
        ? semanaAbierta.detalle
        : []
    : [];
  const semanaEditable = haySemana && isSemanaAbierta(semanaAbierta.estado);
  const haySemanaActiva = semanaEditable;

  const detallesConInicial = detalles.filter((d) => getStockInicialDetalle(d) !== null).length;
  const detallesConFinal = detalles.filter((d) => getStockFinalDetalle(d) !== null).length;
  const detallesCompletos = detalles.filter(
    (d) => getStockInicialDetalle(d) !== null && getStockFinalDetalle(d) !== null
  ).length;
  const todosCompletos = detalles.length > 0 && detallesCompletos === detalles.length;
  const puedeCerrarSemana = semanaEditable && todosCompletos && !loadingCerrarSemana;
  const disableGuardarStock = loadingStock || hasErrors(errorsStock);
  const stockInicialActualEditado = detalleEditando ? getStockInicialDetalle(detalleEditando) : null;
  const stockInicialEvaluadoParaMax =
    stockIniStr.trim() !== '' && Number.isFinite(Number(stockIniStr)) ? Number(stockIniStr) : stockInicialActualEditado;
  const maxStockFinal =
    stockInicialEvaluadoParaMax !== null &&
    stockInicialEvaluadoParaMax !== undefined &&
    Number.isInteger(stockInicialEvaluadoParaMax) &&
    stockInicialEvaluadoParaMax >= 0
      ? stockInicialEvaluadoParaMax
      : undefined;

  const abrirCrear = () => {
    setFormCrear(emptyCrearForm());
    setErrorsCrear({});
    setModalCrear(true);
  };

  const abrirEditarDetalle = (detalle) => {
    setDetalleEditando(detalle);
    const si = getStockInicialDetalle(detalle);
    const sf = getStockFinalDetalle(detalle);
    setStockIniStr(si !== null ? String(si) : '');
    setStockFinStr(sf !== null ? String(sf) : '');
    setObservacionesDetalleStr(detalle?.observaciones ?? '');
    setErrorsStock({});
  };

  const cerrarEditar = (open) => {
    if (!open && !loadingStock) {
      setDetalleEditando(null);
      setStockIniStr('');
      setStockFinStr('');
      setObservacionesDetalleStr('');
      setErrorsStock({});
    }
  };

  const handleCrearSubmit = async () => {
    const v = validateCrearSemana(formCrear);
    setErrorsCrear(v);
    if (hasErrors(v)) {
      toast.error(Object.values(v)[0]);
      return;
    }

    const obs = (formCrear.observaciones || '').trim();
    setLoadingCrear(true);
    try {
      const res = await onCrearSemanaStock({
        fecha_inicio: formCrear.fecha_inicio.trim(),
        fecha_fin: formCrear.fecha_fin.trim(),
        observaciones: obs ? obs : null,
      });
      if (res.success) {
        toast.success(res.mensaje || 'Semana creada correctamente');
        setModalCrear(false);
        setFormCrear(emptyCrearForm());
      } else {
        toast.error(res.error || 'No se pudo crear la semana');
      }
    } catch {
      toast.error('Error al crear la semana');
    } finally {
      setLoadingCrear(false);
    }
  };

  const handleGuardarStocks = async () => {
    if (!detalleEditando || !haySemana) return;

    const semanaId = semanaAbierta.id;
    const detalleId = getDetalleId(detalleEditando);
    if (!semanaId || !detalleId) {
      toast.error('No se pudo identificar la fila a actualizar');
      return;
    }

    const iniParsed = parseStockInput(stockIniStr);
    const finParsed = parseStockInput(stockFinStr);
    const nextErr = getErroresStockTiempoReal({
      stockIniStr,
      stockFinStr,
      detalle: detalleEditando,
    });
    setErrorsStock(nextErr);
    if (hasErrors(nextErr)) {
      const primerError = nextErr.stock_final || nextErr.stock_inicial || 'Revisá los valores ingresados';
      toast.error(primerError);
      return;
    }

    const currIni = getStockInicialDetalle(detalleEditando);
    const currFin = getStockFinalDetalle(detalleEditando);
    const currObs = normalizeObservacion(detalleEditando.observaciones);
    const nextObs = normalizeObservacion(observacionesDetalleStr);

    const quiereIni = stockIniStr.trim() !== '';
    const quiereFin = stockFinStr.trim() !== '';

    if (!quiereIni && !quiereFin) {
      toast.error('Ingresá stock inicial o final para actualizar');
      return;
    }

    let cambiaIni = false;
    let cambiaFin = false;
    const cambiaObs = currObs !== nextObs;
    let valorIni;
    let valorFin;

    if (quiereIni) {
      valorIni = iniParsed.value;
      cambiaIni = currIni !== valorIni;
    }
    if (quiereFin) {
      valorFin = finParsed.value;
      cambiaFin = currFin !== valorFin;
    }

    if (!cambiaIni && !cambiaFin && !cambiaObs) {
      toast.info('No hay cambios respecto a los valores actuales');
      return;
    }

    setLoadingStock(true);
    try {
      if (cambiaIni) {
        const r1 = await onActualizarStockInicialDetalle(semanaId, detalleId, valorIni, cambiaObs ? nextObs : undefined);
        if (!r1.success) {
          toast.error(r1.error || 'No se pudo actualizar el stock inicial');
          return;
        }
      }
      if (cambiaFin) {
        const r2 = await onActualizarStockFinalDetalle(semanaId, detalleId, valorFin, cambiaObs ? nextObs : undefined);
        if (!r2.success) {
          toast.error(r2.error || 'No se pudo actualizar el stock final');
          return;
        }
      }
      if (!cambiaIni && !cambiaFin && cambiaObs) {
        const r3 = await onActualizarStockInicialDetalle(semanaId, detalleId, undefined, nextObs);
        if (!r3.success) {
          toast.error(r3.error || 'No se pudieron actualizar las observaciones');
          return;
        }
      }
      toast.success('Stock actualizado');
      setStockIniStr('');
      setStockFinStr('');
      setObservacionesDetalleStr('');
      setErrorsStock({});
      setDetalleEditando(null);
    } catch {
      toast.error('Error al guardar');
    } finally {
      setLoadingStock(false);
    }
  };

  if (primeraCarga && loadingSemanaAbierta) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#315e92]" />
        <p className="text-muted-foreground text-sm">Cargando semana actual...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {loadingSemanaAbierta && !primeraCarga ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px]"
          aria-busy="true"
        >
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 shadow-sm text-sm text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin text-[#315e92]" />
            Actualizando...
          </div>
        </div>
      ) : null}

      {errorSemanaAbierta ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span>{errorSemanaAbierta}</span>
            <Button type="button" size="sm" variant="outline" onClick={() => onCargarSemanaAbierta()}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Semana actual</h3>
            {haySemanaActiva ? (
              <Badge variant="outline" className="text-slate-800 border-slate-300">
                Abierta
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground mt-1 text-center sm:text-left">Gestioná la semana activa de stock</p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0 justify-center sm:justify-start w-full sm:w-auto">
          {!haySemanaActiva ? (
            <Button type="button" onClick={abrirCrear} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
              <CalendarPlus className="h-4 w-4" />
              Crear nueva semana
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => onCargarSemanaAbierta()}>
                Refrescar
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setModalCerrarSemana(true)}
                disabled={!puedeCerrarSemana}
                title={
                  !todosCompletos
                    ? 'Completá stock inicial y final en todos los insumos para cerrar la semana'
                    : undefined
                }
              >
                Cerrar semana
              </Button>
            </>
          )}
        </div>
      </div>

      {!haySemanaActiva && !errorSemanaAbierta ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 p-10 text-center space-y-3">
          <p className="text-base font-semibold text-slate-900">No hay una semana activa en este momento.</p>
          <p className="text-sm text-muted-foreground">Creá una nueva semana para comenzar a cargar stock.</p>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="gap-1 text-slate-700"
            onClick={() => {
              if (onIrHistorico) {
                onIrHistorico();
              } else {
                document
                  .getElementById('stock-semanal-historico-heading')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          >
            <History className="h-3.5 w-3.5" />
            Ir al histórico
          </Button>
        </div>
      ) : null}

      {haySemanaActiva ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Período</p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {formatDateShort(semanaAbierta.fecha_inicio)} - {formatDateShort(semanaAbierta.fecha_fin)}
              </p>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mt-3">Observaciones</p>
              <p className="text-sm text-slate-800 mt-1 line-clamp-3">
                {semanaAbierta.observaciones?.trim() ? semanaAbierta.observaciones : 'Sin observaciones'}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Estado de carga</p>
              <div className="mt-2 space-y-3">
                <ProgressRow label="Stock inicial cargado" value={detallesConInicial} total={detalles.length} />
                <ProgressRow label="Stock final cargado" value={detallesConFinal} total={detalles.length} />
                <ProgressRow
                  label="Completos para cierre"
                  value={detallesCompletos}
                  total={detalles.length}
                />
              </div>
            </div>
          </div>

          <div className="mt-2 space-y-3">
            <p className="text-sm text-muted-foreground">Completá el stock inicial y final por insumo</p>
            {detalles.length === 0 ? (
              <Alert>
                <AlertDescription>
                  La semana está abierta pero no tiene líneas de detalle. Verificá que existan insumos activos en la
                  sección «Insumos semanales» y refrescá. Si acabás de crear la semana sin insumos activos, creá una
                  nueva semana luego de activar insumos.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <SemanaActualDetalleTable
                  detalles={detalles}
                  onEditarDetalle={abrirEditarDetalle}
                  edicionHabilitada={semanaEditable}
                />
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detalles.map((d) => (
                    <SemanaActualDetalleCard
                      key={getDetalleId(d) ?? JSON.stringify(d)}
                      detalle={d}
                      onEditarDetalle={abrirEditarDetalle}
                      edicionHabilitada={semanaEditable}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      <CrearSemanaModal
        open={modalCrear}
        onOpenChange={(o) => {
          if (!o && !loadingCrear) {
            setModalCrear(false);
            setFormCrear(emptyCrearForm());
            setErrorsCrear({});
          }
        }}
        formulario={formCrear}
        onFieldChange={(campo, valor) => {
          setFormCrear((prev) => ({ ...prev, [campo]: valor }));
          setErrorsCrear((prev) => clearFieldError(prev, campo));
        }}
        errors={errorsCrear}
        onSubmit={handleCrearSubmit}
        loading={loadingCrear}
      />

      <AlertDialog
        open={modalCerrarSemana}
        onOpenChange={(open) => {
          if (!open && loadingCerrarSemana) return;
          setModalCerrarSemana(open);
        }}
      >
        <AlertDialogContent className="w-[calc(100vw-0.75rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar esta semana?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Vas a cerrar la semana del{' '}
                  <strong className="text-slate-900">{formatDateShort(semanaAbierta?.fecha_inicio)}</strong> al{' '}
                  <strong className="text-slate-900">{formatDateShort(semanaAbierta?.fecha_fin)}</strong>.
                </p>
                <p>
                  Quedará en estado <strong className="text-slate-900">Cerrada</strong>, dejará de poder editarse el
                  stock inicial y final, y pasará al <strong className="text-slate-900">histórico</strong> de semanas.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingCerrarSemana}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={loadingCerrarSemana || !semanaAbierta?.id}
              onClick={async (e) => {
                e.preventDefault();
                if (!onCerrarSemana || !semanaAbierta?.id) return;
                setLoadingCerrarSemana(true);
                try {
                  const res = await onCerrarSemana(semanaAbierta.id);
                  if (res.success) {
                    toast.success(res.mensaje || 'Semana cerrada correctamente');
                    setModalCerrarSemana(false);
                  } else {
                    toast.error(res.error || 'No se pudo cerrar la semana');
                  }
                } catch {
                  toast.error('Error al cerrar la semana');
                } finally {
                  setLoadingCerrarSemana(false);
                }
              }}
            >
              {loadingCerrarSemana ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cerrando...
                </span>
              ) : (
                'Cerrar semana'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditarDetalleStockModal
        open={Boolean(detalleEditando)}
        onOpenChange={cerrarEditar}
        detalle={detalleEditando}
        stockInicialInput={stockIniStr}
        stockFinalInput={stockFinStr}
        observacionesInput={observacionesDetalleStr}
        onStockInicialChange={(v) => {
          setStockIniStr(v);
          const nextErrors = getErroresStockTiempoReal({
            stockIniStr: v,
            stockFinStr,
            detalle: detalleEditando,
          });
          setErrorsStock((prev) => {
            const base = clearFieldError(clearFieldError(prev, 'stock_inicial'), 'stock_final');
            return { ...base, ...nextErrors };
          });
        }}
        onStockFinalChange={(v) => {
          setStockFinStr(v);
          const nextErrors = getErroresStockTiempoReal({
            stockIniStr,
            stockFinStr: v,
            detalle: detalleEditando,
          });
          setErrorsStock((prev) => {
            const base = clearFieldError(clearFieldError(prev, 'stock_inicial'), 'stock_final');
            return { ...base, ...nextErrors };
          });
        }}
        onObservacionesChange={setObservacionesDetalleStr}
        stockFinalMax={maxStockFinal}
        errors={errorsStock}
        onSubmit={handleGuardarStocks}
        loading={loadingStock}
        disableSubmit={disableGuardarStock}
      />
    </div>
  );
}
