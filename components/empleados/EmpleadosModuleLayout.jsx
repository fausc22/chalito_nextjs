import Link from 'next/link';
import { useMemo } from 'react';
import { CalendarCheck, Users, ArrowLeftRight, FileText } from 'lucide-react';
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
          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
      )}
    >
      <span
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
          isActive
            ? 'bg-white/20 text-white'
            : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700'
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span>{section.title}</span>
    </Link>
  );
}

export function EmpleadosModuleLayout({ activeSection, children, headerTitle, headerSubtitle, headerActions }) {
  const activeSectionData = useMemo(() => SECTION_CONFIG[activeSection], [activeSection]);

  if (!activeSectionData) {
    return null;
  }

  return (
    <div className="main-content">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <aside className="hidden lg:block lg:w-72 lg:shrink-0">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 px-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Módulo Empleados
              </p>
            </div>
            <nav className="flex flex-col gap-2">
              {SECTION_ORDER.map((sectionKey) => (
                <SidebarItem key={sectionKey} sectionKey={sectionKey} activeSection={activeSection} />
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:hidden">
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Secciones de Empleados
              </p>
            </div>
            <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {SECTION_ORDER.map((sectionKey) => {
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
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {section.title}
                  </Link>
                );
              })}
            </nav>
          </div>

          <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#315e92] sm:text-[2rem]">
                {headerTitle || activeSectionData.title}
              </h1>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                {headerSubtitle || activeSectionData.subtitle}
              </p>
            </div>

            {headerActions ? (
              <div className="flex items-center gap-2 self-start">
                {headerActions}
              </div>
            ) : null}
          </header>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
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
