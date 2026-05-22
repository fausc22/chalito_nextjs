import { getHomeShortcuts } from '@/components/layout/admin/navigation';
import { HomeShortcutCard } from './HomeShortcutCard';

export function HomeShortcutsGrid({ userRole, pedidosAtrasadosCount = 0 }) {
  const shortcuts = getHomeShortcuts(userRole);

  if (shortcuts.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">No hay módulos disponibles para tu perfil.</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-foreground">Accesos rápidos</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shortcuts.map((item) => (
          <HomeShortcutCard
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            module={item.module}
            badgeCount={pedidosAtrasadosCount}
          />
        ))}
      </div>
    </section>
  );
}
