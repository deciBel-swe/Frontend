"use client";

import Link from "next/link";
import Image from "next/image";

interface SoundBadgeProps {
  track: string;
  artist: string;
  artwork: string;
}

export default function SoundBadge({ track, artist, artwork }: SoundBadgeProps) {
  return (
    <div className="flex items-center gap-3 w-57 overflow-hidden group select-none">
      {/* Artwork with subtle border */}
      <div className="relative flex-shrink-0">
        <Image 
          src={artwork}
          alt={track} 
          className="w-12 h-12 rounded-[4px] object-cover border border-neutral-800" 
          width={48}
          height={48}
          unoptimized
        />
      </div>

      {/* Text Container */}
      <div className="flex flex-col min-w-0 leading-tight">
        {/* Artist Name (Top, Gray) */}
        <Link href="#" className="text-xs text-neutral-300 truncate hover:text-neutral-400 cursor-pointer transition-colors font-extrabold">
          {artist}
        </Link>
        
        {/* Track Title (Bottom, Bold White) */}
        <Link href="#" className="text-xs font-extrabold text-neutral-200 truncate block hover:text-interactive-hover transition-colors">
          {track}
        </Link>
      </div>
    </div>
  );
}