import React from "react";
import { Notification } from "@/components/notifications/types/notification";
import { AvatarImage } from "@/components/notifications/AvatarImage";
import FollowButton from '@/components/buttons/FollowButton';
import Link from "next/link";

interface Props {
  notification: Notification;
}

export const NotificationItem: React.FC<Props> = ({ notification }) => {
  return (
    <li className="flex items-start justify-between gap-4 py-4 border-b border-border-default">
      
      {/* Left avatar */}
      <div className="flex items-center gap-3 min-w-[220px]">

  <Link href={`/user/${notification.actor.id}`}>
    <AvatarImage
      src={notification.actor.avatarUrl}
      alt={notification.actor.username}
    />
  </Link>

<Link
  href={notification.targetUrl ?? "#"}
  className="text-sm block"
>
  <p className="text-text-primary">
    <span className="font-semibold">
      {notification.actor.username}
    </span>{" "}
    {notification.type === "like" && "liked your playlist"}
    {notification.type === "repost" && "reposted your playlist"}
    {notification.type === "follow" && "started following you"}{" "}
    {notification.targetTitle && (
      <span className="text-text-secondary">
        "{notification.targetTitle}"
      </span>
    )}
  </p>

  <p className="text-xs text-text-muted mt-1">
    {notification.createdAt}
  </p>
</Link>
      </div>

      {/* Actions (right side like in image) */}
      {/* <button className="px-3 py-1 text-xs bg-surface-default border border-border-default rounded-md hover:bg-surface-raised">
        Following
      </button> */}
      {/* TODO: make the follow appears only when message.type == "follow" */}
      {notification.type === "follow" && <FollowButton defaultFollowing={false}
       />}
       {/* TODO: add blockbtn */}
    </li>
  );
};