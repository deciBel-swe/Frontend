import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
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
 * - The `dark` class on <html> activates the .dark colour tokens defined in
 *   globals.css. A theme-switcher component should toggle this at runtime.
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
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
