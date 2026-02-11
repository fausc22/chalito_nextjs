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
  
  const negocio_nombre = negocio.nombre || 'EL CHALITO';
  const pedido_id = pedido.numero || datos.pedido_id;
  const fecha = pedido.fecha || datos.fecha;
  const cliente_nombre = cliente.nombre || 'MOSTRADOR';
  const tipo_entrega = datos.tipo || datos.tipo_entrega || 'RETIRO';
  const direccion = cliente.direccion || datos.direccion;
  const telefono = cliente.telefono || datos.telefono;
  const tiempoDisplay = datos.tiempo || '';
  const tiempo_atraso_minutos = datos.tiempo_atraso_minutos;
  const items = datos.items || [];
  const estado_pago = datos.estado_pago || 'DEBE';

  // Construir HTML
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Comanda #${pedido_id}</title>
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
        .pedido-id {
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
        .seccion-titulo {
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 4px;
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
        .item {
          margin: 6px 0;
        }
        .item-nombre {
          font-weight: bold;
        }
        .item-extras {
          margin-left: 12px;
          font-size: 11px;
          color: #555;
        }
        .item-observaciones {
          margin-left: 12px;
          font-size: 11px;
          font-style: italic;
          color: #777;
        }
        .tiempo {
          background: #f0f0f0;
          padding: 4px;
          text-align: center;
          font-weight: bold;
          margin: 8px 0;
        }
        .tiempo-atrasado {
          background: #ffcccc;
        }
        .estado-pago {
          text-align: center;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 2px dashed #000;
          font-weight: bold;
        }
        .estado-pago.pagado {
          color: #006400;
        }
        .estado-pago.pendiente {
          color: #cc0000;
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
          <div class="pedido-id">COMANDA #${pedido_id}</div>
          <div class="fecha">${formatearFechaHora(fecha)}</div>
        </div>

        <div class="cliente-nombre">${cliente_nombre}</div>

        <div class="seccion">
          <div class="cliente-info"><strong>Tipo:</strong> ${tipo_entrega === 'DELIVERY' ? 'DELIVERY' : 'RETIRO'}</div>
          ${direccion ? `<div class="cliente-info"><strong>Dirección:</strong> ${direccion}</div>` : ''}
          ${telefono ? `<div class="cliente-info"><strong>Teléfono:</strong> ${telefono}</div>` : ''}
        </div>

      ${tiempoDisplay ? `
      <div class="tiempo ${tiempo_atraso_minutos && tiempo_atraso_minutos > 0 ? 'tiempo-atrasado' : ''}">
        ${tiempoDisplay}
      </div>
      ` : ''}

      <div class="seccion">
        <div class="seccion-titulo">ITEMS:</div>
        ${items.map(item => {
          const itemNombre = item.nombre || item.articulo_nombre || 'Producto';
          const itemCantidad = item.cantidad || 1;
          
          let itemHtml = `
            <div class="item">
              <div class="item-nombre">${itemCantidad}x ${itemNombre}</div>
          `;
          
          if (item.extras && Array.isArray(item.extras) && item.extras.length > 0) {
            itemHtml += '<div class="item-extras">';
            item.extras.forEach(extra => {
              const extraNombre = extra.nombre || extra.nombre_adicional || '';
              const extraPrecio = parseFloat(extra.precio || extra.precio_adicional || 0);
              if (extraNombre) {
                itemHtml += `+ ${extraNombre}`;
                if (extraPrecio > 0) {
                  itemHtml += ` (+$${extraPrecio.toFixed(2)})`;
                }
                itemHtml += '<br>';
              }
            });
            itemHtml += '</div>';
          }
          
          if (item.observaciones) {
            itemHtml += `<div class="item-observaciones">Obs: ${item.observaciones}</div>`;
          }
          
          itemHtml += '</div>';
          return itemHtml;
        }).join('')}
      </div>

      <div class="estado-pago ${estado_pago === 'PAGADO' || estado_pago === 'paid' ? 'pagado' : 'pendiente'}">
        ${estado_pago === 'PAGADO' || estado_pago === 'paid' ? '✓ PAGADO' : 'PENDIENTE DE PAGO'}
      </div>

      <div class="footer">
        ---
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
  const subtotal = datos.subtotal || 0;
  const descuento = datos.descuento || 0;
  const iva = datos.iva_total || datos.iva || 0;
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
        ${subtotal > 0 ? `
          <div class="total-linea">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
        ` : ''}
        ${descuento > 0 ? `
          <div class="total-linea">
            <span>Descuento:</span>
            <span>-$${descuento.toFixed(2)}</span>
          </div>
        ` : ''}
        ${iva > 0 ? `
          <div class="total-linea">
            <span>IVA:</span>
            <span>$${iva.toFixed(2)}</span>
          </div>
        ` : ''}
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

