import { useMemo, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  PLACEHOLDER_CHIPS,
  TEMPLATE_LABELS,
  buildPreviewText,
  insertAtCursor,
  isTransferenciaKey,
  validateTemplate,
} from '@/lib/whatsappTemplateUtils';

export function WhatsAppPlantillaEditor({
  templateKey,
  value,
  onChange,
  onRestore,
  disabled,
  nombreNegocio,
  aliasTransferencia,
  serverErrors = [],
}) {
  const textareaRef = useRef(null);

  const localErrors = useMemo(() => validateTemplate(templateKey, value), [templateKey, value]);
  const errors = serverErrors.length > 0 ? serverErrors : localErrors;
  const hasErrors = errors.length > 0;

  const previewText = useMemo(
    () =>
      buildPreviewText(value, {
        nombreNegocio,
        aliasTransferencia,
      }),
    [value, nombreNegocio, aliasTransferencia]
  );

  const chips = isTransferenciaKey(templateKey)
    ? PLACEHOLDER_CHIPS
    : PLACEHOLDER_CHIPS.filter((chip) => chip.key !== 'alias');

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
        <p className="text-xs font-semibold text-foreground">
          {TEMPLATE_LABELS[templateKey] || templateKey}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={onRestore}
          disabled={disabled}
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Restaurar
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
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
        rows={8}
        className="font-mono text-xs"
        placeholder="Escribí el mensaje usando las variables..."
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
        <p className="text-xs font-medium text-muted-foreground">Vista previa</p>
        <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground font-sans">
          {previewText}
        </pre>
      </div>
    </div>
  );
}
