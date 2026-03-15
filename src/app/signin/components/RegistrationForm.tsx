'use client';

import React, { useState } from 'react';
import GoogleIcon from '../../../../public/images/google-icon.svg';
import FacebookIcon from '../../../../public/images/facebook-icon.svg';
import AppleIcon from '../../../../public/images/apple-icon.svg';
import EmailStepWrapper from './EmailStepWrapper';
import Image from 'next/image';
import EmailInput from './EmailInput';
import ContinueButton from './ContinueButton';

const RegistrationForm = () => {
  
  const [showEmailFlow, setShowEmailFlow] = useState(false);
  const [email, setEmail] = useState('');
  
  const userTypedSomething = email.trim().length > 0;

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

        <EmailInput
    value={email}
    onChange={setEmail}
    label="Your email address or profile URL"
    onFocus={() => setShowEmailFlow(true)}
    autoComplete='off'
  />
        <ContinueButton type="submit" disabled={!userTypedSomething} onClick={() => setShowEmailFlow(true)}>Continue</ContinueButton>      
      </div>

      <div className='p-4'>
        <a href="#needhelp" className='pt-4 text-[#699fff] hover:text-[#38d] transition-colors text-sm'>Need help?</a>
        </div>

      </form>
      
    </div>
  </div>
    {/* EMAIL FLOW CONTROLLER */}
      {showEmailFlow && (
        <EmailStepWrapper
          onClose={() => setShowEmailFlow(false)}
          onEmailContinue={setEmail}
        />
      )}
</div>

  );
};

export default RegistrationForm;