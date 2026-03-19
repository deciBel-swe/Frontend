'use client';

import React from 'react';
import { useEffect, useState } from "react";
import { HoverPlayImage } from '@/components/sidebar/HoverPlayImage';
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
        m-2
      "
    >
      {/* Image with hover play */}
      <HoverPlayImage
        image={coverUrl}
        //size={160} // controls scaling (adjust if needed)
        alt={title}
      />

      {/* Title */}
      <p className="mt-1 text-xs font-medium text-text-primary truncate">
        {title}
      </p>
    </div>
  );
};

export default PlaylistCard;