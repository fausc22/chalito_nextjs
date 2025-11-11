import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { ROUTES } from '../config/routes';
import Head from 'next/head';
import Image from 'next/image';

export default function LoginPage() {
  const { isAuthenticated, isLoading, clearError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Iniciar Sesión - El Chalito</title>
        <meta name="description" content="Inicia sesión en el sistema de gestión El Chalito" />
      </Head>

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Panel izquierdo - Formulario */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>

        {/* Panel derecho - Branding */}
        <div className="flex-1 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-6 lg:p-12 flex items-center justify-center">
          <div className="text-center text-white max-w-lg animate-fade-in">
            <div className="relative w-64 h-64 mx-auto mb-8">
              <Image
                src="/logo-empresa.png"
                alt="Logo El Chalito"
                fill
                sizes="(max-width: 768px) 100vw, 256px"
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              ¡Bienvenido a El Chalito!
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 drop-shadow">
              Sistema de gestión gastronómica
            </p>
            <div className="mt-8 flex justify-center space-x-4 text-sm text-primary-100">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🍔</span>
                <span>Pedidos</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💳</span>
                <span>Ventas</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📊</span>
                <span>Reportes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

