/**
 * Playback tracking service placeholders.
 *
 * These are intentionally left empty for now. They define the contract surface
 * for future API integration and analytics wiring.
 */

/**
 * Called when a user starts playback for a track.
 */
export function userPlayedTrack(trackId: number): void {console.log(`User played track ${trackId}`);}

/**
 * Called once when playback reaches >= 90% for a track.
 */
export function userCompletedTrack(trackId: number): void {console.log(`User completed track ${trackId}`);}

/**
 * Called when a track starts to keep recently played in sync.
 */
export function addToRecentlyPlayed(trackId: number): void {console.log(`Adding track to recently played: ${trackId}`);}

/**
 * Placeholder for reading listening history.
 */
export function getListeningHistory(): void {console.log('Fetching listening history');}
