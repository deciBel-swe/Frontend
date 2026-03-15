'use client';

import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import ContinueButton from './ContinueButton';

interface ResetPasswordFormProps {
  email?: string;
  onClose: () => void;
  onBack?: () => void;
  onSend?: (email: string) => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  email: initialEmail = '',
  onClose,
  onBack,
  onSend,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSent(true);
    onSend?.(email);
  };

  return (
    <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center bg-[#121212] px-4">
      <div className="w-full max-w-md rounded border border-white bg-[#121212] p-8">
        <div className="flex items-center gap-22">
          <button
            type="button"
            onClick={onBack ?? onClose}
            className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition"
          >
            <FaArrowLeft className="text-white text-[17px]" />
          </button>
          <h2 className="text-[17px] font-bold" style={{ fontFamily: 'var(--font-sans)' }}>
            Reset password
          </h2>
        </div>

        {sent ? (
          <div className="mt-6 text-sm text-gray-300">
            If the email address is in our database, we will send you an email to reset your password.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
            <div>
              <label className="text-xs text-gray-400">Your email address</label>
              <div className="mt-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded bg-[#303030] px-4 py-3 text-white outline-none border border-gray-500/30 focus:border-gray-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="text-sm text-gray-400">
              If the email address is in our database, we will send you an email to reset your password. Need help?{' '}
              <a href="#" className="text-[#699fff] hover:text-[#38d]">
                visit our Help Center
              </a>
              .
            </div>

            <ContinueButton type="submit" disabled={!email.trim()}>
              Send reset link
            </ContinueButton>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordForm;
