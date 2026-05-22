import { direccionFormFromStored } from './formatters';

export const sanitizeNombre = (v) => (v || '').replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '');

export const sanitizeTelefono = (v) => {
  const s = (v || '').trim();
  const hasPlus = s.startsWith('+');
  const rest = (hasPlus ? s.slice(1) : s).replace(/[^\d\s\-()]/g, '');
  return (hasPlus ? '+' : '') + rest;
};

export const sanitizeDireccion = (v) =>
  (v || '').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,'\-/°]/g, '');

export const sanitizeNumeroAltura = (v) => (v || '').replace(/[^a-zA-Z0-9\s\-°]/g, '');

/**
 * Parsea dirección almacenada y aplica las mismas reglas que los inputs del formulario.
 */
export function sanitizedDireccionFieldsFromStored(str) {
  const raw = direccionFormFromStored(str);
  return {
    calle: sanitizeDireccion(raw.calle).slice(0, 200),
    numero: sanitizeNumeroAltura(raw.numero).slice(0, 30),
    edificio: sanitizeDireccion(raw.edificio).slice(0, 100),
    piso: sanitizeDireccion(raw.piso).slice(0, 50),
  };
}
