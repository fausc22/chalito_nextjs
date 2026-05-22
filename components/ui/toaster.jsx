import { Toaster as SonnerToaster } from 'sonner';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';

export function Toaster() {
  const { isAuthenticated } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const theme = resolvedTheme === 'dark' ? 'dark' : 'light';

  return createPortal(
    <SonnerToaster
      theme={theme}
      expand={false}
      visibleToasts={4}
      closeButton
      richColors
      position="top-right"
      swipeDirections={[]}
      className="chalito-sonner pointer-events-none z-[2147483647]"
      style={{ zIndex: 2147483647 }}
      offset={isAuthenticated ? '5.5rem' : '1rem'}
      mobileOffset="1rem"
      toastOptions={{
        classNames: {
          toast: 'pointer-events-auto w-full sm:max-w-[420px]',
        },
      }}
    />,
    document.body
  );
}
