'use client';

import React from 'react';
import Link from 'next/link';
import StateItem from '@/features/prof/components/layout/sidebar/StatItem';

type PlaylistEngagementSidebarProps = {
  username: string;
  playlistId: number;
  likesCount: number;
  repostsCount: number;
};

export default function PlaylistEngagementSidebar({
  username,
  playlistId,
  likesCount,
  repostsCount,
}: PlaylistEngagementSidebarProps) {
  const basePath = `/${username}/sets/${playlistId}`;

  return (
    <aside className="hidden w-72 shrink-0 py-5 pl-4 md:block">
      <div className="rounded border border-border-default bg-surface-default p-3">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-text-muted">
          Playlist Activity
        </p>

        <div className="flex flex-nowrap overflow-x-auto">
          <Link href={`${basePath}/reposts`}>
            <StateItem count={repostsCount} text="Reposts" />
          </Link>
          <Link href={`${basePath}/likes`}>
            <StateItem count={likesCount} text="Likes" />
          </Link>
        </div>

        <p className="mt-2 text-xs text-text-muted">
          Click Likes or Reposts to view users.
        </p>
      </div>
    </aside>
  );
}