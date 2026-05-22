import { Card, CardContent } from '@/components/ui/card';

export function AsistenciaMetricCard({ label, value, hint, accentClass = 'text-blue-700' }) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={`mt-2 text-2xl font-semibold ${accentClass}`}>
          {value}
        </p>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
