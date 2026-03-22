import Link from 'next/link';
import type { FC } from 'react';

/**
 * NavLink — top-navigation link with an active-state bottom-border indicator.
 *
 * @example
 * <NavLink href="/discover" label="Home" isActive={activeNav === 'home'} />
 */

export interface NavLinkProps {
  href: string;
  label: string;
  isActive?: boolean;
  prefetch?: boolean;
  /** Extra Tailwind classes — e.g. responsive visibility overrides. */
  className?: string;
}

export const NavLink: FC<NavLinkProps> = ({
  href,
  label,
  isActive = false,
  prefetch,
  className = '',
}) => {
  const cls = [
    'inline-flex items-center h-full px-2.5 rounded-none text-[13px] font-extrabold border-b-2',
    'select-none whitespace-nowrap cursor-pointer hover:bg-transparent',
    'transition-colors duration-150 ease-in-out',
    isActive
      ? 'text-text-primary border-default'
      : 'text-text-secondary border-transparent hover:text-text-primary',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Link
      href={href}
      prefetch={prefetch}
      aria-current={isActive ? 'page' : undefined}
      className="h-full no-underline"
    >
      <span className={cls}>{label}</span>
    </Link>
  );
};
