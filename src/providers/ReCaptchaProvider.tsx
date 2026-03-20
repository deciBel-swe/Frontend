'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import React from 'react';

/**
 * Props for the ReCaptchaProvider
 * @interface ReCaptchaProviderProps
 * @property {React.ReactNode} children - Child components that have access to reCAPTCHA functionality
 */
interface ReCaptchaProviderProps {
  children: React.ReactNode;
}

/**
 * ReCaptchaProvider Component
 *
 * Wraps a section of the application with Google reCAPTCHA v3 functionality.
 * Must wrap any component that uses the `useReCaptcha` hook.
 *
 * The reCAPTCHA site key is read from the environment variable `NEXT_PUBLIC_RECATCHA_SITE_KEY`.
 * Unlike reCAPTCHA v2, v3 runs invisibly and returns a score (0-1) indicating user trustworthiness.
 *
 * @component
 * @param {ReCaptchaProviderProps} props - Component props
 * @returns {JSX.Element} Provider component wrapping children
 *
 * @example
 * <ReCaptchaProvider>
 *   <SignInForm />
 *   <ResetPasswordForm />
 * </ReCaptchaProvider>
 *
 * @see {@link https://developers.google.com/recaptcha/docs/v3} Google reCAPTCHA v3 Documentation
 */
export const ReCaptchaProvider: React.FC<ReCaptchaProviderProps> = ({
  children,
}) => {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECATCHA_SITE_KEY!}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
};
