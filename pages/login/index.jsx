import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from '../../components/auth/LoginForm';
import { ROUTES } from '../../config/routes';
import Head from 'next/head';
import Image from 'next/image';
import { ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';

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

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-start sm:items-center justify-center py-4 px-4 lg:p-8">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 xl:gap-24">
          {/* Formulario a la izquierda - Card blanca independiente */}
          <div className="w-full lg:w-auto lg:flex-shrink-0 order-2 lg:order-1 lg:ml-16 xl:ml-20">
            <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-10 w-full lg:w-[480px] animate-fade-in">
              <LoginForm />
            </div>
          </div>

          {/* Texto de bienvenida a la derecha - Directamente sobre el fondo azul */}
          <div className="w-full lg:flex-1 order-1 lg:order-2 lg:pl-8">
            <div className="text-center text-white max-w-2xl mx-auto animate-fade-in">
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 lg:w-[350px] lg:h-[350px] mx-auto mb-3 lg:mb-2">
                <Image
                  src="/logo-empresa.png"
                  alt="Logo El Chalito"
                  fill
                  sizes="(max-width: 640px) 192px, (max-width: 1024px) 208px, 350px"
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-5 drop-shadow-lg -mt-6 lg:-mt-12">
                ¡Bienvenido a El Chalito!
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 drop-shadow mb-8 lg:mb-10">
                Sistema de gestión gastronómica
              </p>
              <div className="flex justify-center gap-6 lg:gap-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-blue-700/50 backdrop-blur-sm flex items-center justify-center">
                    <ShoppingBag className="h-7 w-7 lg:h-8 lg:w-8" />
                  </div>
                  <span className="text-sm lg:text-base text-blue-100 font-medium">Pedidos</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-blue-700/50 backdrop-blur-sm flex items-center justify-center">
                    <DollarSign className="h-7 w-7 lg:h-8 lg:w-8" />
                  </div>
                  <span className="text-sm lg:text-base text-blue-100 font-medium">Ventas</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-blue-700/50 backdrop-blur-sm flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 lg:h-8 lg:w-8" />
                  </div>
                  <span className="text-sm lg:text-base text-blue-100 font-medium">Reportes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

