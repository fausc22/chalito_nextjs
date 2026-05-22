import { useEffect, useCallback } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { tokenManager } from '@/services/api';
import { readLegacyDarkModeFromApi } from '@/services/configuracionService';
import {
  THEME_STORAGE_KEY,
  hasStoredThemePreference,
  migrateLegacyDarkModeStorage,
  LEGACY_DARK_MODE_KEY,
} from '@/lib/theme';

const MIGRATION_FLAG_KEY = 'chalito.theme.migratedFromDb';

function ThemeMigration() {
  const { setTheme } = useTheme();

  useEffect(() => {
    migrateLegacyDarkModeStorage();

    if (hasStoredThemePreference()) return;

    try {
      if (window.localStorage.getItem(MIGRATION_FLAG_KEY) === '1') return;
    } catch {
      return;
    }

    if (!tokenManager.getAccessToken()) return;

    let cancelled = false;

    const runMigration = async () => {
      const legacyDark = await readLegacyDarkModeFromApi();
      if (cancelled || legacyDark == null) return;

      const nextTheme = legacyDark ? 'dark' : 'light';
      setTheme(nextTheme);
      try {
        window.localStorage.setItem(MIGRATION_FLAG_KEY, '1');
        window.localStorage.removeItem(LEGACY_DARK_MODE_KEY);
      } catch {
        /* ignore */
      }
    };

    runMigration();

    return () => {
      cancelled = true;
    };
  }, [setTheme]);

  return null;
}

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange
    >
      <ThemeMigration />
      {children}
    </NextThemesProvider>
  );
}

export function useThemeMode() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const activeTheme = resolvedTheme || theme || 'light';
  const isDark = activeTheme === 'dark';
  const preference = theme || 'system';

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  const setThemePreference = useCallback(
    (value) => {
      if (value === 'light' || value === 'dark' || value === 'system') {
        setTheme(value);
      }
    },
    [setTheme]
  );

  return {
    theme: activeTheme,
    preference,
    isDark,
    setTheme,
    setThemePreference,
    toggleTheme,
  };
}
