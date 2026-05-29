import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from '../../components/auth/LoginForm';
import { getDefaultRouteForRole } from '../../config/permissions';
import Head from 'next/head';
import Image from 'next/image';

export default function LoginPage() {
  const { isAuthenticated, isLoading, clearError, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(getDefaultRouteForRole(userRole));
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
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

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center py-4 px-4 lg:p-8">
        <div className="w-full max-w-7xl flex flex-col items-center justify-center gap-2 lg:grid lg:grid-cols-[480px_minmax(0,1fr)] lg:items-center lg:gap-x-16 xl:gap-x-20">
          {/* Formulario a la izquierda */}
          <div className="w-full max-w-[400px] mx-auto order-2 lg:order-none lg:col-start-1 lg:justify-self-end lg:pr-4 xl:pr-8">
            <div className="bg-card rounded-2xl p-6 sm:p-8 lg:p-9 w-full lg:w-[480px] animate-fade-in">
              <LoginForm />
            </div>
          </div>

          {/* Branding a la derecha (desktop) / logo arriba (mobile) */}
          <div className="w-full order-1 lg:order-none lg:col-start-2 flex justify-center lg:items-center lg:justify-center lg:pl-4 xl:pl-8 lg:-translate-y-8">
            <div className="text-center text-white max-w-md lg:max-w-lg mx-auto animate-fade-in lg:flex lg:flex-col lg:items-center">
              <div className="relative w-48 h-48 lg:w-[350px] lg:h-[350px] mx-auto shrink-0 lg:mb-0">
                <Image
                  src="/logo-empresa.png"
                  alt="Logo El Chalito"
                  fill
                  sizes="(max-width: 1024px) 192px, 350px"
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
              <div className="hidden lg:block space-y-2 lg:-mt-16">
                <h1 className="text-xl lg:text-2xl font-semibold text-white">
                  Sistema de gestión gastronómica
                </h1>
                <p className="text-sm lg:text-base text-blue-100/90 leading-relaxed max-w-md mx-auto">
                  Panel interno para administrar pedidos, ventas, inventario y operación diaria.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
