'use client';

import { useCopyTrackLink } from '@/hooks/useCopyTrackLink';
import React, { useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import Button from '@/components/buttons/Button';
import Waveform from '@/components/waveform/Waveform';
import { ShareModal } from '@/features/prof/components/ShareModal';
import { useSecretLink } from '@/hooks/useSecretLink';
import { useTrackVisibility } from '@/hooks/useTrackVisibility';
import EditTrackModal from '@/features/tracks/components/EditTrackModal';
import CompactTrackList from '@/components/CompactTrackList'
import TrackActions from '@/components/TrackActions'

type TrackCardProps = {
  trackId: string;
  isPrivate?: boolean;
  timeAgoText?: string; // ex: "3 years ago"
  
  user: {
    name: string;
    avatar: string;
  };
  postedText?: string;
  timeAgo?: string;
  showEditButton?: boolean;

    // New prop to conditionally show the track list
  showTrackList?: boolean;

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
  trackId,
  isPrivate = false,
  user,
  postedText = 'posted a track',
  timeAgo = '',
  showEditButton = true,
  track,
  waveform,
  showTrackList = false,
  timeAgoText = '',
}: TrackCardProps) {
  const userSlug = user.name.toLowerCase().replace(/\s+/g, '');
  const trackSlug = track.title.toLowerCase().replace(/\s+/g, '-');
  const [editOpen, setEditOpen] = useState(false);

  const { visibility } = useTrackVisibility(Number(trackId));
  const resolvedIsPrivate = visibility?.isPrivate ?? isPrivate;

  // ── Share modal state
  const [isShareOpen, setIsShareOpen] = useState(false);

  // ── Fetch correct URL based on privacy
  const { secretUrl } = useSecretLink(resolvedIsPrivate ? trackId : undefined);

  // ── Use the centralized copy hook (bypasses useTrackMetadata entirely)
  const { copied, handleCopy } = useCopyTrackLink({
    trackId,
    isPrivate: resolvedIsPrivate,
    secretUrl,
    artistName: track.artist,
    trackTitle: track.title,
  });

  return (
    <div className="bg-surface-default text-text-primary p-2 sm:p-3 rounded-lg w-full my-3">
      {/* HEADER (soundContext) */}
      <div className="flex items-center gap-2 mb-4 text-sm text-text-muted">
        <Link href={`/${userSlug}`}>
          <img
            src={user.avatar}
            className="w-8 h-8 rounded-full object-cover"
          />
        </Link>

        <div>
          <span className="text-text-primary font-medium hover:opacity-40">
            <Link href={`/${userSlug}`}>{user.name}</Link>
          </span>{' '}
          {postedText} <span>{timeAgo}</span>
        </div>
      </div>

      {/* MAIN ROW */}
      <div className="flex gap-2 sm:gap-3 md:gap-4 items-start min-w-0">
        {/* LEFT IMAGE */}
        <Link
          href={`/${userSlug}/${trackSlug}`}
          className="w-24 sm:w-28 md:w-36 aspect-square flex-shrink-0 -mt-1"
        >
          <img
            src={track.cover}
            className="w-full h-full object-cover rounded"
          />
        </Link>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col flex-1 gap-2 min-w-0">
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

<div className="flex flex-col w-full">
  <div className="flex items-center gap-2">
    <Link
      href={`/${userSlug}`}
      className="text-text-muted text-sm inline-flex self-start font-bold hover:opacity-40"
    >
      {track.artist}
    </Link>

    {timeAgoText && (
      <p className="ml-auto text-xs text-text-muted">{timeAgoText} years ago</p>
    )}
  </div>

  <Link
    href={`/${userSlug}/${trackSlug}`}
    className="w-fit text-text-primary font-semibold inline-block hover:opacity-40"
  >
    {track.title}
  </Link>
</div>
          </div>

          {/* 2. WAVEFORM */}
          <div className="hidden sm:block px-1 sm:px-2 w-full min-w-0 overflow-hidden">
            <Waveform
              data={waveform}
              height={90}
              barClassName="bg-text-muted hover:bg-brand-primary"
            />
          </div>

          {/* 2a. Track list */}
          {showTrackList && (
<CompactTrackList
  tracks={[
    {
      id: 1,
      title: 'No Promises',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-000244807472-dvac3y-t120x120.jpg',
      plays: '39.7M',
    },
    {
      id: 2,
      title: 'Undefeated (feat. 21 Savage)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-000244805227-4pqktm-t120x120.jpg',
      plays: '15.5M',
    },
    {
      id: 3,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 4,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 5,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 6,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
            {
      id: 7,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 8,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 9,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
            {
      id: 10,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 11,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 12,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
            {
      id: 13,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 14,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
        {
      id: 15,
      title: 'Drowning (feat. Kodak Black)',
      artist: 'A Boogie Wit Da Hoodie',
      coverUrl: 'https://i1.sndcdn.com/artworks-tii3xobg7kRq-0-t120x120.jpg',
      plays: 'Unavailable',
      available: false,
    },
  ]}
/>
)}
         <TrackActions
        size={16}                
        showEdit={showEditButton}  
        onEdit={() => setEditOpen(true)} 
        onLike={() => console.log('Liked', track.id)}
        onRepost={() => console.log('Reposted', track.id)}
        onShare={() => setIsShareOpen(true)}
        onCopy={handleCopy}
        onMore={() => console.log('More options', track.id)}
        />
        </div>

        {/* DURATION */}
        <div className="text-xs text-text-muted pt-1">{track.duration}</div>
      </div>

      <ShareModal
        variant="track"
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        trackId={trackId}
        isPrivate={resolvedIsPrivate}
        track={{
          title: track.title,
          artist: track.artist,
          coverUrl: track.cover,
          duration: track.duration,
        }}
      />

      <EditTrackModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        trackId={track.id}
        track={{ title: track.title, artist: track.artist, cover: track.cover }}
      />
    </div>
  );
}
