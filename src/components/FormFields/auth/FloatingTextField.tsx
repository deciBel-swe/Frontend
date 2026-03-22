'use client';

import type { FC, InputHTMLAttributes } from 'react';

/**
 * Props for the FloatingTextField component
 * Extends standard HTML input attributes while customizing value and onChange handling
 * @interface FloatingTextFieldProps
 * @property {string} label - Floating label text that animates above the input when focused or filled
 * @property {string} value - Current input value
 * @property {(value: string) => void} onChange - Callback function invoked when input value changes
 * @property {string} [error] - Optional error message displayed below the input field
 */
interface FloatingTextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/**
 * FloatingTextField Component
 *
 * A reusable input field with an animated floating label.
 * The label smoothly animates to the top when the field is focused or has content.
 * Displays validation error messages below the input.
 *
 * Features:
 * - Floating label animation
 * - Error state display
 * - Supports all standard HTML input attributes (type, placeholder, autoComplete, etc.)
 * - Focus styles with border animation
 *
 * @component
 * @param {FloatingTextFieldProps} props - Component props
 * @returns {JSX.Element} The input field with floating label
 *
 * @example
 * <FloatingTextField
 *   type="email"
 *   name="email"
 *   label="Email address"
 *   value={email}
 *   onChange={setEmail}
 *   error={emailError}
 *   autoComplete="email"
 * />
 */
const FloatingTextField: FC<FloatingTextFieldProps> = ({
  label,
  value,
  onChange,
  error,
  ...inputProps
}) => {
  return (
    <div className="w-full">
      <label className="relative block w-full">
        <input
          {...inputProps}
          value={value}
          onChange={(event) => onChange(event.target.value)}
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
      </label>

      {error ? <p className="mt-2 text-red-400 text-xs">{error}</p> : null}
    </div>
  );
};

export default FloatingTextField;
