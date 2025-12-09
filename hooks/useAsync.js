import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para manejar operaciones asíncronas
 * Facilita el manejo de loading, error y data
 */
export const useAsync = (asyncFunction, immediate = true, dependencies = []) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Función para ejecutar la operación asíncrona
  const execute = useCallback(async (...params) => {
    setStatus('loading');
    setError(null);

    try {
      const response = await asyncFunction(...params);
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);

  // Ejecutar automáticamente si immediate es true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  // Resetear estado
  const reset = useCallback(() => {
    setStatus('idle');
    setData(null);
    setError(null);
  }, []);

  return {
    execute,
    reset,
    status,
    data,
    error,
    isLoading: status === 'loading',
    isError: status === 'error',
    isSuccess: status === 'success',
    isIdle: status === 'idle',
  };
};

export default useAsync;


