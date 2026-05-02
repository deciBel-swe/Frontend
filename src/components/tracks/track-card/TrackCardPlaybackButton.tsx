'use client';

import { Play } from 'lucide-react';
import Button from '@/components/buttons/Button';

type TrackCardPlaybackButtonProps = {
  disabled: boolean;
  isPlaying: boolean;
  onClick: () => void;
};

export default function TrackCardPlaybackButton({
  disabled,
  isPlaying,
  onClick,
}: TrackCardPlaybackButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      aria-label={
        disabled ? 'Playback blocked' : isPlaying ? 'Pause track' : 'Play track'
      }
      className="group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full p-0 sm:h-14 sm:w-14"
    >
      <div className="absolute inset-0 bg-neutral-0 opacity-100 transition" />

      {isPlaying ? (
        <span
          aria-hidden="true"
          className="relative z-10 inline-flex items-center gap-1"
        >
          <span className="h-6 w-1.5 rounded-sm bg-neutral-1000" />
          <span className="h-6 w-1.5 rounded-sm bg-neutral-1000" />
        </span>
      ) : (
        <Play
          className="relative z-10 h-6 w-6 translate-x-px text-neutral-1000 hover:opacity-40"
          fill="currentColor"
        />
      )}
    </Button>
  );
}
