'use client';
import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
interface SmallFormProps {
  onClose: () => void; // callback to close this form when hit cancel button (or submit?)
}

const SmallEmailForm: React.FC<SmallFormProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');

  const userTypedSomething = email.trim().length > 0;

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Check email format on submit
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValid) {
    console.log("Invalid email");
    return; // do not close form
  }

  console.log("Submitted email:", email);
  onClose();
};

  return (
    <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center bg-[#121212]">
      {/* Outer div with border */}
      <div className="w-[28rem] h-[17rem] border border-white flex items-center justify-center rounded">
        {/* Inner form container */}
        <div className="w-[25rem] h-[13rem] bg-[#121212]">
    
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
    
            <div className="flex items-center gap-15">
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

<label className="relative block w-full">
  <input
    type="email"
    placeholder=" "
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="
      peer
      w-full
      h-[3.2rem]
      rounded
      bg-[#303030]
      text-white
      text-[14px]
      !pl-4
      !pt-[14px]        /* input text pushed DOWN */
      pb-2
      border
      border-gray-500/30
      focus:border-gray-400
      focus:outline-none
    "
  />

  <span
    className="
      absolute
      left-4
      top-[17px]        /* label starts here */
      text-gray-400
      text-xs
      pointer-events-none
      transition-all
      duration-200
      ease-in-out

      peer-focus:top-[4px]           /* float UP */
      peer-focus:text-[11px]

      peer-not-placeholder-shown:top-[4px]
      peer-not-placeholder-shown:text-[11px]
    "
  >
    Your email address or profile URL
  </span>
</label>
  

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
              Continue
            </button>
           
          </div>
    
          <div className='p-4'>
            <a href="#needhelp" className='pt-4 text-[#699fff] hover:text-[#38d] transition-colors text-sm'>Need help?</a>
            </div>
    
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default SmallEmailForm;