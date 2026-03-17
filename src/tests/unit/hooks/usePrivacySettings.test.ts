import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import { privacyService } from '@/services';

jest.mock('@/services', () => ({
  privacyService: {
    getPrivacySettings: jest.fn(),
    updatePrivacySettings: jest.fn(),
  },
}));

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, { client }, children);
  return Wrapper;
};

describe('usePrivacySettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches settings and exposes them', async () => {
    (privacyService.getPrivacySettings as jest.Mock).mockResolvedValue({
      isPrivate: false,
      showHistory: true,
    });

    const { result } = renderHook(() => usePrivacySettings(), {
      wrapper: createWrapper(),
    });

    // Wait until loading is done
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.settings).toEqual({
      isPrivate: false,
      showHistory: true,
    });
    expect(result.current.isError).toBe(false);
  });

  it('allows updating a single field', async () => {
    (privacyService.getPrivacySettings as jest.Mock)
      .mockResolvedValueOnce({ isPrivate: false, showHistory: true }) // initial fetch
      .mockResolvedValueOnce({ isPrivate: true,  showHistory: true }); // after invalidation refetch

    (privacyService.updatePrivacySettings as jest.Mock).mockResolvedValue({
      isPrivate: true,
      showHistory: true,
    });

    const { result } = renderHook(() => usePrivacySettings(), {
      wrapper: createWrapper(),
    });

    // Wait for initial load
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateSetting({ isPrivate: true });
    });

    await waitFor(() => expect(result.current.isUpdating).toBe(false));

    expect(privacyService.updatePrivacySettings).toHaveBeenCalledWith({
      isPrivate: true,
    });
    expect(result.current.settings?.isPrivate).toBe(true);
  });
});