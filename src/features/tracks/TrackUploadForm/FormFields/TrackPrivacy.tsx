'use client';

import { useEffect } from 'react';
import { useTrackVisibility } from '@/hooks/useTrackVisibility';
import type { TrackPrivacyValue } from '@/types/tracks';

interface TrackPrivacyProps {
  /** Controlled value — parent owns this */
  value: TrackPrivacyValue;
  onChange: (val: TrackPrivacyValue) => void;
  /**
   * Present after track has been saved.
   * - undefined → upload mode: radio buttons only, no API calls
   * - string    → edit mode: saves to API immediately on change, shows share modal
   */
  trackId?: string;
}

interface RadioOptionProps {
  id: TrackPrivacyValue;
  label: string;
  checked: boolean;
  disabled?: boolean;
  proOnly?: boolean;
  onChange: () => void;
}

// ─── Pro tooltip (shown on hover over Schedule) ───────────────────────────────

function ProTooltip() {
  return (
    <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50 w-64 bg-surface-default border border-border-default rounded-lg shadow-lg p-4">
      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface-default border-l border-t border-border-default rotate-45" />
      <p className="text-sm font-bold text-text-primary mb-1">Schedule</p>
      <p className="text-xs text-text-secondary leading-snug mb-3">
        Artist Pro subscribers can schedule when their tracks go live.
      </p>
      <button
        type="button"
        className="w-full bg-text-primary text-neutral-0 text-xs font-semibold py-2 px-4 rounded-full cursor-default"
      >
        Unlock with Artist Pro
      </button>
    </div>
  );
}

// ─── Radio option ─────────────────────────────────────────────────────────────

function RadioOption({
  id,
  label,
  checked,
  disabled = false,
  proOnly = false,
  onChange,
}: RadioOptionProps) {
  return (
    <div className="relative group">
      <label
        htmlFor={id}
        className={[
          'flex items-center gap-2 select-none',
          disabled ? 'opacity-40 cursor-default' : 'cursor-pointer',
        ].join(' ')}
      >
        <input
          type="radio"
          id={id}
          name="track-privacy"
          value={id}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="sr-only"
        />
        <span
          className={[
            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
            'transition-colors duration-150',
            checked ? 'border-text-primary' : 'border-border-strong',
          ].join(' ')}
        >
          {checked && (
            <span className="w-2.5 h-2.5 rounded-full bg-text-primary" />
          )}
        </span>
        <span className="text-sm font-medium text-text-primary">{label}</span>
      </label>

      {proOnly && (
        <>
          <div className="absolute top-full left-0 right-0 h-2" />
          <div className="hidden group-hover:block">
            <ProTooltip />
          </div>
        </>
      )}
    </div>
  );
}

// ─── TrackPrivacy ─────────────────────────────────────────────────────────────

export function TrackPrivacy({ value, onChange, trackId }: TrackPrivacyProps) {
  const numericTrackId = trackId ? Number(trackId) : undefined;
  const { visibility, updateVisibility, isUpdating } =
    useTrackVisibility(numericTrackId);

  // Sync API state into parent when editing an existing track
  useEffect(() => {
    if (visibility) {
      onChange(visibility.isPrivate ? 'private' : 'public');
    }
  }, [visibility, onChange]);

  const handleChange = (next: TrackPrivacyValue) => {
    onChange(next);
    if (numericTrackId) {
      updateVisibility({ isPrivate: next === 'private' });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold text-text-primary">
        Track Privacy
      </span>

      <div className="flex items-center gap-6">
        <RadioOption
          id="public"
          label="Public"
          checked={value === 'public'}
          disabled={isUpdating}
          onChange={() => handleChange('public')}
        />
        <RadioOption
          id="private"
          label="Private"
          checked={value === 'private'}
          disabled={isUpdating}
          onChange={() => handleChange('private')}
        />
        <RadioOption
          id="scheduled"
          label="Schedule"
          checked={value === 'scheduled'}
          disabled
          proOnly
          onChange={() => {}}
        />
      </div>

      {/* Upload mode — info message only, no trackId yet */}
      {!trackId && value === 'private' && (
        <p className="text-xs text-text-muted leading-snug">
          Only you and people you share the secret link with can listen to this
          track. The secret link will be available after saving.
        </p>
      )}
    </div>
  );
}
