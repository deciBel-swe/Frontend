'use client';

interface TrackTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  tooltipTitle?: string;
  tooltipText?: string;
}

export default function TrackTextField({
  label,
  value,
  onChange,
  error,
  required = false,
  tooltipTitle,
  tooltipText,
}: TrackTextFieldProps) {
  return (
    <div>
      <div className="mb-1 flex items-baseline gap-1">
        <label className="block text-[10px] font-extrabold text-text-primary">
          {label}
          {required ? <span className="text-status-error">*</span> : ''}
        </label>
        {tooltipTitle && tooltipText ? (
          <div className="relative group">
            <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-border-contrast text-[7px] text-text-primary cursor-pointer">
              ?
            </span>
            <div className="hidden group-hover:block absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50 w-64 bg-bg-base border border-interactive-default rounded-lg shadow-lg p-4">
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-surface-default border-l border-t border-border-default rotate-45" />
              <p className="text-xs font-bold text-text-primary mb-1">
                {tooltipTitle}
              </p>
              <p className="text-[10px] text-text-primary font-semibold leading-snug">
                {tooltipText}
              </p>
            </div>
          </div>
        ) : null}
      </div>
      <div className="relative w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
        peer w-full
        bg-transparent
        text-text-primary text-xs
        py-2

        border-b border-text-primary/15
        outline-none

        placeholder:text-text-muted

        focus:border-transparent
        `}
        />

        <span className="absolute left-1/2 bottom-0 h-px w-0 -translate-x-1/2 bg-border-contrast transition-all duration-200 peer-focus:w-full peer-hover:w-full" />
      </div>
      {error ? (
        <p className="mt-1 font-light text-xs text-status-error">{error}</p>
      ) : null}
    </div>
  );
}
