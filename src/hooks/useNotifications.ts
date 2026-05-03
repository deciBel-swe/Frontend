'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import type { NotificationDTO } from '@/types/notification';
import { notificationService, playlistService, trackService } from '@/services';
import { buildPlaylistHref, buildProfileHref, buildTrackHref } from '@/utils/socialRoutes';
import type { Notification } from '@/components/notifications/types/notification';

type NotificationTargetCache = Record<
  string,
  {
    targetUrl: string;
    targetTitle?: string;
  }
>;

export function useNotifications() {
  const { user } = useAuth();
  const [rawNotifications, setRawNotifications] = useState<NotificationDTO[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [targetCache, setTargetCache] = useState<NotificationTargetCache>({});
  const pendingKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) {
      setRawNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      (data) => {
        setRawNotifications(data);
        setIsLoading(false);
        void notificationService
          .getUnreadCount()
          .then((response) => {
            setUnreadCount(response.unreadCount);
          })
          .catch(() => undefined);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  useEffect(() => {
    let isCancelled = false;

    const hydrateTargets = async () => {
      const notificationsToHydrate = rawNotifications.filter((notification) => {
        if (notification.targetUrl) {
          return false;
        }

        if (notification.type === 'FOLLOW' || notification.type === 'DM') {
          return false;
        }

        const cacheKey = `${notification.resource.resourceType}:${notification.resource.resourceId}`;
        return (
          !targetCache[cacheKey] && !pendingKeysRef.current.has(cacheKey)
        );
      });

      if (notificationsToHydrate.length === 0) {
        return;
      }

      notificationsToHydrate.forEach((notification) => {
        pendingKeysRef.current.add(
          `${notification.resource.resourceType}:${notification.resource.resourceId}`
        );
      });

      const hydratedTargets = await Promise.all(
        notificationsToHydrate.map(async (notification) => {
          const cacheKey = `${notification.resource.resourceType}:${notification.resource.resourceId}`;

          try {
            if (notification.resource.resourceType === 'TRACK') {
              const track = await trackService.getTrackMetadata(
                notification.resource.resourceId
              );
              return {
                cacheKey,
                targetUrl: buildTrackHref(track),
                targetTitle: track.title,
              };
            }

            if (notification.resource.resourceType === 'PLAYLIST') {
              const playlist = await playlistService.getPlaylist(
                notification.resource.resourceId
              );
              return {
                cacheKey,
                targetUrl: buildPlaylistHref(playlist),
                targetTitle: playlist.title,
              };
            }

            return {
              cacheKey,
              targetUrl: buildProfileHref(notification.user.username),
              targetTitle: notification.user.displayName || notification.user.username,
            };
          } finally {
            pendingKeysRef.current.delete(cacheKey);
          }
        })
      );

      if (!isCancelled) {
        setTargetCache((previous) => {
          const next = { ...previous };
          hydratedTargets.forEach((entry) => {
            next[entry.cacheKey] = {
              targetUrl: entry.targetUrl,
              targetTitle: entry.targetTitle,
            };
          });
          return next;
        });
      }
    };

    void hydrateTargets();

    return () => {
      isCancelled = true;
    };
  }, [rawNotifications, targetCache]);

  const notifications = useMemo<Notification[]>(
    () =>
      rawNotifications.map((dto) => {
        const cacheKey = `${dto.resource.resourceType}:${dto.resource.resourceId}`;
        const cachedTarget = targetCache[cacheKey];
        const followTarget = buildProfileHref(dto.user.username);
        const dmTarget = dto.conversationId
          ? `/messages?conversation=${dto.conversationId}`
          : '/messages';

        return {
          id: dto.id,
          type: dto.type.toLowerCase() as Notification['type'],
          actor: {
            id: String(dto.user.id),
            username: dto.user.username,
            displayName: dto.user.displayName || dto.user.username,
            avatarUrl: dto.user.avatarUrl || '',
            isFollowing: dto.user.isFollowing ?? false,
            followerCount: dto.user.followerCount ?? 0,
          },
          resourceType: dto.resource.resourceType,
          resourceId: dto.resource.resourceId,
          isRead: dto.isRead,
          targetTitle:
            dto.targetTitle || cachedTarget?.targetTitle || undefined,
          targetUrl:
            dto.targetUrl ||
            (dto.type === 'FOLLOW'
              ? followTarget
              : dto.type === 'DM'
              ? dmTarget
              : cachedTarget?.targetUrl || followTarget),
          createdAt: dto.createdAt,
          conversationId: dto.conversationId,
        };
      }),
    [rawNotifications, targetCache]
  );

  const markAllAsRead = async () => {
    if (!user?.id) return;
    setRawNotifications((previous) =>
      previous.map((notification) => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
    await notificationService.markAllAsRead(user.id);
  };

  return { notifications, unreadCount, isLoading, error, markAllAsRead };
}
