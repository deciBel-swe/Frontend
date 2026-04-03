'use client';

/**
 * Button — Pure UI button component for the Decibel design system.
 *
 * Variants: "primary" | "secondary" | "ghost" | "danger | premiums"
 * Sizes:    "sm" | "md" | "lg"
 *
 * Accepts all standard HTML button attributes, including `onClick`,
 * `type="submit"`, and `disabled`. Compose icons as children.
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleUpload}>Upload</Button>
 * <Button variant="secondary" size="sm"><SearchIcon /> Search</Button>
 * <Button variant="danger" size="lg" disabled>Delete track</Button>
 * <Button type="submit" variant="primary">Save</Button>
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'premium'
  | 'ghost_highlight';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Fills the full width of its container */
  fullWidth?: boolean;
}

// ─── Style maps ──────────────────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-transparent text-text-primary font-extrabold',
    'hover:border-text-primary hover:text-text-muted',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
  secondary: [
    'bg-text-primary text-bg-base font-extrabold',
    'hover:text-text-muted',
    'disabled:bg-brand-muted disabled:cursor-not-allowed',
  ].join(' '),
  premium: [
    'bg-transparent text-text-primary font-extrabold',
    'border border-border-brand',
    'disabled:bg-brand-muted disabled:cursor-not-allowed',
  ].join(' '),
  ghost: [
    'bg-transparent text-text-secondary',
    'border border-transparent',
    'hover:bg-interactive-hover hover:text-text-primary',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
  ghost_highlight: [
    'hover:bg-interactive-hover hover:text-text-primary',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),

  danger: [
    'bg-status-error text-neutral-0',
    'border border-transparent',
    'hover:opacity-90',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-7  px-3   text-xs  gap-1.5 rounded-sm',
  md: 'h-9  px-4   text-sm  gap-2   rounded',
  lg: 'h-11 px-5   text-base gap-2  rounded-md',
};

// ─── Button ───────────────────────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      type = 'button',
      className = '',
      children,
      ...restProps
    },
    ref
  ) => {
    const classes = [
      'inline-flex items-center justify-center font-bold',
      'select-none whitespace-nowrap cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
      'transition-colors duration-150 ease-in-out',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} type={type} className={classes} {...restProps}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
