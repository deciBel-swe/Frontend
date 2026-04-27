'use client';

import Link from 'next/link';
import { Play, Pause } from 'lucide-react';
import Button from '@/components/buttons/Button';
import Waveform from '@/components/waveform/Waveform';
import Image from 'next/image';
import WaveformTimedComments, {
  type TimedComment,
} from '@/features/tracks/components/WaveformTimedComments';
import { useWaveformData } from '@/hooks/useWaveformData';

type Tag = string;

type TrackHeroProps = {
  title: string;
  artistName: string;
  artistSlug: string;
  coverUrl: string;
  timeAgo: string;
  tags: Tag[];
  genre: string;
  waveformUrl?: string;
  waveformData?: number[];
  duration: string;
  currentUserAvatar?: string;
  currentUserName?: string;
  waveformComments?: TimedComment[];
  waveformCurrentTime?: number;
  waveformDurationSeconds?: number;
  pendingTimestamp?: number | null;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onWaveformSeek?: (progress: number) => void;
};

export default function TrackHero({
  title,
  artistName,
  artistSlug,
  coverUrl,
  timeAgo,
  tags,
  genre,
  waveformUrl,
  waveformData,
  duration,
  currentUserAvatar,
  currentUserName,
  waveformComments = [],
  waveformCurrentTime = 0,
  waveformDurationSeconds = 1,
  pendingTimestamp = null,
  isPlaying = false,
  onPlayPause,
  onWaveformSeek,
}: TrackHeroProps) {
  const waveform = useWaveformData(waveformData, waveformUrl);

  return (
    <div className="relative w-full bg-surface-default rounded-lg overflow-hidden">
      {/* Blurred background from cover art */}
      <div
        className="absolute inset-0 opacity-20 blur-2xl scale-110"
        style={{ backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        aria-hidden
      />

      <div className="relative flex flex-col md:flex-row gap-0">
        {/* ── LEFT: Player area ─────────────────────────────── */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4 min-w-0">
          {/* Top row: play + title + meta */}
          <div className="flex items-start gap-4">
            {/* Play button */}
            <Button
              variant="ghost"
              onClick={onPlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="shrink-0 w-14 h-14 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center justify-center p-0"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" fill="currentColor" />
              ) : (
                <Play className="w-6 h-6 translate-x-px" fill="currentColor" />
              )}
            </Button>

            {/* Title block */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 text-sm text-text-muted mb-0.5">
                <Link
                  href={`/${artistSlug}`}
                  className="font-semibold text-text-primary hover:text-brand-primary transition-colors truncate"
                >
                  {artistName}
                </Link>
               <div className="flex items-center gap-2 shrink-0">
                <span className="shrink-0 text-xs">{timeAgo}</span>
              </div>

              </div>
              <div className="flex items-center justify-between gap-2 text-sm text-text-muted mb-0.5">
                <h1 className="text-lg sm:text-xl font-bold text-text-primary leading-tight truncate">
                  {title}
                </h1>
                {/* Genre pill */}
                  {genre && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-interactive-default text-brand-primary border border-brand-primary font-semibold cursor-pointer transition-colors hover:bg-brand-primary hover:text-white">
                      # {genre}
                    </span>
                  )}
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-interactive-default text-text-muted border border-border-default hover:border-border-brand hover:text-brand-primary cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Waveform */}
          <div className="w-full min-w-0">
            <div className="w-full relative">
              <Waveform
                data={waveform}
                barClassName="bg-text-muted hover:bg-brand-primary"
                currentTime={waveformCurrentTime}
                durationSeconds={waveformDurationSeconds}
                onWaveformClick={onWaveformSeek}
              />
              <WaveformTimedComments
                comments={waveformComments}
                durationSeconds={waveformDurationSeconds}
                currentUser={{
                  name: currentUserName ?? 'You',
                  avatar: currentUserAvatar ?? '/images/default_song_image.png',
                }}
                pendingTimestamp={pendingTimestamp}
                pendingText=""
                setPendingText={() => {}}
                showCommentInput={false}
                onSubmit={() => {}}
                showMarkers={true}
              />
            </div>

            <div className="flex justify-end mt-1">
              <span className="text-xs font-mono text-text-muted bg-neutral-900/60 px-1.5 py-0.5 rounded">
                {duration}
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Cover art ──────────────────────────────── */}
        <div className="shrink-0 w-full md:w-52 lg:w-64 aspect-square md:aspect-auto">
          <Image
            src={coverUrl}
            alt={`${title} cover art`}
            className="w-full h-full object-cover"
            width ={400}
            height={400}
          />
        </div>
      </div>
    </div>
  );
}