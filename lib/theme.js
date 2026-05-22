/** Clave de almacenamiento compartida con next-themes y el script anti-FOUC en _document. */
export const THEME_STORAGE_KEY = 'chalito.theme';

const LEGACY_DARK_MODE_KEY = 'chalito.theme.darkMode';

const isBrowser = () => typeof window !== 'undefined';

const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['1', 'true', 'si', 'sí', 'on'].includes(normalized);
  }
  return false;
};

function resolveDarkFromStored(stored) {
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  if (stored === 'system' || stored == null) {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  }
  return false;
}

/** Script inline para _document: aplica clase dark antes del paint. */
export const themeBlockingScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var t=localStorage.getItem(k);if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)||(t==null&&localStorage.getItem('${LEGACY_DARK_MODE_KEY}')==='1')){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export const hasStoredThemePreference = () => {
  if (!isBrowser()) return false;
  try {
    const current = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (current === 'light' || current === 'dark' || current === 'system') return true;
    const legacy = window.localStorage.getItem(LEGACY_DARK_MODE_KEY);
    return legacy === '0' || legacy === '1';
  } catch {
    return false;
  }
};

export const migrateLegacyDarkModeStorage = () => {
  if (!isBrowser()) return;
  try {
    if (window.localStorage.getItem(THEME_STORAGE_KEY)) return;
    const legacy = window.localStorage.getItem(LEGACY_DARK_MODE_KEY);
    if (legacy == null) return;
    window.localStorage.setItem(THEME_STORAGE_KEY, toBoolean(legacy) ? 'dark' : 'light');
    window.localStorage.removeItem(LEGACY_DARK_MODE_KEY);
  } catch {
    /* ignore */
  }
};

export { resolveDarkFromStored, LEGACY_DARK_MODE_KEY };
