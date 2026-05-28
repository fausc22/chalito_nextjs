import { cn } from '@/lib/utils';

/**
 * Header compacto para tabs y sub-secciones dentro de un módulo.
 */
export function SectionHeader({
  title,
  description,
  icon: Icon,
  iconNode,
  actions,
  className,
  headingClassName,
}) {
  const iconElement =
    iconNode ?? (Icon ? <Icon className="h-6 w-6 shrink-0 text-primary" aria-hidden /> : null);

  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0 text-center sm:text-left">
        <h2
          className={cn(
            'flex flex-wrap items-center justify-center gap-2 text-xl font-semibold tracking-tight text-foreground sm:justify-start sm:text-2xl',
            headingClassName,
          )}
        >
          {iconElement}
          <span>{title}</span>
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
