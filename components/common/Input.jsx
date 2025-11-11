/**
 * Componente Input reutilizable
 * Input con label, error y diferentes variantes
 */
export const Input = ({
  label,
  error,
  helperText,
  icon,
  fullWidth = true,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  const baseClasses = 'input';
  const errorClass = error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : '';
  const widthClass = fullWidth ? 'w-full' : '';
  const iconPadding = icon ? 'pl-12' : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${wrapperClassName}`}>
      {label && (
        <label className="label">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`${baseClasses} ${errorClass} ${widthClass} ${iconPadding} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

/**
 * Textarea reutilizable
 */
export const Textarea = ({
  label,
  error,
  helperText,
  fullWidth = true,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  const baseClasses = 'input resize-none';
  const errorClass = error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : '';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${wrapperClassName}`}>
      {label && (
        <label className="label">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`${baseClasses} ${errorClass} ${widthClass} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

/**
 * Select reutilizable
 */
export const Select = ({
  label,
  error,
  helperText,
  options = [],
  fullWidth = true,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  const baseClasses = 'input';
  const errorClass = error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : '';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${wrapperClassName}`}>
      {label && (
        <label className="label">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`${baseClasses} ${errorClass} ${widthClass} ${className}`}
        {...props}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
        {props.children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

/**
 * Checkbox reutilizable
 */
export const Checkbox = ({
  label,
  error,
  className = '',
  labelClassName = '',
  ...props
}) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        className={`w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 ${className}`}
        {...props}
      />
      {label && (
        <label htmlFor={props.id} className={`label mb-0 cursor-pointer ${labelClassName}`}>
          {label}
        </label>
      )}
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
};


