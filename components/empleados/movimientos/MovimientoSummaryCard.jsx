import { Card, CardContent } from '@/components/ui/card';

const formatMoney = (amount) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
}).format(Number(amount) || 0);

export function MovimientoSummaryCard({ title, value, accentClass = 'text-foreground' }) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="space-y-1 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className={`text-2xl font-semibold ${accentClass}`}>
          {formatMoney(value)}
        </p>
      </CardContent>
    </Card>
  );
}
