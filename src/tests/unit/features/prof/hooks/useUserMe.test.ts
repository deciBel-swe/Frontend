import { renderHook, waitFor } from '@testing-library/react';

import { useUserMe } from '@/features/prof/hooks/useUserMe';
import { authService, userService } from '@/services';

jest.mock('@/services', () => ({
  authService: {
    getSession: jest.fn(),
  },
  userService: {
    getUserMe: jest.fn(),
  },
}));

jest.mock('@/services/index', () => ({
  authService: {
    getSession: jest.fn(),
  },
  userService: {
    getUserMe: jest.fn(),
  },
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockUserService = userService as jest.Mocked<typeof userService>;

describe('useUserMe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null user when there is no session token', async () => {
    mockAuthService.getSession.mockResolvedValue(null as any);

    const { result } = renderHook(() => useUserMe());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockUserService.getUserMe).not.toHaveBeenCalled();
  });

  it('loads current user data when session token exists', async () => {
    mockAuthService.getSession.mockResolvedValue({ accessToken: 'token' } as any);
    mockUserService.getUserMe.mockResolvedValue({
      id: 5,
      username: 'artist',
      email: 'artist@test.com',
    } as any);

    const { result } = renderHook(() => useUserMe());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockUserService.getUserMe).toHaveBeenCalledTimes(1);
    expect(result.current.user).toEqual(
      expect.objectContaining({ username: 'artist' })
    );
    expect(result.current.error).toBeNull();
  });

  it('returns an error when fetching current user fails', async () => {
    mockAuthService.getSession.mockResolvedValue({ accessToken: 'token' } as any);
    mockUserService.getUserMe.mockRejectedValue(new Error('request failed'));

    const { result } = renderHook(() => useUserMe());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Failed to fetch current user data');
  });
});
