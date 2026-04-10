const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getQuantity = (item) => {
  const quantity = toNumber(item?.quantity ?? item?.cantidad, 1);
  return quantity > 0 ? quantity : 1;
};

export const calculateLineSubtotalFromSnapshot = (item) => {
  const subtotal = toNumber(item?.subtotal, Number.NaN);
  if (Number.isFinite(subtotal)) return subtotal;

  const quantity = getQuantity(item);
  const unitPrice = toNumber(item?.precio ?? item?.price, 0);
  return unitPrice * quantity;
};

export const calculateCartItemTotal = (item) => {
  const quantity = getQuantity(item);
  const unitBasePrice = toNumber(item?.price ?? item?.precio, 0);
  const extras = item?.extras ?? item?.extrasSeleccionados ?? [];
  const unitExtrasTotal = extras.reduce((sum, extra) => sum + toNumber(extra?.precio, 0), 0);

  return (unitBasePrice + unitExtrasTotal) * quantity;
};

export const calculateCartSubtotal = (items = []) =>
  items.reduce((sum, item) => sum + calculateCartItemTotal(item), 0);
