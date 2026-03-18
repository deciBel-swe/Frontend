'use client';

import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

/**
 * Props for the PasswordInput component
 * @interface PasswordInputProps
 * @property {string} label - Floating label text that animates above the input when focused or filled
 * @property {string} value - Current password value
 * @property {(v: string) => void} onChange - Callback function invoked when password value changes
 */
interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

/**
 * PasswordInput Component
 *
 * A secure password input field with show/hide toggle functionality.
 * Features:
 * - Floating label animation (similar to FloatingInputField)
 * - Show/hide password toggle button
 * - Eye icon that changes based on visibility state
 * - Hides text content when in password mode
 *
 * @component
 * @param {PasswordInputProps} props - Component props
 * @returns {JSX.Element} The password input field with floating label and visibility toggle
 *
 * @example
 * <PasswordInput
 *   label="Password"
 *   value={password}
 *   onChange={setPassword}
 * />
 */
const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChange,
}) => {
  const [show, setShow] = useState(false);

  return (
    <label className="relative block w-full">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full h-[3.2rem] bg-interactive-default outline-none text-text-primary text-[13px] font-medium px-3.5 placeholder:text-text-muted border border-transparent rounded focus-within:border-interactive-active transition-[border-color] duration-150"
      />

      <span
        className={`
          absolute left-4 text-text-muted pointer-events-none transition-all duration-200
          ${value ? 'top-1 text-[9px]' : 'top-4 text-[13px]'}
          peer-focus:top-0.5 peer-focus:text-[9px]
        `}
      >
        {label}
      </span>

      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors z-10"
      >
        {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
      </button>
    </label>
  );
};

export default PasswordInput;
