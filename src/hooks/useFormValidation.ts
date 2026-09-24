import { useState, useCallback } from 'react';

export type ValidationRule = {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  isNumber?: boolean;      
  isInteger?: boolean;     
  isPositive?: boolean;    
  custom?: (value: any) => boolean;
  message: string;
};

export type ValidationSchema = {
  [key: string]: ValidationRule | ValidationRule[];
};

export type ValidationErrors = {
  [key: string]: string;
};

export type TouchedFields = {
  [key: string]: boolean;
};

export function useFormValidation(schema: ValidationSchema) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (fieldName: string, value: any): string | null => {
      const rules = schema[fieldName];
      if (!rules) return null;

      // Handle array of rules
      const ruleArray = Array.isArray(rules) ? rules : [rules];

      for (const rule of ruleArray) {
        // Required validation
        if (rule.required) {
          if (value === null || value === undefined || value === '') {
            return rule.message;
          }
          if (typeof value === 'string' && !value.trim()) {
            return rule.message;
          }
        }

        // Skip other validations if value is empty and not required
        if (!value && !rule.required) {
          continue;
        }

        // Number validation (strict - must be valid number)
        if (rule.isNumber) {
          const numValue = typeof value === 'string' ? parseFloat(value) : value;
          if (isNaN(numValue) || typeof numValue !== 'number') {
            return rule.message;
          }
          // Continue to use numValue for other number validations
          value = numValue;
        }

        // Integer validation (must be whole number)
        if (rule.isInteger) {
          const numValue = typeof value === 'string' ? parseFloat(value) : value;
          if (isNaN(numValue) || !Number.isInteger(numValue)) {
            return rule.message;
          }
        }

        // Positive number validation
        if (rule.isPositive) {
          const numValue = typeof value === 'string' ? parseFloat(value) : value;
          if (isNaN(numValue) || numValue <= 0) {
            return rule.message;
          }
        }

        // Pattern validation
        if (rule.pattern && typeof value === 'string') {
          if (!rule.pattern.test(value)) {
            return rule.message;
          }
        }

        // Min length validation
        if (rule.minLength !== undefined && typeof value === 'string') {
          if (value.length < rule.minLength) {
            return rule.message;
          }
        }

        // Max length validation
        if (rule.maxLength !== undefined && typeof value === 'string') {
          if (value.length > rule.maxLength) {
            return rule.message;
          }
        }

        // Min value validation (for numbers)
        if (rule.min !== undefined) {
          const numValue = typeof value === 'string' ? parseFloat(value) : value;
          if (!isNaN(numValue) && numValue < rule.min) {
            return rule.message;
          }
        }

        // Max value validation (for numbers)
        if (rule.max !== undefined) {
          const numValue = typeof value === 'string' ? parseFloat(value) : value;
          if (!isNaN(numValue) && numValue > rule.max) {
            return rule.message;
          }
        }

        // Custom validation
        if (rule.custom) {
          if (!rule.custom(value)) {
            return rule.message;
          }
        }
      }

      return null;
    },
    [schema]
  );

  /**
   * Validate a single field and update errors state
   */
  const validate = useCallback(
    (fieldName: string, value: any): boolean => {
      const error = validateField(fieldName, value);

      setErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[fieldName] = error;
        } else {
          delete next[fieldName];
        }
        return next;
      });

      return error === null;
    },
    [validateField]
  );

  /**
   * Validate all fields in the form data
   */
  const validateAll = useCallback(
    (formData: { [key: string]: any }): boolean => {
      const newErrors: ValidationErrors = {};

      Object.keys(schema).forEach((fieldName) => {
        const value = formData[fieldName];
        const error = validateField(fieldName, value);
        if (error) {
          newErrors[fieldName] = error;
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [schema, validateField]
  );

  /**
   * Clear error for a specific field
   */
  const clearError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Mark a field as touched
   */
  const markTouched = useCallback((fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  /**
   * Mark multiple fields as touched
   */
  const markAllTouched = useCallback(() => {
    const allTouched: TouchedFields = {};
    Object.keys(schema).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
  }, [schema]);

  /**
   * Reset touched state
   */
  const resetTouched = useCallback(() => {
    setTouched({});
  }, []);

  /**
   * Check if form is valid (no errors)
   */
  const isValid = Object.keys(errors).length === 0;

  /**
   * Check if a specific field has error
   */
  const hasError = useCallback(
    (fieldName: string): boolean => {
      return !!errors[fieldName];
    },
    [errors]
  );

  /**
   * Get error message for a field
   */
  const getError = useCallback(
    (fieldName: string): string | undefined => {
      return errors[fieldName];
    },
    [errors]
  );

  /**
   * Check if field is touched
   */
  const isTouched = useCallback(
    (fieldName: string): boolean => {
      return !!touched[fieldName];
    },
    [touched]
  );

  /**
   * Validate on blur (mark touched and validate)
   */
  const validateOnBlur = useCallback(
    (fieldName: string, value: any) => {
      markTouched(fieldName);
      validate(fieldName, value);
    },
    [markTouched, validate]
  );

  return {
    // State
    errors,
    touched,
    isValid,

    // Validation methods
    validate,
    validateAll,
    validateField,
    validateOnBlur,

    // Error management
    clearError,
    clearAllErrors,
    hasError,
    getError,

    // Touched management
    markTouched,
    markAllTouched,
    resetTouched,
    isTouched,
  };
}
