export const CLIENTE_AL_LOCAL_REQUIRED_PLACEHOLDERS = [
  '{{cliente}}',
  '{{modalidad}}',
  '{{contenido}}',
  '{{total}}',
  '{{medio_pago}}',
  '{{codigo_pedido}}',
];

export const CLIENTE_AL_LOCAL_PLACEHOLDER_CHIPS = [
  {
    key: 'cliente',
    token: '{{cliente}}',
    label: 'Nombre del cliente',
    required: true,
    description: 'Nombre de quien hace el pedido. Es obligatorio.',
  },
  {
    key: 'modalidad',
    token: '{{modalidad}}',
    label: 'Tipo de entrega',
    required: true,
    description: 'Indica si es retiro o delivery. Es obligatorio.',
  },
  {
    key: 'contenido',
    token: '{{contenido}}',
    label: 'Lista de productos',
    required: true,
    description: 'Artículos del pedido con cantidades y totales. Es obligatorio.',
  },
  {
    key: 'total',
    token: '{{total}}',
    label: 'Total del pedido',
    required: true,
    description: 'Monto total del pedido. Es obligatorio.',
  },
  {
    key: 'medio_pago',
    token: '{{medio_pago}}',
    label: 'Forma de pago',
    required: true,
    description: 'Efectivo, transferencia o Mercado Pago. Es obligatorio.',
  },
  {
    key: 'codigo_pedido',
    token: '{{codigo_pedido}}',
    label: 'Código del pedido',
    required: true,
    description: 'Identificador del pedido web. Es obligatorio.',
  },
  {
    key: 'bloque_retiro',
    token: '{{bloque_retiro}}',
    label: 'Bloque retiro',
    required: false,
    description: 'Se completa solo en pedidos para retirar en el local. No borrar el nombre.',
  },
  {
    key: 'bloque_entrega',
    token: '{{bloque_entrega}}',
    label: 'Bloque dirección',
    required: false,
    description: 'Se completa solo en pedidos delivery con dirección y entre calles.',
  },
  {
    key: 'bloque_horario',
    token: '{{bloque_horario}}',
    label: 'Bloque horario',
    required: false,
    description: 'Se completa si el pedido tiene horario programado.',
  },
  {
    key: 'bloque_descuento',
    token: '{{bloque_descuento}}',
    label: 'Bloque descuento',
    required: false,
    description: 'Se completa si el pedido tiene cupón o descuento aplicado.',
  },
  {
    key: 'bloque_abono',
    token: '{{bloque_abono}}',
    label: 'Bloque abono efectivo',
    required: false,
    description: 'Se completa en pagos en efectivo con monto de abono.',
  },
  {
    key: 'bloque_transferencia',
    token: '{{bloque_transferencia}}',
    label: 'Bloque transferencia',
    required: false,
    description: 'Se completa en pagos por transferencia con alias.',
  },
  {
    key: 'bloque_mercadopago',
    token: '{{bloque_mercadopago}}',
    label: 'Bloque Mercado Pago',
    required: false,
    description: 'Se completa en pagos con Mercado Pago.',
  },
  {
    key: 'subtotal',
    token: '{{subtotal}}',
    label: 'Subtotal',
    required: false,
    description: 'Uso interno. Neto sin IVA.',
  },
  {
    key: 'alias',
    token: '{{alias}}',
    label: 'Alias transferencia',
    required: false,
    description: 'Alias bancario del local para transferencias.',
  },
  {
    key: 'telefono',
    token: '{{telefono}}',
    label: 'Teléfono',
    required: false,
    description: 'Teléfono del cliente.',
  },
  {
    key: 'horario',
    token: '{{horario}}',
    label: 'Horario',
    required: false,
    description: 'Horario de entrega programado.',
  },
  {
    key: 'cupon',
    token: '{{cupon}}',
    label: 'Cupón',
    required: false,
    description: 'Código de cupón aplicado.',
  },
  {
    key: 'descuento',
    token: '{{descuento}}',
    label: 'Descuento',
    required: false,
    description: 'Monto descontado por cupón.',
  },
  {
    key: 'id',
    token: '{{id}}',
    label: '# Pedido',
    required: false,
    description: 'Número interno del pedido.',
  },
  {
    key: 'local',
    token: '{{local}}',
    label: 'Nombre del local',
    required: false,
    description: 'Nombre del negocio.',
  },
];

const PREVIEW_KNOWN_PLACEHOLDERS = CLIENTE_AL_LOCAL_PLACEHOLDER_CHIPS.map((chip) => chip.key);

const CHIP_BY_TOKEN = CLIENTE_AL_LOCAL_PLACEHOLDER_CHIPS.reduce((acc, chip) => {
  acc[chip.token] = chip;
  return acc;
}, {});

export const formatClienteAlLocalValidationError = (error) => {
  const text = String(error ?? '');
  const missingMatch = text.match(/Falta el placeholder obligatorio (\{\{[^}]+\}\})/);
  if (missingMatch) {
    const chip = CHIP_BY_TOKEN[missingMatch[1]];
    if (chip) {
      return `Falta ${chip.label} — ${chip.description}`;
    }
  }
  return text;
};

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
