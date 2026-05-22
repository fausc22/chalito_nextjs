/**
 * Fallback de impresión por navegador — PrintPayload v1, 58mm
 */

const PAGE_CSS = `
  @page { size: 58mm auto; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; font-size: 11px; color: #000; background: #fff; }
  .ticket { width: 58mm; max-width: 58mm; padding: 3mm 2mm; margin: 0 auto; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .lg { font-size: 14px; }
  .sep { text-align: center; margin: 4px 0; letter-spacing: 1px; }
  .item { margin: 6px 0; }
  .mod { margin-left: 8px; font-size: 10px; }
  .obs { margin-left: 8px; font-weight: bold; font-size: 10px; }
  .row { display: flex; justify-content: space-between; gap: 4px; }
`;

const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const openPrintWindow = (title, bodyHtml) => {
  const doc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escapeHtml(title)}</title><style>${PAGE_CSS}</style></head><body><div class="ticket">${bodyHtml}</div></body></html>`;

  const ventana = window.open('', '_blank', 'width=400,height=700');
  if (!ventana) {
    console.error('No se pudo abrir ventana de impresión. Habilitá popups.');
    return false;
  }
  ventana.document.write(doc);
  ventana.document.close();
  ventana.onload = () => {
    setTimeout(() => {
      ventana.print();
      setTimeout(() => ventana.close(), 800);
    }, 200);
  };
  return true;
};

export function printKitchenPayloadBrowser(payload) {
  const b = payload.business || {};
  const o = payload.order || {};
  const c = payload.customer || {};
  const lines = payload.lines || [];

  let itemsHtml = '';
  for (const line of lines) {
    itemsHtml += `<div class="item"><div class="bold">${line.qty}x ${escapeHtml(String(line.name).toUpperCase())}</div>`;
    if (line.modifiers?.length) {
      for (const m of line.modifiers) {
        itemsHtml += `<div class="mod">+ ${escapeHtml(String(m).toUpperCase())}</div>`;
      }
    }
    if (line.lineNote) {
      itemsHtml += `<div class="obs">OBS: ${escapeHtml(String(line.lineNote).toUpperCase())}</div>`;
    }
    itemsHtml += '</div>';
  }

  const body = `
    <div class="center bold lg">${escapeHtml((b.name || 'EL CHALITO').toUpperCase())}</div>
    <div class="sep">========================</div>
    <div class="center bold lg">PEDIDO #${escapeHtml(o.number || o.id)}</div>
    <div class="center">${escapeHtml(o.createdAtLabel || '')}</div>
    <div class="sep">========================</div>
    <div class="center bold">&gt;&gt;&gt; ${escapeHtml(o.scheduledLabel || 'CUANTO ANTES')} &lt;&lt;&lt;</div>
    <div class="sep">------------------------</div>
    <div class="center bold">${escapeHtml(o.modality || 'RETIRO')}</div>
    <div class="sep">------------------------</div>
    <div class="bold center">${escapeHtml((c.name || 'MOSTRADOR').toUpperCase())}</div>
    ${c.phone ? `<div>TEL: ${escapeHtml(c.phone)}</div>` : ''}
    ${c.address ? `<div>${escapeHtml(c.address)}</div>` : ''}
    ${o.orderNotes ? `<div class="sep">------------------------</div><div class="bold">OBS PEDIDO:</div><div>${escapeHtml(o.orderNotes)}</div>` : ''}
    <div class="sep">------------------------</div>
    ${itemsHtml}
    <div class="sep">------------------------</div>
    <div class="center bold">${o.paymentStatus === 'PAGADO' ? 'PAGO: PAGADO' : 'PAGO: PENDIENTE'}</div>
    <div class="sep">------------------------</div>
    <div class="center bold">*** COCINA ***</div>
  `;

  return openPrintWindow(`Comanda #${o.number || o.id}`, body.replace(/div/g, 'div'));
}

export function printCustomerPayloadBrowser(payload) {
  const b = payload.business || {};
  const o = payload.order || {};
  const c = payload.customer || {};
  const lines = payload.lines || [];
  const t = payload.totals || {};

  const fmt = (n) => {
    const num = Number(n);
    return Number.isFinite(num)
      ? `$${num.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
      : '$0';
  };

  let itemsHtml = '';
  for (const line of lines) {
    itemsHtml += `<div class="row"><span>${line.qty}x ${escapeHtml(line.name)}</span><span>${fmt(line.lineTotal ?? line.unitPrice)}</span></div>`;
  }

  const body = `
    <div class="center bold">${escapeHtml((b.name || 'EL CHALITO').toUpperCase())}</div>
    ${b.address ? `<div class="center">${escapeHtml(b.address)}</div>` : ''}
    ${b.phone ? `<div class="center">Tel: ${escapeHtml(b.phone)}</div>` : ''}
    <div class="sep">------------------------</div>
    <div class="center bold">TICKET #${escapeHtml(o.saleNumber || o.saleId)}</div>
    <div class="center">${escapeHtml(o.createdAtLabel || '')}</div>
    <div class="center">Pedido #${escapeHtml(o.number || o.id)}</div>
    <div class="sep">------------------------</div>
    <div class="center bold">${escapeHtml(c.name || 'Cliente')}</div>
    <div class="sep">------------------------</div>
    ${itemsHtml}
    <div class="sep">------------------------</div>
    <div class="row bold lg"><span>TOTAL</span><span>${fmt(t.total)}</span></div>
    <div class="sep">------------------------</div>
    <div class="center bold">Pago: ${escapeHtml(t.paymentMethod || '')}</div>
    <div class="center" style="margin-top:8px">Gracias por su compra</div>
  `;

  return openPrintWindow(`Ticket #${o.saleNumber || o.saleId}`, body.replace(/div/g, 'div'));
}

export function printPayloadBrowser(payload) {
  if (!payload) return false;
  if (payload.kind === 'kitchen') return printKitchenPayloadBrowser(payload);
  if (payload.kind === 'customer') return printCustomerPayloadBrowser(payload);
  return false;
}
