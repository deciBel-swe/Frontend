'use client';

import { useEffect, useState } from 'react';

import { Toggle } from '@/components/buttons/Toggle';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import type { NotificationSettingsDTO } from '@/types/notification';

type Status = 'idle' | 'saving' | 'saved' | 'error';

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-5">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-text-primary">{label}</div>
        <div className="mt-1 text-sm leading-snug text-text-secondary">
          {description}
        </div>
      </div>
      <div className="shrink-0 pt-0.5">
        <Toggle
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          label={label}
        />
      </div>
    </div>
  );
}

export default function Page() {
  const { settings, isLoading, isError, isUpdating, updateSettings } =
    useNotificationSettings();

  const [localSettings, setLocalSettings] =
    useState<NotificationSettingsDTO>(settings);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (status === 'idle') {
      return;
    }

    const timeoutId = setTimeout(() => setStatus('idle'), 3000);
    return () => clearTimeout(timeoutId);
  }, [status]);

  const handleToggle = async (
    key: keyof NotificationSettingsDTO,
    value: boolean
  ) => {
    const nextSettings = {
      ...localSettings,
      [key]: value,
    };

    setLocalSettings(nextSettings);
    setStatus('saving');

    try {
      await updateSettings(nextSettings);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-20 rounded-xl bg-surface-raised animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-status-error">
        Unable to load notification settings.
      </p>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-md font-extrabold text-text-primary">
          Notification settings
        </h2>
        {status !== 'idle' && (
          <span className="text-xs text-text-muted">
            {status === 'saving' && 'Saving changes...'}
            {status === 'saved' && 'Changes saved'}
            {status === 'error' && 'Failed to save'}
          </span>
        )}
      </div>

      <div className="mt-4 divide-y divide-border-default">
        <ToggleRow
          label="Followers"
          description="Receive a notification when someone starts following you."
          checked={localSettings.notifyOnFollow}
          disabled={isUpdating}
          onChange={(checked) => void handleToggle('notifyOnFollow', checked)}
        />
        <ToggleRow
          label="Likes"
          description="Receive a notification when someone likes one of your tracks or playlists."
          checked={localSettings.notifyOnLike}
          disabled={isUpdating}
          onChange={(checked) => void handleToggle('notifyOnLike', checked)}
        />
        <ToggleRow
          label="Reposts"
          description="Receive a notification when someone reposts one of your tracks or playlists."
          checked={localSettings.notifyOnRepost}
          disabled={isUpdating}
          onChange={(checked) => void handleToggle('notifyOnRepost', checked)}
        />
        <ToggleRow
          label="Comments and replies"
          description="Receive notifications for new comments and replies on your tracks."
          checked={localSettings.notifyOnComment}
          disabled={isUpdating}
          onChange={(checked) => void handleToggle('notifyOnComment', checked)}
        />
        <ToggleRow
          label="Direct messages"
          description="Receive a notification for every new direct message."
          checked={localSettings.notifyOnDM}
          disabled={isUpdating}
          onChange={(checked) => void handleToggle('notifyOnDM', checked)}
        />
      </div>
    </div>
  );
}
