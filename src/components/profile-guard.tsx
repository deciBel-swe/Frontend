'use client';

import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

interface ProfileGuardProps {
  username: string;
  children: ReactNode;
}

/**
 * ProfileGuard
 *
 * Client component that only handles profile loading state and backend 404.
 *
 * Behaviour:
 * - Loading  → renders a skeleton placeholder
 * - Backend 404 → calls notFound()
 * - Any other response state → renders children
 *
 * @example
 * // In layout.tsx (server component):
 * <ProfileGuard username={username}>{children}</ProfileGuard>
 */
export function ProfileGuard({ username, children }: ProfileGuardProps) {
  const { isLoading, isError, errorStatusCode } = useUserProfile(username);

  if (isLoading) {
    return (
      <div className="w-full animate-pulse">
        {/* Cover photo skeleton */}
        <div className="w-full h-48 bg-surface-raised" />
        {/* Avatar + name skeleton */}
        <div className="px-8 py-4 flex items-end gap-4">
          <div className="w-32 h-32 rounded-full bg-surface-raised -mt-16" />
          <div className="flex flex-col gap-2 mb-2">
            <div className="h-5 w-40 bg-surface-raised rounded" />
            <div className="h-3 w-24 bg-surface-default rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Only treat an actual backend 404 as a not-found route.
  if (isError && errorStatusCode === 404) {
    notFound();
  }

  return <>{children}</>;
}