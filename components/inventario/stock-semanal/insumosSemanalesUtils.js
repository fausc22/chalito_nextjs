/** Normaliza distintas formas de "activo" que puede devolver el backend */
export function isInsumoSemanalActivo(insumo) {
  if (!insumo) return false;
  const v = insumo.activo;
  return v === true || v === 1 || v === '1';
}
