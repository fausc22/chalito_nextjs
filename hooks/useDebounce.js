import { useState, useEffect } from 'react';

/**
 * Hook para debouncing de valores
 * Útil para búsquedas en tiempo real sin sobrecargar el servidor
 *
 * @param {any} value - Valor a debounce
 * @param {number} delay - Retraso en milisegundos (default: 500ms)
 * @returns {any} Valor debounced
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 500);
 *
 * useEffect(() => {
 *   // Hacer búsqueda con debouncedSearch
 * }, [debouncedSearch]);
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Establecer timeout para actualizar el valor debounced
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timeout si el valor cambia antes del delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para callback debounced
 * Útil para funciones que se ejecutan frecuentemente
 *
 * @param {function} callback - Función a ejecutar
 * @param {number} delay - Retraso en milisegundos (default: 500ms)
 * @returns {function} Función debounced
 *
 * @example
 * const handleSearch = useDebouncedCallback((query) => {
 *   fetchResults(query);
 * }, 500);
 */
export function useDebouncedCallback(callback, delay = 500) {
  const [timeoutId, setTimeoutId] = useState(null);

  const debouncedCallback = (...args) => {
    // Limpiar timeout anterior
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Establecer nuevo timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedCallback;
}
