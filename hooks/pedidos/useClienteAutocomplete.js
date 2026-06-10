import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clientesService } from '@/services/clientesService';
import { CLIENTE_AUTOCOMPLETE_MIN_CHARS } from '@/lib/clienteAutocompleteUtils';

export { CLIENTE_AUTOCOMPLETE_MIN_CHARS };

export function useClienteAutocomplete({ debounceMs = 300 } = {}) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const debounceRef = useRef(null);
  const requestSeqRef = useRef(0);

  const clearResults = useCallback(() => {
    setItems([]);
    setError('');
    setIsLoading(false);
    setLastSearchQuery('');
  }, []);

  const reset = useCallback(() => {
    requestSeqRef.current += 1;
    setQuery('');
    clearResults();
  }, [clearResults]);

  const buscar = useCallback(async (value) => {
    const q = String(value || '').trim();
    if (q.length < CLIENTE_AUTOCOMPLETE_MIN_CHARS) {
      requestSeqRef.current += 1;
      clearResults();
      return;
    }

    const requestId = ++requestSeqRef.current;
    setIsLoading(true);
    setError('');

    const result = await clientesService.buscarSugerencias(q);
    if (requestId !== requestSeqRef.current) {
      return;
    }

    if (!result.success) {
      setError(result.error || 'No se pudieron cargar sugerencias');
      setItems([]);
      setIsLoading(false);
      setLastSearchQuery(q);
      return;
    }

    setItems(result.data || []);
    setIsLoading(false);
    setLastSearchQuery(q);
  }, [clearResults]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      buscar(query);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [buscar, debounceMs, query]);

  const isEmptyResult = useMemo(() => {
    const q = String(query || '').trim();
    return (
      !isLoading &&
      !error &&
      q.length >= CLIENTE_AUTOCOMPLETE_MIN_CHARS &&
      items.length === 0 &&
      lastSearchQuery === q
    );
  }, [query, isLoading, error, items.length, lastSearchQuery]);

  return useMemo(
    () => ({
      query,
      setQuery,
      items,
      isLoading,
      error,
      isEmptyResult,
      reset,
      clearResults,
    }),
    [query, items, isLoading, error, isEmptyResult, reset, clearResults]
  );
}
