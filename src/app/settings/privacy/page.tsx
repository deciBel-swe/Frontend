'use client';

import { useEffect, useState } from 'react';
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
}
