const normalizeText = (value) => (value ?? '').toString().trim();

const normalizeExtra = (extra = {}) => ({
  id: extra.id ?? extra.adicional_id ?? null,
  nombre: (extra.nombre ?? extra.adicional_nombre ?? '').toString(),
  precio: Number.parseFloat(extra.precio ?? extra.precio_extra ?? 0) || 0
});

const sortExtras = (extras = []) =>
  [...extras]
    .map(normalizeExtra)
    .sort((a, b) => {
      const idA = a.id == null ? '' : String(a.id);
      const idB = b.id == null ? '' : String(b.id);
      if (idA !== idB) return idA.localeCompare(idB);
      if (a.nombre !== b.nombre) return a.nombre.localeCompare(b.nombre);
      return a.precio - b.precio;
    });

const stableExtrasKey = (extras = []) => JSON.stringify(sortExtras(extras));

const getItemObservaciones = (item = {}) =>
  normalizeText(item.observaciones ?? item.observacion ?? item.notes ?? '');

const getItemQuantity = (item = {}) => {
  const parsed = Number.parseInt(item.quantity ?? item.cantidad, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const getItemProductId = (item = {}) => item.product_id ?? item.id ?? item.articulo_id;

const getItemExtras = (item = {}) => item.extras ?? item.extrasSeleccionados ?? [];

export const crearItemCarrito = ({ product_id, nombre, price, extras = [], observaciones = '', quantity = 1, sourceProduct = null }) => {
  const normalizedExtras = sortExtras(extras);
  const normalizedObservaciones = normalizeText(observaciones);
  const normalizedQuantity = Math.max(1, Number.parseInt(quantity, 10) || 1);

  const categoria =
    sourceProduct?.categoria ??
    sourceProduct?.categoria_id ??
    sourceProduct?.categoriaId ??
    undefined;

  return {
    product_id,
    nombre,
    price: Number.parseFloat(price) || 0,
    extras: normalizedExtras,
    observaciones: normalizedObservaciones,
    quantity: normalizedQuantity,
    carritoId: Date.now() + Math.random(),
    // Compatibilidad temporal con componentes existentes
    id: product_id,
    articulo_id: product_id,
    precio: Number.parseFloat(price) || 0,
    extrasSeleccionados: normalizedExtras,
    observacion: normalizedObservaciones || undefined,
    cantidad: normalizedQuantity,
    extrasDisponibles: sourceProduct?.extrasDisponibles || [],
    categoria,
  };
};

export const sonItemsAgrupables = (left, right) => {
  if (getItemProductId(left) !== getItemProductId(right)) return false;
  if (getItemObservaciones(left) !== getItemObservaciones(right)) return false;
  return stableExtrasKey(getItemExtras(left)) === stableExtrasKey(getItemExtras(right));
};

export const mergeItemEnCarrito = (carritoPrevio = [], itemNuevo) => {
  const qtyToAdd = getItemQuantity(itemNuevo);
  const idx = carritoPrevio.findIndex((item) => sonItemsAgrupables(item, itemNuevo));

  if (idx === -1) {
    return [...carritoPrevio, { ...itemNuevo, quantity: qtyToAdd, cantidad: qtyToAdd }];
  }

  return carritoPrevio.map((item, index) => {
    if (index !== idx) return item;
    const updated = getItemQuantity(item) + qtyToAdd;
    return { ...item, quantity: updated, cantidad: updated };
  });
};

export const reagruparCarrito = (carrito = []) =>
  carrito.reduce((acc, item) => mergeItemEnCarrito(acc, item), []);

