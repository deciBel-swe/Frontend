'use client';

import type { FC, SelectHTMLAttributes } from 'react';

/**
 * Represents a single option in a select field
 * @interface FloatingSelectOption
 * @property {string} value - The option's value (what gets submitted)
 * @property {string} label - The displayed text for the option
 * @property {boolean} [disabled] - Whether the option is disabled and cannot be selected
 */
export interface FloatingSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Props for the FloatingSelectField component
 * Extends standard HTML select attributes while customizing value and onChange handling
 * @interface FloatingSelectFieldProps
 * @property {string} label - Floating label text that animates above the select when focused or has a value
 * @property {string} value - Currently selected option value
 * @property {(value: string) => void} onChange - Callback function invoked when selection changes
 * @property {FloatingSelectOption[]} options - Array of available options
 * @property {string} [placeholder] - Placeholder option text (displayed when no value is selected)
 * @property {string} [error] - Optional error message displayed below the select field
 */
interface FloatingSelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FloatingSelectOption[];
  placeholder?: string;
  error?: string;
}

/**
 * FloatingSelectField Component
 * 
 * A reusable select dropdown field with an animated floating label.
 * The label smoothly animates to the top when the field is focused or has a selected value.
 * Displays validation error messages below the select.
 * 
 * Features:
 * - Floating label animation
 * - Optional placeholder option
 * - Support for disabled options
 * - Error state display
 * - Customizable appearance with Tailwind classes
 * 
 * @component
 * @param {FloatingSelectFieldProps} props - Component props
 * @returns {JSX.Element} The select field with floating label
 * 
 * @example
 * <FloatingSelectField
 *   label="Month"
 *   value={month}
 *   onChange={setMonth}
 *   options={monthOptions}
 *   placeholder="Select a month"
 *   error={monthError}
 * />
 */
const FloatingSelectField: FC<FloatingSelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  ...selectProps
}) => {
  return (
    <div className="w-full">
      <label className="relative block w-full">
        <select
          {...selectProps}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="peer w-full h-[3.2rem] bg-interactive-default outline-none text-text-primary text-[13px] font-medium px-3.5 placeholder:text-text-muted border border-transparent rounded focus-within:border-interactive-active transition-[border-color] duration-150 appearance-none pr-10"
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}

          {options.map((option) => (
            <option
              key={`${option.value}-${option.label}`}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <span
          className={`
            absolute left-4 text-text-muted pointer-events-none transition-all duration-200
            ${value ? 'top-1 text-[9px]' : 'top-4 text-[13px]'}
            peer-focus:top-0.5 peer-focus:text-[9px]
          `}
        >
          {value ? label: ''}
        </span>

        <svg
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </label>

      {error ? <p className="mt-1 text-red-400 text-xs">{error}</p> : null}
    </div>
  );
};

export default FloatingSelectField;