import { useCallback, useEffect, useState } from 'react';
import { privacyService } from '@/services';
import type { UpdatePrivacySettingsDto } from '@/types/privacy';

export function usePrivacySettings() {
  const [settings, setSettings] = useState<Awaited<
    ReturnType<typeof privacyService.getPrivacySettings>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchSettings = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const data = await privacyService.getPrivacySettings();
        if (!isCancelled) {
          setSettings(data);
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

  const updateSetting = useCallback(
    async (data: UpdatePrivacySettingsDto) => {
      setIsUpdating(true);
      setIsError(false);

      const previous = settings;
      if (previous) {
        setSettings({
          ...previous,
          ...data,
        });
      }

      try {
        const updated = await privacyService.updatePrivacySettings(data);
        setSettings(updated);
      } catch {
        if (previous) {
          setSettings(previous);
        }
        setIsError(true);
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
