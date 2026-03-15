import type { TrackVisibilityService } from '@/services/api/trackVisibilityService';
import type { TrackVisibility, UpdateTrackVisibilityDto } from '@/types';

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));
const storageKey = (trackId: number) => `decibel_mock_track_visibility_${trackId}`;

export class MockTrackVisibilityService implements TrackVisibilityService {
  async getTrackVisibility(trackId: number): Promise<TrackVisibility> {
    await delay();
    const stored = localStorage.getItem(storageKey(trackId));
    return stored ? JSON.parse(stored) : { isPrivate: false };
  }

  async updateTrackVisibility(
    trackId: number,
    data: UpdateTrackVisibilityDto
  ): Promise<TrackVisibility> {
    await delay();
    const updated: TrackVisibility = { isPrivate: data.isPrivate };
    localStorage.setItem(storageKey(trackId), JSON.stringify(updated));
    return updated;
  }
}