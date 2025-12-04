import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar estados booleanos
 * Útil para toggles, checkboxes, etc.
 */
export const useToggle = (initialState = false) => {
  const [state, setState] = useState(initialState);

  const toggle = useCallback(() => {
    setState(prev => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setState(true);
  }, []);

  const setFalse = useCallback(() => {
    setState(false);
  }, []);

  return [state, toggle, setTrue, setFalse, setState];
};

export default useToggle;


