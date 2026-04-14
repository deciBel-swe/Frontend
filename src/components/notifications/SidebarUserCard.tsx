'use client';

import React from "react";
import { Users, BarChart3 } from "lucide-react";
import AvatarImage from "@/components/avatars/AvatarImage";
import Link from "next/link";
import FollowButton from '@/components/buttons/FollowButton';

interface SidebarUserCardProps {
  username: string;
  avatarUrl: string;
  followersCount: number;
  statsCount: number;
  // isFollowing?: boolean;
  // onFollowToggle?: () => void;
}

export const SidebarUserCard: React.FC<SidebarUserCardProps> = ({
  username,
  avatarUrl,
  followersCount,
  statsCount,
  // isFollowing = true,
  // onFollowToggle,
}) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-default border border-border-default">
      
      {/* LEFT: avatar + info */}
      <div className="flex items-center gap-3">
        
        {/* Avatar */}
<AvatarImage
  src={avatarUrl}
  alt={username}
  size={40}
  shape="circle"
/>

        {/* Name + stats */}
        <div className="flex flex-col">
          <Link href="#" className="text-sm font-extrabold text-text-primary hover:text-interactive-hover">
            {username}
          </Link>

          <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
            
            {/* followers */}
            <Link href="#" className="hover:text-interactive-hover">
            <div className="flex items-center gap-1">
              <Users size={10} />
              <span>{followersCount}</span>
            </div>
            </Link>

            {/* stats */}
            <Link href="#" className="hover:text-interactive-hover">
              <div className="flex items-center gap-1">
                <BarChart3 size={10} />
                <span>{statsCount}</span>
              </div>
            </Link>

          </div>
        </div>
      </div>

      {/* RIGHT: button */}
      {/* <button
        onClick={onFollowToggle}
        className={`
          px-3 py-1.5 text-xs rounded-md font-medium transition
          ${isFollowing
            ? "bg-surface-raised text-text-primary hover:bg-surface-hover"
            : "bg-interactive-default hover:bg-interactive-hover"}
        `}
      >
        {isFollowing ? "Following" : "Follow"}
      </button> */}
            <FollowButton defaultFollowing={false} size="sm"/>
      {/* TODO: add block btn */}
    </div>
  );
};