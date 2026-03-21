'use client';

import React from 'react';
import { Users, Music } from 'lucide-react';
import Button from '@/components/buttons/Button';
import Link from 'next/link';

interface SidebarArtistCardProps {
  name: string;
  followers: number;
  tracks: number;
  imageUrl?: string;
  artistUrl?: string;
}

const SidebarArtistCard: React.FC<SidebarArtistCardProps> = ({
  name,
  followers = 0,
  tracks = 0,
  imageUrl,
  artistUrl,
}) => {
  // URL logic
  const artistSlug = encodeURIComponent(name);
  const baseUrl = artistUrl ?? `/artist/${artistSlug}`;

  const statsLinks = {
    followers: `${baseUrl}/followers`,
    tracks: `${baseUrl}/tracks`,
  };

  return (
    <div className="group flex items-center justify-between px-2 py-4 rounded-xl hover:bg-surface-raised transition-colors w-full cursor-pointer">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-2">
        {/* IMAGE */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 bg-neutral-400 rounded-full flex-shrink-0" />
        )}

        {/* TEXT */}
        <div className="flex flex-col">
          {/* NAME */}
          <Link
            href={baseUrl}
            className="text-sm font-medium text-text-primary truncate transition group-hover:text-text-primary"
          >
            {name}
          </Link>

          {/* STATS */}
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <Link
              href={statsLinks.followers}
              className="flex items-center gap-1 transition hover:text-text-primary"
            >
              <Users className="w-3 h-3" />
              {followers.toLocaleString()}
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
      <Button size="sm" variant="secondary" className="rounded-full px-3 py-1">
        Follow
      </Button>
    </div>
  );
};

export default SidebarArtistCard;
