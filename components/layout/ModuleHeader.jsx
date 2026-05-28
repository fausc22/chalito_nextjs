import { cn } from '@/lib/utils';

/**
 * Header unificado para módulos del panel admin.
 * Sin card ni gradiente por defecto; divider inferior sutil.
 */
export function ModuleHeader({
  title,
  description,
  icon: Icon,
  iconNode,
  actions,
  rightSlot,
  children,
  className,
  headingClassName,
  showDivider = true,
  size = 'module',
}) {
  const HeadingTag = size === 'compact' ? 'h2' : 'h1';
  const titleSizeClass =
    size === 'compact'
      ? 'text-xl sm:text-2xl font-semibold tracking-tight'
      : 'admin-page-heading text-[2rem] font-semibold';

  const iconElement = iconNode ?? (Icon ? <Icon className="h-7 w-7 shrink-0 text-primary" aria-hidden /> : null);

  return (
    <header
      className={cn(
        'mb-6',
        showDivider && 'border-b border-border pb-5',
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <HeadingTag
            className={cn(
              titleSizeClass,
              'flex flex-wrap items-center gap-2.5 text-foreground',
              headingClassName,
            )}
          >
            {iconElement}
            <span>{title}</span>
          </HeadingTag>
          {description ? (
            <p className="page-subtitle mt-2 text-base text-muted-foreground">{description}</p>
          ) : null}
        </div>

        {(rightSlot || actions) ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:justify-end">
            {rightSlot}
            {actions}
          </div>
        ) : null}
      </div>

      {children ? <div className="mt-5">{children}</div> : null}
    </header>
  );
}
