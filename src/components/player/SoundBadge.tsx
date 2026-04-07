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
          className="w-12 h-12 rounded-[4px] object-cover border border-border-strong" 
          width={48}
          height={48}
          unoptimized
        />
      </div>

      {/* Text Container */}
      <div className="flex flex-col min-w-0 leading-tight">
        {/* Artist Name (Top, Gray) */}
        <Link href="#" className="text-xs text-text-secondary truncate hover:text-text-primary cursor-pointer transition-colors font-extrabold">
          {artist}
        </Link>
        
        {/* Track Title (Bottom, Bold White) */}
        <Link href="#" className="text-xs font-extrabold text-text-primary truncate block hover:text-interactive-hover transition-colors">
          {track}
        </Link>
      </div>
    </div>
  );
}