import { apiRequest, type ApiQueryParams } from '@/hooks/useAPI';
import type { DeviceInfoDTO } from '@/types';
import { API_CONTRACTS } from '@/types/apiContracts';
import type { MessageResponse, PaginatedFeedResponse } from '@/types/user';

export interface PlaybackPaginationParams {
	page?: number;
	size?: number;
}

export interface PlaybackService {
	getListeningHistory(
		params?: PlaybackPaginationParams
	): Promise<PaginatedFeedResponse>;
	playTrack(trackId: number, deviceInfo?: DeviceInfoDTO): Promise<MessageResponse>;
	completeTrack(trackId: number, deviceInfo?: DeviceInfoDTO): Promise<MessageResponse>;
}

const toQueryParams = (
	params?: PlaybackPaginationParams
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

const getDeviceType = (): DeviceInfoDTO['deviceType'] => {
	if (typeof window === 'undefined') {
		return 'DESKTOP';
	}

	const width = window.innerWidth;
	if (width < 768) {
		return 'MOBILE';
	}
	if (width < 1024) {
		return 'TABLET';
	}

	return 'DESKTOP';
};

const buildDeviceInfo = (): DeviceInfoDTO => {
	const userAgent =
		typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown-device';

	return {
		deviceType: getDeviceType(),
		fingerPrint: userAgent,
		deviceName: userAgent,
	};
};

const buildPlaybackPayload = (
	trackId: number,
	deviceInfo?: DeviceInfoDTO
): { trackId: number; deviceInfo: DeviceInfoDTO } => {
	return {
		trackId,
		deviceInfo: deviceInfo ?? buildDeviceInfo(),
	};
};

export class RealPlaybackService implements PlaybackService {
	async getListeningHistory(
		params?: PlaybackPaginationParams
	): Promise<PaginatedFeedResponse> {
		return apiRequest(API_CONTRACTS.USERS_ME_HISTORY, {
			params: toQueryParams(params),
		});
	}

	async playTrack(
		trackId: number,
		deviceInfo?: DeviceInfoDTO
	): Promise<MessageResponse> {
		return apiRequest(API_CONTRACTS.TRACK_PLAY(trackId), {
			payload: buildPlaybackPayload(trackId, deviceInfo),
		});
	}

	async completeTrack(
		trackId: number,
		deviceInfo?: DeviceInfoDTO
	): Promise<MessageResponse> {
		return apiRequest(API_CONTRACTS.TRACK_COMPLETE(trackId), {
			payload: buildPlaybackPayload(trackId, deviceInfo),
		});
	}
}
