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
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  canMutateEmployeeMaster,
  canOperateEmployeeMovements,
  canViewEmployeeLiquidaciones,
  getAllowedEmpleadosSections,
  getDefaultEmpleadosSection,
} from '@/config/empleadosPermissions';

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
  const { userRole } = useAuth();
  const currentSection = typeof router.query.section === 'string' ? router.query.section : '';
  const allowedSections = useMemo(() => getAllowedEmpleadosSections(userRole), [userRole]);
  const defaultAllowedSection = useMemo(() => getDefaultEmpleadosSection(userRole), [userRole]);
  const sectionMeta = useMemo(() => getEmpleadosSection(currentSection), [currentSection]);
  const hasSectionAccess = useMemo(
    () => allowedSections.includes(currentSection),
    [allowedSections, currentSection]
  );
  const canMutateEmployees = useMemo(() => canMutateEmployeeMaster(userRole), [userRole]);
  const canOperateMovements = useMemo(() => canOperateEmployeeMovements(userRole), [userRole]);
  const canViewLiquidaciones = useMemo(() => canViewEmployeeLiquidaciones(userRole), [userRole]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!defaultAllowedSection) return;
    if (!sectionMeta || !hasSectionAccess) {
      router.replace(`/empleados/${defaultAllowedSection}`);
    }
  }, [defaultAllowedSection, hasSectionAccess, router, sectionMeta]);

  if (!sectionMeta || !hasSectionAccess) {
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
        allowedSections={allowedSections}
        headerTitle={sectionMeta.title}
        headerSubtitle={sectionMeta.subtitle}
        headerActions={
          isAsistencia ? (
            <Button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
              onClick={() =>
                document.getElementById('actividad-reciente')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              Ver historial
            </Button>
          ) : isEmpleados && canMutateEmployees ? (
            <Button
              type="button"
              className="gap-2 bg-green-600 text-white hover:bg-green-700 hover:text-white"
              onClick={() => router.push('/empleados/empleados?nuevo=1')}
            >
              <Plus className="h-4 w-4" />
              Nuevo empleado
            </Button>
          ) : isMovimientos && canOperateMovements ? (
            <Button
              type="button"
              className="gap-2 bg-green-600 text-white hover:bg-green-700 hover:text-white"
              onClick={() => router.push('/empleados/movimientos?nuevo=1')}
            >
              <Plus className="h-4 w-4" />
              Nuevo movimiento
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
        ) : isLiquidaciones && canViewLiquidaciones ? (
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
      <ProtectedRoute module="empleados">
        <EmpleadosSectionContent />
      </ProtectedRoute>
    </ErrorBoundary>
  );
}
