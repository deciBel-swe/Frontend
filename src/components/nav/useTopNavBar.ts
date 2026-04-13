
import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname, useRouter  } from 'next/navigation';
import type { ActiveNav } from '@/types';
import { NAV_LINKS, ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth';
import { useRedirectAfterLogin } from '@/hooks';

/**
 * useTopNavBar — manages the user dropdown state, derives activeNav from the URL, and computes initials.
 *
 * Reads the authenticated user directly from AuthContext so TopNavBar
 * has no user-related props.
 */
export function useTopNavBar() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const pathname = usePathname();
  const activeNav = (NAV_LINKS.find(
    ({ href }) => pathname === href || pathname.startsWith(href + '/')
  )?.name ?? null) as ActiveNav | null;
  const userMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useRedirectAfterLogin();
  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node))
        setUserMenuOpen(false);
      if (!moreMenuRef.current?.contains(e.target as Node))
        setMoreMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    //close all modals and drop down menus when changing route
    setSignInOpen(false);
    setRegisterOpen(false);
    setUserMenuOpen(false);
    setMoreMenuOpen(false);
  }, [pathname]);

  const handleSignOut = useCallback(async () => {
    await logout();
    router.push(ROUTES.HOME);
  }, [logout,router]);
 
  const initials = user
    ? user.username
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  const openSignIn = () => {
    if (pathname === '/signin') {
      return;
    }

    setSignInOpen(true);
  };

  const closeSignIn = () => setSignInOpen(false);

  const openRegister = () => {
    if (pathname === '/register') {
      return;
    }

    setRegisterOpen(true);
  };

  const closeRegister = () => setRegisterOpen(false);

  return {
    user,
    isAuthenticated,
    isAuthLoading: isLoading,
    isMounted,
    login,
    handleSignOut,
    userMenuOpen,
    toggleUserMenu: () => setUserMenuOpen((v) => !v),
    closeUserMenu: () => setUserMenuOpen(false),
    userMenuRef,
    moreMenuOpen,
    toggleMoreMenu: () => setMoreMenuOpen((v) => !v),
    closeMoreMenu: () => setMoreMenuOpen(false),
    moreMenuRef,
    initials,
    activeNav,
    signInOpen,
    registerOpen,
    openSignIn,
    closeSignIn,
    openRegister,
    closeRegister,
  };
}
