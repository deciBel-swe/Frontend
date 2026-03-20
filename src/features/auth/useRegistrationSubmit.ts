'use client';

import { useCallback } from 'react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';

import { useReCaptcha } from '../../hooks/UseReCaptcha';
import {
  getSchemaFieldErrors,
  registrationSchema,
  type FieldErrors,
  type RegistrationFormValues,
} from '@/types/authSchemas';

/**
 * Parameters for the useRegistrationSubmit hook
 * @interface UseRegistrationSubmitParams
 * @property {RegistrationFormValues} formValues - Current form values to submit
 * @property {Dispatch<SetStateAction<FieldErrors<RegistrationFormValues>>>} setFieldErrors - Function to set field-level validation errors
 * @property {Dispatch<SetStateAction<string>>} setSubmitError - Function to set form-level submission error
 * @property {Dispatch<SetStateAction<boolean>>} setIsSubmitting - Function to set loading state
 * @property {() => void} onSuccess - Callback invoked when registration is successfully submitted
 */
interface UseRegistrationSubmitParams {
  formValues: RegistrationFormValues;
  setFieldErrors: Dispatch<SetStateAction<FieldErrors<RegistrationFormValues>>>;
  setSubmitError: Dispatch<SetStateAction<string>>;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  onSuccess: () => void;
}

export const useRegistrationSubmit = ({
  formValues,
  setFieldErrors,
  setSubmitError,
  setIsSubmitting,
  onSuccess,
}: UseRegistrationSubmitParams) => {
  const { verifyReCaptcha } = useReCaptcha();

  /**
   * Hook for handling registration form submission
   *
   * Validates form data, performs reCAPTCHA verification, and processes user registration.
   * Handles validation errors, reCAPTCHA failures, and submission errors gracefully.
   *
   * @hook
   * @param {UseRegistrationSubmitParams} params - Hook parameters
   * @returns {Object} Handler object
   * @returns {(event: FormEvent<HTMLFormElement>) => Promise<void>} handleSubmit - Form submission handler
   *
   * @example
   * const { handleSubmit } = useRegistrationSubmit({ formValues, setFieldErrors, ... });
   * <form onSubmit={handleSubmit}>
   *   // form fields
   * </form>
   */
  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const parsedValues = registrationSchema.safeParse(formValues);
      if (!parsedValues.success) {
        setFieldErrors(getSchemaFieldErrors(parsedValues.error));
        return;
      }

      setFieldErrors({});
      setSubmitError('');

      setIsSubmitting(true);

      try {
        const recaptchaResult = await verifyReCaptcha('submit_form');
        if (!recaptchaResult.success) {
          setSubmitError(
            recaptchaResult.error ||
              'ReCaptcha verification failed. Please try again.'
          );
          return;
        }

        const { email, displayName, month, day, year, gender } =
          parsedValues.data;

        const userData = {
          email,
          profile: {
            displayName,
            dateOfBirth: {
              month,
              day,
              year,
            },
            gender,
          },
          registrationDate: new Date().toISOString(),
          ageVerified: true,
        };
        console.log('Email verification requested for:', userData);
        onSuccess();
      } catch (error) {
        console.error('Registration submit failed:', error);
        setSubmitError('Failed to submit registration. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formValues,
      onSuccess,
      setFieldErrors,
      setIsSubmitting,
      setSubmitError,
      verifyReCaptcha,
    ]
  );

  return { handleSubmit };
};
