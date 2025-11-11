import Link from 'next/link';
import { ROUTES } from '../config/routes';

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-4xl font-semibold text-gray-800 mt-4 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-8">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link
          href={ROUTES.DASHBOARD}
          className="btn-primary inline-flex items-center gap-2"
        >
          <span>←</span>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

