import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Search, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClienteAutocomplete } from '@/hooks/pedidos/useClienteAutocomplete';

export function ClienteAutocomplete({
  value,
  onInputChange,
  onSelectCliente,
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
  } = useClienteAutocomplete({ debounceMs: 300 });

  useEffect(() => {
    setQuery(value ?? '');
  }, [value, setQuery]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const trimmedQuery = (value ?? query ?? '').trim();
  const showNoMatchHint =
    trimmedQuery.length >= 2 && !isLoading && !error && items.length === 0;

  const shouldShowList = useMemo(
    () => open && (isLoading || Boolean(error) || items.length > 0),
    [open, isLoading, error, items.length]
  );

  const handleChange = (nextValue) => {
    onInputChange?.(nextValue);
    setQuery(nextValue);
    setOpen(true);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setOpen(true);
  };

  return (
    <div className="relative space-y-2">
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

      {showNoMatchHint ? (
        <p className="text-xs text-muted-foreground">No hay coincidencias para la búsqueda.</p>
      ) : null}

      {shouldShowList && (
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
                  onClick={() => {
                    onSelectCliente?.(cliente);
                    onInputChange?.(cliente.nombre || '');
                    setQuery(cliente.nombre || '');
                    setOpen(false);
                  }}
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
        </div>
      )}
    </div>
  );
}

export default ClienteAutocomplete;
