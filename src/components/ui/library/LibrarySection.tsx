'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import HorizontalScroll from '@/components/HorizontalScroll';

interface LibrarySectionProps {
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
  children: ReactNode;
  className?: string;
  filterSlot?: ReactNode;
}

/**
 * LibrarySection — reusable horizontal-scroll section used throughout
 * the Library Overview page.
 *
 * Renders a labelled row with an optional "Browse …" CTA link on the right,
 * followed by a horizontally-scrollable children area.
 *
 * Follows SRP: it owns only layout + scroll shell, not content.
 */
export default function LibrarySection({
  title,
  ctaLabel,
  ctaHref,
  children,
  className = '',
  filterSlot,
}: LibrarySectionProps) {
  return (
    <section className={`mb-10 ${className}`}>
      {/* Row header */}
      <div className="flex items-center justify-between mb-4 mt-4">
        <h2 className="text-base font-bold text-text-primary m-0">{title}</h2>
         {filterSlot
        ? filterSlot
        : ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="text-[13px] text-text-primary hover:text-text-secondary transition-colors duration-150"
            >
              {ctaLabel}
            </Link>
          )}
        {/* {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="text-sm text-text-primary hover:text-text-secondary no-underline transition-colors"
          >
            {ctaLabel}
          </Link>
        )} */}
      </div>

          <HorizontalScroll>
        {children}
      </HorizontalScroll>
    </section>
  );
}