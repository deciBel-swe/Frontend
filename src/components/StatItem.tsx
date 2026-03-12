import { formatNumber } from '@/utils/formatNumber';

interface StateItemProps {
  params: Promise<{ count: number; text: string; color?: string }>;
}
// this component display counter with text above it it takes count and text and color for the background
const StateItem = async ({ params }: StateItemProps) => {
  const { count, text } = await params;

  return (
    <div className="flex flex-col items-center justify-center min-w-[120px] py-4 px-6">
      <span className="text-[#999] text-sm font-normal mb-1 tracking-wide">
        {text}
      </span>
      <span className="text-white text-3xl font-bold tracking-tight">
        {formatNumber(count)}
      </span>
    </div>
  );
};

export default StateItem;
