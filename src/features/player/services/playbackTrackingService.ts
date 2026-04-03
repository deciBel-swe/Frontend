/**
 * Playback tracking service placeholders.
 *
 * These are intentionally left empty for now. They define the contract surface
 * for future API integration and analytics wiring.
 */

/**
 * Called when a user starts playback for a track.
 *
 * TODO: replace with real analytics/service call.
 *
 * @param trackId Numeric track identifier from the canonical playback model.
 */
export function userPlayedTrack(trackId: number): void {}

/**
 * Called once when playback reaches >= 90% for a track.
 *
 * TODO: replace with real analytics/service call.
 *
 * @param trackId Numeric track identifier from the canonical playback model.
 */
export function userCompletedTrack(trackId: number): void {}

/**
 * Called when a track starts to keep recently played in sync.
 *
 * TODO: replace with real persistence/service call.
 *
 * @param trackId Numeric track identifier from the canonical playback model.
 */
export function addToRecentlyPlayed(trackId: number): void {}

/**
 * Placeholder for reading listening history.
 *
 * TODO: replace with real retrieval call returning typed history payload.
 */
export function getListeningHistory(): void {}
