'use client';

import { useEffect, useState } from 'react';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';

type Status = 'idle' | 'saving' | 'saved' | 'error';

// ─── Toggle pill ──────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (val: boolean) => void;
  label: string;
}

function Toggle({ checked, disabled = false, onChange, label }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative shrink-0 w-[46px] h-[26px] rounded-full',
        'transition-colors duration-200 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-brand-primary focus-visible:ring-offset-2',
        'focus-visible:ring-offset-bg-base',
        'disabled:cursor-not-allowed cursor-pointer',
        checked ? 'bg-brand-primary' : 'bg-interactive-default',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-[3px] left-[3px]',
          'w-5 h-5 rounded-full bg-neutral-0 shadow-sm',
          'transition-transform duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (val: boolean) => void;
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

  const [isPrivate, setIsPrivate]     = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [status, setStatus]           = useState<Status>('idle');

  useEffect(() => {
    if (settings) {
      setIsPrivate(settings.isPrivate);
      setShowHistory(settings.showHistory);
    }
  }, [settings]);

  const flash = (result: 'saved' | 'error') => {
    setStatus(result);
    setTimeout(() => setStatus('idle'), 3000);
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

      {/* Heading row — status text is right-aligned to sit above the toggles */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-md font-extrabold text-text-primary">Privacy settings</h2>

        {/* Status — always right-aligned, aligned with toggle column */}
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