"use client";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function PlayerControls({
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center gap-4 px-4">
      {/* Previous Button */}
      <button
        onClick={onPrev}
        className="hover:text-text-secondary text-text-primary cursor-pointer transition-colors duration-200"
      >
        <SkipBack size={20} fill="currentColor" />
      </button>

      {/* Play/Pause Toggle */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="w-9 h-9 flex items-center justify-center bg-text-primary rounded-full hover:scale-105 transition-transform duration-200 active:scale-95 shadow-lg"
      >
        {isPlaying ? (
          /* Pause Icon: Small and dark to contrast with white circle */
          <Pause size={17} className="translate-x-[1px] text-surface-raised hover:opacity-40" fill="currentColor" />
        ) : (
          /* Play Icon: Slightly offset to the right for optical centering */
          <Play size={17} className="translate-x-[1px] text-surface-raised hover:opacity-40" fill="currentColor" />
        )}
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="hover:text-text-secondary text-text-primary cursor-pointer transition-colors duration-200"
      >
        <SkipForward size={20} fill="currentColor" />
      </button>
    </div>
  );
}