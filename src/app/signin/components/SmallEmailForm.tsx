'use client';

import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import EmailInput from './EmailInput';
import ContinueButton from './ContinueButton';

interface SmallFormProps {
  onClose: () => void; // callback to close this form when hit cancel button (or submit?)
  onContinue: (email: string) => void; // called when email is submitted
}

const SmallEmailForm: React.FC<SmallFormProps> = ({ onClose, onContinue }) => {
  const [email, setEmail] = useState('');

  const userTypedSomething = email.trim().length > 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check email format on submit
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValid) {
      console.log("Invalid email");
      return; // do not continue
    }

    // Send email to parent
    onContinue(email);
  };

  return (
    <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center bg-[#121212]">
      {/* Outer div with border */}
      <div className="w-[28rem] h-[17rem] border border-white flex items-center justify-center rounded">
        {/* Inner form container */}
        <div className="w-[25rem] h-[13rem] bg-[#121212]">
    
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
    
            <div className="flex items-center gap-13">
                <button
                 type="button"
                onClick={onClose}
                 className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition cursor-pointer"
                >
                <FaArrowLeft className="text-white text-[17px]" />
                </button>
              <h2 className="text-[17px] font-semibold mb-1" style={{ fontFamily: "var(--font-sans)" }}>
                Sign in or create an account
              </h2>
            </div>
    
            <div className='flex flex-col gap-4'>

<EmailInput value={email} onChange={setEmail} />
            
            <ContinueButton type="submit" disabled={!userTypedSomething}>Continue</ContinueButton>
           
          </div>
    
          <div className='pb-2'>
            <a href="#needhelp" className='pt-4 text-[#699fff] hover:text-[#38d] transition-colors text-sm'>Need help?</a>
            </div>
    
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default SmallEmailForm;