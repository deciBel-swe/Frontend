'use client';

import SignInForm from '@/features/auth/components/Forms/SignInForm'
import {useRedirectAfterLogin } from '@/hooks';
import { ReCaptchaProvider } from '@/providers/ReCaptchaProvider';
import { useEffect, useState } from 'react';

/**
 * Sign In Page (Route: /signin)
 * 
 * Displays the sign-in form for existing users to authenticate with email/password
 * or Google OAuth.
 * 
 * Features:
 * - Email and password authentication
 * - Google OAuth sign-in option
 * - Forgot password link
 * - Link to create new account
 * - Protected by reCAPTCHA v3 verification
 * 
 * Implementation notes:
 * - Wrapped with ReCaptchaProvider to enable reCAPTCHA verification
 * - Uses isMounted state to handle hydration (client-side only rendering)
 * - Automatically redirects logged-in users to home page via useRedirectAfterLogin()
 * 
 * @component
 * @returns {JSX.Element} The sign-in page
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
            {/* {isMounted && <SignInForm />} */}
            <SignInForm />
          </ReCaptchaProvider>

        </div>
    </div>
  );
}
