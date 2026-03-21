import { formatNumber } from '@/utils/formatNumber';

interface StateItemProps {
  count: number;
  text: string;
}
// this component display counter with text above it it takes count and text and color for the background
const StateItem = ({ count, text }: StateItemProps) => {
  return (
    <div className="group cursor-pointer">
      <div className="flex flex-col items-center justify-center min-w-[100px] py-4 px-6">
        <span className="text-[#999] text-sm font-bold mb-1 tracking-wide">
          {text}
        </span>
        <span
          className="text-black dark:text-white text-3xl font-bold tracking-tight mb-1 tracking-wide transition-colors group-hover:text-gray-500"
        >
          {formatNumber(count)}
        </span>
      </div>
    </div>
  );
};

export default StateItem;
