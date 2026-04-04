import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import { privacyService, userService } from '@/services';

jest.mock('@/services', () => ({
  userService: {
    getUserMe: jest.fn(),
  },
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
    (userService.getUserMe as jest.Mock).mockResolvedValue({
      privacySettings: {
        isPrivate: false,
        showHistory: true,
      },
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

  it('updates settings with full payload', async () => {
    (userService.getUserMe as jest.Mock).mockResolvedValue({
      privacySettings: { isPrivate: false, showHistory: true },
    });

    (privacyService.updatePrivacySettings as jest.Mock).mockResolvedValue({
      isPrivate: true,
      showHistory: false,
    });

    const { result } = renderHook(() => usePrivacySettings(), {
      wrapper: createWrapper(),
    });

    // Wait for initial load
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateSetting({ isPrivate: true, showHistory: false });
    });

    await waitFor(() => expect(result.current.isUpdating).toBe(false));

    expect(privacyService.updatePrivacySettings).toHaveBeenCalledWith({
      isPrivate: true,
      showHistory: false,
    });
    expect(result.current.settings?.isPrivate).toBe(true);
    expect(result.current.settings?.showHistory).toBe(false);
  });
});
