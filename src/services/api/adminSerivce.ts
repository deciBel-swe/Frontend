import {
  apiRequest,
  normalizeApiError,
  type ApiQueryParams,
} from '@/hooks/useAPI';
import type { DeviceInfoDTO } from '@/types';
import { API_CONTRACTS } from '@/types/apiContracts';
import type { MessageResponse } from '@/types/user';
import type {
  AdminLoginResponse,
  AdminReportsPage,
  BanUserRequest,
  PlatformAnalyticsResponse,
  ReportRequest,
  UpdateAdminReportStatusRequest,
} from '@/types/admin';

export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
  deviceInfo: DeviceInfoDTO;
}

const toQueryParams = (
  params?: PaginationParams
): ApiQueryParams | undefined => {
  if (!params) {
    return undefined;
  }

  const query: ApiQueryParams = {};

  if (params.page !== undefined) {
    query.page = params.page;
  }

  if (params.size !== undefined) {
    query.size = params.size;
  }

  return Object.keys(query).length > 0 ? query : undefined;
};

export interface AdminService {
  /*report a track */
  reportTrack(
    trackId: number,
    payload: ReportRequest
  ): Promise<MessageResponse>;
  /*report a comment */
  reportComment(
    commentId: number,
    payload: ReportRequest
  ): Promise<MessageResponse>;
  /* login as admin */
  adminLogin(payload: AdminLoginRequest): Promise<AdminLoginResponse>;
  /* get platform reports with pagination */
  getPlatformReports(params?: PaginationParams): Promise<AdminReportsPage>;
  updateReportStatus(
    reportId: number,
    payload: UpdateAdminReportStatusRequest
  ): Promise<MessageResponse>;
  /* delete a track as moderator */
  deleteTrackAsModerator(trackId: number): Promise<MessageResponse>;
  /* ban a user */
  banUser(userId: number, payload?: BanUserRequest): Promise<MessageResponse>;
  /* unban a user */
  unbanUser(userId: number): Promise<MessageResponse>;
  /* get platform analytics */
  getPlatformAnalytics(): Promise<PlatformAnalyticsResponse>;
}

export class RealAdminService implements AdminService {
  async reportTrack(
    trackId: number,
    payload: ReportRequest
  ): Promise<MessageResponse> {
    try {
      return await apiRequest(API_CONTRACTS.TRACK_REPORT(trackId), { payload });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async reportComment(
    commentId: number,
    payload: ReportRequest
  ): Promise<MessageResponse> {
    try {
      return await apiRequest(API_CONTRACTS.COMMENT_REPORT(commentId), {
        payload,
      });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async adminLogin(payload: AdminLoginRequest): Promise<AdminLoginResponse> {
    try {
      return await apiRequest(API_CONTRACTS.ADMIN_LOGIN, { payload });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async getPlatformReports(
    params?: PaginationParams
  ): Promise<AdminReportsPage> {
    try {
      return await apiRequest(API_CONTRACTS.ADMIN_REPORTS, {
        params: toQueryParams(params),
      });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async updateReportStatus(
    reportId: number,
    payload: UpdateAdminReportStatusRequest
  ): Promise<MessageResponse> {
    try {
      return await apiRequest(
        API_CONTRACTS.ADMIN_UPDATE_REPORT_STATUS(reportId),
        {
          payload,
        }
      );
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async deleteTrackAsModerator(trackId: number): Promise<MessageResponse> {
    try {
      return await apiRequest(API_CONTRACTS.ADMIN_DELETE_TRACK(trackId));
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async banUser(
    userId: number,
    payload?: BanUserRequest
  ): Promise<MessageResponse> {
    try {
      return await apiRequest(API_CONTRACTS.ADMIN_BAN_USER(userId), {
        payload,
      });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async unbanUser(userId: number): Promise<MessageResponse> {
    try {
      return await apiRequest(API_CONTRACTS.ADMIN_UNBAN_USER(userId));
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async getPlatformAnalytics(): Promise<PlatformAnalyticsResponse> {
    try {
      return await apiRequest(API_CONTRACTS.ADMIN_ANALYTICS);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}
