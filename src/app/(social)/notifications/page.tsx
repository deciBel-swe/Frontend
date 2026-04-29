'use client';

import { useState } from 'react';

import { NotificationsList } from '@/components/notifications/NotificationsList';
import type { Notification } from '@/components/notifications/types/notification';
import { Button } from '@/components/buttons/Button';
import { useNotifications } from '@/hooks/useNotifications';

const FILTERS: Array<{
  value: 'all' | Notification['type'];
  label: string;
}> = [
  { value: 'all', label: 'All notifications' },
  { value: 'follow', label: 'Follows' },
  { value: 'like', label: 'Likes' },
  { value: 'repost', label: 'Reposts' },
  { value: 'comment', label: 'Comments' },
  { value: 'reply', label: 'Replies' },
  { value: 'dm', label: 'Messages' },
];

export default function Page() {
  const [selectedFilter, setSelectedFilter] =
    useState<'all' | Notification['type']>('all');
  const { unreadCount, markAllAsRead } = useNotifications();

  return (
    <div className="w-full max-w-6xl bg-bg-base text-text-primary flex justify-center">
      <div className="w-full max-w-5xl px-6 py-6">
        <div className="rounded-xl border border-border-default bg-surface-default p-4">
          <div className="mb-4 flex flex-col gap-3 border-b border-border-default pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold text-text-primary">
                  Notifications
                </h1>
                <p className="text-sm text-text-muted">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                    : 'You are all caught up.'}
                </p>
              </div>
              <Button
                variant="secondary_inverse"
                size="sm"
                onClick={() => void markAllAsRead()}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <Button
                  key={filter.value}
                  size="sm"
                  variant={
                    selectedFilter === filter.value
                      ? 'secondary'
                      : 'secondary_inverse'
                  }
                  onClick={() => setSelectedFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          <NotificationsList filter={selectedFilter} />
        </div>
      </div>
    </div>
  );
}
