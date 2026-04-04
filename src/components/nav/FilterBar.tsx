interface FilterBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * FilterBar — controlled text input for filtering lists.
 * Stateless: value and onChange are fully controlled by parent.
 * All colors use design tokens — no hardcoded values.
 */
export default function FilterBar({
  placeholder = "Filter",
  value,
  onChange,
  className = "",
}: FilterBarProps) {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-3 pr-3 py-2 w-56 bg-surface-default border border-border-strong rounded text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-border-brand transition-colors font-sans"
      />
    </div>
  );
}