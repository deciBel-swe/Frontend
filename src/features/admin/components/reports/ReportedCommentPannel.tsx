import { FC } from 'react';

import { ReportDetail } from '@/features/admin/types/types';

interface ReportedCommentPanelProps {
  comment: NonNullable<ReportDetail['comment']>;
}

export const ReportedCommentPanel: FC<ReportedCommentPanelProps> = ({
  comment,
}) => {
  const fields = [
    { label: 'author', value: comment.author },
    { label: 'posted on track', value: comment.postedOnTrack },
    { label: 'uploaded', value: comment.uploadedDate },
    { label: 'comment content', value: comment.commentContent },
  ].filter(
    (field): field is { label: string; value: string } =>
      typeof field.value === 'string' && field.value.length > 0
  );

  return (
    <div className="flex-1 min-w-[160px]">
      <p className="text-brand-primary text-sm font-semibold mb-3">
        Reported comment
      </p>
      <dl className="space-y-2">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-text-muted text-xs capitalize">{label}:</dt>
            <dd className="text-text-primary text-xs">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
