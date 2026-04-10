type SkeletonVariant = "user-card" | "user-list-item" | "avatar";

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
  className?: string;
}

/**
 * Skeleton shimmer uses surface tokens so it adapts to light/dark mode.
 * --color-surface-raised  → base shimmer colour
 * --color-interactive-default → highlight pass colour
 */
const shimmerStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, var(--color-surface-raised) 25%, var(--color-interactive-default) 50%, var(--color-surface-raised) 75%)",
  backgroundSize: "200% 100%",
  animation: "sc-skeleton-pulse 1.4s ease-in-out infinite",
  borderRadius: 4,
};

function UserCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2.5 w-40">
      <div style={{ ...shimmerStyle, width: 140, height: 140, borderRadius: "50%" }} />
      <div style={{ ...shimmerStyle, width: 100, height: 13 }} />
      <div style={{ ...shimmerStyle, width: 80, height: 11 }} />
    </div>
  );
}

function UserListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div style={{ ...shimmerStyle, width: 48, height: 48, borderRadius: "50%" }} />
      <div className="flex flex-col gap-1.5 flex-1">
        <div style={{ ...shimmerStyle, width: "40%", height: 12 }} />
        <div style={{ ...shimmerStyle, width: "25%", height: 10 }} />
      </div>
    </div>
  );
}

function AvatarSkeleton() {
  return <div style={{ ...shimmerStyle, width: 48, height: 48, borderRadius: "50%" }} />;
}

/**
 * LoadingSkeleton — shimmer placeholders while data loads.
 * variant controls shape, count repeats it.
 */
export default function LoadingSkeleton({
  variant = "user-card",
  count = 6,
  className = "",
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  return (
    <>
      <style>{`
        @keyframes sc-skeleton-pulse {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div
        className={`flex flex-wrap ${variant === "user-card" ? "gap-6" : ""} ${className}`}
      >
        {items.map((_, i) => (
          <div key={i}>
            {variant === "user-card"      && <UserCardSkeleton />}
            {variant === "user-list-item" && <UserListItemSkeleton />}
            {variant === "avatar"         && <AvatarSkeleton />}
          </div>
        ))}
      </div>
    </>
  );
}