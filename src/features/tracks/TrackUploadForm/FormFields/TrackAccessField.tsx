'use client';

import type { TrackAccess } from '@/types/tracks';

interface TrackAccessFieldProps {
  value: TrackAccess;
  onChange: (value: TrackAccess) => void;
}

const ACCESS_OPTIONS: Array<{
  value: TrackAccess;
  label: string;
  description: string;
}> = [
  {
    value: 'PLAYABLE',
    label: 'Playable',
    description: 'Full track is available to listeners.',
  },
  {
    value: 'PREVIEW',
    label: 'Preview',
    description: 'Listeners only get preview access.',
  },
  {
    value: 'BLOCKED',
    label: 'Blocked',
    description: 'Track is uploaded but not playable.',
  },
];

export default function TrackAccessField({
  value,
  onChange,
}: TrackAccessFieldProps) {
  return (
    <div>
      <label className="block text-[10px] font-extrabold text-text-primary mb-1">
        Track Access
      </label>
      <div className="group relative w-full">
        <div className="flex items-center gap-2 py-2 bg-bg-base">
          <select
            id="track-access"
            value={value}
            onChange={(event) => onChange(event.target.value as TrackAccess)}
            className="w-full bg-bg-base text-xs text-text-primary outline-none"
          >
            {ACCESS_OPTIONS.map((option) => (
              <option
                className="bg-bg-subtle"
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <span className="absolute left-1/2 bottom-0 h-px w-0 -translate-x-1/2 bg-border-contrast transition-all duration-200 group-hover:w-full group-focus-within:w-full" />
      </div>
      <p className="mt-1 text-xs text-text-secondary">
        {ACCESS_OPTIONS.find((option) => option.value === value)?.description}
      </p>
    </div>
  );
}
