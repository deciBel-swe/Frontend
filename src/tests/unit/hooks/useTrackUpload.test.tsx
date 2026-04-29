import { act, renderHook } from '@testing-library/react';

import { useTrackUpload } from '@/hooks/useTrackUpload';
import { trackService } from '@/services';

jest.mock('@/services', () => ({
  trackService: {
    uploadTrack: jest.fn(),
  },
}));

describe('useTrackUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates status/progress on successful upload', async () => {
    const response = {
      id: 1,
      title: 'Track',
      trackUrl: 'https://decibel.test/u/track',
      coverUrl: 'https://decibel.test/cover.jpg',
      durationSeconds: 120,
    };

    (trackService.uploadTrack as jest.Mock).mockImplementation(
      async (_formData: FormData, onProgress: (value: number) => void) => {
        onProgress(55);
        onProgress(100);
        return response;
      }
    );

    const { result } = renderHook(() => useTrackUpload());

    const formData = new FormData();

    let uploadResult: unknown;
    await act(async () => {
      uploadResult = await result.current.startUpload(formData);
    });

    expect(trackService.uploadTrack).toHaveBeenCalledWith(
      formData,
      expect.any(Function)
    );
    expect(result.current.progress).toBe(100);
    expect(result.current.status).toBe('complete');
    expect(result.current.error).toBeNull();
    expect(uploadResult).toEqual(response);
  });

  it('sets error state when upload fails', async () => {
    (trackService.uploadTrack as jest.Mock).mockRejectedValue(
      new Error('boom')
    );

    const { result } = renderHook(() => useTrackUpload());

    await act(async () => {
      await result.current.startUpload(new FormData());
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('boom');
  });
});
