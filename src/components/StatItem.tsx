interface StateItemProps {
  params: Promise<{ count: number; text: string; color?: string }>;
}
// this component display counter with text above it it takes count and text and color for the background
const StateItem = async ({ params }: StateItemProps) => {
  const { count, text, color } = await params;
  return (
    <div
      className="flex flex-col items-center gap-2 rounded-xl px-6 py-4 shadow-sm w-fit font-medium"
      style={{ backgroundColor: color }}
    >
      <span className="text-white">{text}</span>
      <span className="text-white">{count}</span>
    </div>
  );
};

export default StateItem;
