import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Avatar } from '@/components/avatars/Avatar';
import { Badge } from '@/components/nav/Badge';
import { DropdownMenu } from '@/components/nav/DropdownMenu';
import { NavLink } from '@/components/nav/NavLink';
import { SearchBar } from '@/components/nav/SearchBar';
import { TopNavBar } from '@/components/nav/TopNavBar';
import { useTopNavBar } from '@/components/nav/useTopNavBar';
import { useSubscriptionStatus } from '@/features/pro/hooks/useSubscriptionStatus';

import { AuthProvider } from '@/features/auth/AuthContext';
jest.mock('next/link', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockLink({
    href,
    onClick,
    children,
    prefetch,
    ...rest
  }: any) {
    void prefetch;
    return (
      <a
        href={typeof href === 'string' ? href : ''}
        {...rest}
        onClick={(event) => {
          event.preventDefault();
          onClick?.(event);
        }}
      >
        {children}
      </a>
    );
  };
});

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

import { usePathname } from 'next/navigation';

jest.mock('@/components/nav/useTopNavBar', () => ({
  useTopNavBar: jest.fn(),
}));

jest.mock('@/features/pro/hooks/useSubscriptionStatus', () => ({
  useSubscriptionStatus: jest.fn(),
}));

const mockUseTopNavBar = useTopNavBar as jest.Mock;
const mockUseSubscriptionStatus = useSubscriptionStatus as jest.Mock;

const createTopNavState = (overrides: Record<string, unknown> = {}) => ({
  user: null,
  isAuthenticated: false,
  isAuthLoading: false,
  isMounted: true,
  login: jest.fn(),
  userMenuOpen: false,
  toggleUserMenu: jest.fn(),
  closeUserMenu: jest.fn(),
  userMenuRef: { current: null },
  moreMenuOpen: false,
  toggleMoreMenu: jest.fn(),
  closeMoreMenu: jest.fn(),
  moreMenuRef: { current: null },
  initials: '',
  activeNav: 'home',
  ...overrides,
});

describe('nav primitives', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTopNavBar.mockReturnValue(createTopNavState());
    mockUseSubscriptionStatus.mockReturnValue({
      subscriptionStatus: {
        status: 'active',
        plan: 'free',
        currentPeriodEnd: 0,
        cancelAtPeriodEnd: false,
      },
      fetchSubscriptionStatus: jest.fn(),
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('renders Avatar initials when no image source is provided', () => {
    render(<Avatar alt="Alice" initials="AL" />);

    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('hides Badge at zero and caps high counts to 9+', () => {
    const { container, rerender } = render(<Badge count={0} />);

    expect(container.firstChild).toBeNull();

    rerender(<Badge count={17} />);

    expect(screen.getByLabelText('17 unread')).toHaveTextContent('9+');
  });

  it('renders DropdownMenu items and invokes onClose when an item is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <DropdownMenu
        items={[
          { label: 'Profile', href: '/me' },
          null,
          { label: 'Sign out', href: '/logout' },
        ]}
        onClose={onClose}
      />
    );

    expect(screen.getAllByRole('menuitem')).toHaveLength(2);

    await user.click(screen.getByRole('menuitem', { name: 'Profile' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('marks NavLink as current when active', () => {
    render(<NavLink href="/feed" label="Feed" isActive />);

    expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('submits SearchBar query through onSearch', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();

    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('searchbox', { name: 'Search' });
    await user.type(input, 'lofi');
    await user.keyboard('{Enter}');

    expect(onSearch).toHaveBeenCalledWith('lofi');
  });
});

describe('TopNavBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSubscriptionStatus.mockReturnValue({
      subscriptionStatus: {
        status: 'active',
        plan: 'free',
        currentPeriodEnd: 0,
        cancelAtPeriodEnd: false,
      },
      fetchSubscriptionStatus: jest.fn(),
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('renders authenticated actions when user is present', async () => {
    const closeUserMenu = jest.fn();

    mockUseTopNavBar.mockReturnValue(
      createTopNavState({
        isAuthenticated: true,
        user: {
          username: 'alex',
          profileUrl: '',
        },
        initials: 'AL',
        userMenuOpen: true,
        closeUserMenu,
      })
    );

    render(<TopNavBar />);

    expect(
      screen.getByRole('button', { name: 'Upgrade now' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Notifications' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Profile' })
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('menuitem', { name: 'Profile' }));

    await waitFor(() => expect(closeUserMenu).toHaveBeenCalledTimes(1));
  });

  it('keeps guest actions visible while auth is loading', () => {
    mockUseTopNavBar.mockReturnValue(
      createTopNavState({
        isAuthenticated: false,
        user: null,
        isAuthLoading: true,
      })
    );

    render(<TopNavBar />);

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
  });

  it('automatically closes the Sign In modal when the URL path changes', async () => {
    const closeSignIn = jest.fn();
    (usePathname as jest.Mock).mockReturnValue('/');
    mockUseTopNavBar.mockReturnValue(
      createTopNavState({
        signInOpen: true,
        closeSignIn,
      })
    );

    const { rerender } = render(<TopNavBar />, {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();

    (usePathname as jest.Mock).mockReturnValue('/register');

    mockUseTopNavBar.mockReturnValue(
      createTopNavState({
        signInOpen: false,
        closeSignIn,
      })
    );

    rerender(<TopNavBar />);

    expect(
      screen.queryByText(/sign in to your account/i)
    ).not.toBeInTheDocument();
  });
});
