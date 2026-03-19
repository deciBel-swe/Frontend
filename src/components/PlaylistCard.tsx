'use client';

import React from 'react';
import { useEffect, useState } from "react";

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
        group 
        relative 
        cursor-pointer 
        w-28 h-28 
        w-[6.5rem] h-[6.5rem]      /* default (half screen) */
        md:w-[8rem] md:h-[8rem] /* medium screen */
        lg:w-[10rem] lg:h-[10rem] /* full laptop screen */
        rounded-md
      "
    >
      {/* Cover Image */}
      <img
        src={coverUrl}
        alt={title}
        className="w-full h-full object-cover rounded-md"
      />

      {/* Hover Overlay (was bg-black/40 → now bg-surface-overlay) */}
      <div
        className="
          absolute inset-0 
          bg-surface-overlay 
          opacity-0 
          group-hover:opacity-100 
          transition
        "
      ></div>

      {/* Play button */}
      <div
        className="
          absolute inset-0 
          flex items-center justify-center 
          opacity-0 group-hover:opacity-100 
          transition
        "
      >
        <div
          className="
            bg-surface-overlay 
            text-neutral-100 
            rounded-full 
            p-2 
            shadow-md 
            text-xs
          "
        >
          ▶
        </div>
      </div>

      {/* Title */}
      <p className="mt-1 text-xs font-medium text-text-primary truncate">
        {title}
      </p>
    </div>
  );
};

export default PlaylistCard;