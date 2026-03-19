import type { TrackVisibilityService } from '@/services/api/trackVisibilityService';
import type { TrackService } from '@/services/api/trackService';
import { MockTrackService } from '@/services/mocks/trackService';
import type {
  SecretLink,
  TrackMetaData,
  TrackVisibility,
  UpdateTrackVisibilityDto,
} from '@/types/tracks';

export class MockTrackVisibilityService implements TrackVisibilityService {
  constructor(private readonly trackService: TrackService = new MockTrackService()) {}

  async getTrackMetadata(trackId: number): Promise<TrackMetaData> {
    return this.trackService.getTrackMetadata(trackId);
  }

  async getTrackVisibility(trackId: number): Promise<TrackVisibility> {
    return this.trackService.getTrackVisibility(trackId);
  }

  async updateTrackVisibility(
    trackId: number,
    data: UpdateTrackVisibilityDto
  ): Promise<TrackVisibility> {
    return this.trackService.updateTrackVisibility(trackId, data);
  }

  async getSecretLink(trackId: string): Promise<SecretLink> {
    return this.trackService.getSecretLink(trackId);
  }

  async regenerateSecretLink(trackId: string): Promise<SecretLink> {
    return this.trackService.regenerateSecretLink(trackId);
  }
}