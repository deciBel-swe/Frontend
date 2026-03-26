interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

/**
 * VerifiedBadge — blue checkmark badge, matches SoundCloud's style.
 * Circle uses --color-status-info token. Checkmark uses --color-neutral-0 (white).
 * Stateless, purely decorative.
 */
export default function VerifiedBadge({ size = 14, className = "" }: VerifiedBadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 inline-block align-middle ${className}`}
      aria-label="Verified"
      role="img"
    >
      <circle cx="8" cy="8" r="8" fill="var(--color-status-info)" />
      <path
        d="M4.5 8.2L6.8 10.5L11.5 5.5"
        stroke="var(--color-neutral-0)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}