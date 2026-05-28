import { useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Layout } from '../../components/layout/Layout';
import { ModuleHeader } from '../../components/layout/ModuleHeader';
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
            <div className="main-content">
                <ModuleHeader
                    title="Ventas"
                    description="Consultá el historial de ventas y gestioná los ingresos del negocio."
                    icon={CreditCard}
                />

                {/* Contenido principal */}
                <div className="bg-card rounded-xl p-8 shadow-sm border border-border min-h-[400px]">
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
            </div>
        </Layout>
    );
}

export default function VentasPage() {
    return (
        <ErrorBoundary>
            <ProtectedRoute module="ventas">
                <VentasContent />
            </ProtectedRoute>
        </ErrorBoundary>
    );
}
