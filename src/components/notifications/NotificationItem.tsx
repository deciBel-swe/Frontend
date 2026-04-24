'use client';

import React from "react";
import Image from 'next/image';
import Link from "next/link";
import { Notification } from "@/components/notifications/types/notification";
import FollowButton from '@/components/buttons/FollowButton';
import TimeAgo from '@/features/tracks/components/TimeAgo';
import { useUserCardHook } from '@/hooks/useUserCardHook';
import { buildProfileHref } from '@/utils/socialRoutes';

interface Props {
  notification: Notification;
  hoverable?: boolean;
}

function getInitials(displayName: string): string {
  if (!displayName) return "";
  return displayName
    .split(/[.\s_-]+/)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export const NotificationItem: React.FC<Props> = ({ notification, hoverable = false }) => {
  const initials = getInitials(notification.actor.username);
  const actorProfileHref = buildProfileHref(notification.actor.username);
  const {
    user: actor,
    isFollowPending,
    handleFollowToggle,
  } = useUserCardHook({
    user: {
      id: notification.actor.id,
      username: notification.actor.username,
      displayName: notification.actor.displayName,
      avatarSrc: notification.actor.avatarUrl,
      followerCount: notification.actor.followerCount ?? 0,
      isFollowing: notification.actor.isFollowing ?? false,
    },
  });
  
  const knownDefaultAvatar = "https://a1.sndcdn.com/images/default_avatar_large.png";
  const shouldShowImage = 
    notification.actor.avatarUrl && 
    notification.actor.avatarUrl !== knownDefaultAvatar;

  const actionLabel =
    notification.type === "like"
      ? "liked your track"
      : notification.type === "repost"
      ? "reposted your track"
      : notification.type === "follow"
      ? "started following you"
      : notification.type === "comment"
      ? "commented on your track"
      : notification.type === "reply"
      ? "replied to your comment"
      : "sent you a message";

  return (
    <li className={`
      flex items-start justify-between gap-3 py-4 border-b border-border-default transition-colors px-2
      ${!notification.isRead ? "bg-surface-raised/40" : ""}
      ${hoverable ? "hover:bg-interactive-default cursor-pointer" : ""} 
    `}>
      <div className="flex gap-3 items-start overflow-hidden w-full">
        
        {/* AVATAR COLUMN */}
        <div className="shrink-0 mt-1">
          <Link href={actorProfileHref}>
            {shouldShowImage ? (
              <Image
                src={notification.actor.avatarUrl}
                alt={notification.actor.username}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#A3A3A3] flex items-center justify-center">
                <span className="text-sm font-medium text-[#1A1A1A] tracking-tight">
                  {initials}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* CONTENT COLUMN - Link restored here */}
        <Link 
          href={notification.targetUrl ?? "#"} 
          className="flex flex-col gap-0.5 flex-1 min-w-0"
        >
          <div className="text-sm leading-tight">
            <p className="text-text-primary">
              <span className="font-bold hover:underline">
                {actor.displayName || actor.username}
              </span>{" "}
              <span className="text-text-secondary">
                {actionLabel}
              </span>
              {notification.targetTitle && (
                <span className="text-text-primary font-medium">
                  {" "}&quot;{notification.targetTitle}&quot;
                </span>
              )}
            </p>
          </div>
          
          <TimeAgo date={notification.createdAt} className="text-[12px] text-text-muted" />
        </Link>
      </div>

      {/* ACTION COLUMN */}
      <div className="shrink-0 pt-1">
        {notification.type === "follow" && (
          <FollowButton
            size="sm"
            isFollowing={actor.isFollowing}
            onToggle={handleFollowToggle}
            disabled={isFollowPending}
          />
        )}
      </div>
    </li>
  );
};
