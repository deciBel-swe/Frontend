'use client';

import { useRedirectAfterLogin } from '@/hooks';
import { ReCaptchaProvider } from '@/providers/ReCaptchaProvider';
import ResetPasswordForm from '@/features/auth/components/Forms/ResetPasswordForm';
import { useEffect, useState } from 'react';

/**
 * Password Reset Page (Route: /reset-password)
 *
 * Displays the password reset form for users who forgot their password.
 *
 * Features:
 * - Email input to identify the account
 * - Password reset link sent via email
 * - Email verification/confirmation screen
 * - Protected by reCAPTCHA v3 verification
 * - Option to resend reset email
 *
 * Implementation notes:
 * - Wrapped with ReCaptchaProvider to enable reCAPTCHA verification
 * - Uses isMounted state to handle hydration (client-side only rendering)
 * - Automatically redirects logged-in users to home page via useRedirectAfterLogin()
 * - Form displays confirmation message after submission
 *
 * @component
 * @returns {JSX.Element} The password reset page
 */
export default function Page() {
  useRedirectAfterLogin();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-center flex-col items-center h-fit justify-center bg-bg-base border border-text-on-brand px-1.5 py-5">
        <ReCaptchaProvider>
          {isMounted && <ResetPasswordForm />}
        </ReCaptchaProvider>
      </div>
    </div>
  );
}
