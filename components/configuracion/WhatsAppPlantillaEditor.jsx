import { useMemo, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  PLACEHOLDER_CHIPS,
  TEMPLATE_LABELS,
  buildPreviewText,
  formatTemplateValidationError,
  insertAtCursor,
  isTransferenciaKey,
  validateTemplate,
} from '@/lib/whatsappTemplateUtils';
import {
  CLIENTE_AL_LOCAL_PLACEHOLDER_CHIPS,
  buildClienteAlLocalPreview,
  formatClienteAlLocalValidationError,
  validateClienteAlLocalTemplate,
} from '@/lib/whatsappClienteAlLocalUtils';

function ChipSection({ title, chips, tone, onInsert, disabled }) {
  const toneClass =
    tone === 'required'
      ? 'border-red-200 bg-red-50 text-red-900'
      : 'border-border bg-muted text-foreground';

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <button
            key={chip.token}
            type="button"
            disabled={disabled}
            title={chip.description}
            onClick={() => onInsert(chip.token)}
            className={`rounded-md border px-2 py-1 text-xs hover:opacity-90 disabled:opacity-50 ${toneClass}`}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function WhatsAppPlantillaEditor({
  templateKey,
  value,
  onChange,
  onRestore,
  disabled,
  nombreNegocio,
  aliasTransferencia,
  serverErrors = [],
  variant = 'local_a_cliente',
}) {
  const textareaRef = useRef(null);
  const isClienteLocal = variant === 'cliente_a_local';

  const localErrors = useMemo(() => {
    if (isClienteLocal) {
      return validateClienteAlLocalTemplate(value);
    }
    return validateTemplate(templateKey, value);
  }, [isClienteLocal, templateKey, value]);

  const errors = serverErrors.length > 0 ? serverErrors : localErrors;
  const hasErrors = errors.length > 0;
  const formatError = isClienteLocal
    ? formatClienteAlLocalValidationError
    : formatTemplateValidationError;

  const previewText = useMemo(() => {
    if (isClienteLocal) {
      return buildClienteAlLocalPreview(value, {
        nombreNegocio,
        aliasTransferencia,
      });
    }
    return buildPreviewText(value, {
      nombreNegocio,
      aliasTransferencia,
    });
  }, [isClienteLocal, value, nombreNegocio, aliasTransferencia]);

  const chips = useMemo(() => {
    if (isClienteLocal) {
      return CLIENTE_AL_LOCAL_PLACEHOLDER_CHIPS;
    }
    const base = isTransferenciaKey(templateKey)
      ? PLACEHOLDER_CHIPS
      : PLACEHOLDER_CHIPS.filter((chip) => chip.key !== 'alias');
    return base.map((chip) =>
      chip.key === 'alias' && isTransferenciaKey(templateKey)
        ? { ...chip, required: true }
        : chip
    );
  }, [isClienteLocal, templateKey]);

  const requiredChips = chips.filter((chip) => chip.required);
  const optionalChips = chips.filter((chip) => !chip.required);

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
    <div className="space-y-3 rounded-md border border-border p-3">
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

      <div className="space-y-2 rounded-md border border-border bg-card p-3">
        <ChipSection
          title="Campos obligatorios"
          chips={requiredChips}
          tone="required"
          onInsert={handleInsertChip}
          disabled={disabled}
        />
        {optionalChips.length > 0 ? (
          <ChipSection
            title="Campos opcionales"
            chips={optionalChips}
            tone="optional"
            onInsert={handleInsertChip}
            disabled={disabled}
          />
        ) : null}
        <p className="text-xs text-muted-foreground">
          Tocá un campo para insertarlo en el mensaje. Pasá el mouse sobre cada botón para ver qué hace.
        </p>
      </div>

      <Textarea
        ref={textareaRef}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        error={hasErrors}
        rows={12}
        className="font-mono text-xs"
        placeholder="Escribí el mensaje usando los campos de arriba..."
      />

      {hasErrors ? (
        <ul className="space-y-1 rounded-md border border-red-200 bg-red-50 p-3">
          {errors.map((error) => (
            <li key={error} className="text-xs text-red-700">
              {formatError(error)}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="space-y-1">
        <p className="text-xs font-semibold text-foreground">Así se verá el mensaje en WhatsApp</p>
        <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground font-sans">
          {previewText}
        </pre>
      </div>
    </div>
  );
}
