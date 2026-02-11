import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ConnectionStatusProvider } from '../contexts/ConnectionStatusContext';
import { Toaster } from '@/components/ui/toaster';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#f2750b" />
        <meta name="description" content="Sistema de gestión gastronómica El Chalito" />
        <link rel="icon" href="/cactus-chalito.png" />
      </Head>

      <NotificationProvider>
        <AuthProvider>
          <ConnectionStatusProvider>
            <Component {...pageProps} />
            <Toaster />
          </ConnectionStatusProvider>
        </AuthProvider>
      </NotificationProvider>
    </>
  );
}

export default MyApp;

