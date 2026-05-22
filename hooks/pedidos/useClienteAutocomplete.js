import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clientesService } from '@/services/clientesService';

export function useClienteAutocomplete({ debounceMs = 300 } = {}) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const debounceRef = useRef(null);
  const requestSeqRef = useRef(0);

  const clear = useCallback(() => {
    setItems([]);
    setError('');
    setIsLoading(false);
  }, []);

  const buscar = useCallback(async (value) => {
    const q = String(value || '').trim();
    if (q.length < 2) {
      requestSeqRef.current += 1;
      clear();
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
      return;
    }

    setItems(result.data || []);
    setIsLoading(false);
  }, [clear]);

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

  const selectCliente = useCallback((cliente) => {
    setSelectedCliente(cliente || null);
  }, []);

  return useMemo(() => ({
    query,
    setQuery,
    items,
    isLoading,
    error,
    selectedCliente,
    selectCliente,
    clear,
  }), [query, items, isLoading, error, selectedCliente, selectCliente, clear]);
}
