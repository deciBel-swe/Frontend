'use client';
import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import PasswordInput from './PasswordInput';
//import { EyeIcon, EyeOffIcon } from 'lucide-react';
interface NewUserRegisterProps {
  email: string;
  onClose: () => void;
}

const NewUserRegister: React.FC<NewUserRegisterProps> = ({ email, onClose }) => {

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');

  const passwordTrimmed = password.trim();
  const confirmTrimmed = confirm.trim();

// Button only checks if fields are filled 
   const canAttemptRegister = 
   passwordTrimmed.length > 0 && confirmTrimmed.length > 0; 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault(); 
     
     const strongPassword =
     passwordTrimmed.length >= 8 && 
     /[A-Z]/.test(passwordTrimmed) && 
     /[0-9]/.test(passwordTrimmed); 
     
     if (!strongPassword) {
       setErrorMessage(
         'Password must be at least 8 characters, include one uppercase letter and one number.' 
        ); 
        return; 
      } 
      
      if (passwordTrimmed !== confirmTrimmed) {
         setErrorMessage('Passwords do not match.');
          return;
         } 
         
         setErrorMessage(''); 
         
      console.log('Register with:', {
         email, password: passwordTrimmed, 
        });
       };

  return (
    <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center bg-[#121212]">
      {/* Outer div with border */}
      <div className="w-[28rem] border border-white flex items-center justify-center rounded py-8">
        {/* Inner form container */}
        <div className="w-[25rem] bg-[#121212]">
    
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
                Create an account
              </h2>
            </div>
            
            <div className="space-y-1">
    <div className="text-gray-400 text-xs select-none">Your email address</div>
            <div className="w-full bg-transparent text-white rounded text-sm">{email}</div>
</div>
            <div className='flex flex-col gap-4'>

  <PasswordInput
    label="Choose a password (min. 8 characters)"
    value={password}
    onChange={setPassword}
  />


  <PasswordInput
    label="Confirm password"
    value={confirm}
    onChange={setConfirm}
  />

{/* ERROR MESSAGE */}
<div
  className={`text-red-400 text-xs transition-all duration-200 ${
    errorMessage ? "opacity-100" : "opacity-0 h-0"
  }`}
>
  {errorMessage}
</div>

                <button
              type="submit"
              disabled={!canAttemptRegister}
              className={`
                w-full h-[2.6rem] rounded font-semibold text-sm transition
                ${canAttemptRegister
                ? "bg-white text-black cursor-pointer hover:bg-gray-200"
                : "bg-[#999] text-black cursor-not-allowed opacity-60"}
                `}           
            >
              Register →
            </button>
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

export default NewUserRegister;