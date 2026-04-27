export const safeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

export const formatCurrencyAr = (value) => {
  const safeAmount = safeNumber(value);

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
};

export const formatNumberAr = (value) => {
  const num = safeNumber(value);
  const hasDecimals = Math.abs(num % 1) > 0;
  return num.toLocaleString('es-AR', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  });
};

export const formatCountAr = (value) =>
  safeNumber(value).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export const formatDateLabel = (dateStr) => {
  if (!dateStr) return 'Sin fecha';
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
};

export const buildRangeLabel = (desde, hasta) => {
  if (!desde || !hasta) return 'Rango sin definir';
  return `${formatDateLabel(desde)} al ${formatDateLabel(hasta)}`;
};

export const getPercentage = (value, total) => {
  const safeValue = safeNumber(value);
  const safeTotal = safeNumber(total);
  if (safeTotal <= 0) return 0;
  return (safeValue / safeTotal) * 100;
};

export const formatPercentage = (value) => {
  const safeValue = safeNumber(value);
  const decimals = Number.isInteger(safeValue) ? 0 : 1;
  return `${safeValue.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
};

