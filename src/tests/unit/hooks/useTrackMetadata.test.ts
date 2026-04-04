import { renderHook, waitFor } from '@testing-library/react';

import { useTrackMetadata } from '@/hooks/useTrackMetaData';
import { trackService } from '@/services';

jest.mock('@/services', () => ({
  trackService: {
    getTrackMetadata: jest.fn(),
  },
}));

const mockTrackService = trackService as jest.Mocked<typeof trackService>;

describe('useTrackMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips loading when trackId is undefined', async () => {
    const { result } = renderHook(() => useTrackMetadata(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.metadata).toBeNull();
    expect(result.current.isError).toBe(false);
    expect(mockTrackService.getTrackMetadata).not.toHaveBeenCalled();
  });

  it('loads metadata for a valid track id', async () => {
    mockTrackService.getTrackMetadata.mockResolvedValue({
      id: 42,
      title: 'Meta',
      trackUrl: 'https://meta.mp3',
    } as any);

    const { result } = renderHook(() => useTrackMetadata(42));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.metadata).toEqual(
      expect.objectContaining({ id: 42, title: 'Meta' })
    );
    expect(result.current.isError).toBe(false);
  });

  it('sets error when metadata fetch fails', async () => {
    mockTrackService.getTrackMetadata.mockRejectedValue(new Error('nope'));

    const { result } = renderHook(() => useTrackMetadata(77));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
  });
});
