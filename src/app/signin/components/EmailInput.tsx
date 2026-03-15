'use client';

import React from 'react';

interface EmailInputProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  onFocus?: () => void;
  autoComplete?: string;
}

const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  onFocus,
  autoComplete = "email",
  label = "Your email address or profile URL",
}) => {

  return (
    <label className="relative block w-full">
      <input
        type="email"
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        autoComplete={autoComplete}
        className="peer w-full h-[3.2rem] rounded bg-[#303030] text-white text-[14px] pl-4 pt-4 pb-2 border border-gray-500/30 focus:border-gray-400 focus:outline-none"
      />

      <span
        className={`
          absolute left-4 text-gray-400 pointer-events-none transition-all duration-200
          ${value ? 'top-[4px] text-[11px]' : 'top-[17px] text-xs'}
          peer-focus:top-[4px] peer-focus:text-[11px]
        `}
      >
        {label}
      </span>
    </label>
  );
};

export default EmailInput;