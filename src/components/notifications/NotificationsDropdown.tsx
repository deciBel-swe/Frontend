'use client';

import Link from 'next/link';
// import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import DropdownPopup from '@/components/social/DropdownPopup';
import { NotificationsList } from './NotificationsList';
// import { notificationsMock } from './notificationsMock';

interface NotificationsDropdownProps {
  onClose?: () => void;
}

/**
 * NotificationsDropdown — renders inside the TopNavBar when the notification icon is clicked.
 *
 * Shows:
 *  - Header: <h1>Notifications</h1>
 *  - NotificationList (top 3 previews)
 *  - "View all notifications" link
 *
 * @example
 * {notificationsOpen && (
 *   <NotificationsDropdown items={notificationItems.slice(0, 3)} onClose={closeNotifications} />
 * )}
 */
export default function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
//   const router = useRouter();

//   const handleSelect = (conversationId: string) => {
//     onClose?.();
//     router.push(`${ROUTES.NOTIFICATIONS}/${conversationId}`);
//   };

  return (
    <DropdownPopup
      header={<div className="text-l text-base font-bold text-text-primary">Notifications</div>}
      footer={
        <Link
          href={ROUTES.NOTIFICATIONS}
          onClick={onClose}
          className="block text-center text-xs font-bold text-text-primary hover:text-text-secondary py-3 transition-colors duration-150 no-underline"
        >
          View all notifications
        </Link>
      }
    >
      <NotificationsList
        // onSelect={handleSelect}
      />
      
    </DropdownPopup>
  );
}