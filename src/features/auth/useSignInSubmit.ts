'use client';

import { useCallback } from 'react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';

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
 */
interface UseSignInSubmitParams {
  formValues: SignInFormValues;
  setFieldErrors: Dispatch<SetStateAction<FieldErrors<SignInFormValues>>>;
  setSubmitError: Dispatch<SetStateAction<string>>;
  login: (email: string, password: string) => Promise<void>;
  onSuccess?: () => void;
}

export const useSignInSubmit = ({
  formValues,
  setFieldErrors,
  setSubmitError,
  login,
  onSuccess
}: UseSignInSubmitParams) => {
  /**
   * Hook for handling sign-in form submission
   *
    * Validates form data and attempts user authentication.
    * Handles validation errors and authentication failures gracefully.
   *
   * Flow:
   * 1. Validates email and password against schema
    * 2. Calls login function with credentials
    * 3. Sets appropriate errors if any step fails
   *
   * @hook
   * @param {UseSignInSubmitParams} params - Hook parameters
   * @returns {Object} Handler object
   * @returns {(event: FormEvent<HTMLFormElement>) => Promise<void>} handleSubmit - Form submission handler
   *
   * @example
    * const { handleSubmit } = useSignInSubmit({ formValues, login, ... });
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


      try {
        await login(parsedValues.data.email, parsedValues.data.password);
        onSuccess?.();
      } catch {
        setSubmitError(
          'Sign in failed. Please check your credentials and try again.'
        );
      }
    },
    [formValues, login, setFieldErrors, setSubmitError, onSuccess]
  );

  return { handleSubmit };
};
