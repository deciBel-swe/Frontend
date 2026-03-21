import { useState } from 'react';
import { trackService } from '@/services';

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
      setError('Upload failed');
      console.error('Track upload error:', err);
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
