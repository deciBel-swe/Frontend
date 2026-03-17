'use client';

import React, { useState } from 'react';
import { MockAuthService } from '@/services/mocks/authService';

/**
 * Props for the EmailSentConfirmation component
 * @interface EmailSentConfirmationProps
 * @property {string} email - User's email address to display in the confirmation message
 * @property {() => void} [onBackToRegister] - Optional callback when user clicks back button; if not provided, navigates to /register
 */
interface EmailSentConfirmationProps {
  email: string;
  onBackToRegister?: () => void;
}

const authService = new MockAuthService();

/**
 * EmailSentConfirmation Component
 * 
 * A modal dialog that confirms an email verification or password reset email has been sent.
 * Displayed as an overlay modal on top of registration or password reset forms.
 * 
 * Features:
 * - Displays user's email address for confirmation
 * - Resend email verification/reset link button
 * - Loading state during resend operation
 * - Success/error feedback messages
 * - Back button to return to form
 * 
 * @component
 * @param {EmailSentConfirmationProps} props - Component props
 * @returns {JSX.Element} The confirmation modal
 * 
 * @example
 * <EmailSentConfirmation
 *   email="user@example.com"
 *   onBackToRegister={() => closeModal()}
 * />
 */
const EmailSentConfirmation: React.FC<EmailSentConfirmationProps> = ({
  email,
  onBackToRegister,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    setLoading(true);
    setMessage('');
    try {
      await authService.requestEmailVerification(email);
      setMessage('Verification email sent!');
    } catch (err) {
      console.error(err);
      setMessage('Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegister = () => {
    if (onBackToRegister) onBackToRegister();
    else window.location.href = '/register'; // fallback
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base px-4">
      <div className="w-full max-w-md rounded-lg border border-border-contrast bg-bg-base p-8 text-center">
        <h1 className="text-3xl font-bold text-text-primary">Check your inbox!</h1>
        <p className="mt-3 text-sm text-text-muted">
          Click on the link we sent to{' '}
          <span className="font-semibold text-text-primary">{email}</span>
        </p>

        <p className="mt-3 text-sm text-text-muted">
          No email in your inbox or spam folder?{' '}
          <button
            type="button"
            onClick={handleResend}
            className={`font-medium text-[#699fff] hover:text-[#38d] ${
              loading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {loading ? 'Sending...' : 'Send again'}
          </button>
        </p>

        {message && (
          <p className="mt-2 text-sm text-green-400 font-medium">{message}</p>
        )}

        <div className="mx-auto mt-9 h-40 w-40">
          <svg
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
          >
            <rect
              x="0"
              y="0"
              width="200"
              height="200"
              fill="var(--bg-base)"
            />
            <path
              d="M40 130 L100 80 L160 130 L100 110 Z"
              fill="none"
              stroke="var(--text-primary)"
              strokeWidth="10"
            />
            <path
              d="M40 130 L40 60 L160 60 L160 130"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="10"
              opacity="0.7"
            />
          </svg>
        </div>

        <div className="mt-6 text-sm text-text-muted">
          Wrong address?{' '}
          <button
            type="button"
            onClick={handleBackToRegister}
            className="font-medium text-[#699fff] hover:text-[#38d]"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSentConfirmation;