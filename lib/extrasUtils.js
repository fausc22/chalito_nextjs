/** Detección de adicionales de presentación (Hacela doble / triple / cuadruple) */
const ES_HACELA_DOBLE = (n) => /hacela\s*doble/i.test(n || '');
const ES_HACELA_TRIPLE = (n) => /hacela\s*triple/i.test(n || '');
const ES_HACELA_CUADRUPLE = (n) => /hacela\s*cu[aá]druple/i.test(n || '');

const extraNombre = (extra) =>
  String(extra?.nombre ?? extra?.adicional_nombre ?? extra?.name ?? '').trim();

const esArticuloConPresentacion = ({ categoriaNombre, articuloNombre } = {}) => {
  const categoria = String(categoriaNombre ?? '').trim().toLowerCase();
  if (
    categoria.includes('hamburguesa') ||
    categoria.includes('sandwich') ||
    categoria.includes('sándwich')
  ) {
    return true;
  }

  const nombre = String(articuloNombre ?? '').trim().toLowerCase();
  return nombre.includes('hambur') || nombre.includes('burger');
};

const inferirPresentacionDesdeExtras = (extras = []) => {
  const arr = Array.isArray(extras) ? extras : [];
  for (const extra of arr) {
    const nombre = extraNombre(extra);
    if (ES_HACELA_CUADRUPLE(nombre)) return 'CUADRUPLE';
    if (ES_HACELA_TRIPLE(nombre)) return 'TRIPLE';
    if (ES_HACELA_DOBLE(nombre)) return 'DOBLE';
  }
  return null;
};

const parsePersonalizacionesObjeto = (personalizaciones) => {
  if (!personalizaciones) return null;
  if (typeof personalizaciones === 'string') {
    try {
      return JSON.parse(personalizaciones);
    } catch (_) {
      return null;
    }
  }
  return typeof personalizaciones === 'object' ? personalizaciones : null;
};

/**
 * Resuelve la presentación para cocina (SIMPLE, DOBLE, TRIPLE, CUADRUPLE o null).
 */
export function resolverPresentacionParaCocina(
  personalizaciones,
  articuloNombre,
  categoriaNombre
) {
  if (Array.isArray(personalizaciones)) {
    const desdeExtras = inferirPresentacionDesdeExtras(personalizaciones);
    if (desdeExtras) return desdeExtras;
    if (esArticuloConPresentacion({ categoriaNombre, articuloNombre })) {
      return 'SIMPLE';
    }
    return null;
  }

  const pers = parsePersonalizacionesObjeto(personalizaciones);
  const explicita = String(pers?.presentacion || '').trim().toUpperCase();
  if (explicita) return explicita;

  const extras = Array.isArray(pers?.extras) ? pers.extras : [];
  const desdeExtras = inferirPresentacionDesdeExtras(extras);
  if (desdeExtras) return desdeExtras;

  if (esArticuloConPresentacion({ categoriaNombre, articuloNombre })) {
    return 'SIMPLE';
  }

  return null;
}

const sufijoDesdePresentacion = (presentacion) => {
  switch (String(presentacion || '').toUpperCase()) {
    case 'CUADRUPLE':
      return ' CUADRUPLE';
    case 'TRIPLE':
      return ' TRIPLE';
    case 'DOBLE':
      return ' DOBLE';
    case 'SIMPLE':
      return ' SIMPLE';
    default:
      return '';
  }
};

/**
 * Separa extras en presentación (Hacela doble/triple/cuadruple) y resto.
 * @param {Array} extras - extrasDisponibles del producto
 * @returns {{ presentacion: Array, extras: Array }}
 */
export function separarPresentacionYExtras(extras) {
  const arr = Array.isArray(extras) ? extras : [];
  const presentacion = arr.filter((e) => {
    const n = e.nombre || e.adicional_nombre || e.name || '';
    return ES_HACELA_DOBLE(n) || ES_HACELA_TRIPLE(n) || ES_HACELA_CUADRUPLE(n);
  });
  const resto = arr.filter((e) => {
    const n = e.nombre || e.adicional_nombre || e.name || '';
    return !ES_HACELA_DOBLE(n) && !ES_HACELA_TRIPLE(n) && !ES_HACELA_CUADRUPLE(n);
  });
  return { presentacion, extras: resto };
}

