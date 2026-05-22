import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ConnectionStatusProvider } from '../contexts/ConnectionStatusContext';
import { WebOrderAlertsProvider } from '../contexts/WebOrderAlertsContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ThemeColorMeta } from '@/components/theme/ThemeColorMeta';
import { Toaster } from '@/components/ui/toaster';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Sistema de gestión gastronómica El Chalito" />
        <link rel="icon" href="/cactus-chalito.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      <ThemeProvider>
        <ThemeColorMeta />
        <NotificationProvider>
          <AuthProvider>
            <ConnectionStatusProvider>
              <WebOrderAlertsProvider>
                <Component {...pageProps} />
                <Toaster />
              </WebOrderAlertsProvider>
            </ConnectionStatusProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
