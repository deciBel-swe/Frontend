import React from "react";
import { useNotifications } from "@/components/notifications/useNotifications";
import { NotificationItem } from "./NotificationItem";

export const NotificationsList = () => {
  const { notifications } = useNotifications();

  return (
    <ul className="flex flex-col">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </ul>
  );
};