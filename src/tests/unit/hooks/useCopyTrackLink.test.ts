import { act, renderHook } from '@testing-library/react';

import { useCopyTrackLink } from '@/hooks/useCopyTrackLink';
import { buildTrackUrl, buildTrackSecretUrl } from '@/utils/resourcePaths';

jest.mock('@/utils/resourcePaths', () => ({
  buildTrackUrl: jest.fn(),
  buildTrackSecretUrl: jest.fn(),
}));

describe('useCopyTrackLink', () => {
  const originalClipboard = navigator.clipboard;
  const writeText = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.useFakeTimers();
    (buildTrackUrl as jest.Mock).mockImplementation((artist, id) => `https://decibel.test/${artist.toLowerCase().replace(/\s+/g, '')}/${id}`);
    (buildTrackSecretUrl as jest.Mock).mockImplementation((artist, id, token) => `https://decibel.test/${artist.toLowerCase().replace(/\s+/g, '')}/${id}?token=${token}`);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
  });

  it('copies a private track URL using artist slug and secret token', async () => {
    const { result } = renderHook(() =>
      useCopyTrackLink({
        trackId: 42,
        isPrivate: true,
        secretToken: 'abc123',
        artistName: 'DJ Nova',
      })
    );

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(writeText).toHaveBeenCalledWith('https://decibel.test/djnova/42?token=abc123');
    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('does nothing for private tracks when no secret token is available', async () => {
    const { result } = renderHook(() =>
      useCopyTrackLink({
        trackId: 'x',
        isPrivate: true,
        secretToken: null,
        artistName: 'Artist',
      })
    );

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(writeText).not.toHaveBeenCalled();
  });

  it('copies public track URL for non-private tracks', async () => {
    const { result } = renderHook(() =>
      useCopyTrackLink({
        trackId: 99,
        isPrivate: false,
        secretToken: null,
        artistName: 'Space Kid',
      })
    );

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(writeText).toHaveBeenCalledWith('https://decibel.test/spacekid/99');
  });

  it('does nothing when no copyable URL can be formed', async () => {
    const { result } = renderHook(() =>
      useCopyTrackLink({
        trackId: 1,
        isPrivate: false,
        secretToken: null,
      })
    );

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(writeText).not.toHaveBeenCalled();
    expect(result.current.copied).toBe(false);
  });
});
