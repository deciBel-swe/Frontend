'use client';

/**
 * TopNavBar
 *
 *  - Left:   Logo (icon + wordmark) + primary nav (Home, Feed, Library)
 *  - Middle: Search bar with submit button
 *  - Right:  Upgrade · User avatar + caret · Notifications · Messages · More (···)
 *            — or Sign in / Create account when unauthenticated.
 *
 * Reads auth state directly via useAuth — no user props required.
 *
 * @example
 * // Authenticated or guest — no props needed
 * <TopNavBar onSearch={(q) => router.push(`/search?q=${q}`)} />
 */

import { type FC } from 'react';
import Link from 'next/link';

import { Button } from '@/components/buttons/Button';
import { useTopNavBar } from './useTopNavBar';
import { Avatar } from '@/components/nav/Avatar';
import { Badge } from '@/components/nav/Badge';
import { DropdownMenu } from '@/components/nav/DropdownMenu';
import { IconButton } from '@/components/buttons/IconButton';
import { NavLink } from '@/components/nav/NavLink';
import { SearchBar } from '@/components/nav/SearchBar';
import {
  BellIcon,
  ChevronDownIcon,
  DotsIcon,
  LogoIcon,
  MailIcon,
} from '@/components/icons/NavIcons';
import {
  CheckoutIcon,
  FollowingIcon,
  LikesIcon,
  PeopleIcon,
  ProfileIcon,
  SettingsIcon,
  SignOutIcon,
  StationsIcon,
  TracksIcon,
} from '@/components/icons/DropdownIcons';
import {
  NAV_LINKS,
  PROTECTED_ROUTES,
  ROUTES,
  USER_DROPDOWN_ITEMS,
  MORE_DROPDOWN_ITEMS,
} from '@/constants/routes';
// ─── Types ────────────────────────────────────────────────────────────────────

export interface TopNavBarProps {
  onSearch?: (query: string) => void;
}

const isProtectedRoute = (href: string): boolean =>
  (PROTECTED_ROUTES as readonly string[]).some(
    (route) => href === route || href.startsWith(`${route}/`)
  );

const shouldPrefetch = (
  href: string,
  isAuthenticated: boolean,
  isAuthLoading: boolean
): boolean => {
  if (!isProtectedRoute(href)) return true;
  return isAuthenticated && !isAuthLoading;
};

// ─── TopNavBar ────────────────────────────────────────────────────────────────

