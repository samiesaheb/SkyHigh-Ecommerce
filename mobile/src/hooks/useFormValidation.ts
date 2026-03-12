import { useState, useCallback, useMemo } from 'react';
import { validateEmail, validatePassword, validatePhone, validateRequired } from '@/utils';

export interface ValidationRule {
  required?: boolean;
  email?: boolean;
  password?: boolean;
  phone?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  match?: string; // Field name to match against
}

export interface FieldConfig {
  value: string;
  rules: ValidationRule;
  error?: string;
  touched?: boolean;
}

export interface FormConfig {
  [fieldName: string]: FieldConfig;
}

export interface FormValidationHook {
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (fieldName: string, value: string) => void;
  setError: (fieldName: string, error: string) => void;
  clearError: (fieldName: string) => void;
  setTouched: (fieldName: string, touched?: boolean) => void;
  validateField: (fieldName: string) => boolean;
  validateForm: () => boolean;
  resetForm: () => void;
  setSubmitting: (submitting: boolean) => void;
  getFieldProps: (fieldName: string) => {
    value: string;
    onChangeText: (text: string) => void;
    onBlur: () => void;
    error?: string;
  };
}

export const useFormValidation = (initialConfig: FormConfig): FormValidationHook => {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initialValues: Record<string, string> = {};
    Object.keys(initialConfig).forEach(key => {
      initialValues[key] = initialConfig[key].value;
    });
    return initialValues;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateSingleField = useCallback((fieldName: string, value: string, rules: ValidationRule): string | null => {
    // Required validation
    if (rules.required && !validateRequired(value)) {
      return `${fieldName} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) {
      return null;
    }

    // Email validation
    if (rules.email && !validateEmail(value)) {
      return 'Please enter a valid email address';
    }

    // Password validation
    if (rules.password && !validatePassword(value)) {
      return `Password must be at least 8 characters long`;
    }

    // Phone validation
    if (rules.phone && !validatePhone(value)) {
      return 'Please enter a valid phone number';
    }

    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${fieldName} must be no more than ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return `${fieldName} format is invalid`;
    }

    // Match validation (for confirm password, etc.)
    if (rules.match && value !== values[rules.match]) {
      return `${fieldName} does not match ${rules.match}`;
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }, [values]);

  const setValue = useCallback((fieldName: string, value: string) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Auto-validate if field was touched
    if (touched[fieldName] && initialConfig[fieldName]) {
      const error = validateSingleField(fieldName, value, initialConfig[fieldName].rules);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    }
  }, [touched, initialConfig, validateSingleField]);

  const setError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, []);

  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const setTouched = useCallback((fieldName: string, isTouched = true) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: isTouched }));
  }, []);

  const validateField = useCallback((fieldName: string): boolean => {
    const config = initialConfig[fieldName];
    if (!config) return true;

    const error = validateSingleField(fieldName, values[fieldName] || '', config.rules);
    
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
      return false;
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    }
  }, [initialConfig, values, validateSingleField]);

  const validateForm = useCallback(): boolean => {
    const newErrors: Record<string, string> = {};
    let isFormValid = true;

    Object.keys(initialConfig).forEach(fieldName => {
      const config = initialConfig[fieldName];
      const error = validateSingleField(fieldName, values[fieldName] || '', config.rules);
      
      if (error) {
        newErrors[fieldName] = error;
        isFormValid = false;
      }
    });

    setErrors(newErrors);
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(initialConfig).forEach(key => {
      allTouched[key] = true;
    });
    setTouchedFields(allTouched);

    return isFormValid;
  }, [initialConfig, values, validateSingleField]);

  const resetForm = useCallback(() => {
    const initialValues: Record<string, string> = {};
    Object.keys(initialConfig).forEach(key => {
      initialValues[key] = initialConfig[key].value;
    });
    
    setValues(initialValues);
    setErrors({});
    setTouchedFields({});
    setIsSubmitting(false);
  }, [initialConfig]);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  const getFieldProps = useCallback((fieldName: string) => ({
    value: values[fieldName] || '',
    onChangeText: (text: string) => setValue(fieldName, text),
    onBlur: () => {
      setTouched(fieldName, true);
      validateField(fieldName);
    },
    error: touched[fieldName] ? errors[fieldName] : undefined,
  }), [values, errors, touched, setValue, setTouched, validateField]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && Object.keys(values).length > 0;
  }, [errors, values]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setError,
    clearError,
    setTouched,
    validateField,
    validateForm,
    resetForm,
    setSubmitting,
    getFieldProps,
  };
};