import Link from 'next/link';

export function ModuleShortcutButton({ href, label, icon: Icon }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
