'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const TABS = [
  { label: 'Account',       href: '/settings/' },
  { label: 'Content',       href: '/settings/content' },
  { label: 'Notifications', href: '/settings/notifications' },
  { label: 'Privacy',       href: '/settings/privacy' },
  { label: 'Advertising',   href: '/settings/advertising' },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">

      <div className="px-8 pt-8">
        <h1 className="text-3xl font-extrabold text-text-primary mb-6">
          Settings
        </h1>

        {/* Tab bar */}
          <nav className="flex items-end">
            {TABS.map(({ label, href }, i) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'relative pb-3 pt-1 text-[20px] whitespace-nowrap',
                    'transition-colors duration-150 no-underline',
                    i === 0 ? 'pr-5' : 'px-5',
                    isActive
                      ? 'text-text-primary font-extrabold'
                      : 'text-text-muted hover:text-text-secondary font-extrabold',
                  ].join(' ')}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-text-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
      </div>

      <div className="px-8 py-8">
        {children}
      </div>

    </div>
  );
}