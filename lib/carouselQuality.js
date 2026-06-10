export const CAROUSEL_IDEAL = { width: 1920, height: 1080 };
export const CAROUSEL_MIN = { width: 1600, height: 900 };
export const CAROUSEL_MAX_SLIDES = 10;
export const CAROUSEL_ZOOM_MIN = 1;
export const CAROUSEL_ZOOM_MAX = 1.35;

const TARGET_ASPECT = 16 / 9;
const ASPECT_TOLERANCE = 0.08;

export function buildCarouselWarnings(width, height) {
  const warnings = [];
  const w = Number(width);
  const h = Number(height);

  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    warnings.push('No se pudo detectar resolución. Se aplicará recorte automático.');
    return warnings;
  }

  if (w < CAROUSEL_MIN.width || h < CAROUSEL_MIN.height) {
    warnings.push('Resolución baja: puede perder nitidez en pantallas grandes.');
  }

  const aspectRatio = w / h;
  if (Math.abs(aspectRatio - TARGET_ASPECT) > ASPECT_TOLERANCE) {
    warnings.push('Proporción distinta a 16:9: se aplicará recorte automático.');
  }

  if (
    w >= CAROUSEL_IDEAL.width &&
    h >= CAROUSEL_IDEAL.height &&
    Math.abs(aspectRatio - TARGET_ASPECT) <= ASPECT_TOLERANCE
  ) {
    return warnings;
  }

  if (warnings.length === 0) {
    warnings.push('Imagen aceptable. Para mejor resultado use 1920x1080 (16:9).');
  }

  return warnings;
}

export function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Archivo inválido'));
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: Number((img.naturalWidth / img.naturalHeight).toFixed(4)),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen'));
    };
    img.src = url;
  });
}

export function formatResolution(width, height) {
  if (!width || !height) return 'Resolución desconocida';
  return `${width}×${height}px`;
}
