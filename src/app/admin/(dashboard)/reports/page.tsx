'use client';

import { useEffect, useMemo, useState } from 'react';

import { ReportsDashboard } from '@/features/admin/components/reports/ReportsDashboard';
import { ReportViewPopup } from '@/features/admin/components/reports/ReportViewPopup';
import {
  useAdminReportDetail,
  useBanUser,
  useDeleteTrackAsModerator,
  usePlatformReports,
  useUpdateReportStatus,
} from '@/features/admin/hooks';
import type {
  ReportDetail,
  ReportRow,
  ReportsDashboardData,
} from '@/features/admin/types/types';
import {
  ReportReason,
  ReportStatus,
  ReportType,
} from '@/features/admin/types/types';
import type { AdminReportStatus } from '@/types/admin';

const DEFAULT_REPORT_PAGE_SIZE = 20;

const toUiReportStatus = (status: AdminReportStatus): ReportStatus => {
  switch (status) {
    case 'RESOLVED':
      return ReportStatus.RESOLVED;
    case 'DISMISSED':
      return ReportStatus.DISMISSED;
    default:
      return ReportStatus.PENDING;
  }
};

const isResolvedReportStatus = (status: ReportStatus): boolean =>
  status === ReportStatus.RESOLVED || status === ReportStatus.DISMISSED;

const toUiReportType = (targetType: string): ReportType =>
  targetType.toUpperCase() === 'COMMENT'
    ? ReportType.COMMENT
    : ReportType.TRACK;

const toUiReportReason = (reason?: string | null): ReportReason => {
  switch (reason?.toUpperCase()) {
    case 'COPYRIGHT':
    case 'COPYRIGHT VIOLATION':
      return ReportReason.COPYRIGHT;
    case 'INAPPROPRIATE':
      return ReportReason.INAPPROPRIATE;
    case 'VIOLENCE':
      return ReportReason.VIOLENCE;
    case 'SPAM':
      return ReportReason.SPAM;
    default:
      return ReportReason.UNKNOWN;
  }
};

const toDisplayDate = (value: string): string => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

const toDisplayTimestamp = (value: string): string => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
};

