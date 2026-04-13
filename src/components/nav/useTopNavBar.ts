import { useState, useRef, useEffect } from 'react';
import { usePathname  } from 'next/navigation';
import type { ActiveNav } from '@/types';
import { NAV_LINKS } from '@/constants/routes';
import { useAuth } from '@/features/auth';
import { useRedirectAfterLogin } from '@/hooks';
import { useUpgradeModal } from '@/features/pro/hooks/useUpgradeModal';

/**
 * useTopNavBar — manages the user dropdown state, derives activeNav from the URL, and computes initials.
 *
 * Reads the authenticated user directly from AuthContext so TopNavBar
 * has no user-related props.
 */
export function useTopNavBar() {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [messagesMenuOpen, setMessagesMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const { upgradeOpen, openUpgrade, closeUpgrade } = useUpgradeModal();
  const pathname = usePathname();
  const activeNav = (NAV_LINKS.find(
    ({ href }) => pathname === href || pathname.startsWith(href + '/')
  )?.name ?? null) as ActiveNav | null;
  const userMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const messagesMenuRef = useRef<HTMLDivElement>(null);
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
      if (!messagesMenuRef.current?.contains(e.target as Node))
        setMessagesMenuOpen(false);
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
    setMessagesMenuOpen(false);
    closeUpgrade();
  }, [pathname, closeUpgrade]);

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
    userMenuOpen,
    toggleUserMenu: () => setUserMenuOpen((v) => !v),
    closeUserMenu: () => setUserMenuOpen(false),
    userMenuRef,
    moreMenuOpen,
    toggleMoreMenu: () => setMoreMenuOpen((v) => !v),
    closeMoreMenu: () => setMoreMenuOpen(false),
    moreMenuRef,
    messagesMenuOpen,
    toggleMessagesMenu: () => setMessagesMenuOpen((v) => !v),
    closeMessagesMenu: () => setMessagesMenuOpen(false),
    messagesMenuRef,
    initials,
    activeNav,
    signInOpen,
    registerOpen,
    openSignIn,
    closeSignIn,
    openRegister,
    closeRegister,
    upgradeOpen,
    openUpgrade,
    closeUpgrade,
  };
}
