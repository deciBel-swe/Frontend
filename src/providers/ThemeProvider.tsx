'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { FC } from 'react';
import type { ThemeProviderProps } from 'next-themes';

/**
 * ThemeProvider
 *
 * Wraps the application with next-themes' ThemeProvider so that the active
 * theme is persisted in localStorage and applied as a `class` attribute on
 * <html> — matching the `.dark` selector defined in globals.css.
 *
 * Props are forwarded directly to NextThemesProvider, so callers can override
 * defaults (e.g. `defaultTheme`, `forcedTheme`) without touching this file.
 *
 * Usage in layout.tsx:
 *   <ThemeProvider defaultTheme="dark" enableSystem>
 *     {children}
 *   </ThemeProvider>
 */

export const ThemeProvider: FC<ThemeProviderProps> = ({
  children,
  ...props
}) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};
