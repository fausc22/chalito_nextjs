const toPathParts = (fieldPath) =>
  Array.isArray(fieldPath)
    ? fieldPath
    : String(fieldPath)
        .split('.')
        .map((part) => part.trim())
        .filter(Boolean);

export const getFieldError = (errors, fieldPath) => {
  if (!errors) return undefined;

  const pathParts = toPathParts(fieldPath);
  let current = errors;

  for (const part of pathParts) {
    if (current == null) return undefined;
    current = current[part];
  }

  return typeof current === 'string' ? current : undefined;
};

export const setFieldError = (errors, fieldPath, message) => {
  const pathParts = toPathParts(fieldPath);
  const nextErrors = { ...(errors || {}) };
  let current = nextErrors;

  pathParts.forEach((part, index) => {
    if (index === pathParts.length - 1) {
      current[part] = message;
      return;
    }

    current[part] = current[part] && typeof current[part] === 'object' ? { ...current[part] } : {};
    current = current[part];
  });

  return nextErrors;
};

export const clearFieldError = (errors, fieldPath) => {
  const pathParts = toPathParts(fieldPath);
  if (!pathParts.length || !errors) return errors || {};

  const nextErrors = { ...errors };
  const stack = [];
  let current = nextErrors;

  for (const part of pathParts) {
    if (current == null || typeof current !== 'object' || !(part in current)) {
      return nextErrors;
    }
    stack.push([current, part]);
    current = current[part];
  }

  const [owner, leaf] = stack.pop();
  delete owner[leaf];

  while (stack.length) {
    const [parent, key] = stack.pop();
    const value = parent[key];
    if (value && typeof value === 'object' && Object.keys(value).length === 0) {
      delete parent[key];
    }
  }

  return nextErrors;
};

export const hasErrors = (errors) => {
  if (!errors) return false;
  if (typeof errors === 'string') return errors.trim().length > 0;
  if (typeof errors !== 'object') return false;
  return Object.values(errors).some((value) => hasErrors(value));
};

export const zodIssuesToErrors = (issues = []) =>
  issues.reduce((acc, issue) => {
    const path = issue?.path?.length ? issue.path.join('.') : 'form';
    if (getFieldError(acc, path)) {
      return acc;
    }
    return setFieldError(acc, path, issue.message || 'Revisá este campo.');
  }, {});

export const getInputErrorProps = (errors, fieldPath) => {
  const error = getFieldError(errors, fieldPath);
  const messageId = `${String(fieldPath).replace(/\./g, '-')}-error`;

  return {
    error,
    messageId,
    inputProps: {
      error: Boolean(error),
      'aria-invalid': Boolean(error),
      'aria-describedby': error ? messageId : undefined,
    },
  };
};
