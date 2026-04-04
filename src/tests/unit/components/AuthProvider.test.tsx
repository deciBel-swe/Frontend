/**
 * AuthProvider Unit Tests
 *
 * Tests the AuthProvider and useAuth hook behaviour using a stubbed authService.
 * The page.tsx dev harness (login as artist / listener / logout buttons) serves
 * as the interaction model for every scenario tested here.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FC } from 'react';

import { AuthProvider } from '@/features/auth/AuthContext';
import { useAuth } from '@/hooks';
import type { LoginResponseDTO, LoginUserDTO } from '@/types';

// ============================================================================
// Stub authService
// ============================================================================

// Hoist the mock so it replaces the module before any import resolves.
jest.mock('@/services', () => ({
  authService: {
    getSession: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    logoutAll: jest.fn(),
    refreshToken: jest.fn(),
  },
}));

// Typed reference to the stub so tests can configure return values.
import { authService } from '@/services';
const mockAuthService = authService as jest.Mocked<typeof authService>;

// ============================================================================
// Test data
// ============================================================================

const artistUser: LoginUserDTO = {
  id: 1,
  username: 'mockartist',
  tier: 'ARTIST',
  avatarUrl: '/images/default_song_image.png',
};
const listenerUser: LoginUserDTO = {
  id: 2,
  username: 'mocklistener',
  tier: 'FREE',
  avatarUrl: '/images/default_song_image.png',
};

const artistSession: LoginResponseDTO = {
  accessToken: 'access.artist.mock',
  user: artistUser,
};

const listenerSession: LoginResponseDTO = {
  accessToken: 'access.listener.mock',
  user: listenerUser,
};

// ============================================================================
// Consumer component
// ============================================================================

const AuthHarness: FC = () => {
  const { login, logout, isAuthenticated, isLoading, role, user } = useAuth();
  if (isLoading) return <p>loading</p>;
  return (
    <div>
      <button onClick={() => login('artist@decibel.test', 'x')}>
        Login as Artist
      </button>
      <button onClick={() => login('listener@decibel.test', 'x')}>
        Login as Listener
      </button>
      <button onClick={logout}>Logout</button>
      {isAuthenticated && <p>logged in as {role}</p>}
      {isAuthenticated && <p>user id: {user?.id}</p>}
      {!isAuthenticated && <p>logged out</p>}
    </div>
  );
};

// Wrap with the provider under test.
const renderHarness = () =>
  render(
    <AuthProvider>
      <AuthHarness />
    </AuthProvider>
  );

// ============================================================================
// Helpers
// ============================================================================

/** Wait until the loading spinner is gone. */
const waitForReady = () =>
  waitFor(() => expect(screen.queryByText('loading')).toBeNull());

/** Click a harness button by accessible name. */
const clickHarnessButton = async (name: string) => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name }));
};

// ============================================================================
// Tests
// ============================================================================

beforeEach(() => {
  jest.clearAllMocks();
  // Default: no existing session.
  mockAuthService.getSession.mockResolvedValue(null);
});

// --------------------------------
// Bootstrap (session restore)
// --------------------------------

describe('bootstrap', () => {
  it('shows loading state while session is being resolved', async () => {
    // Keep getSession pending long enough to assert loading, then resolve to
    // avoid leaving dangling async work after the test ends.
    let resolveSession: (value: LoginResponseDTO | null) => void = () => {};
    const pendingSession = new Promise<LoginResponseDTO | null>((resolve) => {
      resolveSession = resolve;
    });

    mockAuthService.getSession.mockReturnValue(pendingSession);
    const { unmount } = renderHarness();

    expect(screen.getByText('loading')).toBeInTheDocument();

    unmount();
    resolveSession(null);
    await pendingSession;
  });

  it('starts logged out when there is no stored session', async () => {
    mockAuthService.getSession.mockResolvedValue(null);
    renderHarness();
    await waitForReady();
    expect(screen.getByText('logged out')).toBeInTheDocument();
  });

  it('restores an artist session from storage', async () => {
    mockAuthService.getSession.mockResolvedValue(artistSession);
    renderHarness();
    await waitForReady();
    expect(screen.getByText('logged in as artist')).toBeInTheDocument();
    expect(screen.getByText('user id: 1')).toBeInTheDocument();
  });

  it('restores a listener session from storage', async () => {
    mockAuthService.getSession.mockResolvedValue(listenerSession);
    renderHarness();
    await waitForReady();
    expect(screen.getByText('logged in as listener')).toBeInTheDocument();
  });

  it('stays logged out when getSession throws', async () => {
    mockAuthService.getSession.mockRejectedValue(new Error('storage error'));
    renderHarness();
    await waitForReady();
    expect(screen.getByText('logged out')).toBeInTheDocument();
  });
});

