'use client';

import React from 'react';
import Link from 'next/link';
import { Users, UserPlus } from 'lucide-react';
import AvatarImage from '@/components/avatars/AvatarImage';
import { Button } from '@/components/buttons/Button';

type Props = {
  owner: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
    id: number | string;
    // TODO: make it mandatory
    followersCount?: number;
    isFollowing?: boolean;
  };
  showFollowButton?: boolean;
  isFollowPending?: boolean;
  onFollowToggle?: (nextFollowing: boolean) => void | Promise<void>;
};

export default function PlaylistOwnerSidebar({ owner, showFollowButton = true, isFollowPending = false, onFollowToggle }: Props) {
  const ownerSlug = owner.username.toLowerCase().replace(/\s+/g, '');
  const ownerDisplayName = owner.displayName || owner.username;
  const canToggleFollow = typeof owner.id === 'number' && Boolean(onFollowToggle);

  return (
    <aside className="hidden md:flex flex-col items-center gap-2 w-44 shrink-0 px-4 py-6">
      
      {/* Avatar */}
      <Link href={`/${ownerSlug}`} className="hover:opacity-80 transition-opacity">
        <AvatarImage
          src={owner.avatarUrl}
          alt={ownerDisplayName}
          size={80}
          shape="circle"
        />
      </Link>

      {/* Username */}
      <Link
        href={`/${ownerSlug}`}
        className="text-sm font-bold text-text-primary hover:opacity-60 transition-opacity text-center"
      >
        {ownerDisplayName}
      </Link>

      {/* Stats */}
      <div className="flex gap-3 text-[11px] text-text-secondary select-none">
        <Link
          href={`/${ownerSlug}/followers`}
          className="flex items-center gap-1 font-medium hover:text-interactive-hover transition-colors"
        >
          <Users size={12} className="opacity-70" />
          {/* TODO: remove owner.id */}
          {owner.followersCount ?? owner.id}
        </Link>
      </div>

      {/* Follow button */}
      {showFollowButton && (
        <Button
          variant="secondary"
          className="flex items-center justify-center px-0 w-full py-1.5 text-xs font-bold"
          disabled={!canToggleFollow || isFollowPending}
          onClick={() => void onFollowToggle?.(!(owner.isFollowing ?? false))}
        >
          <UserPlus size={14} />
          {owner.isFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
    </aside>
  );
}
