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
 * Client component that gates access to a user profile based on privacy
 * settings. 
 *
 * Behaviour:
 * - Loading  → renders a skeleton placeholder
 * - Error    → calls notFound() (user does not exist)
 * - Private + not owner → calls notFound()
 * - Public or owner → renders children with isOwner context via slot props
 *
 * @example
 * // In layout.tsx (server component):
 * <ProfileGuard username={username}>{children}</ProfileGuard>
 */
export function ProfileGuard({ username, children }: ProfileGuardProps) {
  const { profile, isOwner, isLoading, isError } = useUserProfile(username);

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

  // User not found
  if (isError || !profile) {
    notFound();
  }

  // Private profile — visitor gets 404, owner sees their own profile
  if (profile.isPrivate && !isOwner) {
    notFound();
  }

  return <>{children}</>;
}