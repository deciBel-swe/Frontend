interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * EmptyState — centred empty-list placeholder with optional CTA.
 * All colors use design tokens — no hardcoded values.
 * Stateless.
 */
export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center gap-3 ${className}`}>
      {/* Music note icon */}
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="24" fill="var(--color-surface-raised)" />
        <path
          d="M20 32V18l14-3v14"
          stroke="var(--color-border-strong)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="17" cy="32" r="3" stroke="var(--color-border-strong)" strokeWidth="2" />
        <circle cx="31" cy="29" r="3" stroke="var(--color-border-strong)" strokeWidth="2" />
      </svg>

      <p className="text-sm font-semibold text-text-primary m-0">{title}</p>

      {description && (
        <p className="text-xs text-text-muted m-0 max-w-[280px]">{description}</p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="
            mt-2 px-5 py-2
            bg-brand-primary hover:bg-brand-primary-hover
            text-text-on-brand
            text-xs font-bold
            rounded
            cursor-pointer
            border-none
            transition-colors
            font-sans
          "
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}