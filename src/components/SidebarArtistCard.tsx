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
  artistUrl?: string; // URL to the artist's page
}

const SidebarArtistCard: React.FC<SidebarArtistCardProps> = ({
  name,
  followers,
  tracks,
  imageUrl,
  artistUrl = '#',
}) => {
  return (
    <div className="group flex items-center justify-between p-2 rounded-md hover:bg-surface-raised transition-colors w-full">
      
      {/* Artist info */}
      <div className="flex items-center gap-2">
        {/* Artist image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 bg-neutral-400 rounded-full flex-shrink-0"></div>
        )}

        <div className="flex flex-col">
          {/* Name (clickable) */}
          <Link
            href={artistUrl}
            className="text-sm font-medium text-text-primary truncate transition-opacity hover:opacity-70"
          >
            {name}
          </Link>

          {/* Followers & Tracks (both clickable) */}
          <div className="flex items-center gap-3 text-xs text-text-muted">
            {/* Followers */}
            <Link
              href={artistUrl}
              className="flex items-center gap-1 transition-opacity hover:opacity-70"
            >
              <Users className="w-3 h-3" /> {followers.toLocaleString()}
            </Link>

            {/* Tracks */}
            <Link
              href={artistUrl}
              className="flex items-center gap-1 transition-opacity hover:opacity-70"
            >
              <Music className="w-3 h-3" /> {tracks}
            </Link>
          </div>
        </div>
      </div>

      {/* Follow button */}
      <Button
        size="sm"
        variant="secondary"
        className="rounded-full px-3 py-1 opacity-100"
      >
        Follow
      </Button>
    </div>
  );
};

export default SidebarArtistCard;