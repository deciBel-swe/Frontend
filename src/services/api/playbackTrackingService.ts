import { playbackService } from '@/services';
import type { PaginatedHistoryResponse } from '@/types/user';
import type { PlaybackPaginationParams } from '@/services/api/playbackService';

/**
 * Called when a user starts playback for a track.
 * @param trackId Numeric track identifier from the canonical playback model.
 */
export function userPlayedTrack(trackId: number): void {
	void playbackService.playTrack(trackId);
}

/**
 * Called once when playback reaches >= 90% for a track.
 * @param trackId Numeric track identifier from the canonical playback model.
 */
export function userCompletedTrack(trackId: number): void {
	void playbackService.completeTrack(trackId);
}

/**
 * Called when a track starts to keep recently played in sync.
 * @param trackId Numeric track identifier from the canonical playback model.
 */
export function addToRecentlyPlayed(trackId: number): void {
  void playbackService.playTrack(trackId);
}

/**
 * Read listening history from playback service.
 */
export function getListeningHistory(
  params?: PlaybackPaginationParams
): Promise<PaginatedHistoryResponse> {
  return playbackService.getListeningHistory(params);
}
