import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar formularios
 * Simplifica el manejo de estado y validación de formularios
 */
export const useForm = (initialValues = {}, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Actualizar un campo
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo al cambiar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  }, [errors]);

  // Marcar campo como tocado (para mostrar errores)
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    // Validar el campo si hay función de validación
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: validationErrors[name],
        }));
      }
    }
  }, [values, validate]);

  // Resetear formulario
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Establecer valores (útil para editar)
  const setFormValues = useCallback((newValues) => {
    setValues(newValues);
  }, []);

  // Establecer errores manualmente
  const setFormErrors = useCallback((newErrors) => {
    setErrors(newErrors);
  }, []);

  // Validar todo el formulario
  const validateForm = useCallback(() => {
    if (!validate) return true;

    const validationErrors = validate(values);
    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  }, [values, validate]);

  // Manejar submit
  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      if (e) e.preventDefault();

      setIsSubmitting(true);

      // Validar antes de enviar
      const isValid = validateForm();

      if (isValid) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Error en submit:', error);
        }
      }

      setIsSubmitting(false);
    };
  }, [values, validateForm]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues: setFormValues,
    setErrors: setFormErrors,
    validateForm,
  };
};

export default useForm;


