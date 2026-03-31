'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HoverPlayImage } from '@/components/sidebar/HoverPlayImage';
import { Heart, UserPlus, MoreHorizontal } from 'lucide-react';

interface PlaylistCardProps {
  title: string;
  coverUrl: string;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ title, coverUrl }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // mark component as mounted
  }, []);

  if (!isMounted) return null; // render nothing on S

  return (
    <div
      className="
        relative
        w-28 h-28
        w-[6.5rem] h-[6.5rem]      /* default (half screen) */
        md:w-[8rem] md:h-[8rem] /* medium screen */
        lg:w-[10rem] lg:h-[10rem] /* full laptop screen */
        rounded-md
        m-2
      "
    >
      {/* Image with hover play */}
      <div className="group relative cursor-pointer h-full w-full rounded-md overflow-hidden">
        <HoverPlayImage
          image={coverUrl}
          alt={title}
        />

        {/* Hover Actions Overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="hidden sm:flex absolute inset-x-0 bottom-1 justify-end gap-1 px-2">
            <button
              aria-label="love"
              className="pointer-events-auto h-8 w-8 rounded-full text-white flex items-center justify-center hover:text-red-400"
            >
              <Heart size={16} />
            </button>

            <button
              aria-label="follow"
              className="pointer-events-auto h-8 w-8 rounded-full text-white flex items-center justify-center hover:text-blue-400"
            >
              <UserPlus size={16} />
            </button>

            <button
              aria-label="more"
              className="pointer-events-auto h-8 w-8 rounded-full text-white flex items-center justify-center hover:text-gray-400"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Title */}
      <Link
        href="#"
        className="mt-3 text-sm font-medium text-text-primary truncate block hover:text-text-secondary transition-colors"
      >
        {title}
      </Link>
    </div>
  );
};

export default PlaylistCard;
