'use client';

import { useEffect, useState } from 'react';
import { Toggle } from '@/components/buttons/Toggle';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';

type Status = 'idle' | 'saving' | 'saved' | 'error';



// ─── Toggle row ───────────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (val: boolean) => void;
=======
import { usePrivacySettings } from '@/hooks/usePrivacySettings';

export default function Page() {
  const {
    settings,
    isLoading,
    isError,
    isUpdating,
    updateSetting,
  } = usePrivacySettings();

  // local copies of the two fields so we can optimistically update the UI
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // simple toast message state; disappears after a short timeout
  const [toast, setToast] = useState<string | null>(null);

  // mirror server data into component state whenever it arrives
  useEffect(() => {
    if (settings) {
      setIsPrivate(settings.isPrivate);
      setShowHistory(settings.showHistory);
    }
  }, [settings]);

  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handlePrivacyToggle = async (nextPrivate: boolean) => {
    // The privacy flag is inverted in the UI; `nextPrivate` is true when
    // the user is opting out of receiving messages from people they don't
    // follow. We ask for confirmation because this change can impact how
    // others can contact you.
    if (nextPrivate) {
      const ok = window.confirm(
        'Disabling messages from anyone will prevent users you do not follow from contacting you. Existing conversations are unaffected. Continue?'
      );
      if (!ok) {
        // user cancelled; revert checkbox state
        setIsPrivate(settings?.isPrivate ?? false);
        return;
      }
    }

    setIsPrivate(nextPrivate);
    try {
      await updateSetting({ isPrivate: nextPrivate });
      notify('Privacy updated');
    } catch {
      notify('Failed to save privacy setting');
      setIsPrivate(settings?.isPrivate ?? false);
    }
  };

  const handleShowHistoryToggle = async (next: boolean) => {
    setShowHistory(next);
    try {
      await updateSetting({ showHistory: next });
      notify('Setting updated');
    } catch {
      notify('Failed to save setting');
      setShowHistory(settings?.showHistory ?? false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Privacy Settings</h1>

      {isError && (
        <p className="text-red-600">Unable to load your privacy settings.</p>
      )}

      {toast && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded">
          {toast}
        </div>
      )}

      <div className="space-y-8">
        {/* first toggle corresponds to `isPrivate` */}
        <div>
          <label className="flex items-center justify-between w-full">
            <div className="flex flex-col">
              <span className="font-medium">
                Receive messages from anyone
              </span>
              <span className="text-sm text-gray-600">
                For your safety, we recommend only allowing messages from
                people you follow. Turning this on will allow anyone to send you
                messages.
              </span>
            </div>
            <input
              type="checkbox"
              checked={!isPrivate}
              disabled={isLoading || isUpdating}
              onChange={(e) => handlePrivacyToggle(!e.target.checked)}
            />
          </label>
        </div>

        {/* second toggle corresponds to `showHistory` */}
        <div>
          <label className="flex items-center justify-between w-full">
            <div className="flex flex-col">
              <span className="font-medium">
                Show my activities in social discovery playlists and modules
              </span>
              <span className="text-sm text-gray-600">
                Your Likes, Reactions and other engagement may be shown to other
                users in discovery features such as Liked By playlists or
                update feeds. Turning this off won’t hide your Likes on your
                profile or tracks.
              </span>
            </div>
            <input
              type="checkbox"
              checked={showHistory}
              disabled={isLoading || isUpdating}
              onChange={(e) => handleShowHistoryToggle(e.target.checked)}
            />
          </label>
        </div>
      </div>
    </div>
  );
>>>>>>> dev
}

function ToggleRow({ label, description, checked, disabled, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 sm:gap-8 py-5">
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="text-sm font-semibold text-text-primary">{label}</span>
        <span className="text-sm text-text-secondary leading-snug">{description}</span>
      </div>
      <div className="shrink-0 pt-0.5">
        <Toggle checked={checked} disabled={disabled} onChange={onChange} label={label} />
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div>
      <div className="h-4 w-32 bg-surface-raised rounded mb-6 animate-pulse" />
      {[1, 2].map((i) => (
        <div key={i} className="flex items-start justify-between gap-4 sm:gap-8 py-5 border-b border-border-default">
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-3.5 w-48 bg-surface-raised rounded animate-pulse" />
            <div className="h-3 w-full max-w-lg bg-surface-default rounded animate-pulse" />
          </div>
          <div className="w-[46px] h-[26px] rounded-full bg-surface-raised animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
  const { settings, isLoading, isError, isUpdating, updateSetting } = usePrivacySettings();

  const [isPrivate, setIsPrivate] = useState(() => settings?.isPrivate ?? false);
  const [showHistory, setShowHistory] = useState(() => settings?.showHistory ?? false);
  const [status, setStatus]           = useState<Status>('idle');

  // Mirror server data into local state when settings load
  useEffect(() => {
    if (settings) {
      setIsPrivate(settings.isPrivate);
      setShowHistory(settings.showHistory);
    }
  }, [settings]);

  // Auto-clear status after 3s — useEffect cleanup prevents
  useEffect(() => {
    if (status === 'idle') return;
    const timer = setTimeout(() => setStatus('idle'), 3000);
    return () => clearTimeout(timer);
  }, [status]);

  const flash = (result: 'saved' | 'error') => {
    setStatus(result);
  };

  const handlePrivacyToggle = async (next: boolean) => {
    if (next) {
      const ok = window.confirm(
        'Disabling messages from anyone will prevent users you do not follow from contacting you. Existing conversations are unaffected. Continue?'
      );
      if (!ok) { setIsPrivate(settings?.isPrivate ?? false); return; }
    }
    setIsPrivate(next);
    setStatus('saving');
    try {
      await updateSetting({ isPrivate: next });
      flash('saved');
    } catch {
      flash('error');
      setIsPrivate(settings?.isPrivate ?? false);
    }
  };

  const handleShowHistoryToggle = async (next: boolean) => {
    setShowHistory(next);
    setStatus('saving');
    try {
      await updateSetting({ showHistory: next });
      flash('saved');
    } catch {
      flash('error');
      setShowHistory(settings?.showHistory ?? false);
    }
  };

  if (isLoading) return <Skeleton />;
  if (isError) return <p className="text-sm text-status-error">Unable to load your privacy settings.</p>;

  return (
    <div className="w-full max-w-3xl">

      {/* Heading row */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-md font-extrabold text-text-primary">Privacy settings</h2>

        {/* Single shared status — right-aligned above toggles */}
        <div className="flex justify-end">
          {status !== 'idle' && (
            <span className="text-xs text-text-muted whitespace-nowrap">
              {status === 'saving' && 'Saving changes…'}
              {status === 'saved'  && '✓ Changes saved'}
              {status === 'error'  && 'Failed to save'}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <ToggleRow
          label="Receive messages from anyone"
          description="For your safety, we recommend only allowing messages from people you follow. Turning this on will allow anyone to send you messages."
          checked={!isPrivate}
          disabled={isLoading || isUpdating}
          onChange={(val) => handlePrivacyToggle(!val)}
        />
        <ToggleRow
          label="Show my activities in social discovery playlists and modules"
          description="Your Likes, Reactions and other engagement may be shown to other users in discovery features such as 'Liked By' playlists or update feeds. Turning this off won't hide your Likes on your profile or tracks."
          checked={showHistory}
          disabled={isLoading || isUpdating}
          onChange={handleShowHistoryToggle}
        />
      </div>
    </div>
  );
}