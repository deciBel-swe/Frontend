import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useSecretLink } from '@/hooks/useSecretLink';
import { trackService } from '@/services';

jest.mock('@/services', () => ({
  trackService: {
    getSecretLink: jest.fn(),
    regenerateSecretLink: jest.fn(),
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

describe('useSecretLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns formatted secret URL when trackId is provided', async () => {
    (trackService.getSecretLink as jest.Mock).mockResolvedValue({
      secretLink: 'token-abc',
    });

    const { result } = renderHook(() => useSecretLink('42'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(trackService.getSecretLink).toHaveBeenCalledWith('42');
    expect(result.current.secretUrl).toContain('/tracks/42?s=token-abc');
    expect(result.current.secretToken).toBe('token-abc');
  });

  it('does not fetch when trackId is undefined', async () => {
    const { result } = renderHook(() => useSecretLink(undefined), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(trackService.getSecretLink).not.toHaveBeenCalled();
    expect(result.current.secretUrl).toBeNull();
  });

  it('updates URL after regenerate', async () => {
    (trackService.getSecretLink as jest.Mock).mockResolvedValue({
      secretLink: 'old-token',
    });
    (trackService.regenerateSecretLink as jest.Mock).mockResolvedValue({
      secretLink: 'new-token',
    });

    const { result } = renderHook(() => useSecretLink('7'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.secretUrl).toContain('/tracks/7?s=old-token');

    await act(async () => {
      result.current.regenerate();
    });

    await waitFor(() => {
      expect(result.current.secretUrl).toContain('/tracks/7?s=new-token');
    });
  });
});
