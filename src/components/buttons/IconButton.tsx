import Link from 'next/link';
import type { FC, ReactNode } from 'react';

/**
 * IconButton — circular 32 × 32 interactive control.
 *
 * Renders as a Next.js `<Link>` when `href` is provided, or as a `<button>` otherwise.
 * `aria-label` is mandatory because icon-only controls must have an accessible name.
 *
 * @example
 * <IconButton href="/notifications" aria-label="Notifications">
 *   <BellIcon /><Badge count={3} />
 * </IconButton>
 * <IconButton aria-label="More options" onClick={openMenu}><DotsIcon /></IconButton>
 */

export interface IconButtonProps {
  children: ReactNode;
  'aria-label': string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

const BASE_CLASS =
  'relative inline-flex items-center justify-center w-8 h-8 px-0 gap-0 rounded-full ' +
  'border-0 bg-transparent text-text-muted hover:text-text-primary hover:cursor-pointer';
export const IconButton: FC<IconButtonProps> = ({
  children,
  'aria-label': ariaLabel,
  href,
  onClick,
  className = '',
}) => {
  const cls = className ? `${BASE_CLASS} ${className}` : BASE_CLASS;

  if (href !== undefined) {
    return (
      <Link
        href={href}
        className="no-underline"
        aria-label={ariaLabel}
        onClick={onClick}
      >
        <span className={cls}>{children}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cls}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
