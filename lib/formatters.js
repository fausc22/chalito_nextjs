// Formatear moneda
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Formatear fecha
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// Formatear fecha y hora
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Formatear fecha corta
export const formatShortDate = (date) => {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
};

// Formatear hora
export const formatTime = (date) => {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Capitalizar primera letra
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncar texto
export const truncate = (str, maxLength = 50) => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Formatea la dirección de entrega al estándar chalito_carta.
 * Solo incluye los campos con valor, manteniendo orden fijo.
 * NO incluye observaciones (van en pedidos.observaciones).
 *
 * @param {Object} params - { calle, numero, edificio, piso }
 * @returns {string} Ej: "Calle: Av. Belgrano | Altura: 1234 | Edificio/Casa: Torre A | Piso/Depto: 3° A"
 */
export const formatDireccionEntrega = ({ calle = '', numero = '', edificio = '', piso = '' } = {}) => {
  const trim = (v) => (typeof v === 'string' ? v.trim() : '') || '';
  const c = trim(calle);
  const n = trim(numero);
  const e = trim(edificio);
  const p = trim(piso);

  const partes = [];
  if (c) partes.push(`Calle: ${c}`);
  if (n) partes.push(`Altura: ${n}`);
  if (e) partes.push(`Edificio/Casa: ${e}`);
  if (p) partes.push(`Piso/Depto: ${p}`);

  return partes.join(' | ');
};

/**
 * Parsea cliente_direccion para poblar el formulario al editar.
 * Devuelve { calle, altura, edificioCasa, pisoDepto }.
 * Soporta formato nuevo (detallado) y antiguo (comas).
 *
 * @param {string} str - cliente_direccion del pedido
 * @returns {{ calle: string, altura: string, edificioCasa: string, pisoDepto: string }}
 */
export const parseClienteDireccion = (str) => {
  const empty = { calle: '', altura: '', edificioCasa: '', pisoDepto: '' };
  if (!str || typeof str !== 'string') return empty;
  const s = str.trim();
  if (!s) return empty;

  // Formato A (nuevo/detallado): "Calle: X | Altura: Y | Edificio/Casa: Z | Piso/Depto: W"
  if (/Calle:\s*/i.test(s) || /Altura:\s*/i.test(s)) {
    const result = { ...empty };
    const parts = s.split('|').map((p) => p.trim());
    for (const p of parts) {
      if (/^Calle:\s*/i.test(p)) result.calle = p.replace(/^Calle:\s*/i, '').trim();
      else if (/^Altura:\s*/i.test(p)) result.altura = p.replace(/^Altura:\s*/i, '').trim();
      else if (/^Edificio\/Casa:\s*/i.test(p)) result.edificioCasa = p.replace(/^Edificio\/Casa:\s*/i, '').trim();
      else if (/^Piso\/Depto:\s*/i.test(p)) result.pisoDepto = p.replace(/^Piso\/Depto:\s*/i, '').trim();
    }
    return result;
  }

  // Formato B (antiguo/comas): "calle, numero, Ed. X, Piso Y, obs"
  const seg = s.split(',').map((x) => x.trim()).filter(Boolean);
  const calle = seg[0] || '';
  // altura = segundo segmento si parece número (ej. "1234", "1234 B")
  const pareceNumero = (v) => v && /^\d/.test(v) && /[\d]/.test(v);
  const altura = (seg[1] && pareceNumero(seg[1])) ? seg[1] : '';
  // edificioCasa: segmento 2 (quitar prefijo Ed./Edificio si existe)
  const raw2 = seg[2] || '';
  const edificioCasa = raw2.replace(/^Ed\.?\s*/i, '').replace(/^Edificio\s*/i, '').trim();
  // pisoDepto: segmento 3 (quitar prefijo Piso si existe)
  const raw3 = seg[3] || '';
  const pisoDepto = raw3.replace(/^Piso\s*/i, '').trim();

  return { calle, altura, edificioCasa, pisoDepto };
};

/**
 * @deprecated Usar parseClienteDireccion. Alias que mapea a { calle, numero, edificio, piso }.
 */
export const parseDireccionEntrega = (str) => {
  const p = parseClienteDireccion(str);
  return {
    calle: p.calle,
    numero: p.altura,
    edificio: p.edificioCasa,
    piso: p.pisoDepto
  };
};
