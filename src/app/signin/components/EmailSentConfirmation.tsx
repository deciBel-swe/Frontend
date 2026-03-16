'use client';

import React, { useState } from 'react';
import { MockAuthService } from '../../../services/mocks/authService';

interface EmailSentConfirmationProps {
  email: string;
  onBackToLogin?: () => void;
}

const authService = new MockAuthService();

const EmailSentConfirmation: React.FC<EmailSentConfirmationProps> = ({
  email,
  onBackToLogin,
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

  const handleBackToLogin = () => {
    if (onBackToLogin) onBackToLogin();
    else window.location.href = '/login'; // fallback
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212] px-4">
      <div className="w-full max-w-md rounded-lg border border-white bg-[#0f0f0f] p-8 text-center">
        <h1 className="text-3xl font-bold text-white">Check your inbox!</h1>
        <p className="mt-3 text-sm text-gray-300">
          Click on the link we sent to{' '}
          <span className="font-semibold text-white">{email}</span>
        </p>

        <p className="mt-3 text-sm text-gray-400">
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
            <rect x="0" y="0" width="200" height="200" fill="#0f0f0f" />
            <path
              d="M40 130 L100 80 L160 130 L100 110 Z"
              fill="none"
              stroke="#fff"
              strokeWidth="10"
            />
            <path
              d="M40 130 L40 60 L160 60 L160 130"
              fill="none"
              stroke="#fff"
              strokeWidth="10"
              opacity="0.25"
            />
          </svg>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          Wrong address?{' '}
          <button
            type="button"
            onClick={handleBackToLogin}
            className="font-medium text-[#699fff] hover:text-[#38d]"
          >
            Back to login
          </button>
        </div>

        <div className="mt-2 text-sm text-gray-500">
          If you still need help, visit our{' '}
          <a href="#" className="font-medium text-[#699fff] hover:text-[#38d]">
            Help Center
          </a>
          .
        </div>
      </div>
    </div>
  );
};

export default EmailSentConfirmation;