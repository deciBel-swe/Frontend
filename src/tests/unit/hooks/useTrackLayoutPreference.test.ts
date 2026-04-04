import { act, renderHook } from '@testing-library/react';

import { useTrackLayoutPreference } from '@/hooks/useTrackLayoutPreference';

describe('useTrackLayoutPreference', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('uses compact as default layout', () => {
    const { result } = renderHook(() => useTrackLayoutPreference());

    expect(result.current.layout).toBe('compact');
    expect(result.current.isCompact).toBe(true);
  });

  it('hydrates layout from localStorage', () => {
    window.localStorage.setItem('you.track-layout.preference', 'non-compact');

    const { result } = renderHook(() => useTrackLayoutPreference());

    expect(result.current.layout).toBe('non-compact');
    expect(result.current.isCompact).toBe(false);
  });

  it('updates layout and persists to localStorage', () => {
    const { result } = renderHook(() => useTrackLayoutPreference('compact'));

    act(() => {
      result.current.setLayout('non-compact');
    });

    expect(result.current.layout).toBe('non-compact');
    expect(window.localStorage.getItem('you.track-layout.preference')).toBe(
      'non-compact'
    );
  });
});
