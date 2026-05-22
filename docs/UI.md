# Guía UI — El Chalito Admin

## Tema

- **Biblioteca**: `next-themes` + clase `dark` en `<html>`.
- **Opciones**: claro, oscuro, sistema (preferencia OS).
- **Marca fija**: sidebar admin y pantalla de login mantienen azul de marca; el resto sigue el tema.

## Colores

- Usar tokens shadcn: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`.
- Estados: importar `STATUS` desde `@/lib/ui-tokens`.
- **Evitar** en código nuevo: `bg-white`, `text-gray-*`, `bg-red-50` sin variante dark.

## Modales

- Solo Radix: `Dialog`, `Sheet`, `AlertDialog`.
- `DialogContent`: incluir scroll con `DIALOG_SCROLL` de `ui-tokens`.
- Cerrar con `onOpenChange`; deshabilitar acciones con `loading`.

## Responsivo

- Tablas: envolver en `TABLE_WRAPPER` o patrón `ResponsiveDataView`.
- Móvil: preferir cards (ventas/gastos) cuando la tabla no quepa.

## Verificación

```bash
npm run check:ui-colors
npm run lint && npm run build
```
