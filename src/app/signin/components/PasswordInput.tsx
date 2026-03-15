'use client';

import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChange,
}) => {
  const [show, setShow] = useState(false);

  return (


    <div className="relative w-full">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="w-full h-[3.2rem] rounded bg-[#303030] text-white pl-4 pt-4 pb-2 border border-gray-500/30 focus:border-gray-400 focus:outline-none peer no-browser-password-icon"
      />

      <label
        className={`
          absolute left-4 text-gray-400 pointer-events-none 
          transition-all duration-200 ease-in-out
          ${value ? "top-[4px] text-[11px]" : "top-[17px] text-xs"}
          peer-focus:top-[4px] peer-focus:text-[11px]
        `}
      >
        {label}
      </label>

      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-2 top-1/2 -translate-y-1/2 
                   text-gray-400 hover:text-white z-10"
      >
        {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>
    </div>
  );
};

export default PasswordInput;