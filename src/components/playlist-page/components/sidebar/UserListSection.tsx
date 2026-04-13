'use client';

import React from 'react';
import Link from 'next/link';

interface UserListSectionProps {
  title: string;
  countLabel: string;
  children?: React.ReactNode;
  viewAllHref?: string;
}

export const UserListSection = ({
  title,
  countLabel,
  children,
  viewAllHref = '#',
}: UserListSectionProps) => {
  return (
    <div className="flex flex-col gap-3">
      {/* header */}
      <div className="flex items-center justify-between">

        <Link
          href="#"
          className="text-[11px] font-bold uppercase text-text-secondary"
        >
          {countLabel} {title}
        </Link>

        <Link
          href={viewAllHref}
          className="text-text-secondary hover:text-text-primary text-[11px]"
        >
          View all
        </Link>

      </div>

      {/* content */}
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  );
};