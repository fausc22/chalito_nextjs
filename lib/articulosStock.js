const TIPO_CONTROLA_STOCK_DEFAULT = {
  ELABORADO: false,
  BEBIDA: true,
  OTRO: true,
};

export const getDefaultControlaStockByTipo = (tipo) => {
  const tipoNormalizado = typeof tipo === 'string' ? tipo.toUpperCase() : 'OTRO';
  return TIPO_CONTROLA_STOCK_DEFAULT[tipoNormalizado] ?? true;
};

export const resolveControlaStock = (articulo = {}) => {
  const valorBackend = articulo.controla_stock;

  if (typeof valorBackend === 'boolean') return valorBackend;
  if (valorBackend === 1 || valorBackend === '1') return true;
  if (valorBackend === 0 || valorBackend === '0') return false;

  return getDefaultControlaStockByTipo(articulo.tipo);
};

export const isArticuloConControlStock = (articulo = {}) => resolveControlaStock(articulo);

export const isStockBajoArticulo = (articulo = {}) => {
  if (!isArticuloConControlStock(articulo)) return false;

  const stockActual = Number(articulo.stock_actual ?? 0);
  const stockMinimo = Number(articulo.stock_minimo ?? 0);
  return stockActual <= stockMinimo;
};
