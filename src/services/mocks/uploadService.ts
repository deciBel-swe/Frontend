import { MockTrackService } from '@/services/mocks/trackService';
import type { UploadTrackService } from '@/types';

const mockTrackService = new MockTrackService();

export const uploadTrackMock: UploadTrackService = (
  formData: FormData,
  token: string,
  onProgress: (progress: number) => void
)=>
  mockTrackService.uploadTrack(formData, token, onProgress);