interface ToggleProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (val: boolean) => void;
  label: string;
}

export function Toggle({
  checked,
  disabled = false,
  onChange,
  label,
}: ToggleProps) {
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
