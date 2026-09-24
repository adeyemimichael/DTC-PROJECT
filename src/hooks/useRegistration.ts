import { useState, useCallback } from 'react';
import { useFormValidation, ValidationSchema } from './useFormValidation';

export interface RegistrationFormData {
  // Step 1: Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  address: string;
  city: string;

  // Step 2: Account Setup
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const initialFormData: RegistrationFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  dob: '',
  gender: '',
  address: '',
  city: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
};

// Validation schemas for each step
const step1Schema: ValidationSchema = {
  firstName: {
    required: true,
    message: 'First name is required',
  },
  lastName: {
    required: true,
    message: 'Last name is required',
  },
  email: [
    {
      required: true,
      message: 'Email address is required',
    },
    {
      pattern: /\S+@\S+\.\S+/,
      message: 'Please enter a valid email address',
    },
  ],
  phoneNumber: [
    {
      required: true,
      message: 'Phone number is required',
    },
    {
      pattern: /^\+?[0-9\s\-()]{8,20}$/,
      message: 'Please enter a valid phone number',
    },
  ],
  dob: [
    {
      required: true,
      message: 'Date of birth is required',
    },
    {
      custom: (value: string) => {
        const birthDate = new Date(value);
        const today = new Date();
        return birthDate <= today;
      },
      message: 'Date of birth cannot be in the future',
    },
  ],
  gender: {
    required: true,
    message: 'Please select your gender',
  },
  address: {
    required: true,
    message: 'Residential address is required',
  },
  city: {
    required: true,
    message: 'City is required',
  },
};

const step2Schema: ValidationSchema = {
  password: [
    {
      required: true,
      message: 'Password is required',
    },
    {
      minLength: 8,
      message: 'Password must be at least 8 characters',
    },
  ],
  confirmPassword: {
    required: true,
    message: 'Confirm password is required',
  },
  agreeToTerms: {
    custom: (value: boolean) => value === true,
    message: 'You must agree to the Terms of Service and Privacy Policy',
  },
};

export function useRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData);

  // Validation hooks for each step
  const step1Validation = useFormValidation(step1Schema);
  const step2Validation = useFormValidation(step2Schema);

  /**
   * Get current step validation
   */
  const getCurrentValidation = () => {
    switch (currentStep) {
      case 1:
        return step1Validation;
      case 2:
        return step2Validation;
      default:
        return step1Validation;
    }
  };

  /**
   * Update a single form field
   */
  const updateField = useCallback((field: keyof RegistrationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user types
    const validation = getCurrentValidation();
    validation.clearError(field);
  }, [currentStep]);

  /**
   * Update multiple fields at once
   */
  const updateFields = useCallback((updates: Partial<RegistrationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Handle gender selection
   */
  const selectGender = useCallback((gender: 'Male' | 'Female' | 'Other') => {
    setFormData((prev) => ({ ...prev, gender }));
    step1Validation.clearError('gender');
  }, [step1Validation]);

  /**
   * Handle checkbox change
   */
  const toggleCheckbox = useCallback((field: keyof RegistrationFormData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
    step2Validation.clearError(field);
  }, [step2Validation]);

  /**
   * Validate current step
   */
  const validateCurrentStep = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return step1Validation.validateAll(formData);
      case 2:
        // Also check if passwords match
        const isStep2Valid = step2Validation.validateAll(formData);
        if (formData.password !== formData.confirmPassword) {
          step2Validation.validate('confirmPassword', formData.confirmPassword);
          return false;
        }
        return isStep2Valid;
      default:
        return true;
    }
  }, [currentStep, formData, step1Validation, step2Validation]);

  /**
   * Go to next step
   */
  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      return true;
    }
    return false;
  }, [validateCurrentStep]);

  /**
   * Go to previous step
   */
  const previousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  /**
   * Go to specific step
   */
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 3) {
      setCurrentStep(step);
    }
  }, []);

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(1);
    step1Validation.clearAllErrors();
    step2Validation.clearAllErrors();
    step1Validation.resetTouched();
    step2Validation.resetTouched();
  }, [step1Validation, step2Validation]);

  /**
   * Get registration data for submission
   */
  const getSubmissionData = useCallback(() => {
    return {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      dob: formData.dob,
      gender: formData.gender,
      address: formData.address,
      city: formData.city,
    };
  }, [formData]);

  // Get current validation state
  const validation = getCurrentValidation();

  return {
    // State
    currentStep,
    formData,
    errors: validation.errors,
    isValid: validation.isValid,

    // Step navigation
    nextStep,
    previousStep,
    goToStep,

    // Form updates
    updateField,
    updateFields,
    selectGender,
    toggleCheckbox,

    // Validation
    validateCurrentStep,
    validate: validation.validate,
    clearError: validation.clearError,

    // Utilities
    resetForm,
    getSubmissionData,

    // Step info
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === 3,
    totalSteps: 3,
    canProceed: validation.isValid,
  };
}
