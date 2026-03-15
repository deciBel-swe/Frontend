import type { TrackVisibility, UpdateTrackVisibilityDto } from '@/types';
import { API_ENDPOINTS, getApiUrl } from '@/constants/routes';

export interface TrackVisibilityService {
  /** GET /tracks/:trackId — returns current privacy state */
  getTrackVisibility(trackId: number): Promise<TrackVisibility>;

  /** PUT /tracks/:trackId — update isPrivate field */
  updateTrackVisibility(trackId: number, data: UpdateTrackVisibilityDto): Promise<TrackVisibility>;
}

export class RealTrackVisibilityService implements TrackVisibilityService {
  async getTrackVisibility(trackId: number): Promise<TrackVisibility> {
    const res = await fetch(getApiUrl(API_ENDPOINTS.TRACKS.BY_ID(trackId)), {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch track visibility');
    return res.json();
  }

  async updateTrackVisibility(
    trackId: number,
    data: UpdateTrackVisibilityDto
  ): Promise<TrackVisibility> {
    const res = await fetch(getApiUrl(API_ENDPOINTS.TRACKS.BY_ID(trackId)), {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update track visibility');
    return res.json();
  }
}