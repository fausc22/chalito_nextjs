const THEME_STORAGE_KEYS = {
  darkMode: 'chalito.theme.darkMode',
  primaryColor: 'chalito.theme.primaryColor',
};

const HEX_COLOR_REGEX = /^#[0-9A-F]{6}$/i;

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

export const normalizeHexColor = (value) => {
  const normalized = String(value ?? '').trim().toUpperCase();
  return HEX_COLOR_REGEX.test(normalized) ? normalized : '';
};

export const applyDarkMode = (enabled) => {
  if (!isBrowser()) return;
  const isEnabled = toBoolean(enabled);
  document.documentElement.classList.toggle('dark', isEnabled);
};

export const applyPrimaryColor = (value) => {
  if (!isBrowser()) return;
  const color = normalizeHexColor(value);
  if (!color) return;
  document.documentElement.style.setProperty('--color-primary', color);
  document.documentElement.style.setProperty('--primary-color', color);
};

export const persistThemePreference = ({ darkMode, primaryColor }) => {
  if (!isBrowser()) return;
  if (typeof darkMode !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEYS.darkMode, toBoolean(darkMode) ? '1' : '0');
  }
  const normalizedPrimary = normalizeHexColor(primaryColor);
  if (normalizedPrimary) {
    window.localStorage.setItem(THEME_STORAGE_KEYS.primaryColor, normalizedPrimary);
  }
};

export const getStoredThemePreference = () => {
  if (!isBrowser()) return {};
  const darkModeRaw = window.localStorage.getItem(THEME_STORAGE_KEYS.darkMode);
  const primaryColorRaw = window.localStorage.getItem(THEME_STORAGE_KEYS.primaryColor);
  return {
    darkMode: darkModeRaw == null ? undefined : toBoolean(darkModeRaw),
    primaryColor: normalizeHexColor(primaryColorRaw),
  };
};

export const applyThemePreference = ({ darkMode, primaryColor }) => {
  if (typeof darkMode !== 'undefined') {
    applyDarkMode(darkMode);
  }
  if (primaryColor) {
    applyPrimaryColor(primaryColor);
  }
};

export const extractThemeFromGeneralConfig = (generalData) => {
  if (!generalData || typeof generalData !== 'object') return {};
  return {
    darkMode: toBoolean(generalData.MODO_OSCURO?.value),
    primaryColor: normalizeHexColor(generalData.COLOR_PRIMARIO?.value),
  };
};
