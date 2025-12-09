import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Head from 'next/head';

function ComponentsDemo() {
  return (
    <>
      <Head>
        <title>Demo de Componentes shadcn/ui - El Chalito</title>
      </Head>
      <div className="container-custom py-8">
        <h1 className="text-4xl font-bold mb-6 text-primary-500">
          Componentes shadcn/ui - El Chalito
        </h1>

        <Separator className="my-6" />

        {/* Botones */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Botones</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        <Separator className="my-6" />

        {/* Cards */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Este es el contenido de la card.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Action</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Artículos</CardTitle>
                <CardDescription>Total de productos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-500">245</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ventas Hoy</CardTitle>
                <CardDescription>Total de ventas del día</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary-500">$12,450</div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-6" />

        {/* Badges */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        <Separator className="my-6" />

        {/* Formularios */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Formularios</h2>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Ejemplo de Formulario</CardTitle>
              <CardDescription>Formulario con componentes de shadcn/ui</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" placeholder="Ingrese su nombre" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="correo@ejemplo.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Enviar</Button>
            </CardFooter>
          </Card>
        </section>

        <Separator className="my-6" />

        {/* Alertas */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Alertas</h2>
          <div className="space-y-4">
            <Alert>
              <AlertTitle>Información</AlertTitle>
              <AlertDescription>
                Esta es una alerta informativa usando shadcn/ui
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Ha ocurrido un error en el sistema
              </AlertDescription>
            </Alert>
          </div>
        </section>

        <Separator className="my-6" />

        {/* Tablas */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Tablas</h2>
          <Card>
            <CardHeader>
              <CardTitle>Lista de Productos</CardTitle>
              <CardDescription>Ejemplo de tabla con datos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Lista de productos de ejemplo</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Hamburguesa</TableCell>
                    <TableCell>Comida</TableCell>
                    <TableCell><Badge>25</Badge></TableCell>
                    <TableCell className="text-right">$850</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Coca Cola</TableCell>
                    <TableCell>Bebidas</TableCell>
                    <TableCell><Badge variant="destructive">5</Badge></TableCell>
                    <TableCell className="text-right">$300</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Papas Fritas</TableCell>
                    <TableCell>Acompañamientos</TableCell>
                    <TableCell><Badge variant="secondary">50</Badge></TableCell>
                    <TableCell className="text-right">$450</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}

export default ComponentsDemo;
