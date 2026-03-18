import { Inter, JetBrains_Mono } from 'next/font/google';
import { Suspense } from 'react';

import { AuthProvider } from '@/features/auth';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { TopNavBar } from '@/components/nav/TopNavBar';
import { QueryProvider } from '@/providers/QueryProvider';
import type { Metadata } from 'next';

import './globals.css';

/**
 * Inter — primary sans-serif typeface.
 * Loaded via next/font/google for zero-layout-shift font delivery.
 * The CSS variable --font-sans (declared in @theme) picks this up automatically
 * because next/font injects the same variable name onto <html>.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

/**
 * JetBrains Mono — monospace typeface for code snippets and timestamps.
 * Referenced by --font-mono in the @theme block.
 */
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

/**
 * Metadata for the application
 */
export const metadata: Metadata = {
  title: 'DeciBel - Social Streaming Platform',
  description: 'A modern music streaming platform inspired by SoundCloud',
  keywords: ['music', 'streaming', 'audio', 'social'],
};

/**
 * Root Layout Component
 *
 * - Applies Inter and JetBrains Mono font CSS variables globally via next/font.
 * - ThemeProvider (next-themes) manages the active theme in localStorage and
 *   injects the `dark` class on <html>, activating the .dark colour tokens
 *   defined in globals.css. `enableSystem` falls back to the OS preference
 *   when no user choice has been stored yet.
 * - All pages inherit bg-bg-base and text-text-primary from the body rule in
 *   globals.css — no hardcoded colours in any component.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      /**
       * Font CSS variables are applied here so every descendant can reference
       * var(--font-sans) and var(--font-mono) regardless of theme.
       * `suppressHydrationWarning` is required because next-themes injects the
       * theme class on the client after hydration, which would otherwise cause
       * a React mismatch warning.
       */
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <Suspense fallback={<>Loading ...</>}>
              <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-[1200px]">
                    <TopNavBar />
                      {/* QueryProvider is a client‑component wrapper that creates the
                       QueryClient on the client side.*/}
                  <QueryProvider>{children}</QueryProvider>
                </div>
              </div>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
