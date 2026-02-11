import { useState, useEffect } from 'react';
import { TrendingDown, Tag } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Layout } from '../../components/layout/Layout';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GastosTab } from '../../components/gastos/GastosTab';
import { CategoriasGastosTab } from '../../components/gastos/CategoriasGastosTab';
import { useGastos } from '../../hooks/gastos/useGastos';

function GastosContent() {
    const [activeTab, setActiveTab] = useState('gastos');

    // Hook de gastos
    const {
        // Gastos
        gastos,
        loadingGastos,
        errorGastos,
        metaGastos,
        isMutatingGastos,
        cargarGastos,
        crearGasto,
        editarGasto,
        eliminarGasto,
        obtenerGastoPorId,
        
        // Categorías
        categorias,
        loadingCategorias,
        errorCategorias,
        cargarCategorias,
        crearCategoria,
        editarCategoria,
        eliminarCategoria,
        
        // Cuentas
        cuentas,
        cargarCuentas
    } = useGastos();

    // Cargar datos iniciales
    useEffect(() => {
        cargarGastos();
        cargarCategorias();
        cargarCuentas();
    }, [cargarGastos, cargarCategorias, cargarCuentas]);

    return (
        <Layout title="Gastos">
            <main className="main-content">
                {/* Header */}
                <div className="mb-8 pb-6 border-b-2 border-slate-200">
                    <h1 className="text-[2rem] font-semibold text-[#315e92] mb-2 flex items-center gap-2">
                        💸 Módulo de Gastos
                    </h1>
                    <p className="text-slate-500 text-base">
                        Registra y controla los egresos económicos del negocio
                    </p>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 mb-8 bg-transparent h-auto p-0">
                        <TabsTrigger
                            value="gastos"
                            className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-2 bg-red-500 !text-white font-semibold rounded-lg shadow-md hover:bg-red-600 hover:shadow-lg hover:scale-105 data-[state=active]:bg-red-700 data-[state=active]:!text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200"
                        >
                            <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-sm sm:text-base">Gastos</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="categorias"
                            className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-2 bg-amber-500 !text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 hover:shadow-lg hover:scale-105 data-[state=active]:bg-amber-700 data-[state=active]:!text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200"
                        >
                            <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-sm sm:text-base">Categorías</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="gastos" className="mt-0 bg-white rounded-xl p-8 shadow-sm border border-slate-200 min-h-[400px]">
                        <GastosTab
                            gastos={gastos}
                            loadingGastos={loadingGastos}
                            errorGastos={errorGastos}
                            metaGastos={metaGastos}
                            isMutatingGastos={isMutatingGastos}
                            categorias={categorias}
                            cuentas={cuentas}
                            onCargarGastos={cargarGastos}
                            onCrearGasto={crearGasto}
                            onEditarGasto={editarGasto}
                            onEliminarGasto={eliminarGasto}
                            onObtenerGastoPorId={obtenerGastoPorId}
                        />
                    </TabsContent>

                    <TabsContent value="categorias" className="mt-0 bg-white rounded-xl p-8 shadow-sm border border-slate-200 min-h-[400px]">
                        <CategoriasGastosTab
                            categorias={categorias}
                            loadingCategorias={loadingCategorias}
                            errorCategorias={errorCategorias}
                            onCrearCategoria={crearCategoria}
                            onEditarCategoria={editarCategoria}
                            onEliminarCategoria={eliminarCategoria}
                        />
                    </TabsContent>
                </Tabs>
            </main>
        </Layout>
    );
}

export default function GastosPage() {
    return (
        <ErrorBoundary>
            <ProtectedRoute>
                <GastosContent />
            </ProtectedRoute>
        </ErrorBoundary>
    );
}

