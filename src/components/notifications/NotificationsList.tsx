'use client';

import React from "react";
import { useNotifications } from "@/components/notifications/useNotifications";
import { NotificationItem } from "./NotificationItem";
import ScrollableArea from '@/components/scroll/ScrollableArea';

interface NotificationsListProps {
  maxItems?: number;
  hoverable?: boolean;
}

export const NotificationsList = ({ maxItems, hoverable }: NotificationsListProps) => {
  const { notifications } = useNotifications();

  const displayedNotifications = maxItems 
    ? notifications.slice(0, maxItems) 
    : notifications;

    if (displayedNotifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-text-muted text-sm">
        No messages yet
      </div>
    );
  }

  return (
    // <ul className="flex flex-col">
        <ScrollableArea
          className="flex-1 px-4 py-4"
          maxHeight="calc(100vh - 220px)"
        >
      {displayedNotifications.map((n) => (
        <NotificationItem 
          key={n.id} 
          notification={n} 
          hoverable= {hoverable}
        />
      ))}
      </ScrollableArea>
    /* </ul> */
  );
};