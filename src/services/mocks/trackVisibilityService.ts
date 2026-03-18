import type { TrackVisibilityService } from '@/services/api/trackVisibilityService';
import type { SecretLink, TrackMetaData, TrackVisibility, UpdateTrackVisibilityDto } from '@/types';

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));
const storageKey = (trackId: number) => `decibel_mock_track_visibility_${trackId}`;
const linkKey     = (trackId: string) => `decibel_mock_secret_link_${trackId}`;

function generateToken(): string {
  return Math.random().toString(36).slice(2, 10);
}

export class MockTrackVisibilityService implements TrackVisibilityService {
  async getTrackMetadata(trackId: number): Promise<TrackMetaData> {
    await delay();
    return {
      id: trackId,
      title: `Mock Track ${trackId}`,
      artist: { id: 1, username: 'mockartist' },
      trackUrl: `http://localhost:3000/tracks/${trackId}`,
      coverUrl: '',
      waveformUrl: '',
      genre: 'Electronic',
      tags: [],
    };
  }

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
    // Auto-generate token when setting private for the first time
    if (data.isPrivate && !localStorage.getItem(linkKey(String(trackId)))) {
      localStorage.setItem(linkKey(String(trackId)), generateToken());
    }
    return updated;
  }
 
  async getSecretLink(trackId: string): Promise<SecretLink> {
    await delay();
    let token = localStorage.getItem(linkKey(trackId));
    if (!token) {
      token = generateToken();
      localStorage.setItem(linkKey(trackId), token);
    }
    return { secretLink: token };
  }
 
  async regenerateSecretLink(trackId: string): Promise<SecretLink> {
    await delay();
    const token = generateToken();
    localStorage.setItem(linkKey(trackId), token);
    return { secretLink: token };
  }
}