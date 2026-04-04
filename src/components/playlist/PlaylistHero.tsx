'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';

interface PlaylistHeroProps {
  title: string;
  creator: string;
  creatorUsername: string;
  trackCount: number;
  duration: string;
  createdAt: string;
  artworkUrl: string;
}

export const PlaylistHero: React.FC<PlaylistHeroProps> = ({
  title,
  creator,
  creatorUsername,
  trackCount,
  duration,
  createdAt,
  artworkUrl,
}) => {
  return (
    <div className="relative w-full bg-surface-raised p-6 flex justify-between h-[340px] overflow-hidden">
      
      {/* LEFT SECTION: Play, Title, and Bottom Badge */}
      <div className="flex flex-col justify-between z-10 h-full">
        {/* Top: Play + Title Group */}
        <div className="flex items-start gap-5">
          <button className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform active:scale-95 shrink-0">
            <Play fill="text-text-primary" className="text-text-primary ml-1" size={30} />
          </button>

          <div className="flex flex-col items-start gap-1">
            <h1 className="text-3xl font-extrabold bg-background-strong text-text-primary px-3 py-1.5 leading-none">
              {title}
            </h1>
            <Link 
              href={`/${creatorUsername}`}
              className="text-text-secondary font-bold text-lg px-3 hover:text-text-primary transition-colors"
            >
              {creator || 'Unknown Artist'}
            </Link>
          </div>
        </div>

        {/* Bottom: Track Badge */}
        <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-surface-raised border border-white/10 backdrop-blur-md">
          <span className="text-xl font-black text-text-primary">{trackCount}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Tracks</span>
          <span className="text-[9px] text-text-muted">{duration}</span>
        </div>
      </div>

      {/* RIGHT SECTION: Time Ago + Full Height Image */}
      <div className="flex items-start gap-4 h-full shrink-0">
        {/* Time Ago - Positioned to the left of the image, aligned to top */}
        <span className="text-sm text-text-secondary font-bold pt-2 whitespace-nowrap">
          {createdAt}
        </span>
        
        {/* Artwork - Takes full height of the parent p-6 container */}
        <div className="relative h-full aspect-square shadow-2xl border rounded-2xl border-white/5">
          <Image 
            src={artworkUrl} 
            alt={title} 
            fill 
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Aesthetic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};