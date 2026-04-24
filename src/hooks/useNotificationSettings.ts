'use client';

import { useCallback, useEffect, useState } from 'react';

import type { NotificationSettingsDTO } from '@/types/notification';
import { notificationService } from '@/services';

const DEFAULT_SETTINGS: NotificationSettingsDTO = {
  notifyOnFollow: true,
  notifyOnLike: true,
  notifyOnRepost: true,
  notifyOnComment: true,
  notifyOnDM: true,
};

export function useNotificationSettings() {
  const [settings, setSettings] =
    useState<NotificationSettingsDTO>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchSettings = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await notificationService.getNotificationSettings();

        if (!isCancelled) {
          setSettings(response);
        }
      } catch {
        if (!isCancelled) {
          setIsError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchSettings();

    return () => {
      isCancelled = true;
    };
  }, []);

  const updateSettings = useCallback(
    async (nextSettings: NotificationSettingsDTO) => {
      const previousSettings = settings;
      setSettings(nextSettings);
      setIsUpdating(true);
      setIsError(false);

      try {
        const response =
          await notificationService.updateNotificationSettings(nextSettings);
        setSettings(response);
      } catch {
        setSettings(previousSettings);
        setIsError(true);
        throw new Error('Failed to update notification settings');
      } finally {
        setIsUpdating(false);
      }
    },
    [settings]
  );

  return {
    settings,
    isLoading,
    isError,
    isUpdating,
    updateSettings,
  };
}
