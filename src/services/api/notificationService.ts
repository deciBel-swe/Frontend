import {
  apiRequest,
  normalizeApiError,
  type ApiQueryParams,
} from '@/hooks/useAPI';
import { API_CONTRACTS } from '@/types/apiContracts';
import type { MessageResponse } from '@/types/user';

import type {
  NotificationsPage,
  UnreadCountResponse,
  NotificationSettingsDTO,
  RegisterDeviceTokenRequest,
} from '@/types/notification';

export interface PaginationParams {
  page?: number;
  size?: number;
}

const toQueryParams = (
  params?: PaginationParams
): ApiQueryParams | undefined => {
  if (!params) return undefined;
  const query: ApiQueryParams = {};
  if (params.page !== undefined) query.page = params.page;
  if (params.size !== undefined) query.size = params.size;
  return Object.keys(query).length > 0 ? query : undefined;
};

export interface NotificationService {
  getNotifications(params?: PaginationParams): Promise<NotificationsPage>;
  markAllAsRead(): Promise<MessageResponse>;
  getUnreadCount(): Promise<UnreadCountResponse>;
  getNotificationSettings(): Promise<NotificationSettingsDTO>;
  updateNotificationSettings(
    payload: NotificationSettingsDTO
  ): Promise<NotificationSettingsDTO>;
  registerDeviceToken(
    payload: RegisterDeviceTokenRequest
  ): Promise<MessageResponse>;
}

export class RealNotificationService implements NotificationService {
  async getNotifications(
    params?: PaginationParams
  ): Promise<NotificationsPage> {
    try {
      return await apiRequest(API_CONTRACTS.NOTIFICATIONS_GET, {
        params: toQueryParams(params),
      });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async markAllAsRead(): Promise<MessageResponse> {
    try {
      return await apiRequest(API_CONTRACTS.NOTIFICATIONS_MARK_ALL_READ);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      return await apiRequest(API_CONTRACTS.NOTIFICATIONS_UNREAD_COUNT);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async getNotificationSettings(): Promise<NotificationSettingsDTO> {
    try {
      return await apiRequest(API_CONTRACTS.NOTIFICATIONS_GET_SETTINGS);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async updateNotificationSettings(
    payload: NotificationSettingsDTO
  ): Promise<NotificationSettingsDTO> {
    try {
      return await apiRequest(API_CONTRACTS.NOTIFICATIONS_UPDATE_SETTINGS, {
        payload,
      });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async registerDeviceToken(
    payload: RegisterDeviceTokenRequest
  ): Promise<MessageResponse> {
    try {
      return await apiRequest(API_CONTRACTS.DEVICE_TOKEN_REGISTER, { payload });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}
