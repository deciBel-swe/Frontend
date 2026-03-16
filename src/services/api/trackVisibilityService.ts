import type { SecretLink, TrackVisibility, UpdateTrackVisibilityDto } from '@/types';
import { API_ENDPOINTS, getApiUrl } from '@/constants/routes';

export interface TrackVisibilityService {
  /** GET /tracks/:trackId — returns current privacy state */
  getTrackVisibility(trackId: number): Promise<TrackVisibility>;

  /** PUT /tracks/:trackId — update isPrivate field */
  updateTrackVisibility(trackId: number, data: UpdateTrackVisibilityDto): Promise<TrackVisibility>;

  /** GET /tracks/:trackId/secret-link — fetch current secret link token */
  getSecretLink(trackId: string): Promise<SecretLink>;
 
  /** GET /tracks/:trackId/regenerate-link — invalidate old token, generate new one */
  regenerateSecretLink(trackId: string): Promise<SecretLink>;
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

  async getSecretLink(trackId: string): Promise<SecretLink> {
    const res = await fetch(getApiUrl(API_ENDPOINTS.TRACKS.SECRET_LINK(trackId)), {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch secret link');
    return res.json();
  }
 
  async regenerateSecretLink(trackId: string): Promise<SecretLink> {
    const res = await fetch(getApiUrl(API_ENDPOINTS.TRACKS.REGENERATE_LINK(trackId)), {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to regenerate secret link');
    return res.json();
  }

}