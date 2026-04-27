import { Button } from '@/components/ui/button';

export function LocalPagination({
  page = 1,
  totalPages = 1,
  onPrevious,
  onNext,
  className = '',
}) {
  const isPreviousDisabled = page <= 1;
  const isNextDisabled = page >= totalPages;

  if (totalPages <= 1) return null;

  return (
    <div
      className={`mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 ${className}`}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={isPreviousDisabled}
      >
        Anterior
      </Button>
      <p className="text-sm font-medium text-slate-700">
        Página {page} de {totalPages}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={isNextDisabled}
      >
        Siguiente
      </Button>
    </div>
  );
}
