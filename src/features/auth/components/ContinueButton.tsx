'use client';

import React from 'react';

/**
 * Props for the ContinueButton component
 * Extends standard HTML button attributes to allow passing disabled, onClick, type, etc.
 * @interface ContinueButtonProps
 * @property {React.ReactNode} children - Button label text or content
 */
interface ContinueButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/**
 * ContinueButton Component
 *
 * A primary call-to-action button used throughout the authentication forms.
 * Features:
 * - Full width button with consistent sizing
 * - Disabled state styling (muted background and reduced opacity)
 * - Supports all standard HTML button attributes
 *
 * @component
 * @param {ContinueButtonProps} props - Component props
 * @returns {JSX.Element} The button element
 *
 * @example
 * <ContinueButton
 *   type="submit"
 *   disabled={!isFormValid}
 *   onClick={handleSubmit}
 * >
 *   Sign In
 * </ContinueButton>
 */
const ContinueButton: React.FC<ContinueButtonProps> = ({
  children,
  ...props
}: ContinueButtonProps) => {
  return (
    <button
      {...props} // forward type, disabled, onClick, etc.
      className="w-full h-[2.6rem] rounded font-semibold text-sm transition bg-border-contrast cursor-pointer text-text-inverse
      disabled:bg-text-muted disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
};

export default ContinueButton;
