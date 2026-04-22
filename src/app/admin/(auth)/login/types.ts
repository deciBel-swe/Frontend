import type { FieldErrors, SignInFormValues } from '@/types/authSchemas';

export type AdminLoginFormValues = SignInFormValues;

export type AdminLoginState = {
  formValues: AdminLoginFormValues;
  fieldErrors: FieldErrors<AdminLoginFormValues>;
  submitError: string;
  isSubmitting: boolean;
};

export type AdminApiError = {
  status?: number;
  message: string;
};
