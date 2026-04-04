import { render, screen, waitFor } from '@testing-library/react';

import {
  ProfileOwnerProvider,
  useProfileOwnerContext,
} from '@/features/prof/context/ProfileOwnerContext';
import { useAuth } from '@/features/auth';
import { normalizeApiError } from '@/hooks/useAPI';
import { authService, userService } from '@/services';

jest.mock('@/features/auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useAPI', () => ({
  normalizeApiError: jest.fn(),
}));

jest.mock('@/services', () => ({
  authService: {
    getSession: jest.fn(),
  },
  userService: {
    getPublicUserByUsername: jest.fn(),
    getUserMe: jest.fn(),
  },
}));

const mockUseAuth = useAuth as jest.Mock;
const mockNormalizeApiError = normalizeApiError as jest.Mock;
const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockUserService = userService as jest.Mocked<typeof userService>;

function ContextProbe() {
  const value = useProfileOwnerContext();

  return (
    <div>
      <div data-testid="route-username">{value?.routeUsername ?? ''}</div>
      <div data-testid="is-owner">{String(value?.isOwner ?? false)}</div>
      <div data-testid="public-loading">
        {String(value?.isPublicLoading ?? false)}
      </div>
      <div data-testid="public-username">
        {value?.publicUser?.profile?.username ?? ''}
      </div>
      <div data-testid="public-error">{value?.publicError ?? ''}</div>
      <div data-testid="public-status-code">
        {value?.publicErrorStatusCode == null
          ? ''
          : String(value.publicErrorStatusCode)}
      </div>
      <div data-testid="owner-loading">{String(value?.isOwnerLoading ?? false)}</div>
      <div data-testid="owner-username">{value?.ownerUser?.username ?? ''}</div>
      <div data-testid="owner-error">{value?.ownerError ?? ''}</div>
    </div>
  );
}

const renderWithProvider = (username: string) =>
  render(
    <ProfileOwnerProvider username={username}>
      <ContextProbe />
    </ProfileOwnerProvider>
  );

describe('ProfileOwnerContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });
    mockNormalizeApiError.mockReturnValue({ statusCode: 500, message: 'error' });
  });

  it('loads both public user and owner user when viewer owns the route profile', async () => {
    mockUseAuth.mockReturnValue({
      user: { username: 'Artist' },
      isLoading: false,
    });
    mockUserService.getPublicUserByUsername.mockResolvedValue({
      profile: { id: 25, username: 'artist' },
    } as any);
    mockAuthService.getSession.mockResolvedValue({ accessToken: 'token' } as any);
    mockUserService.getUserMe.mockResolvedValue({ username: 'Artist' } as any);

    renderWithProvider('artist');

    await waitFor(() =>
      expect(screen.getByTestId('owner-username')).toHaveTextContent('Artist')
    );

    expect(screen.getByTestId('is-owner')).toHaveTextContent('true');
    expect(screen.getByTestId('public-username')).toHaveTextContent('artist');
    expect(mockUserService.getPublicUserByUsername).toHaveBeenCalledWith('artist');
    expect(mockAuthService.getSession).toHaveBeenCalledTimes(1);
    expect(mockUserService.getUserMe).toHaveBeenCalledTimes(1);
  });

  it('does not load owner data when route profile belongs to another user', async () => {
    mockUseAuth.mockReturnValue({
      user: { username: 'someone-else' },
      isLoading: false,
    });
    mockUserService.getPublicUserByUsername.mockResolvedValue({
      profile: { id: 30, username: 'artist' },
    } as any);

    renderWithProvider('artist');

    await waitFor(() =>
      expect(screen.getByTestId('public-username')).toHaveTextContent('artist')
    );

    expect(screen.getByTestId('is-owner')).toHaveTextContent('false');
    expect(screen.getByTestId('owner-username').textContent).toBe('');
    expect(mockAuthService.getSession).not.toHaveBeenCalled();
    expect(mockUserService.getUserMe).not.toHaveBeenCalled();
  });

  it('skips public lookup when provided route username is empty', async () => {
    renderWithProvider('   ');

    await waitFor(() =>
      expect(screen.getByTestId('public-loading')).toHaveTextContent('false')
    );

    expect(mockUserService.getPublicUserByUsername).not.toHaveBeenCalled();
    expect(screen.getByTestId('public-error').textContent).toBe('');
    expect(screen.getByTestId('public-status-code').textContent).toBe('');
  });

  it('normalizes public lookup failures into message and status code', async () => {
    mockUserService.getPublicUserByUsername.mockRejectedValue(new Error('not-found'));
    mockNormalizeApiError.mockReturnValue({
      statusCode: 404,
      message: 'not found',
    });

    renderWithProvider('ghost-user');

    await waitFor(() =>
      expect(screen.getByTestId('public-error')).toHaveTextContent(
        'Failed to fetch user'
      )
    );

    expect(screen.getByTestId('public-status-code')).toHaveTextContent('404');
  });
});
