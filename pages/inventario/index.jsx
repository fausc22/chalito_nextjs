import { useState, useEffect } from 'react';
import { Box, Carrot, Tag, Plus } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Layout } from '../../components/layout/Layout';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArticulosTab } from '../../components/inventario/articulos/ArticulosTab';
import { IngredientesTab } from '../../components/inventario/ingredientes/IngredientesTab';
import { CategoriasTab } from '../../components/inventario/categorias/CategoriasTab';
import { AdicionalesTab } from '../../components/inventario/adicionales/AdicionalesTab';
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
    eliminarAdicionalDeArticulo
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

  return (
    <Layout title="Inventario">
      <main className="main-content">
        {/* Header */}
        <div className="mb-8 pb-6 border-b-2 border-slate-200">
          <h1 className="text-[2rem] font-semibold text-[#315e92] mb-2 flex items-center gap-2">
            📦Módulo Inventario
          </h1>
          <p className="text-slate-500 text-base">
            Administrá artículos, ingredientes, categorías y adicionales
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 mb-8 bg-transparent h-auto p-0">
            <TabsTrigger
              value="articulos"
              className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-2 bg-blue-500 !text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg hover:scale-105 data-[state=active]:bg-blue-700 data-[state=active]:!text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200 max-[400px]:w-[calc(50%-0.25rem)]"
            >
              <Box className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Artículos</span>
            </TabsTrigger>
            <TabsTrigger
              value="ingredientes"
              className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-2 bg-green-500 !text-white font-semibold rounded-lg shadow-md hover:bg-green-600 hover:shadow-lg hover:scale-105 data-[state=active]:bg-green-700 data-[state=active]:!text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200 max-[400px]:w-[calc(50%-0.25rem)]"
            >
              <Carrot className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Ingredientes</span>
            </TabsTrigger>
            <TabsTrigger
              value="categorias"
              className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-2 bg-orange-500 !text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 hover:shadow-lg hover:scale-105 data-[state=active]:bg-orange-700 data-[state=active]:!text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200 max-[400px]:w-[calc(50%-0.25rem)]"
            >
              <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Categorías</span>
            </TabsTrigger>

            <TabsTrigger
              value="adicionales"
              className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-2 bg-purple-500 !text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 hover:shadow-lg hover:scale-105 data-[state=active]:bg-purple-700 data-[state=active]:!text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200 max-[400px]:w-[calc(50%-0.25rem)]"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Adicionales</span>
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
