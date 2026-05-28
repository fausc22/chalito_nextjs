import Link from 'next/link';
import { useMemo } from 'react';
import { CalendarCheck, Users, ArrowLeftRight, FileText } from 'lucide-react';
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { cn } from '@/lib/utils';

const SECTION_CONFIG = {
  asistencia: {
    title: 'Asistencia',
    subtitle: 'Control de horarios, presencia y jornadas del equipo.',
    icon: CalendarCheck,
  },
  empleados: {
    title: 'Empleados',
    subtitle: 'Gestión general de perfiles, roles y datos del personal.',
    icon: Users,
  },
  movimientos: {
    title: 'Movimientos',
    subtitle: 'Registro y seguimiento de novedades internas del equipo.',
    icon: ArrowLeftRight,
  },
  liquidaciones: {
    title: 'Liquidaciones',
    subtitle: 'Administración de cierres y pagos por período.',
    icon: FileText,
  },
};

const SECTION_ORDER = ['asistencia', 'empleados', 'movimientos', 'liquidaciones'];

function SidebarItem({ sectionKey, activeSection }) {
  const section = SECTION_CONFIG[sectionKey];
  const Icon = section.icon;
  const isActive = sectionKey === activeSection;

  return (
    <Link
      href={`/empleados/${sectionKey}`}
      className={cn(
        'group flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-200',
        isActive
          ? 'border-blue-500 bg-blue-600 text-white shadow-md'
          : 'border-border bg-card text-foreground hover:border-blue-300 hover:bg-accent hover:text-blue-700'
      )}
    >
      <span
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
          isActive
            ? 'bg-card/20 text-white'
            : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span>{section.title}</span>
    </Link>
  );
}

export function EmpleadosModuleLayout({
  activeSection,
  children,
  headerTitle,
  headerSubtitle,
  headerActions,
  allowedSections = SECTION_ORDER,
}) {
  const activeSectionData = useMemo(() => SECTION_CONFIG[activeSection], [activeSection]);
  const sectionsToRender = useMemo(
    () => SECTION_ORDER.filter((sectionKey) => allowedSections.includes(sectionKey)),
    [allowedSections]
  );

  if (!activeSectionData) {
    return null;
  }

  return (
    <div className="main-content">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <aside className="hidden lg:block lg:w-72 lg:shrink-0">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 px-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Módulo Empleados
              </p>
            </div>
            <nav className="flex flex-col gap-2">
              {sectionsToRender.map((sectionKey) => (
                <SidebarItem key={sectionKey} sectionKey={sectionKey} activeSection={activeSection} />
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-3 shadow-sm lg:hidden">
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Secciones de Empleados
              </p>
            </div>
            <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {sectionsToRender.map((sectionKey) => {
                const section = SECTION_CONFIG[sectionKey];
                const Icon = section.icon;
                const isActive = sectionKey === activeSection;

                return (
                  <Link
                    key={sectionKey}
                    href={`/empleados/${sectionKey}`}
                    className={cn(
                      'inline-flex min-w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
                      isActive
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-border bg-card text-foreground hover:border-blue-300 hover:bg-accent hover:text-blue-700'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {section.title}
                  </Link>
                );
              })}
            </nav>
          </div>

          <ModuleHeader
            title={headerTitle || activeSectionData.title}
            description={headerSubtitle || activeSectionData.subtitle}
            icon={activeSectionData.icon}
            actions={headerActions}
            showDivider
            className="mb-4"
          />

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}

export function getEmpleadosSection(sectionKey) {
  return SECTION_CONFIG[sectionKey] || null;
}
