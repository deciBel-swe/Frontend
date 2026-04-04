'use client';

import React from 'react';
import { Users, Music } from 'lucide-react';
import Button from '@/components/buttons/Button';
import Link from 'next/link';
import Image from 'next/image';
import { useUserCardHook } from '@/hooks/useUserCardHook';

interface SidebarArtistCardProps {
  id?: number;
  name: string;
  followers: number;
  tracks: number;
  isFollowing?: boolean;
  imageUrl?: string;
  artistUrl?: string;
}

const SidebarArtistCard: React.FC<SidebarArtistCardProps> = ({
  id,
  name,
  followers = 0,
  tracks = 0,
  isFollowing = false,
  imageUrl,
  artistUrl,
}) => {
  const {
    user: resolvedUser,
    isFollowPending,
    handleFollowToggle,
  } = useUserCardHook({
    user: {
      id: String(id ?? name),
      username: name,
      avatarSrc: imageUrl,
      followerCount: followers,
      isFollowing,
    },
  });

  const artistSlug = resolvedUser.username.toLowerCase().replace(/\s+/g, '');
  const baseUrl = artistUrl ?? `/${artistSlug}`;
  const canToggleFollow = typeof id === 'number' && id > 0;

  const statsLinks = {
    followers: `${baseUrl}/followers`,
    tracks: `${baseUrl}/tracks`,
  };

  return (
    <div className="group flex items-center justify-between px-2 py-4 rounded-xl hover:bg-surface-raised transition-colors w-full cursor-pointer">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-2">
        {/* IMAGE */}
        {resolvedUser.avatarSrc ? (
          <Image
            src={resolvedUser.avatarSrc}
            alt={resolvedUser.username}
            className="w-10 h-10 rounded-full object-cover shrink-0"
            width={40}
            height={40}
            unoptimized
          />
        ) : (
          <div className="w-10 h-10 bg-neutral-400 rounded-full shrink-0" />
        )}

        {/* TEXT */}
        <div className="flex flex-col">
          {/* NAME */}
          <Link
            href={baseUrl}
            className="text-sm font-medium text-text-primary truncate transition group-hover:text-text-primary"
          >
            {resolvedUser.username}
          </Link>

          {/* STATS */}
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <Link
              href={statsLinks.followers}
              className="flex items-center gap-1 transition hover:text-text-primary"
            >
              <Users className="w-3 h-3" />
              {resolvedUser.followerCount.toLocaleString()}
            </Link>

            <Link
              href={statsLinks.tracks}
              className="flex items-center gap-1 transition hover:text-text-primary"
            >
              <Music className="w-3 h-3" />
              {tracks}
            </Link>
          </div>
        </div>
      </div>

      {/* ACTION */}
      <Button
        size="sm"
        variant="secondary"
        className="rounded-full px-3 py-1"
        onClick={() => {
          void handleFollowToggle((resolvedUser.isFollowing ?? false));
        }}
        disabled={!canToggleFollow || isFollowPending}
      >
        {resolvedUser.isFollowing ? 'Follow' : 'Following'}
      </Button>
    </div>
  );
};

export default SidebarArtistCard;
