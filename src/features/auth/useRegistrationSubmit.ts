'use client';

import { useCallback } from 'react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';

import { useReCaptcha } from '@/hooks/UseReCaptcha';
import { authService } from '@/services';
import {
  getSchemaFieldErrors,
  registrationSchema,
  type FieldErrors,
  type RegistrationFormValues,
} from '@/types/authSchemas';

const toIsoDate = (year: string, month: string, day: string): string => {
  const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1;
  const safeMonth = Number.isNaN(monthIndex) ? 1 : monthIndex;
  const safeDay = Number.parseInt(day, 10) || 1;

  return `${year}-${String(safeMonth).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
};

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
  const { getRecaptchaToken } = useReCaptcha();

  /**
   * Hook for handling registration form submission
   *
   * Validates form data, registers the user, and triggers verification email flow.
   * Handles validation errors and submission errors gracefully.
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
        const {
          email,
          password,
          displayName,
          month,
          day,
          year,
          gender,
        } = parsedValues.data;

        const recaptchaResult = await getRecaptchaToken('register_local');
        if (!recaptchaResult.success) {
          setSubmitError(
            recaptchaResult.error ||
              'ReCaptcha verification failed. Please try again.'
          );
          return;
        }

        if (!recaptchaResult.token) {
          setSubmitError('ReCaptcha token is missing. Please try again.');
          return;
        }

        await authService.registerLocal({
          email,
          username: displayName,
          password,
          dateOfBirth: toIsoDate(year, month, day),
          gender,
          captchaToken: recaptchaResult.token,
        });

        await authService.resendVerification(email);
        onSuccess();
      } catch (error) {
        console.error('Registration submit failed:', error);
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to submit registration. Please try again.';
        setSubmitError(message);
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
      getRecaptchaToken,
    ]
  );

  return { handleSubmit };
};
