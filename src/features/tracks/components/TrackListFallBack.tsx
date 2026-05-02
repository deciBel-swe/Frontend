export function TrackListFallBack() {
  return (
    <>
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="bg-surface-default rounded-lg h-40 animate-pulse" />
    ))}
  </>
  );
}