import { useState, useEffect } from 'react';
import { Box, Carrot, Tag, Plus, CalendarRange } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Layout } from '../../components/layout/Layout';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArticulosTab } from '../../components/inventario/articulos/ArticulosTab';
import { IngredientesTab } from '../../components/inventario/ingredientes/IngredientesTab';
import { CategoriasTab } from '../../components/inventario/categorias/CategoriasTab';
import { AdicionalesTab } from '../../components/inventario/adicionales/AdicionalesTab';
import { StockSemanalTab } from '../../components/inventario/stock-semanal/StockSemanalTab';
import { useInventario } from '../../hooks/inventario/useInventario';

function InventarioContent() {
  const [activeTab, setActiveTab] = useState('articulos');

  // Hook de inventario - todas las funciones vienen de aquí
  const {
    // Artículos
    articulos,
    loadingArticulos,
    errorArticulos,
    metaArticulos,
    cargarArticulos,
    crearArticulo,
    editarArticulo,
    eliminarArticulo,
    obtenerArticuloPorId,
    obtenerCostoArticulo,
    isMutatingArticulos,
    // Categorías
    categorias,
    loadingCategorias,
    errorCategorias,
    cargarCategorias,
    crearCategoria,
    editarCategoria,
    eliminarCategoria,
    // Ingredientes
    ingredientes,
    ingredientesDisponibles,
    loadingIngredientes,
    errorIngredientes,
    metaIngredientes,
    cargarIngredientes,
    crearIngrediente,
    editarIngrediente,
    eliminarIngrediente,
    cargarIngredientesActivos,
    // Adicionales
    adicionales,
    adicionalesDisponibles,
    loadingAdicionales,
    errorAdicionales,
    metaAdicionales,
    cargarAdicionales,
    crearAdicional,
    editarAdicional,
    eliminarAdicional,
    cargarAdicionalesActivos,
    obtenerAdicionalesPorArticulo,
    asignarAdicionalesAArticulo,
    eliminarAdicionalDeArticulo,
    // Stock semanal — insumos
    insumosSemanales,
    loadingInsumosSemanales,
    errorInsumosSemanales,
    cargarInsumosSemanales,
    crearInsumoSemanal,
    editarInsumoSemanal,
    setActivoInsumoSemanal,
    eliminarInsumoSemanal,
    // Stock semanal — semana abierta
    semanaAbierta,
    loadingSemanaAbierta,
    errorSemanaAbierta,
    cargarSemanaAbierta,
    crearSemanaStock,
    actualizarStockInicialDetalle,
    actualizarStockFinalDetalle,
    cerrarSemanaStock,
    semanasHistorico,
    loadingSemanasHistorico,
    errorSemanasHistorico,
    cargarSemanasHistorico,
    obtenerSemanaStockPorId,
  } = useInventario();

  // Cargar datos iniciales
  useEffect(() => {
    cargarArticulos();
    cargarIngredientes();
    cargarIngredientesActivos();
    cargarCategorias();
    cargarAdicionales();
    cargarAdicionalesActivos();
  }, [cargarArticulos, cargarIngredientes, cargarIngredientesActivos, cargarCategorias, cargarAdicionales, cargarAdicionalesActivos]);

  useEffect(() => {
    if (activeTab === 'stock-semanal') {
      cargarInsumosSemanales();
      cargarSemanaAbierta();
      cargarSemanasHistorico();
    }
  }, [activeTab, cargarInsumosSemanales, cargarSemanaAbierta, cargarSemanasHistorico]);

  return (
    <Layout title="Inventario">
      <main className="main-content">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-slate-200">
          <h1 className="text-[2rem] font-semibold text-[#315e92] mb-2 flex items-center gap-2">
            📦Módulo Inventario
          </h1>
          <p className="text-slate-500 text-base">
            Administrá artículos, ingredientes, categorías, adicionales y stock semanal
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 mb-8 bg-transparent h-auto p-0">
            <TabsTrigger
              value="articulos"
              className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-medium shadow-sm hover:bg-slate-200 hover:text-slate-800 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:border-slate-300 data-[state=active]:shadow-md max-[400px]:w-[calc(50%-0.25rem)]"
            >
              <Box className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Artículos</span>
            </TabsTrigger>
            <TabsTrigger
              value="ingredientes"
              className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-medium shadow-sm hover:bg-slate-200 hover:text-slate-800 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:border-slate-300 data-[state=active]:shadow-md max-[400px]:w-[calc(50%-0.25rem)]"
            >
              <Carrot className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Ingredientes</span>
            </TabsTrigger>
            <TabsTrigger
              value="categorias"
              className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-medium shadow-sm hover:bg-slate-200 hover:text-slate-800 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:border-slate-300 data-[state=active]:shadow-md max-[400px]:w-[calc(50%-0.25rem)]"
            >
              <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Categorías</span>
            </TabsTrigger>

            <TabsTrigger
              value="adicionales"
              className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-medium shadow-sm hover:bg-slate-200 hover:text-slate-800 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:border-slate-300 data-[state=active]:shadow-md max-[400px]:w-[calc(50%-0.25rem)]"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Adicionales</span>
            </TabsTrigger>
            <TabsTrigger
              value="stock-semanal"
              className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-medium shadow-sm hover:bg-slate-200 hover:text-slate-800 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-slate-400 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:border-[#315e92]/35 data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-[#315e92]/15 max-[400px]:w-[calc(50%-0.25rem)]"
            >
              <CalendarRange className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Stock semanal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articulos" className="mt-0 bg-white rounded-xl p-8 shadow-sm border border-slate-200 min-h-[400px]">
            <ArticulosTab
              articulos={articulos}
              loadingArticulos={loadingArticulos}
              errorArticulos={errorArticulos}
              metaArticulos={metaArticulos}
              isMutatingArticulos={isMutatingArticulos}
              categorias={categorias}
              ingredientesDisponibles={ingredientesDisponibles}
              onCargarArticulos={cargarArticulos}
              onCrearArticulo={crearArticulo}
              onEditarArticulo={editarArticulo}
              onEliminarArticulo={eliminarArticulo}
              onObtenerArticuloPorId={obtenerArticuloPorId}
              onObtenerCostoArticulo={obtenerCostoArticulo}
            />
          </TabsContent>

          <TabsContent value="ingredientes" className="mt-0 bg-white rounded-xl p-8 shadow-sm border border-slate-200 min-h-[400px]">
            <IngredientesTab
              ingredientes={ingredientes}
              loadingIngredientes={loadingIngredientes}
              errorIngredientes={errorIngredientes}
              metaIngredientes={metaIngredientes}
              onCargarIngredientes={cargarIngredientes}
              onCrearIngrediente={crearIngrediente}
              onEditarIngrediente={editarIngrediente}
              onEliminarIngrediente={eliminarIngrediente}
            />
          </TabsContent>

          <TabsContent value="categorias" className="mt-0 bg-white rounded-xl p-8 shadow-sm border border-slate-200 min-h-[400px]">
            <CategoriasTab
              categorias={categorias}
              loadingCategorias={loadingCategorias}
              errorCategorias={errorCategorias}
              onCrearCategoria={crearCategoria}
              onEditarCategoria={editarCategoria}
              onEliminarCategoria={eliminarCategoria}
              articulos={articulos}
            />
          </TabsContent>

          <TabsContent value="adicionales" className="mt-0 bg-white rounded-xl p-8 shadow-sm border border-slate-200 min-h-[400px]">
            <AdicionalesTab
              adicionales={adicionales}
              loadingAdicionales={loadingAdicionales}
              errorAdicionales={errorAdicionales}
              metaAdicionales={metaAdicionales}
              onCargarAdicionales={cargarAdicionales}
              onCrearAdicional={crearAdicional}
              onEditarAdicional={editarAdicional}
              onEliminarAdicional={eliminarAdicional}
              articulos={articulos}
              onObtenerAdicionalesPorArticulo={obtenerAdicionalesPorArticulo}
              onAsignarAdicionalesAArticulo={asignarAdicionalesAArticulo}
            />
          </TabsContent>

          <TabsContent
            value="stock-semanal"
            className="mt-0 bg-white rounded-xl p-5 sm:p-8 shadow-sm border border-slate-200 min-h-[min(520px,85vh)]"
          >
            <StockSemanalTab
              semanaAbierta={semanaAbierta}
              loadingSemanaAbierta={loadingSemanaAbierta}
              errorSemanaAbierta={errorSemanaAbierta}
              onCargarSemanaAbierta={cargarSemanaAbierta}
              onCrearSemanaStock={crearSemanaStock}
              onActualizarStockInicialDetalle={actualizarStockInicialDetalle}
              onActualizarStockFinalDetalle={actualizarStockFinalDetalle}
              onCerrarSemana={cerrarSemanaStock}
              semanasHistorico={semanasHistorico}
              loadingSemanasHistorico={loadingSemanasHistorico}
              errorSemanasHistorico={errorSemanasHistorico}
              onCargarSemanasHistorico={cargarSemanasHistorico}
              onObtenerSemanaStockPorId={obtenerSemanaStockPorId}
              insumosSemanales={insumosSemanales}
              loadingInsumosSemanales={loadingInsumosSemanales}
              errorInsumosSemanales={errorInsumosSemanales}
              onCargarInsumosSemanales={cargarInsumosSemanales}
              onCrearInsumoSemanal={crearInsumoSemanal}
              onEditarInsumoSemanal={editarInsumoSemanal}
              onSetActivoInsumoSemanal={setActivoInsumoSemanal}
              onEliminarInsumoSemanal={eliminarInsumoSemanal}
            />
          </TabsContent>
        </Tabs>
      </main>
    </Layout>
  );
}

export default function InventarioPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <InventarioContent />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
