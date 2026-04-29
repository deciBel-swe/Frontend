import { useCallback, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { notificationService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { NotificationSettingsDTO } from '@/types/notification';

/**
 * useUpdateNotificationSettings Hook
 *
 * Mutation hook for updating user's notification preferences.
 *
 * Features:
 * - Updates settings on backend via REST API
 * - Syncs updated settings to Firestore
 * - Loading, error, and updated settings state tracking
 * - Throws error on failure for error handling in UI
 *
 * After successful update:
 * - Backend notification creation respects new preferences
 * - Firestore settings are synced for offline access
 * - All real-time notification listeners will respect the new settings
 *
 * @returns Object with updateNotificationSettings function, updated settings, and loading/error states
 *
 * @example
 * const { updateNotificationSettings, updatedSettings, isLoading, isError, error } =
 *   useUpdateNotificationSettings();
 *
 * const handleSave = async (newSettings: NotificationSettingsDTO) => {
 *   try {
 *     const result = await updateNotificationSettings(newSettings);
 *     console.log('Settings updated:', result);
 *   } catch (err) {
 *     console.error('Failed to update:', error?.message);
 *   }
 * };
 *
 * return (
 *   <NotificationSettingsForm
 *     initialSettings={updatedSettings}
 *     onSave={handleSave}
 *     disabled={isLoading}
 *   />
 * );
 */
export function useUpdateNotificationSettings() {
  const [updatedSettings, setUpdatedSettings] =
    useState<NotificationSettingsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ApiErrorDTO | null>(null);

  const updateNotificationSettings = useCallback(
    async (payload: NotificationSettingsDTO) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const result =
          await notificationService.updateNotificationSettings(payload);
        setUpdatedSettings(result);
        return result;
      } catch (caughtError) {
        const normalizedError = normalizeApiError(caughtError);
        setIsError(true);
        setError(normalizedError);
        throw normalizedError;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    updatedSettings,
    updateNotificationSettings,
    isLoading,
    isError,
    error,
  };
}
