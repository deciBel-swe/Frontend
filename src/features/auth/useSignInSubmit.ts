'use client';

import { useCallback } from 'react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';

import type { ReCaptchaResult } from '../../hooks/UseReCaptcha';
import {
  getSchemaFieldErrors,
  signInSchema,
  type FieldErrors,
  type SignInFormValues,
} from '@/types/authSchemas';

/**
 * Parameters for the useSignInSubmit hook
 * @interface UseSignInSubmitParams
 * @property {SignInFormValues} formValues - Current form values (email and password)
 * @property {Dispatch<SetStateAction<FieldErrors<SignInFormValues>>>} setFieldErrors - Function to set field-level validation errors
 * @property {Dispatch<SetStateAction<string>>} setSubmitError - Function to set form-level submission error
 * @property {(email: string, password: string) => Promise<void>} login - Function to authenticate user with backend
 * @property {(action?: string) => Promise<ReCaptchaResult>} verifyReCaptcha - Function to verify reCAPTCHA token
 */
interface UseSignInSubmitParams {
  formValues: SignInFormValues;
  setFieldErrors: Dispatch<SetStateAction<FieldErrors<SignInFormValues>>>;
  setSubmitError: Dispatch<SetStateAction<string>>;
  login: (email: string, password: string) => Promise<void>;
  verifyReCaptcha: (action?: string) => Promise<ReCaptchaResult>;
}

export const useSignInSubmit = ({
  formValues,
  setFieldErrors,
  setSubmitError,
  login,
  verifyReCaptcha,
}: UseSignInSubmitParams) => {
  /**
   * Hook for handling sign-in form submission
   *
   * Validates form data, performs reCAPTCHA verification, and attempts user authentication.
   * Handles validation errors, reCAPTCHA failures, and authentication failures gracefully.
   *
   * Flow:
   * 1. Validates email and password against schema
   * 2. Verifies reCAPTCHA token with backend
   * 3. If reCAPTCHA passes, calls login function with credentials
   * 4. Sets appropriate errors if any step fails
   *
   * @hook
   * @param {UseSignInSubmitParams} params - Hook parameters
   * @returns {Object} Handler object
   * @returns {(event: FormEvent<HTMLFormElement>) => Promise<void>} handleSubmit - Form submission handler
   *
   * @example
   * const { handleSubmit } = useSignInSubmit({ formValues, login, verifyReCaptcha, ... });
   * <form onSubmit={handleSubmit}>
   *   // form fields
   * </form>
   */
  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const parsedValues = signInSchema.safeParse(formValues);
      if (!parsedValues.success) {
        setFieldErrors(getSchemaFieldErrors(parsedValues.error));
        return;
      }

      setFieldErrors({});
      setSubmitError('');

      const recaptchaResult = await verifyReCaptcha('signin');
      if (!recaptchaResult.success) {
        setSubmitError(
          recaptchaResult.error ||
            'ReCaptcha verification failed. Please try again.'
        );
        return;
      }

      try {
        await login(parsedValues.data.email, parsedValues.data.password);
      } catch {
        setSubmitError(
          'Sign in failed. Please check your credentials and try again.'
        );
      }
    },
    [formValues, login, setFieldErrors, setSubmitError, verifyReCaptcha]
  );

  return { handleSubmit };
};
