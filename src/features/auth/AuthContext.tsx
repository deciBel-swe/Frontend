'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import type { FC, ReactNode } from 'react';

import { authService } from '@/services';

import type { AuthContextValue, AuthState, AuthUserDTO, UserRole } from '@/types';

// ================================
// Context
// ================================

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ================================
// Provider
// ================================

const initialState: AuthState = {
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
};

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUserDTO | null>(initialState.user);
  const [role, setRole] = useState<UserRole | null>(initialState.role);
  const [isLoading, setIsLoading] = useState(initialState.isLoading);

  // Bootstrap — resume session from stored token (no network call)
  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const session = await authService.getSession();
        if (!cancelled && session) {
          setUser(session.user);
          setRole(session.user.role);
        }
      } catch {
        // No valid session — stay logged out
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (loginRole: UserRole = 'artist') => {
    setIsLoading(true);
    try {
      const session = await authService.login(loginRole);
      setUser(session.user);
      setRole(session.user.role);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setRole(null);
  }, []);

  const value: AuthContextValue = {
    user,
    role,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
