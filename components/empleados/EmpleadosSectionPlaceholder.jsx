import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function EmpleadosSectionPlaceholder({ title, description }) {
  return (
    <div className="space-y-4">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl text-slate-800">{title}</CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Base visual lista
            </Badge>
          </div>
          <CardDescription className="text-sm sm:text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Espacio preparado para filtros, buscadores y estado de la sección.
            </div>
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Contenedor listo para tablas, cards y acciones específicas.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
