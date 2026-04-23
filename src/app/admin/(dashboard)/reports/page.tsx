'use client';

import { ReportsDashboard } from '@/features/admin/components/reports/ReportsDashboard';
import { ReportViewPopup } from '@/features/admin/components/reports/ReportViewPopup';
import { useState } from 'react';
import {
  ReportReason,
  ReportStatus,
  ReportType,
  ReportDetail,
  ReportsDashboardData,
} from '@/features/admin/types/types';

const REPORTS_DATA: ReportsDashboardData = {
  totalReports: 400,
  resolved: { count: 108, total: 400, percent: 27 },
  flaggedItems: {
    total: 11678,
    items: [
      {
        id: '1',
        user: 'test user',
        type: ReportType.TRACK,
        reason: ReportReason.INAPPROPRIATE,
        date: '1/1/2026',
        status: ReportStatus.PENDING,
      },
      {
        id: '2',
        user: 'test user',
        type: ReportType.COMMENT,
        reason: ReportReason.VIOLENCE,
        date: '1/1/2026',
        status: ReportStatus.PENDING,
      },
      {
        id: '3',
        user: 'test user',
        type: ReportType.TRACK,
        reason: ReportReason.COPYRIGHT,
        date: '1/1/2026',
        status: ReportStatus.PENDING,
      },
    ],
  },
};
/** Stub detail — replace with a real lookup by id from your service layer */
const MOCK_REPORT_DETAIL: ReportDetail = {
  reason: 'inappropriate',
  type: ReportType.TRACK,
  reportedBy: 'test user',
  date: '1/1/2026',
  status: ReportStatus.PENDING,
  description: '',
  track: {
    thumbnailUrl: 'https://picsum.photos/seed/track1/400/200',
    artistName: 'Artist Name',
    trackTitle: 'Track Title',
    plays: '1k',
    uploadedDate: '1/1/2026',
  },
};

const MOCK_REPORT_COMMENT_DETAIL: ReportDetail = {
   reason: 'inappropriate',
  type: ReportType.COMMENT,
  reportedBy: 'test user',
  date: '1/1/2026',
  status: ReportStatus.PENDING,
  description: '',
  comment:{
    author: 'test reporter',
    postedOnTrack: "Example Track Name",
    uploadedDate: '1/1/2026',
    commentContent: "This is a sample reported comment content."
    }
};

export default function AdminReportsPage() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const selectedReport = REPORTS_DATA.flaggedItems.items.find(
    (item) => item.id === selectedReportId
  );

  // 2. In a real app, you'd fetch the full detail (with track/comment info) 
  // from an API here. For now, we merge the row data with the mock structure.
  const displayDetail: ReportDetail | null = selectedReport 
    ? {
        ...MOCK_REPORT_DETAIL, // Base mock info
        ...selectedReport,     // Override with actual row info (type, reason, id)
        // Ensure track/comment only exist if the type matches
        track: selectedReport.type === ReportType.TRACK ? MOCK_REPORT_DETAIL.track : undefined,
        comment: selectedReport.type === ReportType.COMMENT ? MOCK_REPORT_COMMENT_DETAIL.comment:undefined,
      }
    : null;
  const handleView = (id: string) => setSelectedReportId(id);
  const handleClose = () => setSelectedReportId(null);
  return (
    <main className="p-6 space-y-6">
      <ReportsDashboard 
        data={REPORTS_DATA}
        onView={handleView}
        onDismiss={(id) => console.info('dismiss', id)}
      />
        {/* Popup renders at page root to avoid z-index / stacking context issues */}
      {selectedReportId && displayDetail && (
        <ReportViewPopup
          detail={displayDetail}
          onClose={handleClose}
          onRemove={() => { console.info('remove', selectedReportId); handleClose(); }}
          onDismiss={() => { console.info('dismiss', selectedReportId); handleClose(); }}
          onSuspendUser={() => { console.info('suspend user', selectedReportId); handleClose(); }}
        />
      )}
    </main>
  );
}
