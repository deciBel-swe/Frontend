'use client';

import React from 'react';
import SignInForm from '@/features/auth/components/Forms/SignInForm'; // adjust path if needed
import {ReCaptchaProvider} from '@/providers/ReCaptchaProvider'
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
};

const SignInModal: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative rounded bg-[#111] text-white border border-white/10">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-sm bg-white/10 px-3 py-1 rounded hover:bg-white/20"
        >
          <X size={20} />
        </button>

        {/* BODY */}
        <div className="p-6 flex justify-center">
          <div className="w-full">
            <ReCaptchaProvider>
            <SignInForm onSuccess={onClose}/>
            </ReCaptchaProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;