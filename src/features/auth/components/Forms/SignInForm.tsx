'use client';

import { useState } from 'react';
import type { FC } from 'react';
import Link from 'next/link';

import { ROUTES } from '@/constants/routes';
import { GoogleLoginButton } from '@/features/auth';
import { useAuth } from '@/features/auth';
import { useReCaptcha } from '@/hooks/UseReCaptcha';
import { useSignInSubmit } from '@/features/auth/useSignInSubmit';
import ContinueButton from '../ContinueButton';
import PasswordInput from '../FormFields/PasswordInput';
import FloatingInputField from '../FormFields/FloatingInputField';
import { type FieldErrors, type SignInFormValues } from '@/types/authSchemas';

/**
 * SignInForm Component
 *
 * A complete authentication form for existing users to sign in to their account.
 * Features:
 * - Email and password input fields with validation
 * - Google OAuth integration for quick sign-in
 * - "Forgot password" link to password reset
 * - "Create account" link to registration
 * - Form-level and field-level error handling
 * - reCAPTCHA v3 verification on submission
 * - Disabled state during authentication loading
 *
 * The form uses:
 * - `useSignInSubmit` hook for form submission logic
 * - `useAuth` hook for authentication operations
 * - `useReCaptcha` hook for reCAPTCHA verification
 *
 * @component
 * @returns {JSX.Element} The sign-in form
 *
 * @example
 * <ReCaptchaProvider>
 *   <SignInForm />
 * </ReCaptchaProvider>
 */
type SignInFormProps = {
  onSuccess?: () => void;
};
const SignInForm: FC <SignInFormProps> = ({ onSuccess }) => {
  const [formValues, setFormValues] = useState<SignInFormValues>({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SignInFormValues>>(
    {}
  );
  const [submitError, setSubmitError] = useState('');
  const { handleGoogleLogin, isLoading, login } = useAuth();
  const { verifyReCaptcha } = useReCaptcha();
  const { handleSubmit } = useSignInSubmit({
    formValues,
    setFieldErrors,
    setSubmitError,
    login,
    verifyReCaptcha,
    onSuccess,
  });

  const updateField = (field: keyof SignInFormValues, value: string) => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
    setSubmitError('');

    setFieldErrors((previous) => {
      if (!previous[field]) return previous;
      return { ...previous, [field]: undefined };
    });
  };

  return (
    <div className="w-110 h-fit py-5 border-2 border-border-default flex items-start justify-center rounded">
      {/* Inner form container */}
      <div className="w-100 h-fit bg-bg-base">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="text-left">
            <h1
              className="text-3xl font-bold mb-1"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Sign in to your account
            </h1>
          </div>
          <div className="flex flex-col w-full gap-3">
            <GoogleLoginButton
              onClick={handleGoogleLogin}
              isLoading={isLoading}
            />
            <FloatingInputField
              type="email"
              name="email"
              autoComplete="email"
              label="Email Address"
              value={formValues.email}
              onChange={(value) => updateField('email', value)}
              error={fieldErrors.email}
            />

            <PasswordInput
              value={formValues.password}
              onChange={(value) => updateField('password', value)}
              label="Password"
            />
            {fieldErrors.password ? (
              <div className="text-red-400 text-xs">{fieldErrors.password}</div>
            ) : null}

            {submitError ? (
              <div className="text-red-400 text-xs">{submitError}</div>
            ) : null}

            <ContinueButton type="submit" disabled={isLoading}>
              Continue
            </ContinueButton>
            <div>
              <Link
                href={ROUTES.RESETPASSWORD}
                className="text-[#699fff] hover:text-[#38d] transition-colors text-sm cursor-pointer"
              >
                Forgot your password?
              </Link>
            </div>
            <div>
              <Link
                href={ROUTES.REGISTER}
                className="text-[#699fff] hover:text-[#38d] transition-colors text-sm cursor-pointer"
              >
                Create an account
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInForm;
