# 🎨 Guía de shadcn/ui - El Chalito

## ✅ Instalación Completada

Se ha instalado correctamente **shadcn/ui** en el proyecto El Chalito.

## 📦 Componentes Instalados

Los siguientes componentes están listos para usar:

- ✅ **Button** - Botones con múltiples variantes
- ✅ **Card** - Tarjetas para contenido
- ✅ **Input** - Campos de entrada
- ✅ **Label** - Etiquetas para formularios
- ✅ **Select** - Selectores dropdown
- ✅ **Dialog** - Modales y diálogos
- ✅ **Table** - Tablas de datos
- ✅ **Form** - Formularios con validación
- ✅ **Badge** - Insignias y etiquetas
- ✅ **Alert** - Alertas y notificaciones
- ✅ **Toast** - Notificaciones toast
- ✅ **Tabs** - Pestañas
- ✅ **Dropdown Menu** - Menús desplegables
- ✅ **Separator** - Separadores

## 🎨 Colores Personalizados

Los componentes están configurados con los colores de El Chalito:

- **Primary**: `#f2750b` (Naranja característico)
- **Secondary**: `#22c55e` (Verde)
- **Danger/Destructive**: `#ef4444` (Rojo)

## 📖 Cómo Usar los Componentes

### 1. Importar Componentes

```javascript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
```

### 2. Ejemplos de Uso

#### Botones

```javascript
// Botón primario (naranja de El Chalito)
<Button>Guardar</Button>

// Botón secundario (verde)
<Button variant="secondary">Cancelar</Button>

// Botón destructivo (rojo)
<Button variant="destructive">Eliminar</Button>

// Botón con borde
<Button variant="outline">Outline</Button>

// Tamaños
<Button size="sm">Pequeño</Button>
<Button size="lg">Grande</Button>
```

#### Cards

```javascript
<Card>
  <CardHeader>
    <CardTitle>Total de Ventas</CardTitle>
    <CardDescription>Ventas del día de hoy</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-primary-500">$12,450</div>
  </CardContent>
  <CardFooter>
    <Button>Ver Detalles</Button>
  </CardFooter>
</Card>
```

#### Formularios

```javascript
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="nombre">Nombre del Artículo</Label>
    <Input
      id="nombre"
      placeholder="Ej: Hamburguesa completa"
      value={nombre}
      onChange={(e) => setNombre(e.target.value)}
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="precio">Precio</Label>
    <Input
      id="precio"
      type="number"
      placeholder="0.00"
    />
  </div>

  <Button className="w-full">Guardar Artículo</Button>
</div>
```

#### Tablas

```javascript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nombre</TableHead>
      <TableHead>Categoría</TableHead>
      <TableHead>Precio</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Hamburguesa</TableCell>
      <TableCell>Comida</TableCell>
      <TableCell>$850</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Badges

```javascript
<Badge>Activo</Badge>
<Badge variant="secondary">En Stock</Badge>
<Badge variant="destructive">Sin Stock</Badge>
<Badge variant="outline">Pendiente</Badge>
```

#### Dialog (Modal)

```javascript
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirmar Acción</DialogTitle>
      <DialogDescription>
        ¿Está seguro que desea continuar?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Alertas

```javascript
<Alert>
  <AlertTitle>Éxito</AlertTitle>
  <AlertDescription>
    El artículo se guardó correctamente
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    No se pudo guardar el artículo
  </AlertDescription>
</Alert>
```

## 🔗 Demo

Visita `/componentes-demo` para ver todos los componentes en acción con ejemplos visuales.

## 📚 Documentación Oficial

Para más información y ejemplos avanzados:
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com/primitives)

## 💡 Tips

1. **Personalización**: Los componentes están en `components/ui/` y pueden ser modificados libremente
2. **Utilidades**: Usa la función `cn()` de `lib/utils.js` para combinar clases de Tailwind
3. **Variantes**: Todos los componentes soportan las variantes de color configuradas
4. **Responsive**: Los componentes son responsive por defecto

## 🚀 Agregar Más Componentes

Para agregar más componentes de shadcn/ui:

```bash
npx shadcn@latest add [nombre-componente]
```

Ejemplos:
```bash
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add textarea
npx shadcn@latest add switch
```

## 📝 Notas

- Los componentes usan las variables CSS definidas en `styles/globals.css`
- Los colores primarios están configurados con el naranja de El Chalito (#f2750b)
- Todos los componentes son accesibles y siguen las mejores prácticas de UI/UX