export default function AdminReportsPage() {
  const [requestedPageSize, setRequestedPageSize] = useState(
    DEFAULT_REPORT_PAGE_SIZE
  );
  const { reports, getPlatformReports, isLoading, isError, error } =
    usePlatformReports({ page: 0, size: requestedPageSize });
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const selectedReportIdNumber =
    selectedReportId !== null ? Number(selectedReportId) : null;
  const {
    reportDetail,
    isLoading: isLoadingReportDetail,
    error: reportDetailError,
  } = useAdminReportDetail(
    selectedReportIdNumber !== null && Number.isFinite(selectedReportIdNumber)
      ? selectedReportIdNumber
      : null
  );
  const {
    deleteTrackAsModerator,
    isLoading: isDeletingTrack,
    error: deleteTrackError,
  } = useDeleteTrackAsModerator();
  const {
    updateReportStatus,
    isLoading: isUpdatingReport,
    error: updateReportError,
  } = useUpdateReportStatus();
  const {
    banUser,
    isLoading: isBanningUser,
    error: banUserError,
  } = useBanUser();

  const reportRows = useMemo<ReportRow[]>(
    () =>
      (reports?.content ?? []).map((report) => ({
        id: String(report.id ?? report.targetId),
        user: report.reporterUsername ?? `Reporter #${report.reporterId}`,
        type: toUiReportType(report.targetType),
        reason: toUiReportReason(report.reason),
        date: toDisplayDate(report.createdAt),
        status: toUiReportStatus(report.status),
      })),
    [reports?.content]
  );

  const filteredRows = useMemo(
    () =>
      reportRows
        .filter((report) => report.status === ReportStatus.PENDING)
        .filter((report) => {
        const matchesType = !typeFilter || report.type === typeFilter;
        const matchesReason = !reasonFilter || report.reason === reasonFilter;
        return matchesType && matchesReason;
      }),
    [reasonFilter, reportRows, typeFilter]
  );

  const dashboardData = useMemo<ReportsDashboardData>(() => {
    const totalReports = reports?.totalElements ?? 0;
    const resolvedCount = reportRows.filter(
      (report) => isResolvedReportStatus(report.status)
    ).length;

    return {
      totalReports,
      resolved: {
        count: resolvedCount,
        total: totalReports,
        percent:
          totalReports === 0
            ? 0
            : Math.round((resolvedCount / totalReports) * 100),
      },
      flaggedItems: {
        total: filteredRows.length,
        items: filteredRows,
      },
    };
  }, [filteredRows, reportRows, reports?.totalElements]);

  useEffect(() => {
    if (
      reports &&
      reports.totalElements > requestedPageSize &&
      reports.content.length < reports.totalElements
    ) {
      setRequestedPageSize(reports.totalElements);
    }
  }, [reports, requestedPageSize]);

  const displayDetail: ReportDetail | null = reportDetail
    ? {
        reason: reportDetail.reason ?? undefined,
        type: toUiReportType(reportDetail.targetType),
        reportedBy:
          reportDetail.reporterUsername ?? `Reporter #${reportDetail.reporterId}`,
        date: toDisplayTimestamp(reportDetail.createdAt),
        status: toUiReportStatus(reportDetail.status),
        description: reportDetail.description ?? undefined,
        track:
          reportDetail.targetType.toUpperCase() === 'TRACK'
            ? {
                thumbnailUrl: reportDetail.targetThumbnailUrl ?? undefined,
                artistName:
                  reportDetail.targetArtistName ??
                  reportDetail.targetDisplayName ??
                  reportDetail.targetUsername ??
                  undefined,
                trackTitle:
                  reportDetail.targetTitle ?? `Track #${reportDetail.targetId}`,
                plays:
                  reportDetail.targetPlayCount !== undefined &&
                  reportDetail.targetPlayCount !== null
                    ? reportDetail.targetPlayCount.toLocaleString()
                    : undefined,
                uploadedDate: reportDetail.targetCreatedAt
                  ? toDisplayTimestamp(reportDetail.targetCreatedAt)
                  : undefined,
              }
            : undefined,
        comment:
          reportDetail.targetType.toUpperCase() === 'COMMENT'
            ? {
                author:
                  reportDetail.commentAuthor ??
                  reportDetail.targetDisplayName ??
                  reportDetail.targetUsername ??
                  undefined,
                postedOnTrack: reportDetail.targetTitle ?? undefined,
                uploadedDate: reportDetail.targetCreatedAt
                  ? toDisplayTimestamp(reportDetail.targetCreatedAt)
                  : undefined,
                commentContent: reportDetail.commentContent ?? undefined,
              }
            : undefined,
      }
    : null;

  const refreshReports = async () => {
    await getPlatformReports({ page: 0, size: requestedPageSize });
  };

  const handleClose = () => setSelectedReportId(null);

  const handleDismiss = async (id: string) => {
    const reportId = Number(id);
    if (!Number.isFinite(reportId)) {
      return;
    }

    setActionError(null);

    try {
      await updateReportStatus(reportId, { status: 'DISMISSED' });
      if (selectedReportId === id) {
        handleClose();
      }
      await refreshReports();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to update report status.';
      setActionError(message);
    }
  };

  const handleRemove = async () => {
    if (!reportDetail) {
      return;
    }

    setActionError(null);

    try {
      if (reportDetail.targetType.toUpperCase() === 'TRACK') {
        await deleteTrackAsModerator(reportDetail.targetId);
      }

      await updateReportStatus(reportDetail.id ?? reportDetail.targetId, {
        status: 'RESOLVED',
      });
      handleClose();
      await refreshReports();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to apply moderation action.';
      setActionError(message);
    }
  };

  const handleSuspendUser = async () => {
    const targetUserId = reportDetail?.targetUserId;

    if (!targetUserId) {
      setActionError('Unable to determine which user should be suspended.');
      return;
    }

    setActionError(null);

    try {
      if (reportDetail?.targetType.toUpperCase() === 'TRACK') {
        await deleteTrackAsModerator(reportDetail.targetId);
      }

      await banUser(targetUserId);
      if (selectedReportId) {
        await updateReportStatus(Number(selectedReportId), {
          status: 'RESOLVED',
        });
      }
      handleClose();
      await refreshReports();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to suspend the reported user.';
      setActionError(message);
    }
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <p className="text-sm text-text-muted">Loading reports...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6 space-y-4">
        <p className="text-sm text-status-error">
          {error?.message ?? 'Unable to load reports.'}
        </p>
        <button
          type="button"
          onClick={() => void refreshReports()}
          className="text-sm font-semibold text-brand-primary"
        >
          Retry
        </button>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <ReportsDashboard
        data={dashboardData}
        typeFilter={typeFilter}
        reasonFilter={reasonFilter}
        onTypeFilterChange={setTypeFilter}
        onReasonFilterChange={setReasonFilter}
        onView={setSelectedReportId}
        onDismiss={(id) => void handleDismiss(id)}
      />
      {selectedReportId && displayDetail && (
        <ReportViewPopup
          detail={displayDetail}
          onClose={handleClose}
          onRemove={() => void handleRemove()}
          onDismiss={() => void handleDismiss(selectedReportId)}
          onSuspendUser={
            reportDetail?.targetUserId ? () => void handleSuspendUser() : undefined
          }
        />
      )}
      {isLoadingReportDetail && (
        <p className="text-sm text-text-muted">Loading report details...</p>
      )}
      {(isUpdatingReport || isDeletingTrack || isBanningUser) && (
        <p className="text-sm text-text-muted">Applying moderation action...</p>
      )}
      {(
        actionError ||
        updateReportError?.message ||
        deleteTrackError?.message ||
        banUserError?.message ||
        reportDetailError?.message
      ) && (
        <p className="text-sm text-status-error">
          {actionError ??
            updateReportError?.message ??
            deleteTrackError?.message ??
            banUserError?.message ??
            reportDetailError?.message ??
            'Unable to apply moderation action.'}
        </p>
      )}
    </main>
  );
}
