'use client';

import React, { useMemo } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import ScrollableArea from '@/components/scroll/ScrollableArea';
import type { Notification } from "./types/notification";

interface NotificationsListProps {
  maxItems?: number;
  hoverable?: boolean;
}

export const NotificationsList = ({ maxItems, hoverable }: NotificationsListProps) => {
  const { notifications: dtoNotifications, isLoading } = useNotifications();

  const notifications: Notification[] = useMemo(() => {
    return dtoNotifications.map((dto) => ({
      id: dto.id,
      type: dto.type.toLowerCase() as any, // 'FOLLOW' -> 'follow', etc.
      actor: {
        id: String(dto.user.id),
        username: dto.user.username,
        displayName: dto.user.displayName || dto.user.username,
        avatarUrl: dto.user.avatarUrl || "",
      },
      targetTitle: (dto as any).targetTitle, // Assuming these might exist in Firestore doc
      targetUrl: (dto as any).targetUrl,
      createdAt: dto.createdAt,
    }));
  }, [dtoNotifications]);

  const displayedNotifications = maxItems 
    ? notifications.slice(0, maxItems) 
    : notifications;

  if (isLoading) {
    return <div className="py-12 text-center text-text-muted">Loading notifications...</div>;
  }

  if (displayedNotifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-text-muted text-sm">
        No notifications yet
      </div>
    );
  }

  return (
    <ScrollableArea
      className="flex-1 px-4 py-4"
      maxHeight="calc(100vh - 220px)"
    >
      {displayedNotifications.map((n) => (
        <NotificationItem 
          key={n.id} 
          notification={n} 
          hoverable={hoverable}
        />
      ))}
    </ScrollableArea>
  );
};