import { apiRequest } from '@/hooks/useAPI';
import type { UploadTrackService } from '@/types';
import { API_CONTRACTS } from '@/types/apiContracts';

export const uploadTrack: UploadTrackService = (
  formData: FormData,
  token: string,
  onProgress: (progress: number) => void
) => {
  return apiRequest(API_CONTRACTS.TRACKS_UPLOAD, {
    payload: formData,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      if (!event.total) {
        return;
      }
      const progress = Math.round((event.loaded / event.total) * 100);
      onProgress(progress);
    },
  });
};
