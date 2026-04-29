import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { notificationService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { NotificationSettingsDTO } from '@/types/notification';

/**
 * useNotificationSettings Hook
 *
 * Fetches and manages user's notification preferences.
 *
 * Features:
 * - Fetches settings from backend on mount
 * - Syncs settings to Firestore for offline access
 * - Can be manually refetched via getNotificationSettings()
 * - Complete lifecycle management (loading, error states)
 *
 * Settings structure:
 * - notifyOnFollow: boolean
 * - notifyOnLike: boolean
 * - notifyOnRepost: boolean
 * - notifyOnComment: boolean
 * - notifyOnDM: boolean
 *
 * @returns Object with settings, getNotificationSettings method, and loading/error states
 *
 * @example
 * const { settings, getNotificationSettings, isLoading, error } = useNotificationSettings();
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error?.message} />;
 *
 * return (
 *   <NotificationPreferences
 *     settings={settings}
 *     onRefresh={getNotificationSettings}
 *   />
 * );
 */
export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsDTO | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const getNotificationSettings = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await notificationService.getNotificationSettings();
      setSettings(result);
      return result;
    } catch (caughtError) {
      const normalizedError = normalizeApiError(caughtError);
      setIsError(true);
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void getNotificationSettings();
  }, [getNotificationSettings]);

  return {
    settings,
    getNotificationSettings,
    isLoading,
    isError,
    error,
  };
}
