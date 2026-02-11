import { useEffect } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Layout } from '../../components/layout/Layout';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { VentasTab } from '../../components/ventas/VentasTab';
import { useVentas } from '../../hooks/ventas/useVentas';

function VentasContent() {
    // Hook de ventas
    const {
        // Ventas
        ventas,
        loadingVentas,
        errorVentas,
        metaVentas,
        isMutatingVentas,
        cargarVentas,
        anularVenta,
        
        // Detalle
        ventaDetalle,
        loadingDetalle,
        obtenerVentaPorId,
        limpiarVentaDetalle,
        
        // Medios de pago
        mediosPago,
        cargarMediosPago
    } = useVentas();

    // Cargar medios de pago al montar
    useEffect(() => {
        cargarMediosPago();
    }, [cargarMediosPago]);

    return (
        <Layout title="Ventas">
            <main className="main-content">
                {/* Header */}
                <div className="mb-8 pb-6 border-b-2 border-slate-200">
                    <h1 className="text-[2rem] font-semibold text-[#315e92] mb-2 flex items-center gap-2">
                        💳 Módulo de Ventas
                    </h1>
                    <p className="text-slate-500 text-base">
                        Consulta el historial de ventas y gestiona los ingresos del negocio
                    </p>
                </div>

                {/* Contenido principal */}
                <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 min-h-[400px]">
                    <VentasTab
                        ventas={ventas}
                        loadingVentas={loadingVentas}
                        errorVentas={errorVentas}
                        metaVentas={metaVentas}
                        isMutatingVentas={isMutatingVentas}
                        mediosPago={mediosPago}
                        onCargarVentas={cargarVentas}
                        onAnularVenta={anularVenta}
                        onObtenerVentaPorId={obtenerVentaPorId}
                        ventaDetalle={ventaDetalle}
                        loadingDetalle={loadingDetalle}
                        onLimpiarVentaDetalle={limpiarVentaDetalle}
                    />
                </div>
            </main>
        </Layout>
    );
}

export default function VentasPage() {
    return (
        <ErrorBoundary>
            <ProtectedRoute>
                <VentasContent />
            </ProtectedRoute>
        </ErrorBoundary>
    );
}
