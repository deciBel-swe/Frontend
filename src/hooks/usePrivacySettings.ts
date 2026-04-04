import { useCallback, useEffect, useState } from 'react';
import { privacyService, userService } from '@/services';
import type { PrivacySettings, UpdatePrivacySettingsDto } from '@/types/privacy';
import { error } from 'console';

export function usePrivacySettings() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchSettings = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const me = await userService.getUserMe();
        if (!isCancelled) {
          setSettings(me.privacySettings);
        }
      } catch (error) {
        throw error;
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

  const updateSetting = useCallback(
    async (data: UpdatePrivacySettingsDto) => {
      setIsUpdating(true);
      setIsError(false);

      const previous = settings;
      setSettings(data);

      try {
        const updated = await privacyService.updatePrivacySettings(data);
        setSettings(updated);
      } catch {
        setSettings(previous ?? null);
        setIsError(true);
        throw new Error('Failed to update privacy settings');
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
    updateSetting,
  };
}
