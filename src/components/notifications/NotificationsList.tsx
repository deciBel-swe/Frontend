'use client';

import React, { useMemo } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import ScrollableArea from '@/components/scroll/ScrollableArea';
import type { Notification } from "./types/notification";

interface NotificationsListProps {
  maxItems?: number;
  hoverable?: boolean;
  filter?: 'all' | Notification['type'];
}

export const NotificationsList = ({
  maxItems,
  hoverable,
  filter = 'all',
}: NotificationsListProps) => {
  const { notifications, isLoading } = useNotifications();

  const filteredNotifications = useMemo(
    () =>
      filter === 'all'
        ? notifications
        : notifications.filter((notification) => notification.type === filter),
    [filter, notifications]
  );

  const displayedNotifications = maxItems
    ? filteredNotifications.slice(0, maxItems)
    : filteredNotifications;

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
