import React from 'react';
import Link from 'next/link';

type DiscoverHeaderProps = {
  title: string;
  /** Optional "See all" or similar action link */
  actionLabel?: string;
  actionHref?: string;
};

/**
 * DiscoverHeader
 *
 * renders a section title with an optional action link.
 * extend via props, never modify this component to add new sections.
 */
export default function DiscoverHeader({
  title,
  actionLabel,
  actionHref,
}: DiscoverHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-text-primary tracking-tight">{title}</h2>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}