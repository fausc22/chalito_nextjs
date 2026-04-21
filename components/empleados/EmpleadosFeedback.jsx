export function EmpleadosFeedback({ type = 'info', message }) {
  const styleByType = {
    error: 'border-red-200 bg-red-50 text-red-700',
    empty: 'border-dashed border-slate-300 bg-slate-50 text-slate-500',
    info: 'border-slate-200 bg-slate-50 text-slate-600',
  };

  const classes = styleByType[type] || styleByType.info;

  return (
    <div className={`rounded-xl border p-4 text-sm ${classes}`}>
      {message}
    </div>
  );
}
