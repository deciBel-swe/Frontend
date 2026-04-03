"use client";
import { Shuffle, Repeat } from "lucide-react";

interface PlaybackModesProps {
  shuffleActive: boolean;
  repeatActive: boolean;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

export default function PlaybackModes({
  shuffleActive,
  repeatActive,
  onToggleShuffle,
  onToggleRepeat,
}: PlaybackModesProps) {

  return (
    <div className="flex items-center gap-6 p-4 select-none">
      
      {/* Shuffle Button with Native Tooltip */}
      <button
        onClick={onToggleShuffle}
        title="Shuffle" // This creates the native tooltip
        className={`transition-colors duration-200 ${
          shuffleActive ? "text-orange-500" : "hover:text-neutral-400 text-white cursor-pointer"
        }`}
      >
        <Shuffle size={15} strokeWidth={2.5} />
      </button>

      {/* Repeat Button with Native Tooltip */}
      <button
        onClick={onToggleRepeat}
        title="Repeat" // This creates the native tooltip
        className={`transition-colors duration-200 ${
          repeatActive ? "text-orange-500" : "hover:text-neutral-400 text-white cursor-pointer"
        }`}
      >
        <Repeat size={15} strokeWidth={2.5} />
      </button>

    </div>
  );
}