import Link from 'next/link';
import { LogOut, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/config/routes';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';

export function CocinaActionBar() {
  const { logout } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 shadow-sm">
      <Button variant="outline" size="sm" asChild className="gap-2">
        <Link href={ROUTES.DASHBOARD}>
          <Home className="h-4 w-4" />
          Salir de cocina
        </Link>
      </Button>

      <div className="flex items-center gap-2">
        <ThemeToggle className="bg-background border border-border shadow-sm" />
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-red-600 hover:bg-destructive/10 hover:text-red-600"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
}
