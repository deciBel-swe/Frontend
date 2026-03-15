'use client';

import React from 'react';

interface EmailSentConfirmationProps {
  email: string;
  onBackToLogin?: () => void;
  onResend?: () => void;
}

const EmailSentConfirmation: React.FC<EmailSentConfirmationProps> = ({
  email,
  onBackToLogin,
  onResend,
}) => {
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
            onClick={onResend}
            className="font-medium text-[#699fff] hover:text-[#38d]"
          >
            Send again
          </button>
        </p>

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
            onClick={onBackToLogin}
            className="font-medium text-[#699fff] hover:text-[#38d]"
          >
            Back to login
          </button>
        </div>

        <div className="mt-2 text-sm text-gray-500">
          If you still need help, visit our{' '}
          <a
            href="#"
            className="font-medium text-[#699fff] hover:text-[#38d]"
          >
            Help Center
          </a>
          .
        </div>
      </div>
    </div>
  );
};

export default EmailSentConfirmation;
