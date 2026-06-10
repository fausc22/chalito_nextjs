import { useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Layout } from '../../components/layout/Layout';
import { ModuleHeader } from '../../components/layout/ModuleHeader';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { VentasTab } from '../../components/ventas/VentasTab';
import { useVentas } from '../../hooks/ventas/useVentas';
import { useAuth } from '../../contexts/AuthContext';
import { MODULES, canWrite } from '../../config/permissions';

function VentasContent() {
    const { userRole } = useAuth();
    const puedeOperarVentas = canWrite(userRole, MODULES.VENTAS);
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
        solicitarFactura,
        
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
        <Layout title={puedeOperarVentas ? 'Ventas' : 'Consulta de ventas'}>
            <div className="main-content">
                <ModuleHeader
                    title={puedeOperarVentas ? 'Ventas' : 'Consulta de ventas'}
                    description={
                        puedeOperarVentas
                            ? 'Consultá el historial de ventas y gestioná los ingresos del negocio.'
                            : 'Consultá el historial de ventas, filtros y detalle de cada operación.'
                    }
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
                        onSolicitarFactura={solicitarFactura}
                        onObtenerVentaPorId={obtenerVentaPorId}
                        ventaDetalle={ventaDetalle}
                        loadingDetalle={loadingDetalle}
                        onLimpiarVentaDetalle={limpiarVentaDetalle}
                        puedeOperarVentas={puedeOperarVentas}
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
