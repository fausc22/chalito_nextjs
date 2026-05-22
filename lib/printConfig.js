const STORAGE_KEYS = {
  agentUrl: 'elchalito_print_agent_url',
  agentToken: 'elchalito_print_token',
  browserFallback: 'elchalito_print_browser_fallback'
};

const DEFAULT_AGENT_URL = 'http://127.0.0.1:9100';

export function getPrintAgentUrl() {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_PRINT_AGENT_URL || DEFAULT_AGENT_URL;
  }
  return (
    localStorage.getItem(STORAGE_KEYS.agentUrl) ||
    process.env.NEXT_PUBLIC_PRINT_AGENT_URL ||
    DEFAULT_AGENT_URL
  );
}

export function setPrintAgentUrl(url) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.agentUrl, url);
}

export function getPrintAgentToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.agentToken) || '';
}

export function setPrintAgentToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.agentToken, (token || '').trim());
}

export function isPrintAgentEnabled() {
  return process.env.NEXT_PUBLIC_PRINT_AGENT_ENABLED !== 'false';
}

export function isBrowserPrintFallbackEnabled() {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_PRINT_FALLBACK_BROWSER !== 'false';
  }
  const stored = localStorage.getItem(STORAGE_KEYS.browserFallback);
  if (stored === 'false') return false;
  if (stored === 'true') return true;
  return process.env.NEXT_PUBLIC_PRINT_FALLBACK_BROWSER !== 'false';
}

export function setBrowserPrintFallbackEnabled(enabled) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.browserFallback, enabled ? 'true' : 'false');
}
