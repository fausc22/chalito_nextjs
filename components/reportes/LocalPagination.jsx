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

  return (
    <div className={`flex items-center justify-end gap-2 ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={isPreviousDisabled}
      >
        Anterior
      </Button>
      <span className="text-sm text-muted-foreground">Página {page}</span>
      <Button
        type="button"
        variant="outline"
        onClick={onNext}
        disabled={isNextDisabled}
      >
        Siguiente
      </Button>
    </div>
  );
}
