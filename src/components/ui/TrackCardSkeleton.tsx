export function TrackCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-raised rounded-lg h-40 animate-pulse"
        />
      ))}
    </div>
  );
}