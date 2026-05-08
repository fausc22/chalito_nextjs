import { getShortcutItems } from '@/components/layout/admin/navigation';
import { ModuleShortcutButton } from './ModuleShortcutButton';

export function QuickActions({ userRole }) {
  const shortcuts = getShortcutItems(userRole);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Atajos rapidos</h2>
      </header>
      <div className="flex flex-wrap gap-2">
        {shortcuts.map((item) => (
          <ModuleShortcutButton key={item.href} href={item.href} label={item.label} icon={item.icon} />
        ))}
      </div>
    </section>
  );
}
