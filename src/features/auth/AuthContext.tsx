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

/**
 * Derives a user role from their tier/plan
 * @param {LoginUserDTO} user - The authenticated user object
 * @returns {UserRole} The user role ('artist' or 'listener')
 */
const deriveRole = (user: LoginUserDTO): UserRole =>
  user.tier === 'PRO' ? 'artist' : 'listener';

// ================================
// Context
// ================================

/**
 * AuthContext provides application-wide authentication state and actions.
 *
 * Contains:
 * - Current authenticated user and their role
 * - Authentication status (loading, authenticated)
 * - Login and logout functions
 *
 * Must be used via the `useAuth` hook rather than directly.
 *
 * @type {React.Context<AuthContextValue|undefined>}
 *
 * @example
 * const context = useContext(AuthContext);
 * // Should use useAuth() hook instead:
 * const { user, isAuthenticated, login } = useAuth();
 */
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

// ================================
// Provider
// ================================

/**
 * Initial authentication state
 * @constant {AuthState}
 */
const initialState: AuthState = {
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
};

/**
 * AuthProvider Component
 *
 * Root provider that manages authentication state for the entire application.
 * Must wrap the entire app or at least all components that need auth access.
 *
 * Responsibilities:
 * - Bootstraps authentication state from stored session token on mount
 * - Manages login/logout operations
 * - Provides auth state to all child components via context
 * - Handles role derivation based on user tier
 *
 * The provider automatically:
 * 1. Checks for existing session on mount (without network call if token cached)
 * 2. Maintains loading state during async auth operations
 * 3. Updates user and role state when auth changes
 *
 * @component
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components with access to auth context
 * @returns {JSX.Element} Provider component
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
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
