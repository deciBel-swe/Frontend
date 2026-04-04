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
  prefetch?: boolean;
  onClick?: () => void;
  className?: string;
}

const BASE_CLASS =
  'relative inline-flex items-center justify-center ' +
  'min-w-7 min-h-7 sm:min-w-8 sm:min-h-8 ' +
  'px-0 sm:px-1 ' +
  'gap-0 rounded-full ' +
  'border-0 bg-transparent text-text-muted ' +
  'hover:opacity-70 active:opacity-50 ' +
  'transition-opacity duration-150';
export const IconButton: FC<IconButtonProps> = ({
  children,
  'aria-label': ariaLabel,
  href,
  prefetch,
  onClick,
  className = '',
}) => {
  const cls = className ? `${BASE_CLASS} ${className}` : BASE_CLASS;

  if (href !== undefined) {
    return (
      <Link
        href={href}
        prefetch={prefetch}
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
