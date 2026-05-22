import { getPrintAgentUrl, getPrintAgentToken } from './printConfig';

export function buildPrintIncidentReport({
  pedidoId = null,
  kind = null,
  errorCode = null,
  errorMessage = null,
  agentHealth = null,
  phase = null
}) {
  const lines = [
    '=== Reporte impresión El Chalito ===',
    `Fecha: ${new Date().toISOString()}`,
    `Pedido: ${pedidoId ?? 'N/A'}`,
    `Tipo: ${kind ?? 'N/A'}`,
    `Fase: ${phase ?? 'N/A'}`,
    `Código error: ${errorCode ?? 'N/A'}`,
    `Mensaje: ${errorMessage ?? 'N/A'}`,
    '',
    '--- Agente local ---',
    `URL: ${getPrintAgentUrl()}`,
    `Token configurado: ${getPrintAgentToken() ? 'sí' : 'no'}`,
    `Health: ${agentHealth ? JSON.stringify(agentHealth) : 'no consultado'}`,
    '',
    '--- Entorno ---',
    `API: ${process.env.NEXT_PUBLIC_API_URL || 'N/A'}`,
    `Navegador: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}`,
    `URL página: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`,
    '==================================='
  ];
  return lines.join('\n');
}

export async function copyPrintIncidentReport(report) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return { success: false, error: 'Clipboard no disponible' };
  }
  try {
    await navigator.clipboard.writeText(report);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function openSupportEmail(report) {
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  if (!email || typeof window === 'undefined') return false;
  const subject = encodeURIComponent('El Chalito - Problema de impresión');
  const body = encodeURIComponent(report);
  window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  return true;
}
