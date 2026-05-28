import { useState, useEffect } from 'react';
import { TrendingDown, Tag, Wallet } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Layout } from '../../components/layout/Layout';
import { ModuleHeader } from '../../components/layout/ModuleHeader';
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
            <div className="main-content">
                <ModuleHeader
                    title="Gastos"
                    description="Registrá y controlá los egresos económicos del negocio."
                    icon={Wallet}
                />

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 mb-8 bg-transparent h-auto p-0">
                        <TabsTrigger
                            value="gastos"
                            className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-2 rounded-lg border border-border bg-muted text-muted-foreground font-medium shadow-sm hover:bg-accent hover:text-foreground transition-all duration-200 focus-visible:ring-2 focus-visible:ring-slate-400 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:border-border data-[state=active]:shadow-md max-[400px]:w-[calc(50%-0.25rem)]"
                        >
                            <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-sm sm:text-base">Gastos</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="categorias"
                            className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-2 rounded-lg border border-border bg-muted text-muted-foreground font-medium shadow-sm hover:bg-accent hover:text-foreground transition-all duration-200 focus-visible:ring-2 focus-visible:ring-slate-400 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:border-border data-[state=active]:shadow-md max-[400px]:w-[calc(50%-0.25rem)]"
                        >
                            <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-sm sm:text-base">Categorías</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="gastos" className="mt-0 bg-card rounded-xl p-8 shadow-sm border border-border min-h-[400px]">
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

                    <TabsContent value="categorias" className="mt-0 bg-card rounded-xl p-8 shadow-sm border border-border min-h-[400px]">
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
            </div>
        </Layout>
    );
}

export default function GastosPage() {
    return (
        <ErrorBoundary>
            <ProtectedRoute module="gastos">
                <GastosContent />
            </ProtectedRoute>
        </ErrorBoundary>
    );
}

