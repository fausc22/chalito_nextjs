import { cn } from '@/lib/utils';
import { TABLE_WRAPPER } from '@/lib/ui-tokens';

/**
 * Desktop: tabla con scroll horizontal.
 * Mobile: render prop children (cards).
 */
export function ResponsiveDataView({
  desktop,
  mobile,
  breakpoint = 'md',
  className = '',
}) {
  const bp = breakpoint === 'sm' ? 'sm' : breakpoint === 'lg' ? 'lg' : 'md';

  return (
    <div className={className}>
      <div className={cn('hidden', `${bp}:block`)}>
        <div className={TABLE_WRAPPER}>{desktop}</div>
      </div>
      <div className={cn('block', `${bp}:hidden`)}>{mobile}</div>
    </div>
  );
}
