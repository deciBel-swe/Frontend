'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import Button from '@/components/buttons/Button';
import { Toggle } from '@/components/buttons/Toggle';
import AvatarImage from '@/components/ui/AvatarImage';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';

type Status = 'idle' | 'saving' | 'saved' | 'error';

// ─── Toggle row ───────────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (val: boolean) => void;
}

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 sm:gap-8 py-5">
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="text-sm font-semibold text-text-primary">{label}</span>
        <span className="text-sm text-text-secondary leading-snug">
          {description}
        </span>
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div>
      <div className="h-4 w-32 bg-surface-raised rounded mb-6 animate-pulse" />
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex items-start justify-between gap-4 sm:gap-8 py-5 border-b border-border-default"
        >
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-3.5 w-48 bg-surface-raised rounded animate-pulse" />
            <div className="h-3 w-full max-w-lg bg-surface-default rounded animate-pulse" />
          </div>
          <div className="w-11.5 h-6.5 rounded-full bg-surface-raised animate-pulse shrink-0" />
        </div>
      ))}
    </div>
  );
}

function BlockedUsersSection() {
  const { users, isLoading, isError, pendingIds, unblockUser, refresh } =
    useBlockedUsers();

  return (
    <section className="mt-10">
      <div className="flex justify-between items-center border-b border-border-default pb-2">
        <span className="text-sm font-semibold text-text-muted">
          Blocked users
        </span>

        <button
          type="button"
          onClick={refresh}
          className="text-xs text-gray-400 hover:text-white transition"
        >
          Refresh list
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4 mt-4">
          {[1, 2].map((index) => (
            <div
              key={index}
              className="h-16 rounded-xl bg-surface-raised animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-status-error mt-4">
          Unable to load blocked users.
        </p>
      ) : users.length === 0 ? (
        <p className="text-sm text-text-secondary mt-4">
          You have not blocked anyone.
        </p>
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          {users.map((user) => {
            const profileHref = `/${user.username}`;
            const isPending = pendingIds.includes(user.id);

            return (
              <div
                key={user.id}
                className="group flex items-center justify-between px-2 py-4 rounded-xl hover:bg-surface-raised transition-colors w-full"
              >
                <div className="flex items-center gap-2">
                  <AvatarImage
                    src={user.avatarUrl}
                    alt={user.username}
                    size={40}
                    shape="circle"
                  />

                  <div className="flex flex-col">
                    <Link
                      href={profileHref}
                      className="text-sm font-medium text-text-primary truncate transition group-hover:text-text-primary"
                    >
                      {user.username}
                    </Link>
                    <span className="text-xs text-text-muted">Blocked user</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full px-3 py-1"
                  disabled={isPending}
                  onClick={() => void unblockUser(user.id)}
                >
                  {isPending ? 'Unblocking...' : 'Unblock'}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
  const { settings, isLoading, isError, isUpdating, updateSetting } =
    usePrivacySettings();

  const [isPrivate, setIsPrivate] = useState(
    () => settings?.isPrivate ?? false
  );
  const [showHistory, setShowHistory] = useState(
    () => settings?.showHistory ?? false
  );
  const [status, setStatus] = useState<Status>('idle');

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
      if (!ok) {
        setIsPrivate(settings?.isPrivate ?? false);
        return;
      }
    }
    setIsPrivate(next);
    setStatus('saving');
    try {
      await updateSetting({ isPrivate: next, showHistory });
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
      await updateSetting({ isPrivate, showHistory: next });
      flash('saved');
    } catch {
      flash('error');
      setShowHistory(settings?.showHistory ?? false);
    }
  };

  if (isLoading) return <Skeleton />;
  if (isError)
    return (
      <p className="text-sm text-status-error">
        Unable to load your privacy settings.
      </p>
    );

  return (
    <div className="w-full max-w-3xl">
      {/* Heading row */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-md font-extrabold text-text-primary">
          Privacy settings
        </h2>

        {/* Single shared status — right-aligned above toggles */}
        <div className="flex justify-end">
          {status !== 'idle' && (
            <span className="text-xs text-text-muted whitespace-nowrap">
              {status === 'saving' && 'Saving changes…'}
              {status === 'saved' && '✓ Changes saved'}
              {status === 'error' && 'Failed to save'}
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

      <BlockedUsersSection />
    </div>
  );
}
