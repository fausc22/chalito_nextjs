import '../styles/globals.css';
import { useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ConnectionStatusProvider } from '../contexts/ConnectionStatusContext';
import { WebOrderAlertsProvider } from '../contexts/WebOrderAlertsContext';
import { Toaster } from '@/components/ui/toaster';
import Head from 'next/head';
import { tokenManager } from '@/services/api';
import { configuracionService } from '@/services/configuracionService';
import {
  applyThemePreference,
  extractThemeFromGeneralConfig,
  getStoredThemePreference,
  persistThemePreference,
} from '@/lib/theme';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Aplica cache local para evitar UI inconsistente durante bootstrap.
    const storedTheme = getStoredThemePreference();
    applyThemePreference(storedTheme);

    const accessToken = tokenManager.getAccessToken();
    if (!accessToken) return;

    let isMounted = true;
    const syncThemeFromBackend = async () => {
      const result = await configuracionService.getConfiguracionGeneral();
      if (!isMounted || !result.success) return;

      const backendTheme = extractThemeFromGeneralConfig(result.data);
      applyThemePreference(backendTheme);
      persistThemePreference(backendTheme);
    };

    syncThemeFromBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#f2750b" />
        <meta name="description" content="Sistema de gestión gastronómica El Chalito" />
        <link rel="icon" href="/cactus-chalito.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

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
    </>
  );
}

export default MyApp;

