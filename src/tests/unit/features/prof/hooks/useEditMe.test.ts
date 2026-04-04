import { act, renderHook, waitFor } from '@testing-library/react';

import { useEditMe } from '@/features/prof/hooks/useEditMe';
import { authService, userService } from '@/services';

jest.mock('@/services', () => ({
  authService: {
    getSession: jest.fn(),
  },
  userService: {
    updateMe: jest.fn(),
  },
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockUserService = userService as jest.Mocked<typeof userService>;

describe('useEditMe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the current profile when token is available', async () => {
    mockAuthService.getSession.mockResolvedValue({ accessToken: 'token' } as any);
    mockUserService.updateMe.mockResolvedValue({ username: 'updated' } as any);

    const { result } = renderHook(() => useEditMe());

    let response: unknown;
    await act(async () => {
      response = await result.current.editMe({ city: 'Lagos' } as any);
    });

    expect(mockUserService.updateMe).toHaveBeenCalledWith(
      expect.objectContaining({ city: 'Lagos' })
    );
    expect(response).toEqual(expect.objectContaining({ username: 'updated' }));
    expect(result.current.error).toBeNull();
    expect(result.current.isUpdating).toBe(false);
  });

  it('stores missing-token error and rethrows when no access token exists', async () => {
    mockAuthService.getSession.mockResolvedValue({} as any);

    const { result } = renderHook(() => useEditMe());

    await act(async () => {
      await expect(result.current.editMe({ city: 'Berlin' } as any)).rejects.toThrow(
        'Missing access token'
      );
    });

    await waitFor(() =>
      expect(result.current.error).toBe('Missing access token')
    );
    expect(result.current.isUpdating).toBe(false);
  });

  it('falls back to generic error message for non-Error throwables', async () => {
    mockAuthService.getSession.mockRejectedValue('bad-data');

    const { result } = renderHook(() => useEditMe());

    await act(async () => {
      await expect(result.current.editMe({ bio: 'bio' } as any)).rejects.toBe(
        'bad-data'
      );
    });

    await waitFor(() =>
      expect(result.current.error).toBe('Failed to update user profile')
    );
    expect(mockUserService.updateMe).not.toHaveBeenCalled();
    expect(result.current.isUpdating).toBe(false);
  });
});
