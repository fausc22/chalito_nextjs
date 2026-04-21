import { Card, CardContent } from '@/components/ui/card';

export function AsistenciaMetricCard({ label, value, hint, accentClass = 'text-blue-700' }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className={`mt-2 text-2xl font-semibold ${accentClass}`}>
          {value}
        </p>
        {hint ? (
          <p className="mt-1 text-xs text-slate-500">
            {hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
