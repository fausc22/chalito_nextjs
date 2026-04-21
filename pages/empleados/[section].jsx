import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Layout } from '../../components/layout/Layout';
import { EmpleadosModuleLayout, getEmpleadosSection } from '../../components/empleados/EmpleadosModuleLayout';
import { EmpleadosSectionPlaceholder } from '../../components/empleados/EmpleadosSectionPlaceholder';
import { AsistenciaSection } from '../../components/empleados/asistencia/AsistenciaSection';
import { EmpleadosSection } from '../../components/empleados/empleados/EmpleadosSection';
import { MovimientosSection } from '../../components/empleados/movimientos/MovimientosSection';
import { LiquidacionesSection } from '../../components/empleados/liquidaciones/LiquidacionesSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const SECTION_CONTENT = {
  asistencia: {
    description: 'Vista inicial para construir control de asistencia, horas y novedades diarias.',
  },
  empleados: {
    description: 'Vista inicial para administrar el legajo de empleados y sus datos principales.',
  },
  movimientos: {
    description: 'Vista inicial para listar y gestionar movimientos internos del equipo.',
  },
  liquidaciones: {
    description: 'Vista inicial para configurar y visualizar liquidaciones de sueldo.',
  },
};

function EmpleadosSectionContent() {
  const router = useRouter();
  const currentSection = typeof router.query.section === 'string' ? router.query.section : '';
  const sectionMeta = useMemo(() => getEmpleadosSection(currentSection), [currentSection]);

  useEffect(() => {
    if (!router.isReady) return;
    if (sectionMeta) return;
    router.replace('/empleados/asistencia');
  }, [router, sectionMeta]);

  if (!sectionMeta) {
    return null;
  }

  const sectionContent = SECTION_CONTENT[currentSection];
  const isAsistencia = currentSection === 'asistencia';
  const isEmpleados = currentSection === 'empleados';
  const isMovimientos = currentSection === 'movimientos';
  const isLiquidaciones = currentSection === 'liquidaciones';

  return (
    <Layout title="Empleados">
      <EmpleadosModuleLayout
        activeSection={currentSection}
        headerTitle={sectionMeta.title}
        headerSubtitle={sectionMeta.subtitle}
        headerActions={
          isAsistencia ? (
            <Button asChild variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <a href="#actividad-reciente">Ver historial</a>
            </Button>
          ) : isEmpleados ? (
            <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
              <Link href="/empleados/empleados?nuevo=1">
                <Plus className="h-4 w-4" />
                Nuevo empleado
              </Link>
            </Button>
          ) : isMovimientos ? (
            <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
              <Link href="/empleados/movimientos?nuevo=1">
                <Plus className="h-4 w-4" />
                Nuevo movimiento
              </Link>
            </Button>
          ) : null
        }
      >
        {isAsistencia ? (
          <AsistenciaSection />
        ) : isEmpleados ? (
          <EmpleadosSection />
        ) : isMovimientos ? (
          <MovimientosSection />
        ) : isLiquidaciones ? (
          <LiquidacionesSection />
        ) : (
          <EmpleadosSectionPlaceholder
            title={sectionMeta.title}
            description={sectionContent.description}
          />
        )}
      </EmpleadosModuleLayout>
    </Layout>
  );
}

export default function EmpleadosSectionPage() {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <EmpleadosSectionContent />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
