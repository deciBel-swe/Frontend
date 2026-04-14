import { notificationsMock } from "@/components/notifications/notificationsMock";

export const useNotifications = () => {
  // stateless mock hook (ready for API swap)
  return {
    notifications: notificationsMock,
  };
};