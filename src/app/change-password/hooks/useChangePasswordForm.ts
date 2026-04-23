'use client';

import { useMemo, useState } from 'react';

import { changePasswordService } from '../services/changePasswordService';
import {
  changePasswordFormSchema,
  getChangePasswordFieldErrors,
  type ChangePasswordFieldErrors,
  type ChangePasswordFormValues,
} from '../types';

const INITIAL_VALUES: ChangePasswordFormValues = {
  password: '',
  confirmPassword: '',
  logoutEverywhere: true,
};

export const useChangePasswordForm = (token: string | null) => {
  const [values, setValues] = useState<ChangePasswordFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<ChangePasswordFieldErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormComplete = useMemo(
    () => changePasswordFormSchema.safeParse(values).success,
    [values]
  );

  const updateField = <TField extends keyof ChangePasswordFormValues>(
    field: TField,
    value: ChangePasswordFormValues[TField]
  ) => {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));
    setSubmitError('');

    setFieldErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      return { ...previous, [field]: undefined };
    });
  };

  const handleSubmit = async () => {
    if (!token) {
      setSubmitError('Missing reset token. Please use the link from your email.');
      return false;
    }

    const parsedValues = changePasswordFormSchema.safeParse(values);
    if (!parsedValues.success) {
      setFieldErrors(getChangePasswordFieldErrors(parsedValues.error));
      return false;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      setFieldErrors({});

      const response = await changePasswordService.submit({
        token,
        newPassword: parsedValues.data.password.trim(),
        logoutAll: parsedValues.data.logoutEverywhere,
      });

      setSuccessMessage(response.message);
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not change your password right now. Please try again.';

      setSubmitError(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    fieldErrors,
    submitError,
    successMessage,
    isSubmitting,
    isFormComplete,
    updateField,
    handleSubmit,
  };
};
