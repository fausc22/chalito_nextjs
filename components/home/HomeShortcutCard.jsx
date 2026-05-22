import Link from 'next/link';
import { MODULES } from '@/config/permissions';

export function HomeShortcutCard({ href, label, icon: Icon, module, badgeCount = 0 }) {
  const showBadge = module === MODULES.PEDIDOS && badgeCount > 0;

  return (
    <Link
      href={href}
      className="group relative flex min-h-[7.5rem] flex-col items-start justify-between rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-blue-300/60 hover:bg-accent"
    >
      {showBadge ? (
        <span className="absolute right-3 top-3 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      ) : null}
      <div className="rounded-xl bg-primary/10 p-2.5 text-blue-700 transition-colors group-hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300">
        <Icon className="h-6 w-6" />
      </div>
      <span className="mt-3 text-sm font-semibold text-foreground">{label}</span>
    </Link>
  );
}
