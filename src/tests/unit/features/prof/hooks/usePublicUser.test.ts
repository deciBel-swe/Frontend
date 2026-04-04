import { renderHook, waitFor } from '@testing-library/react';

import { useProfileOwnerContext } from '@/features/prof/context/ProfileOwnerContext';
import { usePublicUser } from '@/features/prof/hooks/usePublicUser';
import { userService } from '@/services/index';

jest.mock('@/services/index', () => ({
  userService: {
    getPublicUserByUsername: jest.fn(),
  },
}));

jest.mock('@/features/prof/context/ProfileOwnerContext', () => ({
  useProfileOwnerContext: jest.fn(),
}));

const mockUserService = userService as jest.Mocked<typeof userService>;
const mockUseProfileOwnerContext = useProfileOwnerContext as jest.Mock;

describe('usePublicUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProfileOwnerContext.mockReturnValue(undefined);
  });

  it('uses profile owner context when route username matches', () => {
    const contextUser = { profile: { id: 12, username: 'artist one' } } as any;

    mockUseProfileOwnerContext.mockReturnValue({
      routeUsername: 'Artist%20One',
      publicUser: contextUser,
      isPublicLoading: true,
      publicError: 'context-error',
    });

    const { result } = renderHook(() => usePublicUser(' artist one '));

    expect(mockUserService.getPublicUserByUsername).not.toHaveBeenCalled();
    expect(result.current.data).toBe(contextUser);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe('context-error');
  });

  it('fetches user data for unmanaged route usernames', async () => {
    mockUserService.getPublicUserByUsername.mockResolvedValue({
      profile: { id: 44, username: 'remote-user' },
    } as any);

    const { result } = renderHook(() => usePublicUser('remote-user'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockUserService.getPublicUserByUsername).toHaveBeenCalledWith(
      'remote-user'
    );
    expect(result.current.data).toEqual(
      expect.objectContaining({
        profile: expect.objectContaining({ id: 44 }),
      })
    );
    expect(result.current.error).toBeNull();
  });

  it('clears data and skips fetch when username is empty after trim', async () => {
    mockUserService.getPublicUserByUsername.mockResolvedValue({
      profile: { id: 77 },
    } as any);

    const { result, rerender } = renderHook(
      ({ username }) => usePublicUser(username),
      { initialProps: { username: 'artist' } }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ username: '   ' });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockUserService.getPublicUserByUsername).toHaveBeenCalledTimes(1);
  });

  it('returns an error message when fetch fails', async () => {
    mockUserService.getPublicUserByUsername.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => usePublicUser('ghost'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Failed to fetch user');
  });
});
