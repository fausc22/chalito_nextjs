import Link from 'next/link';
import { ChefHat, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/config/routes';

export function HomeCocinaLauncher() {
  return (
    <section>
      <Link
        href={ROUTES.COCINA}
        className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-blue-300/60 hover:bg-accent"
      >
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            <ChefHat className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Abrir cocina</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tu espacio de trabajo es la pantalla de comandas en preparación.
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      </Link>
    </section>
  );
}