/**
 * Obtiene el sufijo de presentación para mostrar en carrito.
 * @param {Array} extras - item.extras o item.extrasSeleccionados
 * @returns {string} '' | '(Doble)' | '(Triple)'
 */
export function getSufijoPresentacion(extrasOrPersonalizaciones, articuloNombre, categoriaNombre) {
  const presentacion = resolverPresentacionParaCocina(
    extrasOrPersonalizaciones,
    articuloNombre,
    categoriaNombre
  );
  const sufijo = sufijoDesdePresentacion(presentacion);
  if (!sufijo) return '';

  const label =
    presentacion === 'CUADRUPLE'
      ? 'Cuadruple'
      : presentacion.charAt(0) + presentacion.slice(1).toLowerCase();
  return ` (${label})`;
}

/**
 * Sufijo de presentación para cocina: " SIMPLE", " DOBLE", " TRIPLE" o " CUADRUPLE".
 */
export function getSufijoPresentacionCocina(
  extrasOrPersonalizaciones,
  articuloNombre,
  categoriaNombre
) {
  const presentacion = resolverPresentacionParaCocina(
    extrasOrPersonalizaciones,
    articuloNombre,
    categoriaNombre
  );
  return sufijoDesdePresentacion(presentacion);
}

/**
 * Extras sin presentación (para listar debajo del item).
 */
export function getExtrasSinPresentacion(extras) {
  const arr = Array.isArray(extras) ? extras : [];
  return arr.filter((e) => {
    const n = e.nombre || e.adicional_nombre || e.name || '';
    return !ES_HACELA_DOBLE(n) && !ES_HACELA_TRIPLE(n) && !ES_HACELA_CUADRUPLE(n);
  });
}

/** Límite técnico de unidades por extra (alineado con backend/carta). */
export const CANTIDAD_EXTRA_MAX = 99;

/** Cantidad efectiva de un extra (default 1). */
export function getExtraCantidad(extra) {
  const n = parseInt(extra?.cantidad, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function formatExtraNombre(extra) {
  const nombre = extra?.nombre || extra?.adicional_nombre || extra?.name || '';
  const qty = getExtraCantidad(extra);
  return qty > 1 ? `${nombre} x${qty}` : nombre;
}

export function getExtraLineTotal(extra) {
  const precio = parseFloat(extra?.precio_extra ?? extra?.precio ?? 0) || 0;
  return precio * getExtraCantidad(extra);
}

/**
 * Construye personalizaciones en formato estándar carta para pedidos_contenido.
 * Formato: `{ extras: [{ id, nombre, precio_extra, cantidad? }], extrasTotal }`
 *
 * @param {Array} extras - Array de extras (pueden tener precio o precio_extra)
 * @returns {Object|null} Objeto para personalizaciones o null si no hay extras
 */
export function buildPersonalizaciones(extras) {
  const arr = Array.isArray(extras) ? extras : [];
  if (arr.length === 0) return null;

  const extrasEstandar = arr.map((e) => {
    const cantidad = getExtraCantidad(e);
    const precio_extra = parseFloat(e.precio_extra ?? e.precio ?? 0) || 0;
    const entry = {
      id: e.id ?? e.adicional_id ?? null,
      nombre: e.nombre ?? e.adicional_nombre ?? e.name ?? '',
      precio_extra,
    };
    if (cantidad > 1) entry.cantidad = cantidad;
    return entry;
  });

  const extrasTotal = extrasEstandar.reduce(
    (s, e) => s + e.precio_extra * getExtraCantidad(e),
    0
  );

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
          id: e.id ?? e.adicional_id ?? null,
          nombre: e.nombre || e.adicional_nombre || e.name || '',
          precio: parseFloat(e.precio_extra ?? e.precio ?? 0) || 0,
          cantidad: getExtraCantidad(e),
        }));
        const extrasTotal =
          typeof parsed?.extrasTotal === 'number'
            ? parsed.extrasTotal
            : extras.reduce((s, e) => s + e.precio * getExtraCantidad(e), 0);
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
    id: e.id ?? e.adicional_id ?? null,
    nombre: e.nombre || e.adicional_nombre || e.name || '',
    precio: parseFloat(e.precio_extra ?? e.precio ?? 0) || 0,
    cantidad: getExtraCantidad(e),
  }));
  const extrasTotal = extras.reduce((s, e) => s + e.precio * getExtraCantidad(e), 0);
  return { extras, extrasTotal };
}
