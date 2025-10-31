import Link from 'next/link';
import Head from 'next/head';
import { ROUTES } from '../src/config/routes';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Página no encontrada</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
        <div className="text-center animate-fade-in">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-primary-500 mb-4">404</h1>
            <div className="text-6xl mb-4">🤷‍♂️</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Página no encontrada
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Lo sentimos, la página que buscas no existe o fue movida.
            </p>
          </div>

          <div className="space-x-4">
            <Link href={ROUTES.DASHBOARD} className="btn-primary btn-lg">
              🏠 Volver al inicio
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-outline btn-lg"
            >
              ← Volver atrás
            </button>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            <p>Si crees que esto es un error, contacta al administrador del sistema.</p>
          </div>
        </div>
      </div>
    </>
  );
}
