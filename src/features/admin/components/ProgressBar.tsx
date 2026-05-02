import { FC } from 'react';

interface ProgressBarProps {
  /** Value from 0 to 100 */
  percent: number;
  /** Optional custom height class */
  heightClass?: string;
}

/**
 * ProgressBar - A themed horizontal bar indicating completion or usage levels.
 */
export const ProgressBar: FC<ProgressBarProps> = ({ percent, heightClass = 'h-1.5' }) => {
  // Ensure percent stays within bounds
  const constrainedPercent = Math.min(Math.max(percent, 0), 100);

  return (
    <div className={`w-full bg-border-default rounded-full overflow-hidden ${heightClass}`}>
      <div
        className="bg-brand-primary h-full transition-all duration-500 ease-out"
        style={{ width: `${constrainedPercent}%` }}
        role="progressbar"
        aria-valuenow={constrainedPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
};