import { FC } from 'react';
import { StorageUsage } from '@/features/admin/types/types';
import { ProgressBar } from '@/features/admin/components/ProgressBar';

const TOTAL_STORAGE_GB = 500;
export const StorageCard: FC<StorageUsage> = ({usedGB}) => (
  <div className="bg-surface-default border border-border-default rounded-lg p-4 flex-1 min-w-[160px]">
    <p className="text-text-muted text-xs mb-2">Total Storage Used</p>
    <p className="text-text-secondary text-xs mb-2">{usedGB}GB / {TOTAL_STORAGE_GB}GB</p>
    <ProgressBar percent={usedGB / TOTAL_STORAGE_GB * 100} />
    <p className="text-brand-primary text-xs mt-1 font-semibold">{(usedGB / TOTAL_STORAGE_GB * 100)}% used</p>
  </div>
);