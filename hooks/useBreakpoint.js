import { useState, useEffect } from 'react';

/**
 * 🎯 Hook para detectar breakpoints de forma eficiente
 * 
 * @param {number} breakpoint - Ancho en px (default: 1024)
 * @returns {boolean} - true si viewport >= breakpoint
 * 
 * @example
 * const isDesktop = useBreakpoint(1024);
 * const isTablet = useBreakpoint(768);
 */
export function useBreakpoint(breakpoint = 1024) {
  const [isAboveBreakpoint, setIsAboveBreakpoint] = useState(false);

  useEffect(() => {
    // ✅ Evitar error en SSR (Next.js)
    if (typeof window === 'undefined') return;

    // 🎯 Función de verificación
    const checkBreakpoint = () => {
      setIsAboveBreakpoint(window.innerWidth >= breakpoint);
    };

    // ⚡ Verificación inicial
    checkBreakpoint();

    // 📱 Listener con debounce nativo
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkBreakpoint, 150);
    };

    window.addEventListener('resize', handleResize);

    // 🧹 Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isAboveBreakpoint;
}

/**
 * 🎨 Hook avanzado con múltiples breakpoints
 * 
 * @returns {Object} - Objeto con estados de breakpoints
 * 
 * @example
 * const { isMobile, isTablet, isDesktop, isWide } = useResponsive();
 */
export function useResponsive() {
  const [breakpoints, setBreakpoints] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isWide: false,
    width: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateBreakpoints = () => {
      const width = window.innerWidth;
      setBreakpoints({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1440,
        isWide: width >= 1440,
        width,
      });
    };

    updateBreakpoints();

    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateBreakpoints, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return breakpoints;
}



