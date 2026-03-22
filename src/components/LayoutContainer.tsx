// components/LayoutContainer.tsx
export default function LayoutContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-6xl px-4">{children}</div>
    </div>
  );
}