// Validar email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar teléfono argentino
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
};

// Validar CUIT/CUIL
export const isValidCUIT = (cuit) => {
  const cleanCuit = cuit.replace(/\D/g, '');
  return cleanCuit.length === 11;
};

// Validar número positivo
export const isPositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

// Validar rango
export const isInRange = (value, min, max) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Validar campo requerido
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// Validar longitud mínima
export const hasMinLength = (value, minLength) => {
  if (typeof value !== 'string') return false;
  return value.trim().length >= minLength;
};

// Validar longitud máxima
export const hasMaxLength = (value, maxLength) => {
  if (typeof value !== 'string') return false;
  return value.trim().length <= maxLength;
};
