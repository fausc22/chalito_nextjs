import { ROLE_NAMES } from '@/config/api';

function formatTodayEsAr() {
  return new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function HomeWelcome({ userName, userRole, hasAlerts }) {
  const roleLabel = ROLE_NAMES[userRole] || userRole || '';
  const subtitle = hasAlerts
    ? 'Revisá los avisos de abajo o entrá directo al módulo que necesites.'
    : 'Elegí un acceso rápido para empezar. El detalle de cada área está en su módulo.';

  return (
    <section className="rounded-2xl border border-border bg-card px-5 py-5 shadow-sm sm:px-6">
      <p className="text-sm text-muted-foreground capitalize">{formatTodayEsAr()}</p>
      <h1 className="mt-1 text-2xl font-semibold text-foreground sm:text-[1.75rem]">
        {userName ? `Hola, ${userName}` : 'Bienvenido'}
      </h1>
      {roleLabel ? (
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {roleLabel}
        </p>
      ) : null}
      <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
    </section>
  );
}
