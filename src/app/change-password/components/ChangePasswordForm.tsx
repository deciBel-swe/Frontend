'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { ROUTES } from '@/constants/routes';
import ContinueButton from '@/features/auth/components/ContinueButton';
import PasswordInput from '@/features/auth/components/FormFields/PasswordInput';

import { useChangePasswordForm } from '../hooks/useChangePasswordForm';

type ChangePasswordFormProps = {
  token: string | null;
};

const getMissingTokenMessage = (token: string | null) => {
  if (token) {
    return '';
  }

  return 'Missing reset token. Please open the password reset link from your email again.';
};

export default function ChangePasswordForm({
  token,
}: ChangePasswordFormProps) {
  const {
    values,
    fieldErrors,
    submitError,
    successMessage,
    isSubmitting,
    isFormComplete,
    updateField,
    handleSubmit,
  } = useChangePasswordForm(token);

  const missingTokenMessage = useMemo(() => getMissingTokenMessage(token), [token]);

  return (
    <section className="w-110 h-fit rounded-lg bg-surface-raised px-4 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.12)] dark:bg-surface-default">
      {!successMessage ? (
        <form
          className="mx-auto flex w-100 flex-col gap-6"
          onSubmit={async (event) => {
            event.preventDefault();
            await handleSubmit();
          }}
        >
          <header className="border-b border-border-default pb-4 text-center">
            <h1 className="text-3xl font-bold text-text-primary">
              Change your password
            </h1>
            <p className="mt-4 text-sm leading-6 text-text-muted">
              Choose a strong, unique password.
              <br />
              For tips on choosing a secure password,{` `}
              <a
                href="https://help.soundcloud.com/hc/en-us"
                target="_blank"
                rel="noreferrer"
                className="text-brand-primary transition-colors hover:text-interactive-hover"
              >
                visit our Help Center.
              </a>
            </p>
          </header>

          <div className="mt-2 flex flex-col gap-3">
            <PasswordInput
              label="Type your new password"
              value={values.password}
              onChange={(value) => updateField('password', value)}
            />
            {fieldErrors.password ? (
              <div className="text-red-400 text-xs">{fieldErrors.password}</div>
            ) : null}

            <PasswordInput
              label="Type your new password again, to confirm"
              value={values.confirmPassword}
              onChange={(value) => updateField('confirmPassword', value)}
            />
            {fieldErrors.confirmPassword ? (
              <div className="text-red-400 text-xs">
                {fieldErrors.confirmPassword}
              </div>
            ) : null}
          </div>

          <label className="mt-2 inline-flex items-center gap-3 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={values.logoutEverywhere}
              onChange={(event) =>
                updateField('logoutEverywhere', event.target.checked)
              }
              className="h-5 w-5 accent-[#ff5500]"
            />
            Also sign me out everywhere
          </label>

          {missingTokenMessage ? (
            <p className="text-red-400 text-xs">{missingTokenMessage}</p>
          ) : null}

          {submitError ? (
            <p className="text-red-400 text-xs">{submitError}</p>
          ) : null}

          <ContinueButton
            type="submit"
            disabled={!isFormComplete || isSubmitting || !token}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </ContinueButton>
        </form>
      ) : (
        <div className="mx-auto flex w-100 flex-col items-center text-center">
          <h1 className="text-3xl font-bold text-text-primary">Password changed</h1>
          <p className="mt-4 text-sm leading-6 text-text-muted">
            {successMessage}
          </p>
          <Link
            href={ROUTES.SIGNIN}
            className="mt-6 cursor-pointer text-sm text-brand-primary transition-colors hover:text-interactive-hover"
          >
            Back to sign in
          </Link>
        </div>
      )}
    </section>
  );
}
