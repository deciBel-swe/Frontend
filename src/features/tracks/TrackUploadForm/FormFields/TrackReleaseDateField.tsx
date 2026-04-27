'use client';

interface TrackUploadDateFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxDate?: string;
}

export default function TrackUploadDateField({
  value,
  onChange,
  error,
  maxDate,
}: TrackUploadDateFieldProps) {
  return (
    <div>
      <label className="block text-[10px] font-extrabold text-text-primary mb-1">
        Upload date <span className="text-status-error">*</span>
      </label>
      <div className="relative w-full">
        <input
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          max={maxDate}
          className="peer w-full bg-transparent text-text-primary text-xs py-2 border-b border-text-primary/15 outline-none placeholder:text-text-muted"
        />
        <span className="absolute left-1/2 bottom-0 h-px w-0 -translate-x-1/2 bg-border-contrast transition-all duration-200 peer-focus:w-full peer-hover:w-full" />
      </div>
      {error ? (
        <p className="mt-1 font-light text-xs text-status-error">{error}</p>
      ) : (
        <p className="mt-1 text-[11px] text-text-muted">
          Format: DD-MM-YYYY.
        </p>
      )}
    </div>
  );
}
