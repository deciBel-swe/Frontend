'use client';

const GENRE_OPTIONS = [
  'Electronic',
  'Rock',
  'Hip-Hop',
  'Jazz',
  'Classical',
] as const;

interface TrackGenreFieldProps {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function TrackGenreField({
  value,
  error,
  onChange,
  required = false,
}: TrackGenreFieldProps) {
  return (
    <div>
      <label className="block text-[10px] font-extrabold text-text-primary mb-1">
        Genre
        {required ? <span className="text-status-error">*</span> : ''}
      </label>
      <div className="group relative w-full">
        <div className="flex items-center gap-2 py-2 bg-bg-base">
          <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="w-full bg-bg-base text-xs text-text-primary outline-none"
          >
            <option className="bg-bg-subtle" value="">
              Select genre
            </option>
            {GENRE_OPTIONS.map((option) => (
              <option className="bg-bg-subtle" key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {value ? (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Clear genre"
              className="text-text-primary hover:text-text-secondary text-md"
            >
              x
            </button>
          ) : null}
        </div>
        <span className="absolute left-1/2 bottom-0 h-px w-0 -translate-x-1/2 bg-border-contrast transition-all duration-200 group-hover:w-full group-focus-within:w-full" />
      </div>
      {error ? <p className="mt-1 text-xs text-status-error">{error}</p> : null}
    </div>
  );
}
