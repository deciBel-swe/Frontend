'use client';

import Link from 'next/link';
import {
  Play,
  Heart,
  MoreHorizontal,
  MessageCircle,
  Repeat,
} from 'lucide-react';
import React from 'react';
import Button from '@/components/buttons/Button';
import { HoverPlayImage } from '@/components/sidebar/HoverPlayImage';
import TrackActions from '@/components/TrackActions'

interface TrackStats {
  plays: string;
  likes: string;
  reposts: string;
  comments: string;
}

interface TrackRowProps {
  image: string;
  artist: string;
  title: string;
  stats: TrackStats;

  // Optional callbacks for the actions
  onLike?: () => void;
  onMore?: () => void;
}

const TrackRow: React.FC<TrackRowProps> = ({ image, artist, title, stats, onLike, onMore }) => {
  const artistSlug = encodeURIComponent(artist);
  const songSlug = encodeURIComponent(title);

  const artistUrl = `/artist/${artistSlug}`;
  const songUrl = `/artist/${artistSlug}/${songSlug}`;

  const statsLinks = {
    plays: artistUrl,
    likes: `${artistUrl}/likes`,
    reposts: `${artistUrl}/reposts`,
    comments: `${artistUrl}/comments`,
  };

  return (
    <div className="group flex w-full items-center gap-3 px-2 py-3 rounded-xl transition hover:bg-surface-raised">
      {/* IMAGE WRAPPER (controls size now) */}
      <div className="w-12 h-12 md:w-14 md:h-14 shrink-0">
        <HoverPlayImage image={image} />
      </div>

      {/* TEXT SECTION */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center w-full mb-1">
          {/* LEFT: TEXT */}
          <div className="flex flex-col min-w-0">
            <Link
              href={artistUrl}
              className="text-xs text-text-muted hover:text-text-primary"
            >
              {artist}
            </Link>

            <Link
              href={songUrl}
              className="text-sm font-semibold truncate transition group-hover:text-text-primary"
            >
              {title}
            </Link>
          </div>

          {/* SPACER (THIS PUSHES BUTTONS RIGHT) */}
          <div className="flex-1" />

          {/* RIGHT: ACTION BUTTONS */}
          <div className="hidden group-hover:flex items-center gap-2">
              <TrackActions
              size={18}
              showRepost={false}
              showShare={false}
              showCopy={false}
              onLike={onLike}
              onMore={onMore}
            />
            {/* <Button
              className="p-2 rounded-lg bg-surface hover:opacity-80 transition"
              variant="secondary"
            >
              <Heart size={18} />
            </Button>

            <Button
              className="p-2 rounded-lg bg-surface hover:opacity-80 transition"
              variant="secondary"
            >
              <MoreHorizontal size={18} />
            </Button> */}
          </div>
        </div>
        {/* STATS */}
        <div className="flex items-center gap-3 text-xs mt-1">
          <p className="flex items-center gap-1 text-text-muted transition group-hover:text-text-primary">
            <Play size={14} /> {stats.plays}
          </p>

          <Link
            href={statsLinks.likes}
            className="flex items-center gap-1 hover:text-status-error transition"
          >
            <Heart size={14} /> {stats.likes}
          </Link>

          <Link
            href={statsLinks.reposts}
            className="flex items-center gap-1 hover:text-status-success transition"
          >
            <Repeat size={14} /> {stats.reposts}
          </Link>

          <Link
            href={statsLinks.comments}
            className="flex items-center gap-1 hover:text-status-info transition"
          >
            <MessageCircle size={14} /> {stats.comments}
          </Link>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      {/* <div className="hidden group-hover:flex items-center gap-2">
        <Button className="p-2 rounded-lg bg-surface hover:opacity-80 transition" variant="secondary">
          <Heart size={18} />
        </Button>

        <Button className="p-2 rounded-lg bg-surface hover:opacity-80 transition" variant="secondary">
          <MoreHorizontal size={18} />
        </Button>
      </div> */}
    </div>
  );
};

export default TrackRow;
