/**
 * Normaliza el campo activo de empleados (API puede enviar 0/1, boolean o string).
 */
export function normalizeActivo(value, { defaultActive = true } = {}) {
  if (value === undefined || value === null) {
    return defaultActive;
  }

  if (value === false || value === 0 || value === '0' || value === 'false') {
    return false;
  }

  return (
    value === true
    || value === 1
    || value === '1'
    || value === 'true'
  );
}
