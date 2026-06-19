import { useMemo, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  CLIENTE_AL_LOCAL_PLACEHOLDER_CHIPS,
  buildClienteAlLocalPreview,
  validateClienteAlLocalTemplate,
} from '@/lib/whatsappClienteAlLocalUtils';
import { insertAtCursor } from '@/lib/whatsappTemplateUtils';

export function WhatsAppClienteAlLocalEditor({
  value,
  defaultValue,
  onChange,
  onRestore,
  disabled,
  nombreNegocio,
  aliasTransferencia,
  serverErrors = [],
}) {
  const textareaRef = useRef(null);

  const localErrors = useMemo(() => validateClienteAlLocalTemplate(value), [value]);
  const errors = serverErrors.length > 0 ? serverErrors : localErrors;
  const hasErrors = errors.length > 0;

  const previewText = useMemo(
    () =>
      buildClienteAlLocalPreview(value, {
        nombreNegocio,
        aliasTransferencia,
      }),
    [value, nombreNegocio, aliasTransferencia]
  );

  const handleInsertChip = (token) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(`${value || ''}${token}`);
      return;
    }
    const { next, cursor } = insertAtCursor(textarea, token);
    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">Mensaje del cliente al local</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={onRestore}
          disabled={disabled || !defaultValue}
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Restaurar
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CLIENTE_AL_LOCAL_PLACEHOLDER_CHIPS.map((chip) => (
          <button
            key={chip.token}
            type="button"
            disabled={disabled}
            onClick={() => handleInsertChip(chip.token)}
            className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-mono text-foreground hover:bg-muted/80 disabled:opacity-50"
          >
            {chip.label}
          </button>
        ))}
      </div>

      <Textarea
        ref={textareaRef}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        error={hasErrors}
        rows={14}
        className="font-mono text-xs"
        placeholder="Plantilla del mensaje que el cliente envía al local..."
      />

      {hasErrors ? (
        <ul className="space-y-0.5">
          {errors.map((error) => (
            <li key={error} className="text-xs text-red-600">
              {error}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Vista previa (ejemplo delivery + transferencia)</p>
        <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground font-sans">
          {previewText}
        </pre>
      </div>
    </div>
  );
}
