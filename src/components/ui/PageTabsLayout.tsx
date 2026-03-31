'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export interface TabItem {
  label: string;
  href: string;
}

interface PageTabsLayoutProps {
  title?: string;        
  tabs: TabItem[];  
  children: ReactNode;
  size?: 'sm' | 'md';
}

export default function PageTabsLayout({ title, tabs, children, size="md" }: PageTabsLayoutProps) {
  const textSize = size === 'sm' ? 'text-[14px] sm:text-[16px]' : 'text-[16px] sm:text-[20px]';
  const pathname = usePathname();

  return (
    <div>
      <div className="pt-3 pb-3">
        {title && (
          <h1 className="text font-extrabold text-text-primary mb-6">{title}</h1>
        )}

        <nav className="flex flex-wrap items-end gap-2">
          {tabs.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'relative pb-2 pt-2 pl-3 transition-colors duration-150 no-underline',
                  textSize,
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

      <div>{children}</div>
    </div>
  );
}