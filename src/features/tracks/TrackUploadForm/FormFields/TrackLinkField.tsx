'use client';

interface TrackLinkFieldProps {
  prefix: string;
  suffix: string;
  error?: string;
  onChange: (value: string) => void;
}

export default function TrackLinkField({
  prefix,
  suffix,
  error,
  onChange,
}: TrackLinkFieldProps) {
  return (
    <div>
      <label className="block text-[10px] font-extrabold text-text-primary mb-1">
        Track Link
      </label>
      <div className="group relative w-full">
        <div className="flex items-center py-2 border-b border-text-primary/15 text-text-primary">
          <span className="text-xs text-text-primary whitespace-nowrap">
            {prefix}/
          </span>
          <input
            type="text"
            value={suffix}
            onChange={(event) => onChange(event.target.value)}
            placeholder="your-track"
            className="w-full bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>
        <span className="absolute left-1/2 bottom-0 h-px w-0 -translate-x-1/2 bg-border-contrast transition-all duration-200 group-hover:w-full group-focus-within:w-full" />
      </div>
      {error ? <p className="mt-1 text-xs text-status-error">{error}</p> : null}
    </div>
  );
}
