import { FC } from 'react';
import { StorageUsage } from '@/features/admin/types/types';
import { ProgressBar } from '@/features/admin/components/ProgressBar';

const formatGB = (value: number) =>
  new Intl.NumberFormat('en', { maximumFractionDigits: 1 }).format(value);

export const StorageCard: FC<StorageUsage> = ({ usedGB, totalGB }) => {
  const safeTotal = totalGB > 0 ? totalGB : 0;
  const percent = safeTotal === 0 ? 0 : (usedGB / safeTotal) * 100;

  return (
    <div className="bg-surface-default border border-border-default rounded-lg p-4 flex-1 min-w-[160px]">
      <p className="text-text-muted text-xs mb-2">Total Storage Used</p>
      <p className="text-text-secondary text-xs mb-2">
        {formatGB(usedGB)}GB / {formatGB(totalGB)}GB
      </p>
      <ProgressBar percent={percent} />
      <p className="text-brand-primary text-xs mt-1 font-semibold">
        {percent.toFixed(1)}% used
      </p>
    </div>
  );
};
