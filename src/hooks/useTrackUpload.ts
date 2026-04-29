import { useState } from 'react';
import { trackService } from '@/services';

const FREE_TRACK_LIMIT_ERROR = 'out of free tracks';

const getUploadErrorMessage = (err: unknown): string => {
  if (err instanceof Error && err.message.trim().length > 0) {
    if (err.message.toLowerCase().includes(FREE_TRACK_LIMIT_ERROR)) {
      return 'Free upload limit reached. Use Blocked or upgrade.';
    }

    return err.message;
  }

  return 'Upload failed';
};

export function useTrackUpload() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    'idle' | 'uploading' | 'error' | 'complete'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);

  const startUpload = async (formData: FormData) => {
    try {
      setStatus('uploading');
      setProgress(0);
      setError(null);

      const response = await trackService.uploadTrack(formData, setProgress);

      setStatus('complete');

      return response;
    } catch (err) {
      setStatus('error');
      setError(getUploadErrorMessage(err));
    }
  };

  const retryUpload = (formData: FormData) => {
    return startUpload(formData);
  };

  return {
    progress,
    status,
    error,
    file,
    setFile,
    startUpload,
    retryUpload,
  };
}
