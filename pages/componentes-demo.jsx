import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Head from 'next/head';

function ComponentsDemo() {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      router.replace('/login');
    }
  }, [router]);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

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

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Botones</CardTitle>
              <CardDescription>Variantes del componente Button</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formulario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="demo-email">Email</Label>
                <Input id="demo-email" type="email" placeholder="usuario@ejemplo.com" />
              </div>
              <Button type="button">Enviar</Button>
            </CardContent>
            <CardFooter>
              <Badge variant="outline">Solo desarrollo</Badge>
            </CardFooter>
          </Card>
        </div>

        <Alert className="mt-6">
          <AlertTitle>Nota</AlertTitle>
          <AlertDescription>
            Esta ruta solo está disponible en entorno de desarrollo.
          </AlertDescription>
        </Alert>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tabla de ejemplo</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Listado demo</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell>Item demo</TableCell>
                  <TableCell>
                    <Badge>Activo</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default ComponentsDemo;
