'use client';

import React from 'react';
import { ReCaptchaProvider } from '@/providers/ReCaptchaProvider';
import RegistrationForm from './RegisterationForm';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
};

const SignInModal: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* BACKDROP (ONLY THIS closes modal) */}
      <div
      className="absolute inset-0 bg-black/60 dark:bg-white/60 backdrop-blur-sm"
      onClick={onClose}
      />
      <div className="relative rounded bg-white dark:bg-black border border-white/10">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-[60] p-2 rounded-full bg-white/80 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/20 hover:text-black dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-md">
          <X size={20} />
        </button>

        {/* BODY */}
        <div className="p-6 flex justify-center">
          <div className="w-full">
            <ReCaptchaProvider>
              <RegistrationForm />
            </ReCaptchaProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
