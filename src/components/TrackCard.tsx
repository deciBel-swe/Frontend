'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Repeat2,
  Share2,
  MoreHorizontal,
  Copy,
  Pencil,
  Play,
} from 'lucide-react';
import Button from '@/components/buttons/Button';
import Waveform from '@/components/waveform/Waveform';
import EditTrackModal from '@/features/tracks/components/EditTrackModal';

type TrackCardProps = {
  user: {
    name: string;
    avatar: string;
  };
  postedText?: string;
  timeAgo?: string;

  track: {
    id: number;
    artist: string;
    title: string;
    cover: string;
    duration: string;
  };

  waveform: number[];
};

export default function TrackCard({
  user,
  postedText = 'posted a track',
  timeAgo = '',
  track,
  waveform,
}: TrackCardProps) {
  const userSlug = user.name.toLowerCase().replace(/\s+/g, '');
  const trackSlug = track.title.toLowerCase().replace(/\s+/g, '-');
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="bg-surface-default text-text-primary p-2 rounded-lg">
      {/* HEADER (soundContext) */}
      <div className="flex items-center gap-2 mb-4 text-sm text-text-muted">
        <Link href={`/system${userSlug}`}>
          <img
            src={user.avatar}
            className="w-8 h-8 rounded-full object-cover"
          />
        </Link>

        <div>
          <span className="text-text-primary font-medium hover:opacity-40">
            <Link href={`/system${userSlug}`}>{user.name}</Link>
          </span>{' '}
          {postedText} <span>{timeAgo}</span>
        </div>
      </div>

      {/* MAIN ROW */}
      <div className="flex gap-2 sm:gap-4 items-start min-w-0">
        {/* LEFT IMAGE */}
        <Link
          href={`/system${userSlug}/${trackSlug}`}
          className="w-28 sm:w-36 aspect-square flex-shrink-0 -mt-1"
        >
          <img
            src={track.cover}
            className="w-full h-full object-cover rounded"
          />
        </Link>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col flex-1 gap-2">
          {/* 1. NAME + PLAY */}
          <div className="flex items-center gap-3 h-12 px-2">
            <Button
              variant="ghost"
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0 flex items-center justify-center group overflow-hidden"
            >
              {/* overlay */}
              <div className="absolute inset-0 bg-neutral-0 opacity-100 transition" />

              {/* play icon */}
              <Play
                className="w-6 h-6 translate-x-[1px] text-neutral-1000 hover:opacity-40"
                fill="currentColor"
              />
            </Button>

            <div className="flex flex-col">
              <Link
                href={`/system${userSlug}`}
                className="text-text-muted text-sm inline-flex w-fit self-start font-bold hover:opacity-40"
              >
                {track.artist}
              </Link>

              <Link
                href={`/system${userSlug}/${trackSlug}`}
                className="text-text-primary font-semibold inline-block hover:opacity-40"
              >
                {track.title}
              </Link>
            </div>
          </div>

          {/* 2. WAVEFORM */}
          <div className="hidden sm:block px-1 sm:px-2 w-full min-w-0">
            <Waveform data={waveform} height={90} barClassName="bg-gray-500" />
          </div>

          {/* 3. ACTIONS */}
          <div className="flex items-center gap-1 h-12 px-2">
            <Button variant="ghost" aria-label="Like" title="Like">
              <Heart size={16} />
            </Button>

            <Button variant="ghost" aria-label="Repost" title="Repost">
              <Repeat2 size={16} />
            </Button>

            <Button variant="ghost" aria-label="Share" title="Share">
              <Share2 size={16} />
            </Button>

            <Button variant="ghost" aria-label="Copy Link" title="Copy Link">
              <Copy size={16} />
            </Button>

            <Button
              variant="ghost"
              aria-label="Edit"
              title="Edit"
              onClick={() => setEditOpen(true)}
            >
              <Pencil size={16} />
            </Button>

            <Button variant="ghost" aria-label="More" title="More">
              <MoreHorizontal size={16} />
            </Button>
          </div>
        </div>

        {/* DURATION */}
        <div className="text-xs text-text-muted pt-1">{track.duration}</div>
      </div>

      <EditTrackModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        trackId={track.id}
        track={{ title: track.title, artist: track.artist, cover: track.cover }}
      />
    </div>
  );
}
