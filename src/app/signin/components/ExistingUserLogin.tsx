'use client';
import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import PasswordInput from './PasswordInput';

interface ExistingUserLoginProps {
  email: string;
  onClose: () => void;
  onForgotPassword?: () => void;
}

const ExistingUserLogin: React.FC<ExistingUserLoginProps> = ({ email, onClose, onForgotPassword }) => {
  
  const [password, setPassword] = useState('');

    const userTypedSomething = password.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register with:', { email, password, confirm });
    // Call registration API here
  };

  return (
    <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center bg-[#121212]">
      {/* Outer div with border */}
      <div className="w-[28rem] h-[23rem] border border-white flex items-center justify-center rounded">
        {/* Inner form container */}
        <div className="w-[25rem] h-[19rem] bg-[#121212]">
    
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
    
            <div className="flex items-center gap-13">
                <button
                 type="button"
                onClick={onClose}
                 className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition cursor-pointer"
                >
                <FaArrowLeft className="text-white text-[17px]" />
                </button>
              <h2 className="text-[17px] font-bold mb-1 ml-10" style={{ fontFamily: "var(--font-sans)" }}>
                Welcome back!
              </h2>
            </div>
            
            <div className="space-y-1">
    <div className="text-gray-400 text-xs select-none">Your email address or profile URL</div>
            <div className="w-full bg-transparent text-white rounded text-sm">{email}</div>
</div>
            <div className='flex flex-col gap-4'>

<PasswordInput
              label="Your password (min. 6 characters)"
              value={password}
              onChange={setPassword}
            />
           
                <button
              type="submit"
              disabled={!userTypedSomething}
              className={`
                w-full h-[2.6rem] rounded font-semibold text-sm transition
                ${userTypedSomething
                ? "bg-white text-black cursor-pointer hover:bg-gray-200"
                : "bg-[#999] text-black cursor-not-allowed opacity-60"}
                `}           
            >
              Register →
            </button>
          </div>
    
          <div className='pb-2'>
            <button
              type="button"
              onClick={onForgotPassword}
              className='pt-4 text-[#699fff] hover:text-[#38d] transition-colors text-sm'
            >
              Forgot your password?
            </button>
          </div>
    
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default ExistingUserLogin;