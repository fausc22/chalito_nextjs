import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Search, Phone, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClienteAutocomplete } from '@/hooks/pedidos/useClienteAutocomplete';
import { CLIENTE_AUTOCOMPLETE_MIN_CHARS } from '@/lib/clienteAutocompleteUtils';

const BLUR_CLOSE_DELAY_MS = 250;

export function ClienteAutocomplete({
  value,
  onInputChange,
  onSelectCliente,
  onCreateCliente,
  placeholder = 'Nombre del cliente',
}) {
  const [open, setOpen] = useState(false);
  const blurTimeoutRef = useRef(null);
  const {
    query,
    setQuery,
    items,
    isLoading,
    error,
    isEmptyResult,
    reset,
  } = useClienteAutocomplete({ debounceMs: 300 });

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!String(value || '').trim()) {
      reset();
    }
  }, [value, reset]);

  const trimmedValue = String(value ?? '').trim();
  const canSearch = trimmedValue.length >= CLIENTE_AUTOCOMPLETE_MIN_CHARS;

  const shouldShowList = useMemo(
    () =>
      open &&
      canSearch &&
      (isLoading || Boolean(error) || items.length > 0 || isEmptyResult),
    [open, canSearch, isLoading, error, items.length, isEmptyResult]
  );

  const handleChange = (nextValue) => {
    onInputChange?.(nextValue);
    setQuery(nextValue);
    const trimmed = String(nextValue || '').trim();
    setOpen(trimmed.length >= CLIENTE_AUTOCOMPLETE_MIN_CHARS);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, BLUR_CLOSE_DELAY_MS);
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    if (canSearch || isLoading || items.length > 0 || error || isEmptyResult) {
      setOpen(true);
    }
  };

  const handleSelectExisting = (cliente) => {
    onSelectCliente?.(cliente);
    onInputChange?.(cliente.nombre || '');
    setQuery(cliente.nombre || '');
    setOpen(false);
  };

  const handleCreateNew = () => {
    const nombre = trimmedValue;
    if (!nombre) return;
    onCreateCliente?.(nombre);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>

      {shouldShowList ? (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-card p-2 shadow-lg">
          {isLoading ? (
            <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando clientes...
            </div>
          ) : null}

          {!isLoading && error ? (
            <p className="p-2 text-sm text-red-600">{error}</p>
          ) : null}

          {!isLoading && !error && items.length > 0 ? (
            <div className="space-y-1">
              {items.map((cliente) => (
                <Button
                  key={cliente.id}
                  type="button"
                  variant="ghost"
                  className="h-auto w-full justify-start px-2 py-2"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectExisting(cliente)}
                >
                  <div className="flex w-full flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cliente.nombre}</span>
                      {cliente.ultima_direccion ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Con dirección guardada
                        </Badge>
                      ) : null}
                    </div>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {cliente.telefono}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          ) : null}

          {!isLoading && !error && isEmptyResult ? (
            <div className="space-y-2 p-2">
              <p className="text-sm text-muted-foreground">
                Sin resultados para &quot;{trimmedValue}&quot;
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-auto w-full justify-start gap-2 py-2"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleCreateNew}
              >
                <UserPlus className="h-4 w-4 shrink-0" />
                Crear nuevo cliente
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default ClienteAutocomplete;
