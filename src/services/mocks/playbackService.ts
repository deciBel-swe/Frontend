import type { DeviceInfoDTO } from '@/types';
import type { MessageResponse, PaginatedHistoryResponse } from '@/types/user';
import type {
  PlaybackPaginationParams,
  PlaybackService,
} from '@/services/api/playbackService';
import {
  getMockTracksStore,
  getMockUsersStore,
  persistMockSystemState,
  resolveCurrentMockUserId,
} from '@/services/mocks/mockSystemStore';

const MOCK_DELAY_MS = 120;

const delay = (ms = MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const paginateHistory = (
  history: Array<{ id: number; title: string }>,
  params?: PlaybackPaginationParams
): PaginatedHistoryResponse => {
  const pageNumber = Math.max(0, params?.page ?? 0);
  const pageSize = Math.max(1, params?.size ?? 20);
  const totalElements = history.length;
  const totalPages = totalElements === 0 ? 1 : Math.ceil(totalElements / pageSize);
  const start = pageNumber * pageSize;

  return {
    content: history.slice(start, start + pageSize),
    pageNumber,
    pageSize,
    totalElements,
    totalPages,
    isLast: pageNumber >= totalPages - 1,
  };
};

const pushListeningHistory = (trackId: number): void => {
  const currentUserId = resolveCurrentMockUserId();
  const user = getMockUsersStore().find((entry) => entry.id === currentUserId);
  if (!user) {
    return;
  }

  const title =
    getMockTracksStore().find((track) => track.id === trackId)?.title ??
    `Track ${trackId}`;

  user.history = user.history.filter((entry) => entry.id !== trackId);
  user.history.unshift({ id: trackId, title });
  persistMockSystemState();
};

const noopDeviceInfo = (_deviceInfo?: DeviceInfoDTO): void => {
  // Mock mode does not need device metadata persistence yet.
};

export class MockPlaybackService implements PlaybackService {
  async getListeningHistory(
    params?: PlaybackPaginationParams
  ): Promise<PaginatedHistoryResponse> {
    await delay();

    const currentUserId = resolveCurrentMockUserId();
    const user = getMockUsersStore().find((entry) => entry.id === currentUserId);

    return paginateHistory(user?.history ?? [], params);
  }

  async playTrack(
    trackId: number,
    deviceInfo?: DeviceInfoDTO
  ): Promise<MessageResponse> {
    await delay();
    noopDeviceInfo(deviceInfo);
    pushListeningHistory(trackId);

    return {
      message: 'Track play recorded successfully',
    };
  }

  async completeTrack(
    trackId: number,
    deviceInfo?: DeviceInfoDTO
  ): Promise<MessageResponse> {
    await delay();
    noopDeviceInfo(deviceInfo);

    return {
      message: `Track ${trackId} completion recorded successfully`,
    };
  }
}
