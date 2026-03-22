'use client';

import React from 'react';

/**
 * Props for the EmailInput component
 * @interface EmailInputProps
 * @property {string} value - Current email input value
 * @property {(val: string) => void} onChange - Callback function invoked when email value changes
 * @property {string} [label] - Custom label text; defaults to "Your email address"
 * @property {() => void} [onFocus] - Optional callback invoked when input receives focus
 * @property {string} [autoComplete] - HTML autoComplete attribute value; defaults to "email"
 */
interface EmailInputProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  onFocus?: () => void;
  autoComplete?: string;
}

/**
 * EmailInput Component
 *
 * A specialized email input field with a floating label and focus handlers.
 * Designed for authentication forms where email is a required field.
 *
 * Features:
 * - Email-specific input type validation
 * - Floating label that animates based on input state
 * - Optional focus callback for side effects
 * - Browser autoComplete support
 *
 * @component
 * @param {EmailInputProps} props - Component props
 * @returns {JSX.Element} The email input field with floating label
 *
 * @example
 * <EmailInput
 *   value={email}
 *   onChange={setEmail}
 *   label="Enter your email"
 *   onFocus={() => console.log('Email focused')}
 * />
 */
const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  onFocus,
  autoComplete = 'email',
  label = 'Your email address',
}) => {
  return (
    <label className="relative block w-full">
      <input
        type="email"
        name="email"
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        autoComplete={autoComplete}
        className="peer w-full h-[3.2rem] bg-interactive-default outline-none text-text-primary text-[13px] font-medium  px-3.5 placeholder:text-text-muted  border border-transparent rounded focus-within:border-interactive-active transition-[border-color] duration-150"
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
    </label>
  );
};

export default EmailInput;
