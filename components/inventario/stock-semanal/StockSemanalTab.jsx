import { useState } from 'react';
import { CalendarRange, ChevronDown, ClipboardList, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InsumosSemanalesSection } from './InsumosSemanalesSection';
import { SemanaActualSection } from './SemanaActualSection';
import { SemanasHistoricoSection } from './SemanasHistoricoSection';

/**
 * Tab Stock semanal: secciones de semana, insumos e histórico.
 */
export function StockSemanalTab({
  semanaAbierta,
  loadingSemanaAbierta = false,
  errorSemanaAbierta = null,
  onCargarSemanaAbierta,
  onCrearSemanaStock,
  onActualizarStockInicialDetalle,
  onActualizarStockFinalDetalle,
  onCerrarSemana,
  semanasHistorico,
  loadingSemanasHistorico = false,
  errorSemanasHistorico = null,
  onCargarSemanasHistorico,
  onObtenerSemanaStockPorId,
  insumosSemanales = [],
  loadingInsumosSemanales = false,
  errorInsumosSemanales = null,
  onCargarInsumosSemanales,
  onCrearInsumoSemanal,
  onEditarInsumoSemanal,
  onSetActivoInsumoSemanal,
  onEliminarInsumoSemanal,
}) {
  const [insumosExpanded, setInsumosExpanded] = useState(false);
  const [historicoExpanded, setHistoricoExpanded] = useState(false);
  const handleIrHistorico = () => {
    setHistoricoExpanded(true);
    window.setTimeout(() => {
      document.getElementById('stock-semanal-historico-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 220);
  };

  return (
    <div className="space-y-10">
      <header className="border-b border-border pb-6">
        <div className="flex items-center gap-2 text-foreground">
          <CalendarRange className="h-5 w-5 shrink-0 text-blue-700" aria-hidden />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Stock semanal</h2>
        </div>
        <p className="text-muted-foreground mt-1 max-w-2xl leading-relaxed">
          Gestión de stock semanal, insumos e histórico.
        </p>
      </header>

      {/* 1. Semana actual — bloque principal */}
      <section aria-labelledby="stock-semanal-semana-actual-heading">
        <Card className="border border-border shadow-sm rounded-xl">
          <CardContent className="p-5 sm:p-6">
            <SemanaActualSection
              semanaAbierta={semanaAbierta}
              loadingSemanaAbierta={loadingSemanaAbierta}
              errorSemanaAbierta={errorSemanaAbierta}
              onCargarSemanaAbierta={onCargarSemanaAbierta}
              onCrearSemanaStock={onCrearSemanaStock}
              onActualizarStockInicialDetalle={onActualizarStockInicialDetalle}
              onActualizarStockFinalDetalle={onActualizarStockFinalDetalle}
              onCerrarSemana={onCerrarSemana}
              onIrHistorico={handleIrHistorico}
            />
          </CardContent>
        </Card>
      </section>

      {/* 2. Configuración de insumos */}
      <section aria-labelledby="stock-semanal-insumos-heading">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 border-b border-border/80">
            <div className="flex items-center justify-between gap-3">
              <CardTitle
                id="stock-semanal-insumos-heading"
                className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2"
              >
                <ClipboardList className="h-5 w-5 text-blue-700 shrink-0" aria-hidden />
                Insumos semanales
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={insumosExpanded ? 'Cerrar sección de insumos semanales' : 'Abrir sección de insumos semanales'}
                aria-expanded={insumosExpanded}
                onClick={() => setInsumosExpanded((v) => !v)}
                className="h-8 w-8 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ChevronDown
                  className={`h-5 w-5 transition-transform duration-200 ${insumosExpanded ? '' : '-rotate-90'}`}
                />
              </Button>
            </div>
            {insumosExpanded ? <CardDescription className="text-muted-foreground mt-1">Catálogo de insumos semanales.</CardDescription> : null}
          </CardHeader>
          <div
            className="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
            style={{ gridTemplateRows: insumosExpanded ? '1fr' : '0fr', opacity: insumosExpanded ? 1 : 0 }}
          >
            <div className="overflow-hidden">
              <CardContent className="pt-6">
                <InsumosSemanalesSection
                  insumosSemanales={insumosSemanales}
                  loadingInsumosSemanales={loadingInsumosSemanales}
                  errorInsumosSemanales={errorInsumosSemanales}
                  onCargarInsumosSemanales={onCargarInsumosSemanales}
                  onCrearInsumoSemanal={onCrearInsumoSemanal}
                  onEditarInsumoSemanal={onEditarInsumoSemanal}
                  onSetActivoInsumoSemanal={onSetActivoInsumoSemanal}
                  onEliminarInsumoSemanal={onEliminarInsumoSemanal}
                />
              </CardContent>
            </div>
          </div>
        </Card>
      </section>

      {/* 3. Histórico */}
      <section id="stock-semanal-historico-section" aria-labelledby="stock-semanal-historico-heading">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 border-b border-border/80">
            <div className="flex items-center justify-between gap-3">
              <CardTitle
                id="stock-semanal-historico-heading"
                className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2"
              >
                <History className="h-5 w-5 text-blue-700 shrink-0" aria-hidden />
                Listado de semanas histórico
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={historicoExpanded ? 'Cerrar sección de histórico' : 'Abrir sección de histórico'}
                aria-expanded={historicoExpanded}
                onClick={() => setHistoricoExpanded((v) => !v)}
                className="h-8 w-8 rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ChevronDown
                  className={`h-5 w-5 transition-transform duration-200 ${historicoExpanded ? '' : '-rotate-90'}`}
                />
              </Button>
            </div>
            {historicoExpanded ? (
              <CardDescription className="text-muted-foreground mt-1">
                Listado de semanas cerradas; abrí el detalle para ver consumo y stocks por insumo.
              </CardDescription>
            ) : null}
          </CardHeader>
          <div
            className="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
            style={{ gridTemplateRows: historicoExpanded ? '1fr' : '0fr', opacity: historicoExpanded ? 1 : 0 }}
          >
            <div className="overflow-hidden">
              <CardContent className="pt-6">
                <SemanasHistoricoSection
                  data={semanasHistorico}
                  loading={loadingSemanasHistorico}
                  error={errorSemanasHistorico}
                  onRefrescar={onCargarSemanasHistorico}
                  onObtenerSemanaPorId={onObtenerSemanaStockPorId}
                />
              </CardContent>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
