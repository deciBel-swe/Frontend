'use client';

import React, { useState } from 'react';
import GoogleIcon from '../../../../public/images/google-icon.svg';
import FacebookIcon from '../../../../public/images/facebook-icon.svg';
import AppleIcon from '../../../../public/images/apple-icon.svg';
import SmallEmailForm from './SmallEmailForm';
import Image from 'next/image';

const RegistrationForm = () => {
  
  const [showSmallForm, setShowSmallForm] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
  {/* Outer div with border */}
  <div className="w-[28rem] h-[40rem] border border-white flex items-center justify-center rounded">
    {/* Inner form container */}
    <div className="w-[25rem] h-[36rem] bg-[#121212]">

      <form className="flex flex-col gap-6">

        <div className="text-left">
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-sans)" }}>
            Sign in or create an
          </h1>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-sans)" }}>
            account
          </h1>
        </div>

        <p className="text-sm text-gray-300 text-left">
          By clicking on any of the "Continue" buttons below, you agree to SoundCloud’s{' '}
          <a href="/termsofuse" className="text-[#699fff] hover:text-[#38d] transition-colors">Terms of Use</a> and acknowledge our{' '}
          <a href="/privacypolicy" className="text-[#699fff] hover:text-[#38d] transition-colors">Privacy Policy</a>.
        </p>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            className="w-full py-3 bg-[#003bb3] text-white rounded font-bold h-[2.6rem] text-[13px] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Image src= {FacebookIcon} alt="Facebook" width={20} height={20} />
            Continue with Facebook
          </button>
          <button
            type="button"
            className="w-full py-3 bg-[#303030] rounded text-white font-bold h-[2.6rem] text-[13px] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Image src= {GoogleIcon} alt="Google" width={20} height={20} />
            Continue with Google
          </button>
          <button
            type="button"
            className="w-full placeholder:text-2xl py-3 bg-[#000] rounded text-white font-semibold h-[2.6rem] text-[13px] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Image src= {AppleIcon} alt="Apple" width={20} height={20} />
            Continue with Apple
          </button>
        </div>

        <div className='flex flex-col gap-4'>
        <p className='font-semibold text-sm'>
          or with email
        </p>

        <input
          type="email"
          name="email"
          placeholder="Your email address or profile URL"
          onFocus={() => setShowSmallForm(true)}
          readOnly // optional to prevent typing
          className="w-full rounded border-0 bg-[#303030] text-white h-[3.2rem] placeholder:text-xs placeholder:tracking-wide placeholder:pl-4 border p-4"
        /> 

        <button
          type="submit"
          className="w-full placeholder:text-2xl py-3 bg-[#999] rounded text-black font-semibold h-[2.6rem] text-sm"
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
   {showSmallForm && <SmallEmailForm onClose={() => setShowSmallForm(false)} />}
</div>

  );
};

export default RegistrationForm;