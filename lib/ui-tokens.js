/**
 * Clases semánticas reutilizables (shadcn + dark mode).
 * Usar en lugar de bg-white, text-gray-*, bg-*-50 sin variante oscura.
 */
export const UI = {
  page: 'bg-background text-foreground',
  surface: 'bg-card text-card-foreground border border-border',
  surfaceMuted: 'bg-muted text-muted-foreground',
  textPrimary: 'text-foreground',
  textSecondary: 'text-muted-foreground',
  border: 'border-border',
  interactive: 'transition-colors duration-150 hover:bg-accent hover:text-accent-foreground',
};

export const STATUS = {
  success: {
    bg: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-500/20',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  },
  error: {
    bg: 'bg-destructive/10 text-destructive',
    border: 'border-destructive/20',
    badge: 'bg-destructive/15 text-destructive',
  },
  warning: {
    bg: 'bg-amber-500/10 text-amber-900 dark:text-amber-300',
    border: 'border-amber-500/20',
    badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  },
  info: {
    bg: 'bg-primary/10 text-primary',
    border: 'border-primary/20',
    badge: 'bg-primary/15 text-primary',
  },
  neutral: {
    bg: 'bg-muted text-muted-foreground',
    border: 'border-border',
    badge: 'bg-muted text-muted-foreground',
  },
};

/** Contenedor estándar para tablas en desktop */
export const TABLE_WRAPPER = 'w-full overflow-x-auto rounded-lg border border-border';

/** DialogContent scroll en móvil */
export const DIALOG_SCROLL =
  'max-h-[min(90dvh,calc(100vh-2rem))] overflow-y-auto';