export const TopNavBar: FC<TopNavBarProps> = ({ onSearch }) => {
  const {
    user,
    isAuthenticated,
    isAuthLoading,
    isMounted,
    login,
    userMenuOpen,
    toggleUserMenu,
    closeUserMenu,
    userMenuRef,
    moreMenuOpen,
    toggleMoreMenu,
    closeMoreMenu,
    moreMenuRef,
    initials,
    activeNav,
  } = useTopNavBar();
  return (
    <header className="font-sans text-sm text-text-primary font-extrabold">
       <div className="fixed top-0 left-15 right-15 z-200 h-12 bg-bg-base border-b border-border-default">
        {!isMounted ? (
          <div aria-hidden />
        ) : (
          <div className="mx-2 flex flex-row w-full h-full">
            {/* ── LEFT ──────────────────────────────────────────────── */}
            <div className="flex items-center w-fit h-full">
              <Link
                href={ROUTES.HOME}
                title="Home"
                aria-label="Decibel"
                className="h-full pr-2 shrink-0 no-underline flex items-center text-text-primary"
              >
                <LogoIcon />
              </Link>

              <nav role="navigation" aria-label="Main navigation">
                <ul className="flex items-center h-full w-fit list-none">
                  {NAV_LINKS.map(({ label, href, name }) => (
                    <li key={name} className="h-12 flex">
                      <NavLink
                        href={href}
                        label={label}
                        isActive={activeNav === name}
                        prefetch={shouldPrefetch(
                          href,
                          isAuthenticated,
                          isAuthLoading
                        )}
                        className=""
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* ── MIDDLE ────────────────────────────────────────────── */}
            <div className="flex justify-center px-2 xl:w-full lg:min-w-100 min-w-32 h-full">
              <SearchBar onSearch={onSearch} />
            </div>

            {/* ── RIGHT ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-0.5 h-full w-fit shrink-0">
              {isAuthenticated && user ? (
                <>
                  <Button
                    type="button"
                    variant="premium"
                    size="sm"
                    className="mr-0.5 px-2.5"
                  >
                    Upgrade now
                  </Button>
                  {/* Avatar + dropdown */}
                  <div
                    className="relative h-12 flex items-center"
                    ref={userMenuRef}
                  >
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      aria-haspopup="true"
                      aria-expanded={userMenuOpen}
                      aria-label="Account menu"
                      onClick={toggleUserMenu}
                      className="h-12 px-1 gap-0.5 rounded-none border-0 bg-transparent text-text-secondary hover:text-text-primary hover:bg-transparent"
                    >
                      <Avatar
                        src={user.profileUrl}
                        alt={user.username}
                        initials={initials}
                      />
                      <ChevronDownIcon open={userMenuOpen} />
                    </Button>

                    {userMenuOpen && (
                      <DropdownMenu
                        items={[
                          {
                            label: 'Profile',
                            href: `/${user.username}`,
                            icon: <ProfileIcon />,
                          },
                          {
                            label: 'Tracks',
                            href: `/${user.username}/tracks`,
                            icon: <TracksIcon />,
                          },
                          null,
                          ...USER_DROPDOWN_ITEMS.map((item) =>
                            item === null
                              ? null
                              : {
                                  ...item,
                                  icon:
                                    item.label === 'Likes' ? (
                                      <LikesIcon />
                                    ) : item.label === 'Stations' ? (
                                      <StationsIcon />
                                    ) : item.label === 'Following' ? (
                                      <FollowingIcon />
                                    ) : item.label === 'Who to Follow' ? (
                                      <PeopleIcon />
                                    ) : item.label === 'Subscription' ? (
                                      <CheckoutIcon />
                                    ) : undefined,
                                }
                          ),
                        ]}
                        onClose={closeUserMenu}
                      />
                    )}
                  </div>

                  <IconButton
                    href={ROUTES.NOTIFICATIONS}
                    aria-label="Notifications"
                    prefetch={shouldPrefetch(
                      ROUTES.NOTIFICATIONS,
                      isAuthenticated,
                      isAuthLoading
                    )}
                  >
                    <BellIcon />
                    <Badge count={0} />
                    <span className="sr-only">Notifications</span>
                  </IconButton>

                  <IconButton
                    href={ROUTES.MESSAGES}
                    aria-label="Messages"
                    prefetch={shouldPrefetch(
                      ROUTES.MESSAGES,
                      isAuthenticated,
                      isAuthLoading
                    )}
                  >
                    <MailIcon />
                    <Badge count={11} />
                    <span className="sr-only">Messages</span>
                  </IconButton>

                  <div
                    className="relative h-12 flex items-center"
                    ref={moreMenuRef}
                  >
                    <IconButton
                      aria-label="Settings and more"
                      onClick={toggleMoreMenu}
                    >
                      <DotsIcon />
                      <span className="sr-only">Settings and more</span>
                    </IconButton>

                    {moreMenuOpen && (
                      <DropdownMenu
                        items={MORE_DROPDOWN_ITEMS.map((item) =>
                          item === null
                            ? null
                            : {
                                ...item,
                                icon:
                                  item.label === 'Settings' ? (
                                    <SettingsIcon />
                                  ) : item.label === 'Subscription' ? (
                                    <CheckoutIcon />
                                  ) : item.label === 'Sign out' ? (
                                    <SignOutIcon />
                                  ) : undefined,
                              }
                        )}
                        onClose={closeMoreMenu}
                      />
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isAuthLoading}
                    onClick={() => {
                      login('artist@decibel.test', 'x');
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="ml-1"
                  >
                    Create account
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopNavBar;
