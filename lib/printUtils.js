/**
 * Utilidades para imprimir comandas y tickets
 * Optimizado para ticketera térmica de 80mm
 */

/**
 * Formatea una fecha/hora para mostrar en impresiones
 */
const formatearFechaHora = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const año = date.getFullYear();
  const horas = String(date.getHours()).padStart(2, '0');
  const minutos = String(date.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${año} ${horas}:${minutos}`;
};

/**
 * Formatea una hora para mostrar en impresiones
 */
const formatearHora = (fecha) => {
  if (!fecha) return '';
  const date = new Date(fecha);
  const horas = String(date.getHours()).padStart(2, '0');
  const minutos = String(date.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
};

/**
 * Formatea minutos a formato legible
 */
const formatearMinutos = (minutos) => {
  if (minutos < 60) return `${minutos}m`;
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas}h ${mins}m`;
};

/**
 * Imprime una comanda
 */
export const imprimirComanda = (datos) => {
  // Mapear estructura del backend a formato plano para impresión
  const negocio = datos.negocio || {};
  const pedido = datos.pedido || {};
  const cliente = datos.cliente || {};
  console.log('PEDIDO IMPRESION:', pedido);
  
  const negocio_nombre = negocio.nombre || 'EL CHALITO';
  const pedido_id = pedido.numero || datos.pedido_id;
  const fecha = pedido.fecha || datos.fecha;
  const cliente_nombre = cliente.nombre || 'MOSTRADOR';
  const tipo_entrega = datos.tipo || datos.tipo_entrega || 'RETIRO';
  const telefono = cliente.telefono || datos.telefono;
  const direccion = cliente.direccion || datos.direccion;
  const items = datos.items || [];
  const estado_pago = datos.estado_pago || 'DEBE';
  const tipoEntregaLabel = tipo_entrega === 'DELIVERY' ? 'DELIVERY' : 'RETIRO';
  const clienteNombreUpper = String(cliente_nombre || 'MOSTRADOR').toUpperCase();

  const total =
    pedido.total ??
    pedido.total_final ??
    pedido.subtotal ??
    datos.total ??
    datos.total_final ??
    datos.subtotal ??
    null;
  const totalNumerico = Number.parseFloat(total);

  const totalDesdeItems = items.reduce((acc, item) => {
    const subtotal = Number.parseFloat(item.subtotal);
    if (Number.isFinite(subtotal)) return acc + subtotal;

    const cantidad = Number.parseFloat(item.cantidad || 1);
    const precio = Number.parseFloat(item.precio || item.precio_unitario || 0);
    if (!Number.isFinite(cantidad) || !Number.isFinite(precio)) return acc;
    return acc + (cantidad * precio);
  }, 0);

  const totalComanda = Number.isFinite(totalNumerico)
    ? totalNumerico
    : totalDesdeItems;
  const totalFormateado = `$${totalComanda.toFixed(2)}`;

  const horario =
    pedido.horario_entrega ||
    pedido.hora_entrega ||
    pedido.hora_programada ||
    pedido.hora_esperada_finalizacion ||
    datos.horario_entrega ||
    datos.hora_entrega ||
    datos.hora_programada ||
    datos.hora_esperada_finalizacion ||
    null;
  const footerHorario = horario ? `PARA ${formatearHora(horario)}` : 'CUANTO ANTES';

  // Construir HTML
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Comanda #${pedido_id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        @page {
          size: 54mm auto;
          margin: 0;
        }
        html, body {
          margin: 0;
          padding: 0;
          font-family: 'Courier New', monospace;
          color: #000;
        }
        /*
         * Pantalla: preview ~155% usando solo calc() (ancho/tipografías).
         * Ni zoom ni transform: en Chrome 146 zoom+flex puede dejar una segunda franja;
         * transform no encoge la caja de layout → scroll fantasma.
         */
        @media screen {
          /*
           * Anclar el documento al viewport: evita scrollHeight suelto y “segunda tira”
           * (mismo ticket pintado debajo del área blanca / preview).
           */
          html {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            max-height: 100%;
            overflow: hidden;
            overscroll-behavior: none;
          }
          body.print-page {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            max-height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            overflow: clip;
            overscroll-behavior: none;
            box-sizing: border-box;
            background: #e8e8e8;
            contain: paint;
          }
          body.print-page .print-stage {
            position: absolute;
            inset: 0;
            box-sizing: border-box;
            padding: clamp(12px, 3vmin, 32px);
            background: #ffffff;
            overflow: hidden;
            overflow: clip;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 0;
          }
          .ticket-preview-scale {
            flex-shrink: 0;
            display: block;
          }
          .ticket-preview-scale .ticket {
            width: calc(54mm * 1.55);
            max-width: calc(54mm * 1.55);
            padding: calc(2.6mm * 1.55) calc(1.8mm * 1.55);
            font-size: calc(11.5px * 1.55);
          }
          .ticket-preview-scale .nombre-negocio {
            font-size: calc(13px * 1.55);
          }
          .ticket-preview-scale .pedido-id {
            font-size: calc(11px * 1.55);
          }
          .ticket-preview-scale .fecha {
            font-size: calc(10px * 1.55);
          }
          .ticket-preview-scale .separator {
            font-size: calc(10px * 1.55);
          }
          .ticket-preview-scale .section-title,
          .ticket-preview-scale .cliente-nombre {
            font-size: calc(11px * 1.55);
          }
          .ticket-preview-scale .item-extras,
          .ticket-preview-scale .item-observaciones {
            font-size: calc(10.5px * 1.55);
          }
          .ticket-preview-scale .total {
            font-size: calc(14px * 1.55);
          }
          .ticket-preview-scale .footer-left {
            font-size: calc(10px * 1.55);
          }
          .ticket-preview-scale .footer-right {
            font-size: calc(11px * 1.55);
          }
          .ticket-preview-scale .extra-info {
            font-size: calc(10.5px * 1.55);
          }
        }
        .ticket {
          width: 54mm;
          max-width: 54mm;
          padding: 2.6mm 1.8mm;
          font-family: 'Courier New', monospace;
          font-size: 11.5px;
          line-height: 1.5;
          color: #000;
          background: #fff;
        }
        .header {
          text-align: center;
          margin-bottom: 4px;
        }
        .nombre-negocio {
          font-size: 13px;
          font-weight: bold;
          letter-spacing: 0.3px;
        }
        .pedido-id {
          font-size: 11px;
          font-weight: bold;
          margin-top: 2px;
        }
        .fecha {
          font-size: 10px;
          margin-top: 2px;
        }
        .separator {
          font-size: 10px;
          letter-spacing: 0.2px;
          margin: 4px 0;
          text-align: center;
        }
        .section {
          margin: 4px 0;
        }
        .section-title {
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 2px;
          text-align: center;
        }
        .items-section {
          text-align: left;
        }
        .items-section .section-title {
          text-align: center;
        }
        .line {
          margin: 1px 0;
        }
        .cliente-nombre {
          font-size: 11px;
          font-weight: bold;
        }
        .item {
          margin: 3px 0;
          text-align: left;
        }
        .item-nombre {
          font-weight: bold;
          text-transform: uppercase;
        }
        .item-extras {
          margin-left: 8px;
          font-size: 10.5px;
          text-transform: uppercase;
          text-align: left;
        }
        .item-observaciones {
          margin-left: 8px;
          font-size: 10.5px;
          font-weight: bold;
          text-align: left;
        }
        .total {
          display: block;
          text-align: center;
          font-size: 14px;
          font-weight: 700;
        }
        .estado-pago {
          margin-top: 2px;
          text-align: center;
          font-weight: 700;
          text-transform: uppercase;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: 6px;
          gap: 8px;
        }
        .footer-left {
          text-align: left;
          text-transform: uppercase;
          font-size: 10px;
          font-weight: bold;
        }
        .footer-right {
          text-align: right;
          text-transform: uppercase;
          font-size: 11px;
          font-weight: bold;
          white-space: nowrap;
        }
        .extra-info {
          margin-top: 4px;
          font-size: 10.5px;
          text-align: left;
          text-transform: uppercase;
          line-height: 1.3;
        }
        @media print {
          html {
            position: static !important;
            inset: auto !important;
            width: auto !important;
            height: auto !important;
            max-height: none !important;
          }
          html, body {
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            overflow: visible !important;
            background: #fff !important;
          }
          body.print-page {
            position: static !important;
            inset: auto !important;
            display: block !important;
            width: auto !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            background: #fff !important;
            contain: none !important;
          }
          .print-stage,
          .ticket-preview-scale {
            position: static !important;
            inset: auto !important;
            display: block !important;
            min-height: 0 !important;
            height: auto !important;
            width: auto !important;
            max-width: none !important;
            max-height: none !important;
            padding: 0 !important;
            margin: 0 !important;
            transform: none !important;
            zoom: 1 !important;
            overflow: visible !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          .ticket {
            width: 54mm !important;
            max-width: 54mm !important;
            margin: 0 auto !important;
            padding: 2.3mm 1.5mm !important;
            font-size: 11px !important;
          }
        }
      </style>
    </head>
    <body class="print-page">
      <section class="print-stage">
          <div class="ticket-preview-scale">
            <div class="ticket">
        <div class="header">
          <div class="nombre-negocio">${String(negocio_nombre).toUpperCase()}</div>
          <div class="pedido-id">COMANDA #${pedido_id}</div>
          <div class="fecha">${formatearFechaHora(fecha)}</div>
        </div>

        <div class="separator">------------------------------</div>
        <div class="section items-section">
          <div class="section-title">ITEMS</div>
          ${items.map(item => {
            const itemNombre = item.nombre || item.articulo_nombre || 'Producto';
            const itemCantidad = item.cantidad || 1;
            const itemNombreUpper = String(itemNombre).toUpperCase();
            const itemObservaciones = item.observaciones ? String(item.observaciones).toUpperCase() : '';

            let itemHtml = `
              <div class="item">
                <div class="item-nombre">${itemCantidad}x ${itemNombreUpper}</div>
            `;

            if (item.extras && Array.isArray(item.extras) && item.extras.length > 0) {
              itemHtml += '<div class="item-extras">';
              item.extras.forEach(extra => {
                const extraNombre = extra.nombre || extra.nombre_adicional || '';
                const extraPrecio = parseFloat(extra.precio || extra.precio_adicional || 0);
                if (extraNombre) {
                  itemHtml += `+ ${String(extraNombre).toUpperCase()}`;
                  if (extraPrecio > 0) {
                    itemHtml += ` (+$${extraPrecio.toFixed(2)})`;
                  }
                  itemHtml += '<br>';
                }
              });
              itemHtml += '</div>';
            }

            if (itemObservaciones) {
              itemHtml += `<div class="item-observaciones">OBS: ${itemObservaciones}</div>`;
            }

            itemHtml += '</div>';
            return itemHtml;
          }).join('')}
        </div>

        <div class="separator">------------------------------</div>
        <div class="section">
          <div class="total">
            <span>TOTAL:</span>
            <span>${totalFormateado}</span>
          </div>
        </div>

        <div class="separator">------------------------------</div>
        <div class="section">
          <div class="estado-pago">
            ${estado_pago === 'PAGADO' || estado_pago === 'paid' ? 'PAGADO' : 'PENDIENTE DE PAGO'}
          </div>
        </div>

        <div class="separator">------------------------------</div>
        <div class="footer">
          <div class="footer-left">
            <div>${tipoEntregaLabel}</div>
            <div>${clienteNombreUpper}</div>
          </div>
          <div class="footer-right">${footerHorario}</div>
        </div>

        <div class="extra-info">
          ${telefono ? `<div>TEL: ${telefono}</div>` : ''}
          ${direccion ? `<div>DIR: ${String(direccion).toUpperCase()}</div>` : ''}
        </div>
            </div>
          </div>
      </section>
    </body>
    </html>
  `;

  const ventanaImpresion = window.open('', '_blank', 'width=960,height=900');
  if (!ventanaImpresion) {
    console.error('No se pudo abrir la ventana de impresión. Verifica que los popups estén habilitados.');
    return;
  }

  ventanaImpresion.document.write(html);
  ventanaImpresion.document.close();

  ventanaImpresion.onload = () => {
    setTimeout(() => {
      ventanaImpresion.print();
      setTimeout(() => {
        ventanaImpresion.close();
      }, 1000);
    }, 250);
  };
};

/**
 * Imprime un ticket/factura
 */
export const imprimirTicket = (datos) => {
  // Mapear estructura del backend a formato plano para impresión
  const negocio = datos.negocio || {};
  const venta = datos.venta || {};
  const pedido = datos.pedido || {};
  const cliente = datos.cliente || {};
  
  const negocio_nombre = negocio.nombre || 'EL CHALITO';
  const negocio_direccion = negocio.direccion || '';
  const negocio_telefono = negocio.telefono || '';
  const venta_id = venta.numero || datos.venta_id;
  const fecha = venta.fecha || datos.fecha;
  const cliente_nombre = cliente.nombre || 'Cliente';
  const items = datos.items || [];
  const total = datos.total || 0;
  const medio_pago = datos.medio_pago || 'EFECTIVO';
  const pedido_id = pedido.numero || datos.pedido_id;

  // Construir HTML
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ticket #${venta_id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        @page {
          size: 80mm auto;
          margin: 0;
        }
        html, body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          font-family: 'Courier New', monospace;
          background: white;
        }
        body {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 10mm 0;
        }
        .ticket-container {
          width: 80mm;
          max-width: 80mm;
          padding: 8mm;
          background: white;
          font-size: 12px;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .nombre-negocio {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .negocio-info {
          font-size: 10px;
          margin: 2px 0;
        }
        .ticket-id {
          font-size: 14px;
          font-weight: bold;
          margin: 4px 0;
        }
        .fecha {
          font-size: 11px;
        }
        .seccion {
          margin: 8px 0;
        }
        .cliente-info {
          margin: 4px 0;
        }
        .cliente-nombre {
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          margin: 8px 0;
          padding: 4px 0;
          border-bottom: 1px solid #000;
        }
        .items-header {
          border-bottom: 1px solid #000;
          padding-bottom: 4px;
          margin: 8px 0 4px 0;
          font-weight: bold;
        }
        .item {
          margin: 4px 0;
          padding-bottom: 4px;
          border-bottom: 1px dotted #ccc;
        }
        .item-linea {
          display: flex;
          justify-content: space-between;
        }
        .item-nombre {
          flex: 1;
        }
        .item-cantidad {
          margin-right: 8px;
        }
        .item-precio {
          text-align: right;
          min-width: 50px;
        }
        .item-subtotal {
          font-size: 11px;
          color: #555;
          margin-left: 12px;
        }
        .totales {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 2px dashed #000;
        }
        .total-linea {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
        }
        .total-linea.total-final {
          font-weight: bold;
          font-size: 14px;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #000;
        }
        .medio-pago {
          text-align: center;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px dashed #000;
          font-weight: bold;
        }
        .referencia {
          text-align: center;
          margin-top: 4px;
          font-size: 10px;
          color: #555;
        }
        .footer {
          text-align: center;
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px dashed #000;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="ticket-container">
        <div class="header">
          <div class="nombre-negocio">${negocio_nombre}</div>
          ${negocio_direccion ? `<div class="negocio-info">${negocio_direccion}</div>` : ''}
          ${negocio_telefono ? `<div class="negocio-info">Tel: ${negocio_telefono}</div>` : ''}
          <div class="ticket-id">TICKET #${venta_id}</div>
          <div class="fecha">${formatearFechaHora(fecha)}</div>
        </div>

        <div class="cliente-nombre">${cliente_nombre}</div>

      <div class="seccion">
        <div class="items-header">PRODUCTOS:</div>
        ${items.map(item => {
          const itemNombre = item.nombre || item.articulo_nombre || 'Producto';
          const itemCantidad = item.cantidad || 1;
          const itemPrecio = parseFloat(item.precio || item.precio_unitario || 0);
          const itemSubtotal = parseFloat(item.subtotal || (itemPrecio * itemCantidad));
          
          return `
          <div class="item">
            <div class="item-linea">
              <span class="item-cantidad">${itemCantidad}x</span>
              <span class="item-nombre">${itemNombre}</span>
              <span class="item-precio">$${itemPrecio.toFixed(2)}</span>
            </div>
            ${itemSubtotal ? `<div class="item-subtotal">Subtotal: $${itemSubtotal.toFixed(2)}</div>` : ''}
          </div>
        `;
        }).join('')}
      </div>

      <div class="totales">
        <div class="total-linea total-final">
          <span>TOTAL:</span>
          <span>$${total.toFixed(2)}</span>
        </div>
      </div>

      ${medio_pago ? `
      <div class="medio-pago">
        Pago: ${medio_pago}
      </div>
      ` : ''}

      ${pedido_id ? `
      <div class="referencia">
        Pedido #${pedido_id}
      </div>
      ` : ''}

      <div class="footer">
        Gracias por su compra
      </div>
      </div>
    </body>
    </html>
  `;

  // Crear ventana de impresión aislada
  const ventanaImpresion = window.open('', '_blank', 'width=400,height=600');
  if (!ventanaImpresion) {
    console.error('No se pudo abrir la ventana de impresión. Verifica que los popups estén habilitados.');
    return;
  }
  
  ventanaImpresion.document.write(html);
  ventanaImpresion.document.close();
  
  // Esperar a que cargue y luego imprimir
  ventanaImpresion.onload = () => {
    setTimeout(() => {
      ventanaImpresion.print();
      // Cerrar ventana después de imprimir (con delay para dar tiempo)
      setTimeout(() => {
        ventanaImpresion.close();
      }, 1000);
    }, 250);
  };
};

