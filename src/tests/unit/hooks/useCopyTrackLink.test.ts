import { act, renderHook } from '@testing-library/react';

import { useCopyTrackLink } from '@/hooks/useCopyTrackLink';

describe('useCopyTrackLink', () => {
  const originalClipboard = navigator.clipboard;
  const writeText = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        origin: 'https://decibel.test',
      } as Location,
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
        secretUrl: 'https://api.test/tracks/42?s=abc123',
        artistName: 'DJ Nova',
      })
    );

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(writeText).toHaveBeenCalledWith('https://decibel.test/djnova/42?s=abc123');
    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('falls back to provided secret URL when parsing fails', async () => {
    const { result } = renderHook(() =>
      useCopyTrackLink({
        trackId: 'x',
        isPrivate: true,
        secretUrl: 'not-a-valid-url',
        artistName: 'Artist',
      })
    );

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(writeText).toHaveBeenCalledWith('not-a-valid-url');
  });

  it('copies public track URL for non-private tracks', async () => {
    const { result } = renderHook(() =>
      useCopyTrackLink({
        trackId: 99,
        isPrivate: false,
        secretUrl: null,
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
        secretUrl: null,
      })
    );

    await act(async () => {
      await result.current.handleCopy();
    });

    expect(writeText).not.toHaveBeenCalled();
    expect(result.current.copied).toBe(false);
  });
});
