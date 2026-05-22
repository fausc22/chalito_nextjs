import { cn } from '@/lib/utils';
import { STATUS } from '@/lib/ui-tokens';

const VARIANT_MAP = {
  success: STATUS.success,
  error: STATUS.error,
  warning: STATUS.warning,
  info: STATUS.info,
  neutral: STATUS.neutral,
};

export function StatusBanner({ variant = 'neutral', className = '', children }) {
  const styles = VARIANT_MAP[variant] || VARIANT_MAP.neutral;
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2 text-sm',
        styles.bg,
        styles.border,
        className
      )}
    >
      {children}
    </div>
  );
}
