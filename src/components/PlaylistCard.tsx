'use client';

import Image from "next/image";
import React from "react";

interface PlaylistCardProps {
  title: string;
  coverUrl: string;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ title, coverUrl }) => {
  return (
    <div className="w-28 sm:w-32">
      {/* Image wrapper */}
      <div className="group relative cursor-pointer h-28 sm:h-32">
        <Image
          src={coverUrl}
          alt={title}
          fill
          className="rounded-md object-cover"
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white text-black rounded-full p-2 shadow-lg">
            ▶
          </div>
        </div>
      </div>

      {/* Title (now visible) */}
      <p className="text-sm mt-2 truncate">{title}</p>
    </div>
  );
};

export default PlaylistCard;