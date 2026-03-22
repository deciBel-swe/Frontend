'use client';

import { useRedirectAfterLogin } from '@/hooks';
import { ReCaptchaProvider } from '@/providers/ReCaptchaProvider';
import RegistrationForm from '@/features/auth/components/Forms/RegisterationForm';
import { useEffect, useState } from 'react';

/**
 * Registration Page (Route: /register)
 *
 * Displays the user registration form for creating a new DeciBel account.
 *
 * Features:
 * - Email and password setup with validation
 * - Display name input with auto-suggestion
 * - Date of birth selection with age verification (13+)
 * - Gender selection
 * - Protected by reCAPTCHA v3 verification
 * - Email verification confirmation after submission
 *
 * Implementation notes:
 * - Wrapped with ReCaptchaProvider to enable reCAPTCHA verification
 * - Uses isMounted state to handle hydration (client-side only rendering)
 * - Automatically redirects logged-in users to home page via useRedirectAfterLogin()
 * - Form validates password strength and age requirements
 *
 * @component
 * @returns {JSX.Element} The registration page
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
          {isMounted && <RegistrationForm />}
        </ReCaptchaProvider>
      </div>
    </div>
  );
}
