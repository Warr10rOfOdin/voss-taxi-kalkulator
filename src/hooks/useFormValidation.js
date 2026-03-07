/**
 * Form Validation Hook
 *
 * Provides real-time form validation with visual feedback.
 */

import { useState, useCallback } from 'react';
import { validateDistance, validateDuration, validateTime, validateDate } from '../utils/validators';

export function useFormValidation() {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    let error = null;

    switch (name) {
      case 'distanceKm':
        if (!validateDistance(value)) {
          error = 'Distance must be between 0 and 999 km';
        }
        break;

      case 'durationMin':
        if (!validateDuration(value)) {
          error = 'Duration must be between 0 and 999 minutes';
        }
        break;

      case 'tripTime':
        if (value && !validateTime(value)) {
          error = 'Invalid time format (HH:mm)';
        }
        break;

      case 'tripDate':
        if (value && !validateDate(value)) {
          error = 'Invalid date format';
        }
        break;

      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return !error;
  }, []);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  const handleChange = useCallback((name, value) => {
    // Validate on change if field has been touched
    if (touched[name]) {
      validateField(name, value);
    }
  }, [touched, validateField]);

  const isFieldValid = useCallback((name) => {
    return !errors[name];
  }, [errors]);

  const getFieldError = useCallback((name) => {
    return touched[name] ? errors[name] : null;
  }, [touched, errors]);

  const hasErrors = useCallback(() => {
    return Object.values(errors).some(error => error !== null);
  }, [errors]);

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField,
    handleBlur,
    handleChange,
    isFieldValid,
    getFieldError,
    hasErrors,
    reset
  };
}
