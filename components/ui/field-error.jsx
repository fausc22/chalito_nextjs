import { cn } from '@/lib/utils';

export function FieldError({ error, className, id }) {
  if (!error) {
    return null;
  }

  return (
    <p id={id} className={cn('mt-1 text-xs font-medium text-red-600', className)}>
      {error}
    </p>
  );
}
