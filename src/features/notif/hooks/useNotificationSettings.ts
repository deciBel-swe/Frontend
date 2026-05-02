import { useCallback, useEffect, useState } from 'react';

import { normalizeApiError } from '@/hooks/useAPI';
import { notificationService } from '@/services';
import type { ApiErrorDTO } from '@/types';
import type { NotificationSettingsDTO } from '@/types/notification';

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
