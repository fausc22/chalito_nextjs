import { pedidosService } from './pedidosService';
import {
  getPrintAgentUrl,
  getPrintAgentToken,
  isPrintAgentEnabled
} from '@/lib/printConfig';

const HEALTH_CACHE_MS = 15000;
const REQUEST_TIMEOUT_MS = 10000;

let healthCache = { at: 0, data: null };

export const AGENT_ERROR_MESSAGES = {
  AGENT_OFFLINE: 'No se detecta El Chalito Print en esta PC. Abrí "Iniciar-impresion.bat".',
  AGENT_UNAUTHORIZED: 'Token de impresión incorrecto. Configuralo en Ayuda impresora.',
  PRINTER_NOT_FOUND: 'No se encuentra la impresora. Revisá el nombre en config.json.',
  PRINTER_OFFLINE: 'Ticketera apagada, sin papel o tapa abierta.',
  PRINT_FAILED: 'Error al imprimir. Reintentá o usá impresión por navegador.',
  JOB_BUSY: 'Otra impresión en curso. Esperá unos segundos.',
  INVALID_PAYLOAD: 'Datos de impresión inválidos.',
  VPS_FETCH_FAILED: 'No se pudieron obtener los datos del pedido. Revisá la conexión.',
  PEDIDO_NOT_PAID: 'El pedido debe estar cobrado para imprimir el ticket.',
  PEDIDO_NO_ENTREGADO: 'El pedido debe estar ENTREGADO para imprimir la factura ARCA.',
  CAE_PENDIENTE: 'La factura ARCA todavía no fue emitida. Reintentá en un minuto.',
  NO_SALE_FOR_TICKET: 'No hay venta asociada. Cobrá el pedido primero.',
  PEDIDO_NOT_FOUND: 'Pedido no encontrado.',
  UNKNOWN: 'Error al imprimir. Copiá el reporte para soporte.'
};

export function getAgentErrorMessage(code, fallbackMessage) {
  return AGENT_ERROR_MESSAGES[code] || fallbackMessage || AGENT_ERROR_MESSAGES.UNKNOWN;
}

async function fetchAgent(path, options = {}) {
  const url = `${getPrintAgentUrl().replace(/\/$/, '')}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    const token = getPrintAgentToken();
    if (token) {
      headers['X-Print-Token'] = token;
    }

    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        code: body.code || (res.status === 401 ? 'AGENT_UNAUTHORIZED' : 'PRINT_FAILED'),
        message: body.message || getAgentErrorMessage(body.code),
        status: res.status,
        data: body
      };
    }

    return { success: true, data: body.data ?? body, message: body.message };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        code: 'AGENT_OFFLINE',
        message: getAgentErrorMessage('AGENT_OFFLINE')
      };
    }
    return {
      success: false,
      code: 'AGENT_OFFLINE',
      message: getAgentErrorMessage('AGENT_OFFLINE'),
      detail: error.message
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkPrintAgentHealth({ force = false } = {}) {
  if (!isPrintAgentEnabled()) {
    return { success: false, code: 'AGENT_DISABLED', offline: true };
  }

  const now = Date.now();
  if (!force && healthCache.data && now - healthCache.at < HEALTH_CACHE_MS) {
    return healthCache.data;
  }

  const result = await fetchAgent('/health', { method: 'GET' });
  const normalized = result.success
    ? { success: true, ok: true, offline: false, ...result.data }
    : { success: false, ok: false, offline: true, code: result.code, message: result.message };

  healthCache = { at: now, data: normalized };
  return normalized;
}

export function invalidatePrintAgentHealthCache() {
  healthCache = { at: 0, data: null };
}

export async function printPayloadToAgent(payload) {
  return fetchAgent('/print', {
    method: 'POST',
    body: JSON.stringify({ payload })
  });
}

export async function printTestPage() {
  return fetchAgent('/test-print', { method: 'POST', body: '{}' });
}

export async function fetchPrintPayloadFromVps(kind, pedidoId) {
  const fetcher =
    kind === 'kitchen'
      ? pedidosService.obtenerComandaParaImprimir
      : pedidosService.obtenerTicketParaImprimir;

  const response = await fetcher(pedidoId);
  if (!response.success) {
    return {
      success: false,
      code: response.code || 'VPS_FETCH_FAILED',
      message: response.error || getAgentErrorMessage('VPS_FETCH_FAILED')
    };
  }
  return { success: true, payload: response.data };
}

/**
 * Flujo completo: VPS → agente local
 */
export async function printPedido(kind, pedidoId) {
  const vps = await fetchPrintPayloadFromVps(kind, pedidoId);
  if (!vps.success) {
    return vps;
  }

  if (!isPrintAgentEnabled()) {
    return {
      success: false,
      code: 'AGENT_DISABLED',
      message: 'Impresión por agente deshabilitada',
      payload: vps.payload
    };
  }

  const health = await checkPrintAgentHealth({ force: true });
  if (!health.ok) {
    return {
      success: false,
      code: health.code || 'AGENT_OFFLINE',
      message: health.message || getAgentErrorMessage('AGENT_OFFLINE'),
      payload: vps.payload,
      agentHealth: health
    };
  }

  const printed = await printPayloadToAgent(vps.payload);
  if (!printed.success) {
    return { ...printed, payload: vps.payload, agentHealth: health };
  }

  return { success: true, message: printed.message, payload: vps.payload };
}