// --------------------------------
// Login
// --------------------------------

describe('login', () => {
  it('logs in as artist and derives role from ARTIST tier', async () => {
    mockAuthService.login.mockResolvedValue(artistSession);
    renderHarness();
    await waitForReady();

    await clickHarnessButton('Login as Artist');

    await waitFor(() =>
      expect(mockAuthService.login).toHaveBeenCalledWith(
        'artist@decibel.test',
        'x'
      )
    );
    await waitFor(() =>
      expect(screen.getByText('logged in as artist')).toBeInTheDocument()
    );
  });

  it('logs in as listener and derives role from FREE tier', async () => {
    mockAuthService.login.mockResolvedValue(listenerSession);
    renderHarness();
    await waitForReady();

    await clickHarnessButton('Login as Listener');

    await waitFor(() =>
      expect(mockAuthService.login).toHaveBeenCalledWith(
        'listener@decibel.test',
        'x'
      )
    );
    await waitFor(() =>
      expect(screen.getByText('logged in as listener')).toBeInTheDocument()
    );
  });

  it('exposes isAuthenticated as true after login', async () => {
    mockAuthService.login.mockResolvedValue(artistSession);
    renderHarness();
    await waitForReady();

    await clickHarnessButton('Login as Artist');

    await waitFor(() => expect(screen.queryByText('logged out')).toBeNull());
    await waitFor(() =>
      expect(screen.getByText('logged in as artist')).toBeInTheDocument()
    );
  });

  it('exposes the user object after login', async () => {
    mockAuthService.login.mockResolvedValue(artistSession);
    renderHarness();
    await waitForReady();

    await clickHarnessButton('Login as Artist');

    await waitFor(() =>
      expect(screen.getByText('user id: 1')).toBeInTheDocument()
    );
  });
});

// --------------------------------
// Logout
// --------------------------------

describe('logout', () => {
  it('clears auth state after logout', async () => {
    mockAuthService.getSession.mockResolvedValue(artistSession);
    mockAuthService.logout.mockResolvedValue(undefined);
    renderHarness();
    await waitForReady();

    // Precondition: logged in.
    expect(screen.getByText('logged in as artist')).toBeInTheDocument();

    await clickHarnessButton('Logout');

    await waitFor(() =>
      expect(mockAuthService.logout).toHaveBeenCalledTimes(1)
    );
    await waitFor(() =>
      expect(screen.getByText('logged out')).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.queryByText('logged in as artist')).toBeNull()
    );
  });

  it('sets isAuthenticated to false after logout', async () => {
    mockAuthService.getSession.mockResolvedValue(listenerSession);
    mockAuthService.logout.mockResolvedValue(undefined);
    renderHarness();
    await waitForReady();

    await clickHarnessButton('Logout');

    await waitFor(() =>
      expect(screen.queryByText('logged in as listener')).toBeNull()
    );
  });
});

// --------------------------------
// Role derivation
// --------------------------------

describe('role derivation', () => {
  it('maps ARTIST tier → artist role', async () => {
    mockAuthService.login.mockResolvedValue(artistSession);
    renderHarness();
    await waitForReady();

    await clickHarnessButton('Login as Artist');

    await waitFor(() =>
      expect(screen.getByText('logged in as artist')).toBeInTheDocument()
    );
  });

  it('maps FREE tier → listener role', async () => {
    mockAuthService.login.mockResolvedValue(listenerSession);
    renderHarness();
    await waitForReady();

    await clickHarnessButton('Login as Listener');

    await waitFor(() =>
      expect(screen.getByText('logged in as listener')).toBeInTheDocument()
    );
  });

  it('role is null when logged out', async () => {
    mockAuthService.getSession.mockResolvedValue(null);
    renderHarness();
    await waitForReady();
    // "logged out" means role is null — the conditional in the harness holds.
    expect(screen.getByText('logged out')).toBeInTheDocument();
  });
});

// --------------------------------
// useAuth guard
// --------------------------------

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    // Suppress the expected error output from React.
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => render(<AuthHarness />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );

    consoleError.mockRestore();
  });
});
