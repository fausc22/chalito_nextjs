import { useState, useEffect } from 'react';
import { Wallet, History } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Layout } from '../../components/layout/Layout';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CuentasTab } from '../../components/fondos/CuentasTab';
import { HistorialTab } from '../../components/fondos/HistorialTab';
import { useFondos } from '../../hooks/fondos/useFondos';

function FondosContent() {
    const [activeTab, setActiveTab] = useState('cuentas');

    // Hook de fondos
    const {
        // Cuentas
        cuentas,
        loadingCuentas,
        errorCuentas,
        metaCuentas,
        isMutatingCuentas,
        cargarCuentas,
        crearCuenta,
        actualizarCuenta,
        eliminarCuenta,
        
        // Movimientos
        registrarMovimiento,
        
        // Historial
        historial,
        loadingHistorial,
        errorHistorial,
        metaHistorial,
        cargarHistorial
    } = useFondos();

    // Cargar datos iniciales
    useEffect(() => {
        cargarCuentas();
    }, [cargarCuentas]);

    return (
        <Layout title="Fondos">
            <main className="main-content">
                {/* Header */}
                <div className="mb-8 pb-6 border-b-2 border-slate-200">
                    <h1 className="text-[2rem] font-semibold text-[#315e92] mb-2 flex items-center gap-2">
                        💰 Módulo de Fondos
                    </h1>
                    <p className="text-slate-500 text-base">
                        Gestiona cuentas, movimientos y balances del negocio
                    </p>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 mb-8 bg-transparent h-auto p-0">
                        <TabsTrigger
                            value="cuentas"
                            className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-2 bg-teal-500 !text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 hover:shadow-lg hover:scale-105 data-[state=active]:bg-teal-700 data-[state=active]:!text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200"
                        >
                            <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-sm sm:text-base">Cuentas y Saldos</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="historial"
                            className="flex items-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-2 bg-indigo-500 !text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 hover:shadow-lg hover:scale-105 data-[state=active]:bg-indigo-700 data-[state=active]:!text-white data-[state=active]:shadow-xl data-[state=active]:scale-105 transition-all duration-200"
                        >
                            <History className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-sm sm:text-base">Historial de Movimientos</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="cuentas" className="mt-0 bg-white rounded-xl p-8 shadow-sm border border-slate-200 min-h-[400px]">
                        <CuentasTab
                            cuentas={cuentas}
                            loadingCuentas={loadingCuentas}
                            errorCuentas={errorCuentas}
                            metaCuentas={metaCuentas}
                            isMutatingCuentas={isMutatingCuentas}
                            onCargarCuentas={cargarCuentas}
                            onCrearCuenta={crearCuenta}
                            onActualizarCuenta={actualizarCuenta}
                            onEliminarCuenta={eliminarCuenta}
                            onRegistrarMovimiento={registrarMovimiento}
                            onCargarHistorial={cargarHistorial}
                        />
                    </TabsContent>

                    <TabsContent value="historial" className="mt-0 bg-white rounded-xl p-8 shadow-sm border border-slate-200 min-h-[400px]">
                        <HistorialTab
                            cuentas={cuentas}
                            historial={historial}
                            loadingHistorial={loadingHistorial}
                            errorHistorial={errorHistorial}
                            metaHistorial={metaHistorial}
                            onCargarHistorial={cargarHistorial}
                        />
                    </TabsContent>
                </Tabs>
            </main>
        </Layout>
    );
}

export default function FondosPage() {
    return (
        <ErrorBoundary>
            <ProtectedRoute>
                <FondosContent />
            </ProtectedRoute>
        </ErrorBoundary>
    );
}

