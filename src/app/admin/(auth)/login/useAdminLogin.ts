'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import {
  getSchemaFieldErrors,
  signInSchema,
  type FieldErrors,
  type SignInFormValues,
} from '@/types/authSchemas';
import { ADMIN_LOGIN_DEFAULT_VALUES, ADMIN_LOGIN_REDIRECT } from './constants';
import {
  getAdminSubmitErrorMessage,
  persistAdminSession,
  requestAdminLogin,
} from './utils';

export const useAdminLogin = () => {
  const router = useRouter();
  const [formValues, setFormValues] = useState<SignInFormValues>(
    ADMIN_LOGIN_DEFAULT_VALUES
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SignInFormValues>>(
    {}
  );
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (
    field: keyof SignInFormValues,
    value: string
  ): void => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
    setSubmitError('');
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        [field]: undefined,
      };
    });
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    const parsedValues = signInSchema.safeParse(formValues);
    if (!parsedValues.success) {
      setFieldErrors(getSchemaFieldErrors(parsedValues.error));
      return;
    }

    setFieldErrors({});
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const response = await requestAdminLogin(
        parsedValues.data.email,
        parsedValues.data.password
      );

      persistAdminSession(response);
      router.push(ADMIN_LOGIN_REDIRECT);
      router.refresh();
    } catch (error) {
      setSubmitError(getAdminSubmitErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formValues,
    fieldErrors,
    submitError,
    isSubmitting,
    updateField,
    handleSubmit,
  };
};
