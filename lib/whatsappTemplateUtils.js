export const TEMPLATE_KEYS = [
  'EFECTIVO_RETIRO',
  'EFECTIVO_DELIVERY',
  'TRANSFERENCIA_RETIRO',
  'TRANSFERENCIA_DELIVERY',
  'MERCADOPAGO_RETIRO',
  'MERCADOPAGO_DELIVERY',
];

export const TEMPLATE_LABELS = {
  EFECTIVO_RETIRO: 'Retiro en local',
  EFECTIVO_DELIVERY: 'Envío a domicilio',
  TRANSFERENCIA_RETIRO: 'Retiro en local',
  TRANSFERENCIA_DELIVERY: 'Envío a domicilio',
  MERCADOPAGO_RETIRO: 'Retiro en local',
  MERCADOPAGO_DELIVERY: 'Envío a domicilio',
};

export const TEMPLATE_GROUPS = [
  {
    id: 'EFECTIVO',
    label: 'Efectivo',
    keys: ['EFECTIVO_RETIRO', 'EFECTIVO_DELIVERY'],
  },
  {
    id: 'TRANSFERENCIA',
    label: 'Transferencia',
    keys: ['TRANSFERENCIA_RETIRO', 'TRANSFERENCIA_DELIVERY'],
  },
  {
    id: 'MERCADOPAGO',
    label: 'Mercado Pago',
    keys: ['MERCADOPAGO_RETIRO', 'MERCADOPAGO_DELIVERY'],
  },
];

export const PLACEHOLDER_CHIPS = [
  {
    key: 'id',
    token: '{{id}}',
    label: '# Pedido',
    required: true,
    description: 'Número único del pedido. Es obligatorio para identificar el pedido.',
  },
  {
    key: 'contenido',
    token: '{{contenido}}',
    label: 'Detalle del pedido',
    required: true,
    description: 'Lista de productos con cantidades. Es obligatorio para que el mensaje muestre el pedido.',
  },
  {
    key: 'total',
    token: '{{total}}',
    label: 'Total',
    required: true,
    description: 'Monto total del pedido. Es obligatorio para que el cliente vea cuánto pagar.',
  },
  {
    key: 'local',
    token: '{{local}}',
    label: 'Nombre del local',
    required: false,
    description: 'Nombre del negocio configurado en el sistema.',
  },
  {
    key: 'alias',
    token: '{{alias}}',
    label: 'Alias transferencia',
    required: false,
    description: 'Alias bancario para transferencias. Obligatorio en plantillas de Transferencia.',
  },
];

export const REQUIRED_PLACEHOLDERS_ALL = ['{{id}}', '{{contenido}}', '{{total}}'];
export const REQUIRED_PLACEHOLDERS_TRANSFERENCIA = ['{{alias}}'];
export const MAX_TEMPLATE_LENGTH = 1500;
const HTML_PATTERN = /<[a-zA-Z][^>]*>/;

export const PREVIEW_MOCK_CONTENIDO = '2x Milanesa napolitana (Papas fritas)\n1x Gaseosa 1.5L';

const KNOWN_PLACEHOLDERS = ['id', 'contenido', 'total', 'local', 'alias'];

const CHIP_BY_TOKEN = PLACEHOLDER_CHIPS.reduce((acc, chip) => {
  acc[chip.token] = chip;
  return acc;
}, {});

export const isTransferenciaKey = (key) => String(key).startsWith('TRANSFERENCIA_');

export const formatTemplateValidationError = (error) => {
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

export const validateTemplate = (templateKey, templateText) => {
  const errors = [];
  const text = String(templateText ?? '');

  if (!text.trim()) {
    errors.push('La plantilla no puede estar vacía');
    return errors;
  }

  if (text.length > MAX_TEMPLATE_LENGTH) {
    errors.push(`La plantilla supera el máximo de ${MAX_TEMPLATE_LENGTH} caracteres`);
  }

  if (HTML_PATTERN.test(text)) {
    errors.push('La plantilla no puede contener HTML');
  }

  for (const placeholder of REQUIRED_PLACEHOLDERS_ALL) {
    if (!text.includes(placeholder)) {
      errors.push(`Falta el placeholder obligatorio ${placeholder}`);
    }
  }

  if (isTransferenciaKey(templateKey)) {
    for (const placeholder of REQUIRED_PLACEHOLDERS_TRANSFERENCIA) {
      if (!text.includes(placeholder)) {
        errors.push(`Falta el placeholder obligatorio ${placeholder}`);
      }
    }
  }

  return errors;
};

export const validateAllPlantillas = (plantillas = {}) => {
  const errors = {};
  for (const key of TEMPLATE_KEYS) {
    const keyErrors = validateTemplate(key, plantillas[key]);
    if (keyErrors.length > 0) {
      errors[key] = keyErrors;
    }
  }
  return errors;
};

export const deriveModoPedidosWeb = ({ notificacionesActivas, clienteEnviaAlLocal }) => {
  const notif = Boolean(notificacionesActivas);
  const cliente = Boolean(clienteEnviaAlLocal);
  if (notif && cliente) return 'desactivado';
  if (notif) return 'local_a_cliente';
  if (cliente) return 'cliente_a_local';
  return 'desactivado';
};

export const modoToFlags = (modo) => {
  switch (modo) {
    case 'local_a_cliente':
      return { notificacionesActivas: true, clienteEnviaAlLocal: false };
    case 'cliente_a_local':
      return { notificacionesActivas: false, clienteEnviaAlLocal: true };
    default:
      return { notificacionesActivas: false, clienteEnviaAlLocal: false };
  }
};

export const getPlantillasMapForModo = (settings, modo) => {
  if (modo === 'cliente_a_local') {
    return settings.plantillasClienteLocal || {};
  }
  return settings.plantillas || {};
};

export const getPlantillasDefaultForModo = (settings, modo) => {
  if (modo === 'cliente_a_local') {
    return settings.plantillasClienteLocalDefault || {};
  }
  return settings.plantillasDefault || {};
};

export const formatNumeroWhatsAppDisplay = (digits) => {
  const raw = String(digits ?? '').replace(/\D/g, '');
  if (!raw) return null;
  if (raw.startsWith('549') && raw.length >= 12) {
    const rest = raw.slice(3);
    const area = rest.slice(0, 4);
    const mid = rest.slice(4, 6);
    const end = rest.slice(6);
    return `+54 9 ${area} ${mid}${end ? `-${end}` : ''}`.trim();
  }
  return `+${raw}`;
};

export const hasValidationErrors = (errors) => Object.keys(errors).length > 0;

export const applyTemplate = (template, vars = {}) => {
  let result = String(template ?? '');
  for (const key of KNOWN_PLACEHOLDERS) {
    result = result.split(`{{${key}}}`).join(vars[key] != null ? String(vars[key]) : '');
  }
  return result;
};

export const buildPreviewText = (template, { nombreNegocio, aliasTransferencia }) =>
  applyTemplate(template, {
    id: '1234',
    local: nombreNegocio || 'El Chalito',
    alias: aliasTransferencia || 'tu.alias.mp',
    total: '$ 18.500',
    contenido: PREVIEW_MOCK_CONTENIDO,
  });

export const insertAtCursor = (textarea, textToInsert) => {
  if (!textarea) return textToInsert;
  const start = textarea.selectionStart ?? 0;
  const end = textarea.selectionEnd ?? 0;
  const current = textarea.value ?? '';
  const next = current.slice(0, start) + textToInsert + current.slice(end);
  const cursor = start + textToInsert.length;
  return { next, cursor };
};
