'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Import Link
import { UserPlus, Users, Music2 } from 'lucide-react';
import Button from '../buttons/Button';

interface UserMiniProfileProps {
  avatarUrl?: string;
  displayName: string;
  followers?: number;
  tracksCount?: number;
  username: string; // Added username for the links
}

export const UserMiniProfile: React.FC<UserMiniProfileProps> = ({
  avatarUrl,
  displayName,
  followers = 0,
  tracksCount = 0,
  username,
}) => {
  return (
    <div className="w-[120px] flex flex-col items-center shrink-0">
      {/* 1. The Avatar Circle */}
      <Link href={`/${username}`} className="relative w-[120px] h-[120px] rounded-full overflow-hidden bg-surface-raised border border-border/40 mb-4 shadow-sm hover:opacity-90 transition-opacity">
        {avatarUrl && (
          <Image 
            src={avatarUrl} 
            alt={displayName} 
            fill 
            className="object-cover" 
          />
        )}
      </Link>

      {/* 2. Display Name */}
      <Link href={`/${username}`} className="text-sm font-extrabold text-text-primary mb-1 truncate w-full text-center hover:text-interactive-hover">
        {displayName}
      </Link>

      {/* 3. Stats with Tooltip/Span effect on hover */}
      <div className="flex gap-3 text-[11px] text-text-secondary mb-3 select-none"> {/* Reduced mb-5 to mb-3 to make button closer */}
        
        {/* Followers Link & Tooltip */}
        <Link 
        title='followers'
          href={`/${username}/followers`} 
          className="group relative flex items-center gap-1 font-medium hover:text-interactive-hover transition-colors"
        >
          <Users size={12} className="opacity-70" /> 
          {followers}
          {/* The "Span Div" that shows on hover */}
        </Link>

        {/* Tracks Link & Tooltip */}
        <Link 
        title='tracks'
          href={`/${username}/tracks`} 
          className="group relative flex items-center gap-1 font-medium hover:text-interactive-hover transition-colors"
        >
          <Music2 size={12} className="opacity-70" /> 
          {tracksCount}
        </Link>
      </div>

      {/* 4. The Follow Button (Now closer to stats) */}
      <Button 
        variant="secondary" 
        className="flex items-center justify-center gap-2 px-0 w-full py-1.5 text-xs font-bold"
      >
        <UserPlus size={14} />
        Follow
      </Button>
    </div>
  );
};