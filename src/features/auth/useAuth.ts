'use client';

import { useContext } from 'react';

import { AuthContext } from '@/features/auth/AuthContext';

import type { AuthContextValue } from '@/types';

/**
 * useAuth — access authentication state from any component.
 *
 * Must be rendered inside `<AuthProvider>`.
 *
 * @example
 *   const { user, role, isAuthenticated, isLoading, login, logout } = useAuth();
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
