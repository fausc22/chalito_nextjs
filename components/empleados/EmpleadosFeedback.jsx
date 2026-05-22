export function EmpleadosFeedback({ type = 'info', message }) {
  const styleByType = {
    error: 'border-red-200 bg-destructive/10 text-red-700',
    empty: 'border-dashed border-border bg-muted text-muted-foreground',
    info: 'border-border bg-muted text-muted-foreground',
  };

  const classes = styleByType[type] || styleByType.info;

  return (
    <div className={`rounded-xl border p-4 text-sm ${classes}`}>
      {message}
    </div>
  );
}
