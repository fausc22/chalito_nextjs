/** Detección de adicionales de presentación (Hacela doble / Hacela triple) */
const ES_HACELA_DOBLE = (n) => /hacela\s*doble/i.test(n || '');
const ES_HACELA_TRIPLE = (n) => /hacela\s*triple/i.test(n || '');

/**
 * Separa extras en presentación (Hacela doble/triple) y resto.
 * @param {Array} extras - extrasDisponibles del producto
 * @returns {{ presentacion: Array, extras: Array }}
 */
export function separarPresentacionYExtras(extras) {
  const arr = Array.isArray(extras) ? extras : [];
  const presentacion = arr.filter((e) => {
    const n = e.nombre || e.adicional_nombre || e.name || '';
    return ES_HACELA_DOBLE(n) || ES_HACELA_TRIPLE(n);
  });
  const resto = arr.filter((e) => {
    const n = e.nombre || e.adicional_nombre || e.name || '';
    return !ES_HACELA_DOBLE(n) && !ES_HACELA_TRIPLE(n);
  });
  return { presentacion, extras: resto };
}

/**
 * Obtiene el sufijo de presentación para mostrar en carrito: "(Doble)" o "(Triple)".
 * @param {Array} extras - item.extras o item.extrasSeleccionados
 * @returns {string} '' | '(Doble)' | '(Triple)'
 */
export function getSufijoPresentacion(extras) {
  const arr = Array.isArray(extras) ? extras : [];
  const doble = arr.find((e) => ES_HACELA_DOBLE(e.nombre || e.adicional_nombre || e.name || ''));
  const triple = arr.find((e) => ES_HACELA_TRIPLE(e.nombre || e.adicional_nombre || e.name || ''));
  if (triple) return ' (Triple)';
  if (doble) return ' (Doble)';
  return '';
}

/**
 * Sufijo de presentación para cocina: " DOBLE" o " TRIPLE".
 * Simple no muestra sufijo.
 */
export function getSufijoPresentacionCocina(extras) {
  const arr = Array.isArray(extras) ? extras : [];
  const triple = arr.find((e) => ES_HACELA_TRIPLE(e.nombre || e.adicional_nombre || e.name || ''));
  const doble = arr.find((e) => ES_HACELA_DOBLE(e.nombre || e.adicional_nombre || e.name || ''));
  if (triple) return ' TRIPLE';
  if (doble) return ' DOBLE';
  return '';
}

/**
 * Extras sin presentación (para listar debajo del item).
 */
export function getExtrasSinPresentacion(extras) {
  const arr = Array.isArray(extras) ? extras : [];
  return arr.filter((e) => {
    const n = e.nombre || e.adicional_nombre || e.name || '';
    return !ES_HACELA_DOBLE(n) && !ES_HACELA_TRIPLE(n);
  });
}

/**
 * Construye personalizaciones en formato estándar carta para pedidos_contenido.
 * Formato: { extras: [{ id, nombre, precio_extra }], extrasTotal }
 *
 * @param {Array} extras - Array de extras (pueden tener precio o precio_extra)
 * @returns {Object|null} Objeto para personalizaciones o null si no hay extras
 */
export function buildPersonalizaciones(extras) {
  const arr = Array.isArray(extras) ? extras : [];
  if (arr.length === 0) return null;

  const extrasEstandar = arr.map((e) => ({
    id: e.id ?? e.adicional_id ?? null,
    nombre: e.nombre ?? e.adicional_nombre ?? e.name ?? '',
    precio_extra: parseFloat(e.precio_extra ?? e.precio ?? 0) || 0
  }));

  const extrasTotal = extrasEstandar.reduce((s, e) => s + e.precio_extra, 0);

  return { extras: extrasEstandar, extrasTotal };
}

/**
 * Parsea personalizaciones de pedidos_contenido y extrae extras normalizados.
 * Soporta formato A (admin): {extras:[{id,nombre,precio}]}
 * Soporta formato B (carta): {extras:[{id,nombre,precio_extra}], extrasTotal}
 *
 * @param {Object} item - Item del pedido (puede tener personalizaciones, extras, extrasSeleccionados)
 * @returns {{ extras: Array<{nombre:string,precio:number}>, extrasTotal: number }}
 */
export function getItemExtras(item) {
  const empty = { extras: [], extrasTotal: 0 };
  if (!item) return empty;

  let rawExtras = [];

  // 1) Intentar desde personalizaciones (fuente BD)
  const pers = item.personalizaciones;
  if (pers) {
    try {
      const parsed = typeof pers === 'string' ? JSON.parse(pers) : pers;
      rawExtras = Array.isArray(parsed?.extras) ? parsed.extras : [];
      if (rawExtras.length > 0) {
        const extras = rawExtras.map((e) => ({
          nombre: e.nombre || e.adicional_nombre || e.name || '',
          precio: parseFloat(e.precio_extra ?? e.precio ?? 0) || 0
        }));
        const extrasTotal =
          typeof parsed?.extrasTotal === 'number'
            ? parsed.extrasTotal
            : extras.reduce((s, e) => s + e.precio, 0);
        return { extras, extrasTotal };
      }
    } catch (_) {
      // ignorar parse error
    }
  }

  // 2) Fallback: item.extras o item.extrasSeleccionados (carrito)
  let arr = item.extras ?? item.extrasSeleccionados ?? [];
  if (arr && typeof arr === 'object' && !Array.isArray(arr) && Array.isArray(arr.extras)) {
    arr = arr.extras;
  }
  if (!Array.isArray(arr) || arr.length === 0) return empty;

  const extras = arr.map((e) => ({
    nombre: e.nombre || e.adicional_nombre || e.name || '',
    precio: parseFloat(e.precio_extra ?? e.precio ?? 0) || 0
  }));
  const extrasTotal = extras.reduce((s, e) => s + e.precio, 0);
  return { extras, extrasTotal };
}
