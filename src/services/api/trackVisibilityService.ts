import type { TrackService } from '@/services/api/trackService';
import { RealTrackService } from '@/services/api/trackService';
import type {
  SecretLink,
  TrackMetaData,
  TrackVisibility,
  UpdateTrackVisibilityDto,
} from '@/types/tracks';

export interface TrackVisibilityService {
  /** GET /tracks/:trackId — normalized track metadata */
  getTrackMetadata(trackId: number): Promise<TrackMetaData>;

  /** GET /tracks/:trackId — returns current privacy state */
  getTrackVisibility(trackId: number): Promise<TrackVisibility>;

  /** PATCH /tracks/:trackId — update isPrivate field */
  updateTrackVisibility(trackId: number, data: UpdateTrackVisibilityDto): Promise<TrackVisibility>;

  /** GET /tracks/:trackId/secret-token — fetch current secret link token */
  getSecretLink(trackId: string): Promise<SecretLink>;
 
  /** POST /tracks/:trackId/generate-token — invalidate old token, generate new one */
  regenerateSecretLink(trackId: string): Promise<SecretLink>;
}

export class RealTrackVisibilityService implements TrackVisibilityService {
  constructor(private readonly trackService: TrackService = new RealTrackService()) {}

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