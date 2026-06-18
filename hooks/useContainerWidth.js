import { useEffect, useState } from 'react';

/** Ancho mínimo del cuerpo de OrderRow para layout items | acciones en línea */
export const ROW_INLINE_MIN = 420;

/**
 * Densidad de acciones según ancho real del contenedor (card footer, etc.)
 * - comfortable (>= 300): ícono + texto completo
 * - medium (220–299): ícono + texto corto
 * - compact (160–219): solo ícono + title
 * - minimal (< 160): primarias ícono; secundarias en menú "..."
 */
export function getActionDensity(width) {
  if (width >= 300) return 'comfortable';
  if (width >= 220) return 'medium';
  if (width >= 160) return 'compact';
  return 'minimal';
}

/**
 * Mide el ancho de un elemento con ResizeObserver.
 * @param {React.RefObject<HTMLElement|null>} ref
 * @returns {number} contentRect.width en px (0 antes del primer measure)
 */
export function useContainerWidth(ref) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const measure = () => {
      setWidth(el.getBoundingClientRect().width);
    };

    measure();
    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [ref]);

  return width;
}
