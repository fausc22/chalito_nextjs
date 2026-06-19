export const CLIENTE_AL_LOCAL_REQUIRED_PLACEHOLDERS = [
  '{{cliente}}',
  '{{modalidad}}',
  '{{contenido}}',
  '{{total}}',
  '{{medio_pago}}',
  '{{codigo_pedido}}',
];

export const CLIENTE_AL_LOCAL_PLACEHOLDER_CHIPS = [
  { key: 'cliente', token: '{{cliente}}', label: '{{cliente}}' },
  { key: 'modalidad', token: '{{modalidad}}', label: '{{modalidad}}' },
  { key: 'contenido', token: '{{contenido}}', label: '{{contenido}}' },
  { key: 'total', token: '{{total}}', label: '{{total}}' },
  { key: 'subtotal', token: '{{subtotal}}', label: '{{subtotal}} (neto sin IVA, uso interno)' },
  { key: 'medio_pago', token: '{{medio_pago}}', label: '{{medio_pago}}' },
  { key: 'codigo_pedido', token: '{{codigo_pedido}}', label: '{{codigo_pedido}}' },
  { key: 'bloque_retiro', token: '{{bloque_retiro}}', label: '{{bloque_retiro}}' },
  { key: 'bloque_entrega', token: '{{bloque_entrega}}', label: '{{bloque_entrega}}' },
  { key: 'bloque_horario', token: '{{bloque_horario}}', label: '{{bloque_horario}}' },
  { key: 'bloque_descuento', token: '{{bloque_descuento}}', label: '{{bloque_descuento}}' },
  { key: 'bloque_abono', token: '{{bloque_abono}}', label: '{{bloque_abono}}' },
  { key: 'bloque_transferencia', token: '{{bloque_transferencia}}', label: '{{bloque_transferencia}}' },
  { key: 'bloque_mercadopago', token: '{{bloque_mercadopago}}', label: '{{bloque_mercadopago}}' },
  { key: 'alias', token: '{{alias}}', label: '{{alias}}' },
  { key: 'telefono', token: '{{telefono}}', label: '{{telefono}}' },
  { key: 'horario', token: '{{horario}}', label: '{{horario}}' },
  { key: 'cupon', token: '{{cupon}}', label: '{{cupon}}' },
  { key: 'descuento', token: '{{descuento}}', label: '{{descuento}}' },
  { key: 'id', token: '{{id}}', label: '{{id}}' },
  { key: 'local', token: '{{local}}', label: '{{local}}' },
];

const PREVIEW_KNOWN_PLACEHOLDERS = CLIENTE_AL_LOCAL_PLACEHOLDER_CHIPS.map((chip) => chip.key);

export const validateClienteAlLocalTemplate = (templateText) => {
  const errors = [];
  const text = String(templateText ?? '');

  if (!text.trim()) {
    errors.push('La plantilla no puede estar vacía');
    return errors;
  }

  for (const placeholder of CLIENTE_AL_LOCAL_REQUIRED_PLACEHOLDERS) {
    if (!text.includes(placeholder)) {
      errors.push(`Falta el placeholder obligatorio ${placeholder}`);
    }
  }

  return errors;
};

export const buildClienteAlLocalPreview = (template, { nombreNegocio, aliasTransferencia }) => {
  const vars = {
    cliente: 'Federico López Vital',
    modalidad: 'DELIVERY',
    bloque_retiro: '',
    bloque_entrega: 'Entregar en Calle 403 número 195\nEntre calles Entre 300 y 404\n',
    bloque_horario: '',
    contenido:
      '✅ 1 x HAMBURGUESA WEISSMAN Triple  ($15.000)\n✅ 1 x HAMBURGUESA DIABLA Doble  ($14.000)',
    subtotal: '$24.793',
    bloque_descuento: '',
    total: '$29.000',
    medio_pago: 'TRANSFERENCIA',
    bloque_abono: '',
    bloque_transferencia: `Alias para transferir: ${aliasTransferencia || 'elchalito.mp'}\n`,
    bloque_mercadopago: '',
    alias: aliasTransferencia || 'elchalito.mp',
    telefono: '23025551234',
    horario: '',
    cupon: '',
    descuento: '',
    codigo_pedido: 'WEB-1234',
    id: '1234',
    local: nombreNegocio || 'El Chalito',
  };

  let result = String(template ?? '');
  for (const key of PREVIEW_KNOWN_PLACEHOLDERS) {
    result = result.split(`{{${key}}}`).join(vars[key] != null ? String(vars[key]) : '');
  }
  return result;
};
