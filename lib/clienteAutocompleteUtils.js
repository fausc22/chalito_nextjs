import {
  sanitizeNombre,
  sanitizeTelefono,
  sanitizedDireccionFieldsFromStored,
} from '@/lib/pedidoFormDireccion';

export const CLIENTE_AUTOCOMPLETE_MIN_CHARS = 2;

export function applyClienteFieldUpdate(prev, fieldPath, value) {
  if (fieldPath.startsWith('direccion.')) {
    const nestedField = fieldPath.replace('direccion.', '');
    return {
      ...prev,
      direccion: {
        ...prev.direccion,
        [nestedField]: value,
      },
    };
  }

  return {
    ...prev,
    [fieldPath]: value,
  };
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function direccionMatchesStored(cliente, ultimaDireccion) {
  const expected = sanitizedDireccionFieldsFromStored(ultimaDireccion);
  const d = cliente.direccion || {};
  const fields = ['calle', 'numero', 'entreCalles', 'edificio', 'piso'];

  return fields.every((key) => String(d[key] || '') === String(expected[key] || ''));
}

/**
 * Indica si los datos del formulario siguen alineados con el cliente elegido del autocomplete.
 */
export function clienteFormMatchesSeleccion(cliente, seleccionado, tipoEntrega) {
  if (!seleccionado) return true;

  if (sanitizeNombre(cliente.nombre) !== sanitizeNombre(seleccionado.nombre || '')) {
    return false;
  }

  if (sanitizeTelefono(cliente.telefono) !== sanitizeTelefono(seleccionado.telefono || '')) {
    return false;
  }

  if (normalizeEmail(cliente.email) !== normalizeEmail(seleccionado.email)) {
    return false;
  }

  if (tipoEntrega === 'delivery' && seleccionado.ultima_direccion) {
    return direccionMatchesStored(cliente, seleccionado.ultima_direccion);
  }

  return true;
}
