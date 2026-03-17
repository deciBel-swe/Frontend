'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import type { FC, ReactNode } from 'react';

import { authService } from '@/services';

import type {
  AuthContextValue,
  AuthState,
  LoginUserDTO,
  UserRole,
} from '@/types';

// ================================
// Helpers
// ================================

/** Derive role from tier for conditional rendering. */
const deriveRole = (user: LoginUserDTO): UserRole =>
  user.tier === 'ARTIST' ? 'artist' : 'listener';

// ================================
// Context
// ================================

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

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
  const [user, setUser] = useState<LoginUserDTO | null>(initialState.user);
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
          setRole(deriveRole(session.user));
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

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const session = await authService.login(email, password);
      setUser(session.user);
      setRole(deriveRole(session.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (googleToken: string) => {
    setIsLoading(true);
    try {
      const session = await authService.loginWithGoogle(googleToken);
      setUser(session.user);
      setRole(deriveRole(session.user));
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
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
