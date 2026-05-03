import { useCallback, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { notificationService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { NotificationSettingsDTO } from '@/types/notification';

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
